'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

const KEY = 'nasib_onboarding_brother'
const inputCls    = 'w-full px-4 py-3.5 rounded-[10px] border border-[#EDE8E3] bg-white text-[#1A1A1A] placeholder-[#9B9B9B] text-[15px] focus:outline-none focus:border-[#AF4D98] focus:ring-2 focus:ring-[#AF4D98]/8 transition-colors'
const textareaCls = 'w-full px-4 py-3.5 rounded-[10px] border border-[#EDE8E3] bg-white text-[#1A1A1A] placeholder-[#9B9B9B] text-[15px] focus:outline-none focus:border-[#AF4D98] focus:ring-2 focus:ring-[#AF4D98]/8 transition-colors resize-none'

export default function BrotherPreferences() {
  const router = useRouter()
  const [spouseReligiosity, setSpouseReligiosity] = useState('')
  const [ageMin,            setAgeMin]            = useState('')
  const [ageMax,            setAgeMax]            = useState('')
  const [dealbreakers,      setDealbreakers]      = useState('')
  const [error,             setError]             = useState<string | null>(null)

  useEffect(() => {
    try {
      const s = JSON.parse(localStorage.getItem(KEY) || '{}')
      if (s.spouse_religiosity_preference) setSpouseReligiosity(s.spouse_religiosity_preference)
      if (s.spouse_age_min) setAgeMin(String(s.spouse_age_min))
      if (s.spouse_age_max) setAgeMax(String(s.spouse_age_max))
      if (s.dealbreakers)   setDealbreakers(Array.isArray(s.dealbreakers) ? s.dealbreakers.join(', ') : s.dealbreakers)
    } catch {}
  }, [])

  function handleNext(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    const minNum = ageMin ? parseInt(ageMin) : null
    const maxNum = ageMax ? parseInt(ageMax) : null
    if (minNum !== null && maxNum !== null && minNum > maxNum) {
      setError('Minimum age cannot be greater than maximum age.')
      return
    }

    const s = JSON.parse(localStorage.getItem(KEY) || '{}')
    localStorage.setItem(KEY, JSON.stringify({
      ...s,
      spouse_religiosity_preference: spouseReligiosity.trim() || null,
      spouse_age_min:  minNum,
      spouse_age_max:  maxNum,
      dealbreakers:    dealbreakers.split(',').map(d => d.trim()).filter(Boolean),
    }))
    router.push('/onboarding/brother/character')
  }

  return (
    <div className="min-h-screen bg-[#FDF8F3]">
      <div className="max-w-[480px] mx-auto px-5 py-8 pb-28">
        <h2 className="text-2xl font-medium text-[#1A1A1A] tracking-[-0.02em] mb-1">Spouse Preferences</h2>
        <p className="text-[15px] text-[#9B9B9B] mb-8">What are you looking for in a spouse?</p>

        <form onSubmit={handleNext} className="space-y-5">

          <div>
            <label className="block text-sm font-medium text-[#1A1A1A] mb-1">
              Religiosity Preference <span className="text-[#9B9B9B] font-normal">(optional)</span>
            </label>
            <input type="text" value={spouseReligiosity} onChange={e => setSpouseReligiosity(e.target.value)}
              placeholder="e.g. Practicing, similar to me" className={inputCls} />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#1A1A1A] mb-2">Preferred Age Range</label>
            <div className="flex gap-3 items-center">
              <input type="number" min={18} max={99} value={ageMin} onChange={e => setAgeMin(e.target.value)}
                placeholder="Min" className={inputCls} />
              <span className="text-[#9B9B9B] text-sm shrink-0">to</span>
              <input type="number" min={18} max={99} value={ageMax} onChange={e => setAgeMax(e.target.value)}
                placeholder="Max" className={inputCls} />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-[#1A1A1A] mb-1">
              Dealbreakers <span className="text-[#9B9B9B] font-normal">(optional)</span>
            </label>
            <textarea value={dealbreakers} onChange={e => setDealbreakers(e.target.value)} rows={3}
              placeholder="e.g. Smoking, not willing to make hijab, no plans for children..."
              className={textareaCls} />
            <p className="text-xs text-[#9B9B9B] mt-1">Separate with commas</p>
          </div>

          {error && (
            <div className="border border-[#C13515]/20 bg-[#FDECEA] text-[#C13515] text-sm rounded-[10px] px-4 py-3">{error}</div>
          )}

          <button type="submit"
            className="w-full py-3.5 bg-[#AF4D98] text-white font-medium rounded-full text-[15px] hover:bg-[#9B3D85] transition-colors">
            Next →
          </button>
        </form>
      </div>
    </div>
  )
}
