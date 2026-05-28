'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { recalculateProfileCompletion } from '../recalculate-action'
import {
  PAGE_BG, EditSpinner, EditPageHeader, ErrorAlert,
  PillGroupKV, MultiPillGroupKV, SaveButton, EditToast,
} from '../EditHelpers'

const RELIGIOSITY_OPTIONS = [
  { value: 'more_practicing', label: 'More practicing than me' },
  { value: 'similar',         label: 'Similar level' },
  { value: 'less_is_fine',    label: "Less strict is fine" },
  { value: 'open',            label: 'Open' },
]

const BROTHER_DEALBREAKER_OPTIONS = [
  { value: 'Smoking',              label: 'Smoking' },
  { value: 'Drinking',             label: 'Drinking' },
  { value: 'Not practicing',       label: 'Not practicing' },
  { value: 'No hijab',             label: 'No hijab' },
  { value: 'Previously married',   label: 'Previously married' },
  { value: 'Has children',         label: 'Has children' },
  { value: 'Unwilling to relocate', label: 'Unwilling to relocate' },
  { value: 'Other',                label: 'Other' },
]

const SISTER_DEALBREAKER_OPTIONS = [
  { value: 'Smoking',              label: 'Smoking' },
  { value: 'Drinking',             label: 'Drinking' },
  { value: 'Not practicing',       label: 'Not practicing' },
  { value: 'Not praying',          label: 'Not praying' },
  { value: 'Previously married',   label: 'Previously married' },
  { value: 'Has children',         label: 'Has children' },
  { value: 'Unwilling to relocate', label: 'Unwilling to relocate' },
  { value: 'Different madhab',     label: 'Different madhab' },
  { value: 'Other',                label: 'Other' },
]

export default function EditPreferencesPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [toast, setToast] = useState<'success' | 'error' | null>(null)

  const [userId, setUserId] = useState<string>('')
  const [gender, setGender] = useState<string>('')

  const [spouseReligiosityPreference, setSpouseReligiosityPreference] = useState('')
  const [spouseAgeMin, setSpouseAgeMin] = useState<number | ''>('')
  const [spouseAgeMax, setSpouseAgeMax] = useState<number | ''>('')
  const [dealbreakers, setDealbreakers] = useState<string[]>([])

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
      const { data } = await supabase.from(table).select('spouse_religiosity_preference, spouse_age_min, spouse_age_max, dealbreakers').eq('id', user.id).single()
      if (data) {
        setSpouseReligiosityPreference(data.spouse_religiosity_preference ?? '')
        setSpouseAgeMin(data.spouse_age_min ?? '')
        setSpouseAgeMax(data.spouse_age_max ?? '')
        setDealbreakers(Array.isArray(data.dealbreakers) ? data.dealbreakers : [])
      }
      setLoading(false)
    }
    load()
  }, [])

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    if (spouseAgeMin !== '' && spouseAgeMax !== '' && Number(spouseAgeMin) > Number(spouseAgeMax)) {
      setError('Minimum age cannot be greater than maximum age.')
      return
    }
    setSaving(true)
    setError(null)
    try {
      const supabase = createClient()
      const table = gender === 'brother' ? 'brother_profiles' : 'sister_profiles'
      const { error: updateError } = await supabase
        .from(table)
        .update({
          spouse_religiosity_preference: spouseReligiosityPreference || null,
          spouse_age_min: spouseAgeMin === '' ? null : Number(spouseAgeMin),
          spouse_age_max: spouseAgeMax === '' ? null : Number(spouseAgeMax),
          dealbreakers,
        })
        .eq('id', userId)
      if (updateError) throw updateError
      recalculateProfileCompletion().catch(() => {})
      setToast('success')
      setTimeout(() => router.push('/dashboard/profile'), 1200)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <EditSpinner />

  const inputStyle = {
    width: '100%', padding: '12px 14px',
    border: '1px solid #EDE8E3', borderRadius: '12px',
    fontSize: '14px', color: '#1A1A1A', background: 'white',
    outline: 'none', boxSizing: 'border-box' as const,
  }

  const labelStyle = {
    display: 'block', fontSize: '14px', fontWeight: 500,
    color: '#1A1A1A', marginBottom: '10px',
  }

  return (
    <div className="min-h-screen pt-[72px] lg:pt-[76px]" style={{ background: PAGE_BG }}>
      <div style={{ maxWidth: '560px', margin: '0 auto', padding: '24px 20px 80px' }}>
        <EditPageHeader title="Edit Preferences" />

        {error && <ErrorAlert message={error} />}

        <form onSubmit={handleSave} className="flex flex-col gap-6">
          <PillGroupKV
            label="What level of practice do you prefer in a spouse?"
            options={RELIGIOSITY_OPTIONS}
            value={spouseReligiosityPreference}
            onChange={setSpouseReligiosityPreference}
            optional
          />

          <div style={{ display: 'flex', gap: '12px' }}>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>Min Age <span style={{ fontSize: '12px', color: '#9B9B9B', fontWeight: 400, marginLeft: '6px' }}>(optional)</span></label>
              <input
                type="number"
                value={spouseAgeMin}
                onChange={e => setSpouseAgeMin(e.target.value === '' ? '' : Number(e.target.value))}
                min={18}
                style={inputStyle}
                placeholder="e.g. 22"
                onFocus={e => { e.currentTarget.style.border = '1.5px solid #AF4D98' }}
                onBlur={e => { e.currentTarget.style.border = '1px solid #EDE8E3' }}
              />
            </div>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>Max Age <span style={{ fontSize: '12px', color: '#9B9B9B', fontWeight: 400, marginLeft: '6px' }}>(optional)</span></label>
              <input
                type="number"
                value={spouseAgeMax}
                onChange={e => setSpouseAgeMax(e.target.value === '' ? '' : Number(e.target.value))}
                min={18}
                style={inputStyle}
                placeholder="e.g. 35"
                onFocus={e => { e.currentTarget.style.border = '1.5px solid #AF4D98' }}
                onBlur={e => { e.currentTarget.style.border = '1px solid #EDE8E3' }}
              />
            </div>
          </div>

          <MultiPillGroupKV
            label="Dealbreakers (select all that apply)"
            options={gender === 'sister' ? SISTER_DEALBREAKER_OPTIONS : BROTHER_DEALBREAKER_OPTIONS}
            value={dealbreakers}
            onChange={setDealbreakers}
            optional
          />

          <SaveButton saving={saving} />
        </form>
      </div>
      <EditToast toast={toast} />
    </div>
  )
}
