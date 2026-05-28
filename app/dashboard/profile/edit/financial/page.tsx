'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { recalculateProfileCompletion } from '../recalculate-action'
import {
  PAGE_BG, EditSpinner, EditPageHeader, ErrorAlert,
  PillGroupKV, TA, SaveButton, EditToast,
} from '../EditHelpers'

const FINANCIAL_READINESS_OPTIONS = [
  { value: 'fully_ready',        label: 'Fully ready' },
  { value: 'almost_ready',       label: 'Almost ready' },
  { value: 'working_towards_it', label: 'Working towards it' },
]

const DEBT_OPTIONS = [
  { value: 'no',                label: 'No' },
  { value: 'yes_student',       label: 'Yes — student loans' },
  { value: 'yes_other',         label: 'Yes — other' },
  { value: 'prefer_not_to_say', label: 'Prefer not to say' },
]

const WORK_OPTIONS = [
  { value: 'yes_full_time',    label: 'Yes — full time' },
  { value: 'yes_part_time',    label: 'Yes — part time' },
  { value: 'depends',          label: 'Depends on children' },
  { value: 'no',               label: 'No' },
  { value: 'undecided',        label: 'Undecided' },
]

const FIN_INDEPENDENCE_OPTIONS = [
  { value: 'very_important',     label: 'Very important' },
  { value: 'somewhat_important', label: 'Somewhat important' },
  { value: 'not_priority',       label: 'Not a priority' },
  { value: 'prefer_supported',   label: 'I prefer to be supported' },
]

export default function EditFinancialPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [toast, setToast] = useState<'success' | 'error' | null>(null)
  const [userId, setUserId] = useState('')
  const [gender, setGender] = useState('')

  const [financialReadiness, setFinancialReadiness] = useState('')
  const [hasSignificantDebt, setHasSignificantDebt] = useState('')
  const [mahrApproach, setMahrApproach] = useState('')
  const [planToWorkAfterMarriage, setPlanToWorkAfterMarriage] = useState('')
  const [financialIndependenceImportance, setFinancialIndependenceImportance] = useState('')

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
        if (prof.gender === 'brother') {
          setFinancialReadiness(data.financial_readiness ?? '')
          setMahrApproach(data.mahr_approach ?? '')
        } else {
          setPlanToWorkAfterMarriage(data.plan_to_work_after_marriage ?? '')
          setFinancialIndependenceImportance(data.financial_independence_importance ?? '')
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
      const extra = gender === 'brother'
        ? { financial_readiness: financialReadiness || null, mahr_approach: mahrApproach || null }
        : { plan_to_work_after_marriage: planToWorkAfterMarriage || null, financial_independence_importance: financialIndependenceImportance || null }
      const { error: e2 } = await supabase.from(table).update({
        has_significant_debt: hasSignificantDebt || null,
        ...extra,
      }).eq('id', userId)
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
              <PillGroupKV label="Financial readiness for marriage" options={FINANCIAL_READINESS_OPTIONS} value={financialReadiness} onChange={setFinancialReadiness} optional />
              <TA label="How do you approach mahr?" value={mahrApproach} onChange={setMahrApproach} placeholder="e.g. I believe mahr should be meaningful but not a burden..." optional />
            </>
          )}
          {gender === 'sister' && (
            <>
              <PillGroupKV label="Do you plan to work after marriage?" options={WORK_OPTIONS} value={planToWorkAfterMarriage} onChange={setPlanToWorkAfterMarriage} optional />
              <PillGroupKV label="How important is financial independence to you?" options={FIN_INDEPENDENCE_OPTIONS} value={financialIndependenceImportance} onChange={setFinancialIndependenceImportance} optional />
            </>
          )}
          <PillGroupKV label="Do you have any significant debt?" options={DEBT_OPTIONS} value={hasSignificantDebt} onChange={setHasSignificantDebt} optional />

          <SaveButton saving={saving} />
        </form>
      </div>
      <EditToast toast={toast} />
    </div>
  )
}
