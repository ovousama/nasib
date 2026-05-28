'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { recalculateProfileCompletion } from '../recalculate-action'
import {
  PAGE_BG, EditSpinner, EditPageHeader, ErrorAlert,
  PillGroupKV, MultiPillGroupKV, TA, SaveButton, EditToast,
} from '../EditHelpers'

const CONFLICT_OPTIONS = [
  { value: 'avoidant',      label: 'I need space first' },
  { value: 'direct',        label: 'Direct and immediate' },
  { value: 'collaborative', label: 'Talk it through calmly' },
  { value: 'emotional',     label: 'Emotionally expressive' },
]

const LOVE_LANGUAGE_OPTIONS = [
  { value: 'words_of_affirmation', label: 'Words of affirmation' },
  { value: 'quality_time',         label: 'Quality time' },
  { value: 'acts_of_service',      label: 'Acts of service' },
  { value: 'gift_giving',          label: 'Gift giving' },
  { value: 'physical_touch',       label: 'Physical touch' },
]

const INTROVERT_OPTIONS = [
  { value: 'introvert', label: 'Introvert' },
  { value: 'ambivert',  label: 'Ambivert' },
  { value: 'extrovert', label: 'Extrovert' },
]

export default function EditCharacterPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [toast, setToast] = useState<'success' | 'error' | null>(null)

  const [userId, setUserId] = useState<string>('')
  const [gender, setGender] = useState<string>('')

  const [characterDescription, setCharacterDescription] = useState('')
  const [goals, setGoals] = useState('')
  const [conflictStyle, setConflictStyle] = useState('')
  const [loveLanguage, setLoveLanguage] = useState<string[]>([])
  const [introvertExtrovert, setIntrovertExtrovert] = useState('')
  const [marriageVision10Years, setMarriageVision10Years] = useState('')
  const [romanceView, setRomanceView] = useState('')
  const [marriageFear, setMarriageFear] = useState('')
  const [uniqueContribution, setUniqueContribution] = useState('')

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
      const { data } = await supabase.from(table).select('character_description, goals, conflict_style, love_language, introvert_extrovert, marriage_vision_10_years, romance_view, marriage_fear, unique_contribution').eq('id', user.id).single()
      if (data) {
        setCharacterDescription(data.character_description ?? '')
        setGoals(data.goals ?? '')
        setConflictStyle(data.conflict_style ?? '')
        setLoveLanguage(Array.isArray(data.love_language) ? data.love_language : [])
        setIntrovertExtrovert(data.introvert_extrovert ?? '')
        setMarriageVision10Years(data.marriage_vision_10_years ?? '')
        setRomanceView(data.romance_view ?? '')
        setMarriageFear(data.marriage_fear ?? '')
        setUniqueContribution(data.unique_contribution ?? '')
      }
      setLoading(false)
    }
    load()
  }, [])

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    if (characterDescription.trim().length < 50) {
      setError('Character description must be at least 50 characters.')
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
          character_description:  characterDescription.trim(),
          goals:                  goals.trim() || null,
          conflict_style:         conflictStyle || null,
          love_language:          loveLanguage.length ? loveLanguage : null,
          introvert_extrovert:    introvertExtrovert || null,
          marriage_vision_10_years: marriageVision10Years.trim() || null,
          romance_view:           romanceView.trim() || null,
          marriage_fear:          marriageFear.trim() || null,
          unique_contribution:    uniqueContribution.trim() || null,
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

  const brotherLabel = 'How would those closest to you describe you?'
  const sisterLabel  = 'How would your family or close friends describe you?'

  return (
    <div className="min-h-screen pt-[72px] lg:pt-[76px]" style={{ background: PAGE_BG }}>
      <div style={{ maxWidth: '560px', margin: '0 auto', padding: '24px 20px 80px' }}>
        <EditPageHeader title="Edit Character & Goals" />

        {error && <ErrorAlert message={error} />}

        <form onSubmit={handleSave} className="flex flex-col gap-6">
          <div>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: '#1A1A1A', marginBottom: '10px' }}>
              {gender === 'brother' ? brotherLabel : sisterLabel}{' '}
              <span style={{ color: '#AF4D98' }}>*</span>
            </label>
            <textarea
              value={characterDescription}
              onChange={e => setCharacterDescription(e.target.value)}
              rows={5}
              maxLength={500}
              style={{
                width: '100%', padding: '12px 14px',
                border: '1px solid #EDE8E3', borderRadius: '12px',
                fontSize: '14px', color: '#1A1A1A', background: 'white',
                outline: 'none', resize: 'vertical' as const, minHeight: '100px',
                fontFamily: 'inherit', lineHeight: '1.6', boxSizing: 'border-box' as const,
              }}
              placeholder="Describe your character, values, and what makes you who you are..."
              onFocus={e => { e.currentTarget.style.border = '1.5px solid #AF4D98' }}
              onBlur={e => { e.currentTarget.style.border = '1px solid #EDE8E3' }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px' }}>
              <p style={{ fontSize: '12px', color: '#9B9B9B', margin: 0 }}>Minimum 50 characters</p>
              <p style={{ fontSize: '12px', color: '#9B9B9B', margin: 0 }}>{characterDescription.length} / 500</p>
            </div>
          </div>

          <TA label="What do you hope to build together in a marriage?" value={goals} onChange={setGoals} placeholder="Your vision for marriage and life together..." optional />

          <PillGroupKV label="How do you typically handle conflict?" options={CONFLICT_OPTIONS} value={conflictStyle} onChange={setConflictStyle} optional />

          <MultiPillGroupKV label="What are your love languages? (up to 3)" options={LOVE_LANGUAGE_OPTIONS} value={loveLanguage} onChange={setLoveLanguage} optional max={3} />

          <PillGroupKV label="Are you more of an introvert or extrovert?" options={INTROVERT_OPTIONS} value={introvertExtrovert} onChange={setIntrovertExtrovert} optional />

          <TA label="What does your marriage look like in 10 years?" value={marriageVision10Years} onChange={setMarriageVision10Years} placeholder="e.g. A stable home, children who love Allah, mutual growth..." optional />
          <TA label="What does romance look like to you in a marriage?" value={romanceView} onChange={setRomanceView} placeholder="e.g. Small gestures, quality time, acts of service..." optional />
          <TA label="What is your biggest fear about marriage?" value={marriageFear} onChange={setMarriageFear} placeholder="Be honest — this is private..." optional />
          <TA label="What unique thing do you bring to a marriage?" value={uniqueContribution} onChange={setUniqueContribution} placeholder="e.g. My patience, my sense of humour, my commitment..." optional />

          <SaveButton saving={saving} />
        </form>
      </div>
      <EditToast toast={toast} />
    </div>
  )
}
