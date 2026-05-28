'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'

const textareaCls = 'w-full px-4 py-3.5 rounded-[10px] border border-[#EDE8E3] bg-white text-[#1A1A1A] placeholder-[#9B9B9B] text-[15px] focus:outline-none focus:border-[#AF4D98] focus:ring-2 focus:ring-[#AF4D98]/8 transition-colors resize-none'

const CONFLICT_OPTIONS = [
  { value: 'avoidant', label: 'Avoidant' },
  { value: 'direct', label: 'Direct' },
  { value: 'collaborative', label: 'Collaborative' },
  { value: 'emotional', label: 'Emotional' },
]

const INTROVERT_OPTIONS = [
  { value: 'introvert', label: 'Introvert' },
  { value: 'ambivert', label: 'Ambivert' },
  { value: 'extrovert', label: 'Extrovert' },
]

const LOVE_LANGUAGE_OPTIONS = [
  'Words of affirmation',
  'Quality time',
  'Acts of service',
  'Gift giving',
  'Physical touch',
]

function PillGroup({ options, value, onChange }: { options: { value: string; label: string }[]; value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map(opt => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          className={`px-4 py-2 rounded-full text-sm font-medium border transition-colors ${
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

export default function BrotherCharacter() {
  const router = useRouter()
  const [userId,            setUserId]            = useState('')
  const [loading,           setLoading]           = useState(true)
  const [saving,            setSaving]            = useState(false)
  const [character,         setCharacter]         = useState('')
  const [goals,             setGoals]             = useState('')
  const [conflictStyle,     setConflictStyle]     = useState('')
  const [loveLanguage,      setLoveLanguage]      = useState<string[]>([])
  const [introvertExtrovert, setIntrovertExtrovert] = useState('')
  const [error,             setError]             = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.replace('/auth/login'); return }
      setUserId(user.id)
      const { data } = await supabase
        .from('brother_profiles')
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

  function toggleLoveLanguage(item: string) {
    setLoveLanguage(prev => {
      if (prev.includes(item)) return prev.filter(l => l !== item)
      if (prev.length >= 3) return prev
      return [...prev, item]
    })
  }

  async function handleNext(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    if (character.trim().length < 50) {
      setError('Please write at least 50 characters describing yourself.')
      return
    }
    if (!goals.trim()) { setError('Please answer: What do you hope to build together in a marriage?'); return }
    if (!conflictStyle)      { setError('Please select your conflict style.'); return }
    if (loveLanguage.length === 0) { setError('Please select at least one love language.'); return }
    if (!introvertExtrovert) { setError('Please select introvert or extrovert.'); return }
    setSaving(true)
    const supabase = createClient()
    const { data: existingRow } = await supabase.from('brother_profiles').select('id').eq('id', userId).maybeSingle()
    if (!existingRow) {
      const { error: insertErr } = await supabase.from('brother_profiles').insert({ id: userId })
      if (insertErr) { setError(insertErr.message); setSaving(false); return }
    }
    const { error: saveErr } = await supabase
      .from('brother_profiles')
      .update({
        character_description: character.trim(),
        goals:                 goals.trim(),
        conflict_style:        conflictStyle,
        love_language:         loveLanguage,
        introvert_extrovert:   introvertExtrovert,
      })
      .eq('id', userId)
    if (saveErr) { setError(saveErr.message); setSaving(false); return }
    const { data: fullProfile } = await supabase.from('brother_profiles').select('*').eq('id', userId).single()
    if (fullProfile) {
      const { calculateCompletion } = await import('@/lib/profile-completion')
      const { percentage, isComplete } = calculateCompletion(fullProfile as Record<string, unknown>, 'brother')
      const { data: currentProfile } = await supabase.from('profiles').select('status, profile_complete').eq('id', userId).single()
      await supabase.from('profiles').update({
        profile_completion_percentage: percentage,
        profile_complete: currentProfile?.profile_complete || isComplete,
        status: currentProfile?.status === 'active' ? 'active' : (isComplete ? 'active' : 'pending_verification'),
      }).eq('id', userId)
    }
    router.push('/onboarding/brother/additional')
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
        <p className="text-[15px] text-[#9B9B9B] mb-8">Let your personality come through — this is what the sister will read first</p>

        <form onSubmit={handleNext} className="space-y-6">

          <div>
            <label className="block text-sm font-medium text-[#1A1A1A] mb-1">
              How would those closest to you describe you?
            </label>
            <textarea required value={character} onChange={e => setCharacter(e.target.value)} rows={5}
              placeholder="e.g. Grounded, patient, someone who leads with kindness. My friends say I'm dependable and I take my responsibilities seriously..."
              className={textareaCls} />
            <p className="text-xs text-[#9B9B9B] mt-1">{character.length} / 500 characters (min 50)</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-[#1A1A1A] mb-1">
              What do you hope to build together in a marriage?
            </label>
            <textarea value={goals} onChange={e => setGoals(e.target.value)} rows={4}
              placeholder="e.g. A home filled with ilm and laughter. I want to raise children who love Allah and grow old with someone who makes me better..."
              className={textareaCls} />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#1A1A1A] mb-3">How do you handle conflict?</label>
            <PillGroup options={CONFLICT_OPTIONS} value={conflictStyle} onChange={setConflictStyle} />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#1A1A1A] mb-1">Love language</label>
            <p className="text-xs text-[#9B9B9B] mb-3">Choose up to 3</p>
            <div className="flex flex-wrap gap-2">
              {LOVE_LANGUAGE_OPTIONS.map(item => (
                <button
                  key={item}
                  type="button"
                  onClick={() => toggleLoveLanguage(item)}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium border transition-colors ${
                    loveLanguage.includes(item)
                      ? 'bg-[#AF4D98] text-white border-[#AF4D98]'
                      : 'bg-white text-[#1A1A1A] border-[#EDE8E3] hover:border-[#D4CBC4]'
                  }`}
                >
                  {loveLanguage.includes(item) && (
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5 flex-shrink-0">
                      <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
                    </svg>
                  )}
                  {item}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-[#1A1A1A] mb-3">Are you more introverted or extroverted?</label>
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
