'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { recalculateProfileCompletion } from '../recalculate-action'
import {
  PAGE_BG, EditSpinner, EditPageHeader, ErrorAlert,
  PillGroup, TA, SaveButton, EditToast,
} from '../EditHelpers'

const INCOME_OPTIONS = ['Under £20k', '£20k–£35k', '£35k–£50k', '£50k–£75k', '£75k–£100k', 'Over £100k', 'Prefer not to say']
const OWN_RENT = ['Own', 'Rent', 'Living with family', 'Working towards owning']
const DEBT_OPTIONS = ['No debt', 'Student loan only', 'Some debt', 'Significant debt']
const SUPPORT_OPTIONS = ['Yes — significant', 'Yes — some', 'No']
const SAVINGS_OPTIONS = ['Actively saving', 'Saving when possible', 'Not currently', 'No savings']
const FIN_PLAN = ['Detailed budget', 'Rough plan', 'Relaxed', 'Day by day']
const WIFE_FIN_INDEP = ['Very important', 'Preferred', 'Fine either way', 'Not a priority']
const HAJJ_OPTIONS = ['Completed', 'Planning soon', 'Not yet', 'Not applicable']
const WIFE_EARNING = ['Very comfortable', 'Comfortable', 'Mildly uncomfortable', 'Not comfortable']
const FIN_READY = ['Fully ready', 'Almost ready', 'Working towards it']
const FIN_DEPEND = ['Fully dependent', 'Partially dependent', 'Prefer independence', 'Fully independent']

export default function EditFinancialPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [toast, setToast] = useState<'success' | 'error' | null>(null)
  const [userId, setUserId] = useState('')
  const [gender, setGender] = useState('')

  const [annualIncome, setAnnualIncome] = useState('')
  const [ownOrRent, setOwnOrRent] = useState('')
  const [financialReadiness, setFinancialReadiness] = useState('')
  const [hajjStatus, setHajjStatus] = useState('')
  const [wifeFinancialIndependence, setWifeFinancialIndependence] = useState('')
  const [wifeEarningMore, setWifeEarningMore] = useState('')
  const [financialPlanningApproach, setFinancialPlanningApproach] = useState('')
  const [mahrApproach, setMahrApproach] = useState('')

  const [hasSignificantDebt, setHasSignificantDebt] = useState('')
  const [supportingFamily, setSupportingFamily] = useState('')
  const [savingsPlan, setSavingsPlan] = useState('')
  const [financialStressApproach, setFinancialStressApproach] = useState('')

  const [financialDependenceView, setFinancialDependenceView] = useState('')

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/auth/login'); return }
      setUserId(user.id)
      const { data: prof } = await supabase.from('profiles').select('gender').eq('id', user.id).single()
      if (!prof) { router.push('/auth/login'); return }
      setGender(prof.gender)
      const table = prof.gender === 'brother' ? 'brother_profiles' : 'sister_profiles'
      const { data } = await supabase.from(table).select('*').eq('id', user.id).single()
      if (data) {
        setHasSignificantDebt(data.has_significant_debt ?? '')
        setSupportingFamily(data.supporting_family_financially ?? '')
        setSavingsPlan(data.savings_plan ?? '')
        setFinancialStressApproach(data.financial_stress_approach ?? '')
        if (prof.gender === 'brother') {
          setAnnualIncome(data.annual_income_range ?? '')
          setOwnOrRent(data.own_or_rent ?? '')
          setFinancialReadiness(data.financial_readiness ?? '')
          setHajjStatus(data.hajj_status ?? '')
          setWifeFinancialIndependence(data.wife_financial_independence ?? '')
          setWifeEarningMore(data.wife_earning_more ?? '')
          setFinancialPlanningApproach(data.financial_planning_approach ?? '')
          setMahrApproach(data.mahr_approach ?? '')
        } else {
          setFinancialDependenceView(data.financial_dependence_view ?? '')
        }
      }
      setLoading(false)
    }
    load()
  }, [])

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true); setError(null)
    try {
      const supabase = createClient()
      const table = gender === 'brother' ? 'brother_profiles' : 'sister_profiles'
      const shared = {
        has_significant_debt: hasSignificantDebt || null,
        supporting_family_financially: supportingFamily || null,
        savings_plan: savingsPlan || null,
        financial_stress_approach: financialStressApproach || null,
      }
      const extra = gender === 'brother'
        ? {
            annual_income_range: annualIncome || null,
            own_or_rent: ownOrRent || null,
            financial_readiness: financialReadiness || null,
            hajj_status: hajjStatus || null,
            wife_financial_independence: wifeFinancialIndependence || null,
            wife_earning_more: wifeEarningMore || null,
            financial_planning_approach: financialPlanningApproach || null,
            mahr_approach: mahrApproach || null,
          }
        : { financial_dependence_view: financialDependenceView || null }
      const { error: e2 } = await supabase.from(table).update({ ...shared, ...extra }).eq('id', userId)
      if (e2) throw e2
      recalculateProfileCompletion().catch(() => {})
      setToast('success')
      setTimeout(() => router.push('/dashboard/profile'), 1200)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong.')
    } finally { setSaving(false) }
  }

  if (loading) return <EditSpinner />

  return (
    <div className="min-h-screen pt-[72px] lg:pt-[76px]" style={{ background: PAGE_BG }}>
      <div style={{ maxWidth: '560px', margin: '0 auto', padding: '24px 20px 80px' }}>
        <EditPageHeader title="Edit Financial" />

        {error && <ErrorAlert message={error} />}

        <form onSubmit={handleSave} className="flex flex-col gap-6">
          {gender === 'brother' && (
            <>
              <PillGroup label="What is your annual income range?" options={INCOME_OPTIONS} value={annualIncome} onChange={setAnnualIncome} optional />
              <PillGroup label="Do you own or rent your home?" options={OWN_RENT} value={ownOrRent} onChange={setOwnOrRent} optional />
              <PillGroup label="Financial readiness for marriage" options={FIN_READY} value={financialReadiness} onChange={setFinancialReadiness} optional />
              <PillGroup label="Have you completed Hajj?" options={HAJJ_OPTIONS} value={hajjStatus} onChange={setHajjStatus} optional />
              <PillGroup label="How do you feel about your wife having financial independence?" options={WIFE_FIN_INDEP} value={wifeFinancialIndependence} onChange={setWifeFinancialIndependence} optional />
              <PillGroup label="How would you feel if your wife earned more than you?" options={WIFE_EARNING} value={wifeEarningMore} onChange={setWifeEarningMore} optional />
              <PillGroup label="What is your approach to financial planning as a couple?" options={FIN_PLAN} value={financialPlanningApproach} onChange={setFinancialPlanningApproach} optional />
            </>
          )}
          {gender === 'sister' && (
            <PillGroup label="Financial dependence view" options={FIN_DEPEND} value={financialDependenceView} onChange={setFinancialDependenceView} optional />
          )}
          <PillGroup label="Do you have any significant debt?" options={DEBT_OPTIONS} value={hasSignificantDebt} onChange={setHasSignificantDebt} optional />
          <PillGroup label="Are you currently supporting your family financially?" options={SUPPORT_OPTIONS} value={supportingFamily} onChange={setSupportingFamily} optional />
          <PillGroup label="Do you have a savings plan?" options={SAVINGS_OPTIONS} value={savingsPlan} onChange={setSavingsPlan} optional />
          <TA label="How do you approach financial stress in a relationship?" value={financialStressApproach} onChange={setFinancialStressApproach} placeholder="e.g. We talk openly and make a plan together..." optional />
          {gender === 'brother' && (
            <TA label="Mahr approach" value={mahrApproach} onChange={setMahrApproach} placeholder="Your thoughts on mahr..." optional />
          )}

          <SaveButton saving={saving} />
        </form>
      </div>
      <EditToast toast={toast} />
    </div>
  )
}
