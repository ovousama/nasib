'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { recalculateProfileCompletion } from '../recalculate-action'
import {
  PAGE_BG, EditSpinner, EditPageHeader, ErrorAlert,
  PillGroupKV, SaveButton, EditToast,
} from '../EditHelpers'

const EDUCATION_OPTIONS = [
  { value: 'high_school',   label: 'High School / Secondary' },
  { value: 'bachelors',     label: "Bachelor's Degree" },
  { value: 'masters',       label: "Master's Degree" },
  { value: 'doctorate',     label: 'PhD / Doctorate' },
  { value: 'trade',         label: 'Trade / Vocational' },
  { value: 'professional',  label: 'Professional Degree (MD, JD, etc.)' },
]

const LIVING_OPTIONS = [
  { value: 'independent',    label: 'Living independently' },
  { value: 'with_family',    label: 'With family' },
  { value: 'with_roommates', label: 'With roommates' },
]

const RELOCATE_OPTIONS = [
  { value: 'yes',     label: 'Yes' },
  { value: 'no',      label: 'No' },
  { value: 'depends', label: 'Depends' },
]

const SMOKING_OPTIONS = [
  { value: 'never',          label: 'Never' },
  { value: 'occasionally',   label: 'Occasionally' },
  { value: 'trying_to_quit', label: 'Trying to quit' },
  { value: 'yes',            label: 'Yes' },
]

const HALAL_OPTIONS = [
  { value: 'strictly',          label: 'Strictly halal only' },
  { value: 'mostly',            label: 'Mostly halal' },
  { value: 'not_strict',        label: 'Not strict' },
  { value: 'prefer_not_to_say', label: 'Prefer not to say' },
]

const FINANCIAL_READINESS_OPTIONS = [
  { value: 'fully_ready',        label: 'Fully ready' },
  { value: 'almost_ready',       label: 'Almost ready' },
  { value: 'working_towards_it', label: 'Working towards it' },
]

export default function EditLifestylePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [toast, setToast] = useState<'success' | 'error' | null>(null)
  const [userId, setUserId] = useState<string>('')
  const [gender, setGender] = useState<string>('')

  const [occupation, setOccupation] = useState('')
  const [educationLevel, setEducationLevel] = useState('')
  const [livingSituation, setLivingSituation] = useState('')
  const [willingToRelocate, setWillingToRelocate] = useState('')
  const [smoking, setSmoking] = useState('')
  const [strictHalalDiet, setStrictHalalDiet] = useState('')
  const [financialReadiness, setFinancialReadiness] = useState('')

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/auth/login'); return }
      setUserId(user.id)
      const { data: profile } = await supabase.from('profiles').select('gender').eq('id', user.id).single()
      if (!profile) { router.push('/auth/login'); return }
      setGender(profile.gender)
      const table = profile.gender === 'brother' ? 'brother_profiles' : 'sister_profiles'
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data } = await supabase.from(table).select('*').eq('id', user.id).single() as { data: any }
      if (data) {
        setOccupation(data.occupation ?? '')
        setEducationLevel(data.education_level ?? '')
        setLivingSituation(data.living_situation ?? '')
        const reloc = data.willing_to_relocate
        setWillingToRelocate(reloc === true ? 'yes' : reloc === false ? 'no' : (reloc ?? ''))
        setSmoking(data.smoking ?? '')
        setStrictHalalDiet(data.strict_halal_diet ?? '')
        if (profile.gender === 'brother') {
          setFinancialReadiness(data.financial_readiness ?? '')
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
      const shared = {
        occupation:          occupation.trim() || null,
        education_level:     educationLevel || null,
        living_situation:    livingSituation || null,
        willing_to_relocate: willingToRelocate || null,
        smoking:             smoking || null,
        strict_halal_diet:   strictHalalDiet || null,
      }
      if (gender === 'brother') {
        const { error: e2 } = await supabase.from('brother_profiles').update({
          ...shared,
          financial_readiness: financialReadiness || null,
        }).eq('id', userId)
        if (e2) throw e2
      } else {
        const { error: e2 } = await supabase.from('sister_profiles').update(shared).eq('id', userId)
        if (e2) throw e2
      }
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
        <EditPageHeader title="Edit Lifestyle" />

        {error && <ErrorAlert message={error} />}

        <form onSubmit={handleSave} className="flex flex-col gap-6">
          <div>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: '#1A1A1A', marginBottom: '10px' }}>
              Occupation <span style={{ fontSize: '12px', color: '#9B9B9B', fontWeight: 400, marginLeft: '6px' }}>(optional)</span>
            </label>
            <input
              type="text" value={occupation} onChange={e => setOccupation(e.target.value)}
              placeholder="e.g. Software Engineer, Teacher, Doctor..."
              style={{
                width: '100%', padding: '12px 14px', border: '1px solid #EDE8E3',
                borderRadius: '12px', fontSize: '14px', color: '#1A1A1A',
                background: 'white', outline: 'none', boxSizing: 'border-box',
              }}
              onFocus={e => { e.currentTarget.style.border = '1.5px solid #AF4D98' }}
              onBlur={e => { e.currentTarget.style.border = '1px solid #EDE8E3' }}
            />
          </div>

          <PillGroupKV label="Education Level" options={EDUCATION_OPTIONS} value={educationLevel} onChange={setEducationLevel} optional />
          <PillGroupKV label="Living Situation" options={LIVING_OPTIONS} value={livingSituation} onChange={setLivingSituation} optional />

          <PillGroupKV label="Willing to relocate?" options={RELOCATE_OPTIONS} value={willingToRelocate} onChange={setWillingToRelocate} optional />
          <PillGroupKV label="Do you smoke or use tobacco/vape products?" options={SMOKING_OPTIONS} value={smoking} onChange={setSmoking} optional />
          <PillGroupKV label="How strictly do you follow a halal diet?" options={HALAL_OPTIONS} value={strictHalalDiet} onChange={setStrictHalalDiet} optional />

          {gender === 'brother' && (
            <PillGroupKV label="Financial readiness for marriage" options={FINANCIAL_READINESS_OPTIONS} value={financialReadiness} onChange={setFinancialReadiness} optional />
          )}

          <SaveButton saving={saving} />
        </form>
      </div>
      <EditToast toast={toast} />
    </div>
  )
}
