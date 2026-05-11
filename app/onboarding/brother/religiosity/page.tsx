'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

const KEY = 'nasib_onboarding_brother'
type Religiosity = 'practicing' | 'moderately_practicing' | 'learning'

const LEVELS: { value: Religiosity; label: string; sub: string }[] = [
  { value: 'practicing',            label: 'Practicing',            sub: 'Actively following the Sunnah' },
  { value: 'moderately_practicing', label: 'Moderately Practicing', sub: 'Working on consistency' },
  { value: 'learning',              label: 'Learning',              sub: 'Growing in my deen' },
]

const selectCls = 'w-full px-4 py-3 rounded-xl border border-[#EBEBEB] focus:outline-none focus:ring-2 focus:ring-[#AF4D98] focus:border-transparent text-[#1A1A1A] text-sm bg-white'
const inputCls  = 'w-full px-4 py-3 rounded-xl border border-[#EBEBEB] focus:outline-none focus:ring-2 focus:ring-[#AF4D98] focus:border-transparent text-[#1A1A1A] placeholder-gray-400 text-sm'

export default function BrotherReligiosity() {
  const router = useRouter()
  const [religiosity,      setReligiosity]      = useState<Religiosity | null>(null)
  const [madhab,           setMadhab]           = useState('')
  const [prayerFreq,       setPrayerFreq]       = useState('')
  const [islamicKnowledge, setIslamicKnowledge] = useState('')
  const [hasBeard,         setHasBeard]         = useState<boolean | null>(null)
  const [error,            setError]            = useState<string | null>(null)

  useEffect(() => {
    try {
      const s = JSON.parse(localStorage.getItem(KEY) || '{}')
      if (s.religiosity_level)       setReligiosity(s.religiosity_level)
      if (s.madhab)                  setMadhab(s.madhab)
      if (s.prayer_frequency)        setPrayerFreq(s.prayer_frequency)
      if (s.islamic_knowledge_level) setIslamicKnowledge(s.islamic_knowledge_level)
      if (s.has_beard !== undefined && s.has_beard !== null) setHasBeard(s.has_beard)
    } catch {}
  }, [])

  function handleNext(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    if (!religiosity)      { setError('Please select your religiosity level.'); return }
    if (!prayerFreq)       { setError('Please select your prayer frequency.'); return }
    if (!islamicKnowledge) { setError('Please select your Islamic knowledge level.'); return }

    const s = JSON.parse(localStorage.getItem(KEY) || '{}')
    localStorage.setItem(KEY, JSON.stringify({
      ...s,
      religiosity_level:       religiosity,
      madhab:                  madhab.trim() || null,
      prayer_frequency:        prayerFreq,
      islamic_knowledge_level: islamicKnowledge,
      has_beard:               hasBeard,
    }))
    router.push('/onboarding/brother/lifestyle')
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-8">
      <h2 className="text-xl font-semibold text-[#1A1A1A] mb-1">Your Deen</h2>
      <p className="text-[#9B9B9B] text-sm mb-8">Help us understand where you are in your faith journey</p>

      <form onSubmit={handleNext} className="space-y-6">

        {/* Religiosity */}
        <div>
          <label className="block text-sm font-medium text-[#1A1A1A] mb-3">Religiosity Level</label>
          <div className="space-y-3">
            {LEVELS.map(opt => (
              <button key={opt.value} type="button" onClick={() => setReligiosity(opt.value)}
                className={`w-full px-4 py-4 rounded-xl border-2 text-left transition-all ${
                  religiosity === opt.value
                    ? 'border-[#AF4D98] bg-[#AF4D98] text-white'
                    : 'border-[#EBEBEB] text-[#1A1A1A] hover:border-[#AF4D98]'
                }`}>
                <div className="font-medium text-sm">{opt.label}</div>
                <div className={`text-xs mt-0.5 ${religiosity === opt.value ? 'text-green-100' : 'text-[#9B9B9B]'}`}>
                  {opt.sub}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Madhab */}
        <div>
          <label className="block text-sm font-medium text-[#1A1A1A] mb-1">
            Madhab <span className="text-[#9B9B9B] font-normal">(optional)</span>
          </label>
          <input type="text" value={madhab} onChange={e => setMadhab(e.target.value)}
            placeholder="e.g. Hanafi, Shafi'i, Maliki, Hanbali" className={inputCls} />
        </div>

        {/* Prayer frequency */}
        <div>
          <label className="block text-sm font-medium text-[#1A1A1A] mb-1">Prayer Frequency</label>
          <select value={prayerFreq} onChange={e => setPrayerFreq(e.target.value)} className={selectCls}>
            <option value="">Select...</option>
            <option value="5 times daily">5 times daily, alhamdulillah</option>
            <option value="mostly">Mostly — occasional missed prayers</option>
            <option value="sometimes">Sometimes — working on it</option>
            <option value="working on it">Just getting started</option>
          </select>
        </div>

        {/* Islamic knowledge */}
        <div>
          <label className="block text-sm font-medium text-[#1A1A1A] mb-1">Islamic Knowledge Level</label>
          <select value={islamicKnowledge} onChange={e => setIslamicKnowledge(e.target.value)} className={selectCls}>
            <option value="">Select...</option>
            <option value="strong">Strong — studied formally or extensively</option>
            <option value="moderate">Moderate — good general knowledge</option>
            <option value="beginner">Beginner — learning the basics</option>
          </select>
        </div>

        {/* Has beard */}
        <div>
          <label className="block text-sm font-medium text-[#1A1A1A] mb-2">Do you keep a beard?</label>
          <div className="flex gap-3">
            {([true, false] as const).map(v => (
              <button key={String(v)} type="button" onClick={() => setHasBeard(v)}
                className={`flex-1 py-3 rounded-xl border-2 font-medium text-sm transition-all ${
                  hasBeard === v
                    ? 'border-[#AF4D98] bg-[#AF4D98] text-white'
                    : 'border-[#EBEBEB] text-[#6B6B6B] hover:border-[#AF4D98]'
                }`}>
                {v ? 'Yes' : 'No'}
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-100 text-red-600 text-sm rounded-xl px-4 py-3">{error}</div>
        )}

        <button type="submit"
          className="w-full py-3 bg-[#AF4D98] text-white font-semibold rounded-xl hover:bg-[#9B3D85] transition-colors text-sm">
          Next →
        </button>
      </form>
    </div>
  )
}
