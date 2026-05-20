'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'
import { recalculateProfileCompletion } from '../recalculate-action'

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

function Pill({ label, selected, onClick }: { label: string; selected: boolean; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick}
      className={`px-4 py-2 rounded-full text-sm font-medium border transition-all cursor-pointer ${
        selected ? 'bg-[#AF4D98] text-white border-[#AF4D98]' : 'bg-white text-[#1A1A1A] border-[#EDE8E3] hover:border-[#AF4D98]'
      }`}>
      {label}
    </button>
  )
}

function PillGroup({ label, options, value, onChange }: { label: string; options: string[]; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <label className="block text-sm font-medium text-[#1A1A1A] mb-2">{label}</label>
      <div className="flex flex-wrap gap-2">
        {options.map(o => <Pill key={o} label={o} selected={value === o} onClick={() => onChange(o)} />)}
      </div>
    </div>
  )
}

function TA({ label, value, onChange, placeholder, optional }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string; optional?: boolean }) {
  return (
    <div>
      <label className="block text-sm font-medium text-[#1A1A1A] mb-1.5">{label}{optional && <span className="text-[#9B9B9B] font-normal"> (optional)</span>}</label>
      <textarea value={value} onChange={e => onChange(e.target.value)} rows={3} placeholder={placeholder}
        className="w-full px-4 py-3 rounded-[10px] border border-[#EDE8E3] bg-white text-[#1A1A1A] text-[15px] focus:outline-none focus:border-[#AF4D98] focus:ring-2 focus:ring-[#AF4D98]/8 resize-none" />
    </div>
  )
}

export default function EditFinancialPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [toast, setToast] = useState<'success' | 'error' | null>(null)
  const [userId, setUserId] = useState('')
  const [gender, setGender] = useState('')

  // Brother
  const [annualIncome, setAnnualIncome] = useState('')
  const [ownOrRent, setOwnOrRent] = useState('')
  const [financialReadiness, setFinancialReadiness] = useState('')
  const [hajjStatus, setHajjStatus] = useState('')
  const [wifeFinancialIndependence, setWifeFinancialIndependence] = useState('')
  const [wifeEarningMore, setWifeEarningMore] = useState('')
  const [financialPlanningApproach, setFinancialPlanningApproach] = useState('')
  const [mahrApproach, setMahrApproach] = useState('')

  // Shared
  const [hasSignificantDebt, setHasSignificantDebt] = useState('')
  const [supportingFamily, setSupportingFamily] = useState('')
  const [savingsPlan, setSavingsPlan] = useState('')
  const [financialStressApproach, setFinancialStressApproach] = useState('')

  // Sister
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

  if (loading) return <div className="min-h-screen bg-[#FDF8F3] flex items-center justify-center"><div className="w-8 h-8 border-2 border-[#AF4D98] border-t-transparent rounded-full animate-spin" /></div>

  return (
    <div className="min-h-screen bg-[#FDF8F3]">
      <div className="max-w-lg mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-6">
          <Link href="/dashboard/profile" className="text-[#9B9B9B] hover:text-[#1A1A1A] transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5"><path fillRule="evenodd" d="M17 10a.75.75 0 01-.75.75H5.612l4.158 3.96a.75.75 0 11-1.04 1.08l-5.5-5.25a.75.75 0 010-1.08l5.5-5.25a.75.75 0 111.04 1.08L5.612 9.25H16.25A.75.75 0 0117 10z" clipRule="evenodd" /></svg>
          </Link>
          <h1 className="text-base font-medium text-[#1A1A1A]">Edit Financial</h1>
        </div>

        {error && <div className="bg-red-50 border border-red-100 text-red-600 text-sm rounded-xl px-4 py-3 mb-4">{error}</div>}

        <form onSubmit={handleSave} className="flex flex-col gap-5">
          {gender === 'brother' && (
            <>
              <PillGroup label="What is your annual income range?" options={INCOME_OPTIONS} value={annualIncome} onChange={setAnnualIncome} />
              <PillGroup label="Do you own or rent your home?" options={OWN_RENT} value={ownOrRent} onChange={setOwnOrRent} />
              <PillGroup label="Financial readiness for marriage" options={FIN_READY} value={financialReadiness} onChange={setFinancialReadiness} />
              <PillGroup label="Have you completed Hajj?" options={HAJJ_OPTIONS} value={hajjStatus} onChange={setHajjStatus} />
              <PillGroup label="How do you feel about your wife having financial independence?" options={WIFE_FIN_INDEP} value={wifeFinancialIndependence} onChange={setWifeFinancialIndependence} />
              <PillGroup label="How would you feel if your wife earned more than you?" options={WIFE_EARNING} value={wifeEarningMore} onChange={setWifeEarningMore} />
              <PillGroup label="What is your approach to financial planning as a couple?" options={FIN_PLAN} value={financialPlanningApproach} onChange={setFinancialPlanningApproach} />
            </>
          )}
          {gender === 'sister' && (
            <PillGroup label="Financial dependence view" options={FIN_DEPEND} value={financialDependenceView} onChange={setFinancialDependenceView} />
          )}
          <PillGroup label="Do you have any significant debt?" options={DEBT_OPTIONS} value={hasSignificantDebt} onChange={setHasSignificantDebt} />
          <PillGroup label="Are you currently supporting your family financially?" options={SUPPORT_OPTIONS} value={supportingFamily} onChange={setSupportingFamily} />
          <PillGroup label="Do you have a savings plan?" options={SAVINGS_OPTIONS} value={savingsPlan} onChange={setSavingsPlan} />
          <TA label="How do you approach financial stress in a relationship?" value={financialStressApproach} onChange={setFinancialStressApproach} placeholder="e.g. We talk openly and make a plan together..." optional />
          {gender === 'brother' && (
            <TA label="Mahr approach" value={mahrApproach} onChange={setMahrApproach} placeholder="Your thoughts on mahr..." optional />
          )}

          <button type="submit" disabled={saving} className="w-full bg-[#AF4D98] text-white font-medium rounded-full py-3.5 mt-2 disabled:opacity-60">
            {saving ? 'Saving...' : 'Save changes'}
          </button>
          <Link href="/dashboard/profile" className="text-center text-sm text-[#9B9B9B] hover:text-[#1A1A1A]">Cancel</Link>
        </form>
      </div>
      {toast && (
        <div className={`fixed bottom-20 left-4 right-4 max-w-lg mx-auto rounded-[10px] px-4 py-3 shadow-[0_2px_8px_rgba(0,0,0,0.1)] text-sm font-medium text-center ${toast === 'success' ? 'bg-[#AF4D98] text-white' : 'bg-red-600 text-white'}`}>
          {toast === 'success' ? 'Changes saved' : 'Something went wrong'}
        </div>
      )}
    </div>
  )
}
