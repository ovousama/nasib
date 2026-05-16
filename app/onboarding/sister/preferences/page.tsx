'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

const KEY = 'nasib_onboarding_sister'
const inputCls    = 'w-full px-4 py-3 rounded-xl border border-[#EDE8E3] focus:outline-none focus:ring-2 focus:ring-[#AF4D98] focus:border-transparent text-[#1A1A1A] placeholder-gray-400 text-sm'
const textareaCls = 'w-full px-4 py-3 rounded-xl border border-[#EDE8E3] focus:outline-none focus:ring-2 focus:ring-[#AF4D98] focus:border-transparent text-[#1A1A1A] placeholder-gray-400 text-sm resize-none'

export default function SisterPreferences() {
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
    router.push('/onboarding/sister/character')
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-8">
      <h2 className="text-xl font-medium text-[#1A1A1A] mb-1">Spouse Preferences</h2>
      <p className="text-[#9B9B9B] text-sm mb-8">What are you looking for in a spouse?</p>

      <form onSubmit={handleNext} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-[#1A1A1A] mb-1">
            Religiosity Preference <span className="text-[#9B9B9B] font-normal">(optional)</span>
          </label>
          <input type="text" value={spouseReligiosity} onChange={e => setSpouseReligiosity(e.target.value)}
            placeholder="e.g. Practicing, someone who leads the family in deen" className={inputCls} />
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
            placeholder="e.g. Smoking, no plans for children, not practicing..."
            className={textareaCls} />
          <p className="text-xs text-[#9B9B9B] mt-1">Separate with commas</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-100 text-red-600 text-sm rounded-xl px-4 py-3">{error}</div>
        )}

        <button type="submit"
          className="w-full py-3 bg-[#AF4D98] text-white font-medium rounded-full hover:bg-[#9B3D85] transition-colors text-sm">
          Next →
        </button>
      </form>
    </div>
  )
}
