'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'

const textareaCls = 'w-full px-4 py-3.5 rounded-[10px] border border-[#EDE8E3] bg-white text-[#1A1A1A] placeholder-[#9B9B9B] text-[15px] focus:outline-none focus:border-[#AF4D98] focus:ring-2 focus:ring-[#AF4D98]/8 transition-colors resize-none'

function PillGroup({ options, value, onChange }: { options: { value: string; label: string }[]; value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map(opt => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          className={`px-4 py-2 rounded-full text-sm font-medium border transition-colors cursor-pointer ${
            value === opt.value
              ? 'bg-[#AF4D98] text-white border-[#AF4D98]'
              : 'bg-white text-[#1A1A1A] border-[#EDE8E3] hover:border-[#D4CBC4]'
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  )
}

function MultiPillGroup({ options, value, onChange, max }: { options: { value: string; label: string }[]; value: string[]; onChange: (v: string[]) => void; max?: number }) {
  function toggle(opt: string) {
    if (value.includes(opt)) {
      onChange(value.filter(v => v !== opt))
    } else if (!max || value.length < max) {
      onChange([...value, opt])
    }
  }
  return (
    <div className="flex flex-wrap gap-2">
      {options.map(opt => (
        <button
          key={opt.value}
          type="button"
          onClick={() => toggle(opt.value)}
          className={`px-4 py-2 rounded-full text-sm font-medium border transition-colors cursor-pointer ${
            value.includes(opt.value)
              ? 'bg-[#AF4D98] text-white border-[#AF4D98]'
              : 'bg-white text-[#1A1A1A] border-[#EDE8E3] hover:border-[#D4CBC4]'
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  )
}

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
  { value: 'introvert',  label: 'Introvert' },
  { value: 'ambivert',   label: 'Ambivert' },
  { value: 'extrovert',  label: 'Extrovert' },
]

export default function SisterCharacter() {
  const router = useRouter()
  const [userId,          setUserId]          = useState('')
  const [loading,         setLoading]         = useState(true)
  const [saving,          setSaving]          = useState(false)
  const [character,       setCharacter]       = useState('')
  const [goals,           setGoals]           = useState('')
  const [conflictStyle,   setConflictStyle]   = useState('')
  const [loveLanguage,    setLoveLanguage]    = useState<string[]>([])
  const [introvertExtrovert, setIntrovertExtrovert] = useState('')
  const [error,           setError]           = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.replace('/auth/login'); return }
      setUserId(user.id)
      const { data } = await supabase
        .from('sister_profiles')
        .select('character_description, goals, conflict_style, love_language, introvert_extrovert')
        .eq('id', user.id)
        .single()
      if (data) {
        if (data.character_description) setCharacter(data.character_description)
        if (data.goals)                 setGoals(data.goals)
        if (data.conflict_style)        setConflictStyle(data.conflict_style)
        if (data.love_language && Array.isArray(data.love_language)) setLoveLanguage(data.love_language)
        if (data.introvert_extrovert)   setIntrovertExtrovert(data.introvert_extrovert)
      }
      setLoading(false)
    }
    load()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function handleNext(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    if (character.trim().length < 50) { setError('Please write at least 50 characters describing yourself.'); return }
    if (!goals.trim())                { setError('Please answer: What do you hope to build together?'); return }
    if (!conflictStyle)               { setError('Please answer: How do you handle conflict?'); return }
    if (loveLanguage.length === 0)    { setError('Please select at least one love language.'); return }
    if (!introvertExtrovert)          { setError('Please answer: Are you more of an introvert or extrovert?'); return }
    setSaving(true)
    const supabase = createClient()
    const { data: existingRow } = await supabase.from('sister_profiles').select('id').eq('id', userId).maybeSingle()
    if (!existingRow) {
      const { error: insertErr } = await supabase.from('sister_profiles').insert({ id: userId })
      if (insertErr) { setError(insertErr.message); setSaving(false); return }
    }
    const { error: saveErr } = await supabase
      .from('sister_profiles')
      .update({
        character_description: character.trim(),
        goals:                 goals.trim(),
        conflict_style:        conflictStyle,
        love_language:         loveLanguage,
        introvert_extrovert:   introvertExtrovert,
      })
      .eq('id', userId)
    if (saveErr) { setError(saveErr.message); setSaving(false); return }
    const { data: fullProfile } = await supabase.from('sister_profiles').select('*').eq('id', userId).single()
    if (fullProfile) {
      const { calculateCompletion } = await import('@/lib/profile-completion')
      const { percentage, isComplete } = calculateCompletion(fullProfile as Record<string, unknown>, 'sister')
      const { data: currentProfile } = await supabase.from('profiles').select('status, profile_complete').eq('id', userId).single()
      await supabase.from('profiles').update({
        profile_completion_percentage: percentage,
        profile_complete: currentProfile?.profile_complete || isComplete,
        status: currentProfile?.status === 'active' ? 'active' : (isComplete ? 'active' : 'pending_verification'),
      }).eq('id', userId)
    }
    router.push('/onboarding/sister/additional')
  }

  if (loading) return (
    <div className="min-h-screen bg-[#FDF8F3] flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-[#AF4D98] border-t-transparent rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="min-h-screen bg-[#FDF8F3]">
      <div className="max-w-[480px] mx-auto px-5 py-8 pb-28">
        <h2 className="text-2xl font-medium text-[#1A1A1A] tracking-[-0.02em] mb-1">Character & Goals</h2>
        <p className="text-[15px] text-[#9B9B9B] mb-8">Let your heart speak — this is what the brother will read first</p>

        <form onSubmit={handleNext} className="space-y-6">

          <div>
            <label className="block text-sm font-medium text-[#1A1A1A] mb-1">
              How would your family or close friends describe you?
            </label>
            <textarea required value={character} onChange={e => setCharacter(e.target.value)} rows={5}
              placeholder="e.g. Warm, grounded, someone who gives without expecting anything back. My family says I'm the glue that holds everyone together..."
              className={textareaCls} />
            <p className="text-xs text-[#9B9B9B] mt-1">{character.length} / 500 characters (min. 50)</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-[#1A1A1A] mb-1">
              What do you hope to build together in a marriage?
            </label>
            <textarea value={goals} onChange={e => setGoals(e.target.value)} rows={4}
              placeholder="e.g. A calm, loving home rooted in taqwa. I want to grow in knowledge alongside my husband and raise children who are proud of who they are..."
              className={textareaCls} />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#1A1A1A] mb-3">How do you typically handle conflict?</label>
            <PillGroup options={CONFLICT_OPTIONS} value={conflictStyle} onChange={setConflictStyle} />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#1A1A1A] mb-1">What are your love languages?</label>
            <p className="text-xs text-[#9B9B9B] mb-3">Select up to 3</p>
            <MultiPillGroup options={LOVE_LANGUAGE_OPTIONS} value={loveLanguage} onChange={setLoveLanguage} max={3} />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#1A1A1A] mb-3">Are you more of an introvert or extrovert?</label>
            <PillGroup options={INTROVERT_OPTIONS} value={introvertExtrovert} onChange={setIntrovertExtrovert} />
          </div>

          {error && (
            <div className="border border-[#C13515]/20 bg-[#FDECEA] text-[#C13515] text-sm rounded-[10px] px-4 py-3">{error}</div>
          )}

          <button type="submit" disabled={saving}
            className="w-full py-3.5 bg-[#AF4D98] text-white font-medium rounded-full text-[15px] hover:bg-[#9B3D85] transition-colors disabled:opacity-50">
            {saving ? 'Saving...' : 'Next →'}
          </button>
        </form>
      </div>
    </div>
  )
}
