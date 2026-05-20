'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'
import { recalculateProfileCompletion } from '../recalculate-action'

const WIFE_WORKING = ['Prefer she stays home', 'Fine if she wants to', 'Encouraged', 'Expect her to contribute']
const HOUSEHOLD_MGMT = ['Wife manages household', 'We share equally', 'Depends on circumstances', 'I take the lead']
const INLAWS = ['Yes — essential', 'Yes — open to it', 'Prefer separate', 'No']
const SCHOOLING = ['Islamic school only', 'Prefer Islamic school', 'Either is fine', 'State school preferred']
const CHILD_CARE = ['Primarily wife', 'Shared equally', 'Depends on circumstance', 'Primarily me']
const HIJAB_IMP = ['Essential', 'Strongly prefer', 'Prefer', 'Not a condition']
const JUMUAH = ['Every week without exception', 'Most weeks', 'When possible', 'Occasionally']
const NON_ISLAMIC = ['Never celebrate', 'Respectful acknowledgement only', 'Some celebrations are fine', 'We celebrate normally']

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

export default function EditHouseholdPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [toast, setToast] = useState<'success' | 'error' | null>(null)
  const [userId, setUserId] = useState('')

  const [wifeWorkingOpenness, setWifeWorkingOpenness] = useState('')
  const [householdManagement, setHouseholdManagement] = useState('')
  const [inlawsLivingTogether, setInlawsLivingTogether] = useState('')
  const [islamicSchoolingImportance, setIslamicSchoolingImportance] = useState('')
  const [childCaregiving, setChildCaregiving] = useState('')
  const [wifeHijabImportance, setWifeHijabImportance] = useState('')
  const [jumuahAttendance, setJumuahAttendance] = useState('')
  const [celebrateNonIslamicHolidays, setCelebrateNonIslamicHolidays] = useState('')

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/auth/login'); return }
      setUserId(user.id)
      const { data } = await supabase.from('brother_profiles').select('wife_working_openness,household_management,inlaws_living_together,islamic_schooling_importance,child_caregiving,wife_hijab_importance,jumuah_attendance,celebrate_non_islamic_holidays').eq('id', user.id).single()
      if (data) {
        setWifeWorkingOpenness(data.wife_working_openness ?? '')
        setHouseholdManagement(data.household_management ?? '')
        setInlawsLivingTogether(data.inlaws_living_together ?? '')
        setIslamicSchoolingImportance(data.islamic_schooling_importance ?? '')
        setChildCaregiving(data.child_caregiving ?? '')
        setWifeHijabImportance(data.wife_hijab_importance ?? '')
        setJumuahAttendance(data.jumuah_attendance ?? '')
        setCelebrateNonIslamicHolidays(data.celebrate_non_islamic_holidays ?? '')
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
      const { error: e2 } = await supabase.from('brother_profiles').update({
        wife_working_openness: wifeWorkingOpenness || null,
        household_management: householdManagement || null,
        inlaws_living_together: inlawsLivingTogether || null,
        islamic_schooling_importance: islamicSchoolingImportance || null,
        child_caregiving: childCaregiving || null,
        wife_hijab_importance: wifeHijabImportance || null,
        jumuah_attendance: jumuahAttendance || null,
        celebrate_non_islamic_holidays: celebrateNonIslamicHolidays || null,
      }).eq('id', userId)
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
          <h1 className="text-base font-medium text-[#1A1A1A]">Edit Household</h1>
        </div>
        {error && <div className="bg-red-50 border border-red-100 text-red-600 text-sm rounded-xl px-4 py-3 mb-4">{error}</div>}
        <form onSubmit={handleSave} className="flex flex-col gap-5">
          <PillGroup label="Are you open to your wife working after marriage?" options={WIFE_WORKING} value={wifeWorkingOpenness} onChange={setWifeWorkingOpenness} />
          <PillGroup label="Who do you expect to manage the household day to day?" options={HOUSEHOLD_MGMT} value={householdManagement} onChange={setHouseholdManagement} />
          <PillGroup label="Would you be open to your in-laws living with you?" options={INLAWS} value={inlawsLivingTogether} onChange={setInlawsLivingTogether} />
          <PillGroup label="How important is Islamic schooling for your children?" options={SCHOOLING} value={islamicSchoolingImportance} onChange={setIslamicSchoolingImportance} />
          <PillGroup label="Who do you see as the primary caregiver for young children?" options={CHILD_CARE} value={childCaregiving} onChange={setChildCaregiving} />
          <PillGroup label="How important is it that your wife wears hijab?" options={HIJAB_IMP} value={wifeHijabImportance} onChange={setWifeHijabImportance} />
          <PillGroup label="How often do you attend Jumu'ah and congregational prayers?" options={JUMUAH} value={jumuahAttendance} onChange={setJumuahAttendance} />
          <PillGroup label="Do you celebrate birthdays or non-Islamic holidays?" options={NON_ISLAMIC} value={celebrateNonIslamicHolidays} onChange={setCelebrateNonIslamicHolidays} />
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
