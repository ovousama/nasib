'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

const KEY = 'nasib_onboarding_sister'
const selectCls = 'w-full px-4 py-3 rounded-xl border border-[#EBEBEB] focus:outline-none focus:ring-2 focus:ring-[#AF4D98] focus:border-transparent text-[#1A1A1A] text-sm bg-white'
const inputCls  = 'w-full px-4 py-3 rounded-xl border border-[#EBEBEB] focus:outline-none focus:ring-2 focus:ring-[#AF4D98] focus:border-transparent text-[#1A1A1A] placeholder-gray-400 text-sm'

function YesNo({ value, onChange }: { value: boolean | null; onChange: (v: boolean) => void }) {
  return (
    <div className="flex gap-3">
      {([true, false] as const).map(v => (
        <button key={String(v)} type="button" onClick={() => onChange(v)}
          className={`flex-1 py-3 rounded-xl border-2 font-medium text-sm transition-all ${
            value === v
              ? 'border-[#AF4D98] bg-[#AF4D98] text-white'
              : 'border-[#EBEBEB] text-[#6B6B6B] hover:border-[#AF4D98]'
          }`}>
          {v ? 'Yes' : 'No'}
        </button>
      ))}
    </div>
  )
}

export default function SisterLifestyle() {
  const router = useRouter()
  const [occupation,        setOccupation]        = useState('')
  const [educationLevel,    setEducationLevel]    = useState('')
  const [livingSituation,   setLivingSituation]   = useState('')
  const [willingToRelocate, setWillingToRelocate] = useState<boolean | null>(null)
  const [error,             setError]             = useState<string | null>(null)

  useEffect(() => {
    try {
      const s = JSON.parse(localStorage.getItem(KEY) || '{}')
      if (s.occupation)       setOccupation(s.occupation)
      if (s.education_level)  setEducationLevel(s.education_level)
      if (s.living_situation) setLivingSituation(s.living_situation)
      if (s.willing_to_relocate !== undefined && s.willing_to_relocate !== null) setWillingToRelocate(s.willing_to_relocate)
    } catch {}
  }, [])

  function handleNext(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    if (!educationLevel)  { setError('Please select your education level.'); return }
    if (!livingSituation) { setError('Please select your living situation.'); return }

    const s = JSON.parse(localStorage.getItem(KEY) || '{}')
    localStorage.setItem(KEY, JSON.stringify({
      ...s,
      occupation:          occupation.trim(),
      education_level:     educationLevel,
      living_situation:    livingSituation,
      willing_to_relocate: willingToRelocate,
    }))
    router.push('/onboarding/sister/marriage')
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-8">
      <h2 className="text-xl font-semibold text-[#1A1A1A] mb-1">Lifestyle</h2>
      <p className="text-[#9B9B9B] text-sm mb-8">Tell us about your day-to-day life</p>

      <form onSubmit={handleNext} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-[#1A1A1A] mb-1">Occupation</label>
          <input type="text" value={occupation} onChange={e => setOccupation(e.target.value)}
            placeholder="e.g. Teacher, Doctor, Student" className={inputCls} />
        </div>

        <div>
          <label className="block text-sm font-medium text-[#1A1A1A] mb-1">Education Level</label>
          <select value={educationLevel} onChange={e => setEducationLevel(e.target.value)} className={selectCls}>
            <option value="">Select...</option>
            <option value="high school">High School</option>
            <option value="bachelors">{"Bachelor's Degree"}</option>
            <option value="masters">{"Master's Degree"}</option>
            <option value="phd">PhD / Doctorate</option>
            <option value="trade">Trade / Vocational</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-[#1A1A1A] mb-1">Living Situation</label>
          <select value={livingSituation} onChange={e => setLivingSituation(e.target.value)} className={selectCls}>
            <option value="">Select...</option>
            <option value="alone">Living alone</option>
            <option value="with family">With family</option>
            <option value="with roommates">With roommates</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-[#1A1A1A] mb-2">Willing to Relocate?</label>
          <YesNo value={willingToRelocate} onChange={setWillingToRelocate} />
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
