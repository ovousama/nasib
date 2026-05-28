'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'

type Religiosity = 'practicing' | 'moderately_practicing' | 'learning'

const LEVELS: { value: Religiosity; label: string; sub: string }[] = [
  { value: 'practicing',            label: 'Practicing',            sub: 'Actively following the Sunnah' },
  { value: 'moderately_practicing', label: 'Moderately Practicing', sub: 'Working on consistency' },
  { value: 'learning',              label: 'Learning',              sub: 'Growing in my deen' },
]

const MADHAB_OPTIONS = ["Hanafi", "Shafi'i", "Maliki", "Hanbali", "No specific madhab", "Salafi"]

const selectCls = 'w-full px-4 py-3.5 rounded-[10px] border border-[#EDE8E3] bg-white text-[#1A1A1A] text-[15px] focus:outline-none focus:border-[#AF4D98] focus:ring-2 focus:ring-[#AF4D98]/8 transition-colors appearance-none'

export default function SisterReligiosity() {
  const router = useRouter()
  const [userId,          setUserId]          = useState('')
  const [loading,         setLoading]         = useState(true)
  const [saving,          setSaving]          = useState(false)
  const [religiosity,     setReligiosity]     = useState<Religiosity | null>(null)
  const [madhab,          setMadhab]          = useState('')
  const [prayerFreq,      setPrayerFreq]      = useState('')
  const [islamicKnowledge, setIslamicKnowledge] = useState('')
  const [wearsHijab,      setWearsHijab]      = useState('')
  const [error,           setError]           = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.replace('/auth/login'); return }
      setUserId(user.id)
      const { data } = await supabase
        .from('sister_profiles')
        .select('religiosity_level, madhab, prayer_frequency, islamic_knowledge_level, wears_hijab')
        .eq('id', user.id)
        .single()
      if (data) {
        if (data.religiosity_level)       setReligiosity(data.religiosity_level)
        if (data.madhab)                  setMadhab(data.madhab)
        if (data.prayer_frequency)        setPrayerFreq(data.prayer_frequency)
        if (data.islamic_knowledge_level) setIslamicKnowledge(data.islamic_knowledge_level)
        if (data.wears_hijab)             setWearsHijab(data.wears_hijab)
      }
      setLoading(false)
    }
    load()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function handleNext(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    if (!religiosity)      { setError('Please select your religiosity level.'); return }
    if (!prayerFreq)       { setError('Please select your prayer frequency.'); return }
    if (!islamicKnowledge) { setError('Please select your Islamic knowledge level.'); return }
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
        religiosity_level:       religiosity,
        madhab:                  madhab || null,
        prayer_frequency:        prayerFreq,
        islamic_knowledge_level: islamicKnowledge,
        wears_hijab:             wearsHijab || null,
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
    router.push('/onboarding/sister/lifestyle')
  }

  if (loading) return (
    <div className="min-h-screen bg-[#FDF8F3] flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-[#AF4D98] border-t-transparent rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="min-h-screen bg-[#FDF8F3]">
      <div className="max-w-[480px] mx-auto px-5 py-8 pb-28">
        <h2 className="text-2xl font-medium text-[#1A1A1A] tracking-[-0.02em] mb-1">Your Deen</h2>
        <p className="text-[15px] text-[#9B9B9B] mb-8">Help us understand where you are in your faith journey</p>

        <form onSubmit={handleNext} className="space-y-6">

          <div>
            <label className="block text-sm font-medium text-[#1A1A1A] mb-3">Religiosity Level</label>
            <div className="space-y-3">
              {LEVELS.map(opt => (
                <button key={opt.value} type="button" onClick={() => setReligiosity(opt.value)}
                  className={`w-full px-4 py-4 rounded-[10px] border text-left transition-colors ${
                    religiosity === opt.value
                      ? 'border-[#AF4D98] bg-[#AF4D98] text-white'
                      : 'border-[#EDE8E3] bg-white text-[#1A1A1A] hover:border-[#D4CBC4]'
                  }`}>
                  <div className="font-medium text-sm">{opt.label}</div>
                  <div className={`text-xs mt-0.5 ${religiosity === opt.value ? 'text-white/80' : 'text-[#9B9B9B]'}`}>
                    {opt.sub}
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-[#1A1A1A] mb-3">
              Madhab <span className="text-[#9B9B9B] font-normal">(optional)</span>
            </label>
            <div className="flex flex-wrap gap-2">
              {MADHAB_OPTIONS.map(opt => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => setMadhab(madhab === opt ? '' : opt)}
                  className={`px-4 py-2 rounded-full text-sm font-medium border transition-colors ${
                    madhab === opt
                      ? 'bg-[#AF4D98] text-white border-[#AF4D98]'
                      : 'bg-white text-[#1A1A1A] border-[#EDE8E3] hover:border-[#D4CBC4]'
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-[#1A1A1A] mb-1">Prayer Frequency</label>
            <select value={prayerFreq} onChange={e => setPrayerFreq(e.target.value)} className={selectCls}>
              <option value="">Select...</option>
              <option value="five_times_daily">5 times daily, alhamdulillah</option>
              <option value="most_prayers">Mostly — occasional missed prayers</option>
              <option value="some_prayers">Sometimes — working on it</option>
              <option value="not_currently">Just getting started</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-[#1A1A1A] mb-1">Islamic Knowledge Level</label>
            <select value={islamicKnowledge} onChange={e => setIslamicKnowledge(e.target.value)} className={selectCls}>
              <option value="">Select...</option>
              <option value="advanced">Strong — studied formally or extensively</option>
              <option value="intermediate">Moderate — good general knowledge</option>
              <option value="basic">Beginner — learning the basics</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-[#1A1A1A] mb-1">Do you wear hijab?</label>
            <select value={wearsHijab} onChange={e => setWearsHijab(e.target.value)} className={selectCls}>
              <option value="">Select...</option>
              <option value="always">Yes, always</option>
              <option value="sometimes">Sometimes</option>
              <option value="no">No</option>
              <option value="prefer_not_to_say">Prefer not to say</option>
            </select>
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
