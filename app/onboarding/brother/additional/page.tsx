'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Slider from '@/components/ui/Slider'
import { createClient } from '@/lib/supabase'

const textareaCls =
  'w-full px-4 py-3.5 rounded-[10px] border border-[#EDE8E3] bg-white text-[#1A1A1A] placeholder-[#9B9B9B] text-[15px] focus:outline-none focus:border-[#AF4D98] focus:ring-2 focus:ring-[#AF4D98]/8 transition-colors resize-none'

function Question({ label, note, children }: { label: string; note?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2.5">
      <label className="block text-sm font-medium text-[#1A1A1A]">{label}</label>
      {note && <p className="text-xs text-[#9B9B9B] -mt-1">{note}</p>}
      {children}
    </div>
  )
}

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

const MUSIC_OPTIONS = [
  { value: 'yes', label: 'Yes' },
  { value: 'no', label: 'No' },
  { value: 'nasheeds_only', label: 'Nasheeds only' },
  { value: 'occasionally', label: 'Occasionally' },
]

const DEBT_OPTIONS = [
  { value: 'no', label: 'No' },
  { value: 'yes_student', label: 'Yes — student loans' },
  { value: 'yes_other', label: 'Yes — other' },
  { value: 'prefer_not_to_say', label: 'Prefer not to say' },
]

export default function BrotherAdditional() {
  const router = useRouter()
  const [userId,   setUserId]   = useState('')
  const [dataLoading, setDataLoading] = useState(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [doYouListenToMusic,    setDoYouListenToMusic]    = useState('')
  const [traditionalVsReformist, setTraditionalVsReformist] = useState(50)
  const [emotionalAvailability,  setEmotionalAvailability]  = useState(50)
  const [stressManagement,       setStressManagement]       = useState('')
  const [hasSignificantDebt,     setHasSignificantDebt]     = useState('')
  const [mahrApproach,           setMahrApproach]           = useState('')

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.replace('/auth/login'); return }
      setUserId(user.id)
      const { data } = await supabase
        .from('brother_profiles')
        .select('do_you_listen_to_music, traditional_vs_reformist, emotional_availability, stress_management, has_significant_debt, mahr_approach')
        .eq('id', user.id)
        .single()
      if (data) {
        if (data.do_you_listen_to_music) setDoYouListenToMusic(data.do_you_listen_to_music)
        if (data.traditional_vs_reformist !== null && data.traditional_vs_reformist !== undefined) setTraditionalVsReformist(data.traditional_vs_reformist)
        if (data.emotional_availability  !== null && data.emotional_availability  !== undefined) setEmotionalAvailability(data.emotional_availability)
        if (data.stress_management)      setStressManagement(data.stress_management)
        if (data.has_significant_debt)   setHasSignificantDebt(data.has_significant_debt)
        if (data.mahr_approach)          setMahrApproach(data.mahr_approach)
      }
      setDataLoading(false)
    }
    load()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    if (!doYouListenToMusic)       { setError('Please answer: Do you listen to music?'); return }
    if (!stressManagement.trim())  { setError('Please answer: How do you manage stress?'); return }
    if (!hasSignificantDebt)       { setError('Please answer: Do you have significant debt?'); return }
    if (!mahrApproach.trim())      { setError('Please answer: How do you approach mahr?'); return }

    setLoading(true)
    const supabase = createClient()
    const { data: existingRow } = await supabase.from('brother_profiles').select('id').eq('id', userId).maybeSingle()
    if (!existingRow) {
      const { error: insertErr } = await supabase.from('brother_profiles').insert({ id: userId })
      if (insertErr) { setError(insertErr.message); setLoading(false); return }
    }
    const { error: saveErr } = await supabase
      .from('brother_profiles')
      .update({
        do_you_listen_to_music:    doYouListenToMusic,
        traditional_vs_reformist:  traditionalVsReformist,
        emotional_availability:    emotionalAvailability,
        stress_management:         stressManagement.trim(),
        has_significant_debt:      hasSignificantDebt,
        mahr_approach:             mahrApproach.trim(),
      })
      .eq('id', userId)
    if (saveErr) { setError(saveErr.message); setLoading(false); return }
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
    router.push('/onboarding/brother/deepdive')
  }

  if (dataLoading) return (
    <div className="min-h-screen bg-[#FDF8F3] flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-[#AF4D98] border-t-transparent rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="min-h-screen bg-[#FDF8F3]">
      <div className="max-w-[480px] mx-auto px-5 py-8 pb-28">
        <h2 className="text-2xl font-medium text-[#1A1A1A] tracking-[-0.02em] mb-1">A little more about you</h2>
        <p className="text-[15px] text-[#9B9B9B] mb-8">These help us find you a truly compatible match</p>

        <form id="brother-additional-form" onSubmit={handleSubmit} className="space-y-8">

          <Question label="Do you listen to music?">
            <PillGroup options={MUSIC_OPTIONS} value={doYouListenToMusic} onChange={setDoYouListenToMusic} />
          </Question>

          <Question label="Where do you sit on the traditional to reformist spectrum?">
            <Slider
              value={traditionalVsReformist}
              onChange={setTraditionalVsReformist}
              leftLabel="Traditional"
              rightLabel="Reformist"
              centerLabel="Balanced"
            />
          </Question>

          <Question label="How emotionally available are you in relationships?">
            <Slider
              value={emotionalAvailability}
              onChange={setEmotionalAvailability}
              leftLabel="Reserved"
              rightLabel="Very open"
              centerLabel="Balanced"
            />
          </Question>

          <Question label="How do you manage stress?">
            <textarea
              value={stressManagement}
              onChange={e => setStressManagement(e.target.value)}
              rows={3}
              placeholder="e.g. Exercise, prayer, talking to a trusted friend..."
              className={textareaCls}
            />
          </Question>

          <Question label="Do you have any significant debt?">
            <PillGroup options={DEBT_OPTIONS} value={hasSignificantDebt} onChange={setHasSignificantDebt} />
          </Question>

          <Question label="How do you approach mahr?">
            <textarea
              value={mahrApproach}
              onChange={e => setMahrApproach(e.target.value)}
              rows={3}
              placeholder="e.g. I believe mahr should be meaningful but not a burden..."
              className={textareaCls}
            />
          </Question>

          {error && (
            <div className="border border-[#C13515]/20 bg-[#FDECEA] text-[#C13515] text-sm rounded-[10px] px-4 py-3">{error}</div>
          )}
        </form>

        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#EDE8E3] px-4 py-4 z-20">
          <div className="max-w-[480px] mx-auto">
            <button
              type="submit"
              form="brother-additional-form"
              disabled={loading}
              className="w-full py-3.5 bg-[#AF4D98] text-white font-medium rounded-full text-[15px] hover:bg-[#9B3D85] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {loading ? 'Saving...' : 'Next →'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
