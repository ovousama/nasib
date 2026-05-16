'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

const KEY = 'nasib_onboarding_brother'
const selectCls = 'w-full px-4 py-3.5 rounded-[10px] border border-[#EDE8E3] bg-white text-[#1A1A1A] text-[15px] focus:outline-none focus:border-[#AF4D98] focus:ring-2 focus:ring-[#AF4D98]/8 transition-colors appearance-none'
const inputCls  = 'w-full px-4 py-3.5 rounded-[10px] border border-[#EDE8E3] bg-white text-[#1A1A1A] placeholder-[#9B9B9B] text-[15px] focus:outline-none focus:border-[#AF4D98] focus:ring-2 focus:ring-[#AF4D98]/8 transition-colors'

function YesNo({ value, onChange }: { value: boolean | null; onChange: (v: boolean) => void }) {
  return (
    <div className="flex gap-3">
      {([true, false] as const).map(v => (
        <button key={String(v)} type="button" onClick={() => onChange(v)}
          className={`flex-1 py-3 rounded-full border font-medium text-sm transition-colors ${
            value === v
              ? 'border-[#AF4D98] bg-[#AF4D98] text-white'
              : 'border-[#EDE8E3] text-[#5C5C5C] bg-white hover:border-[#D4CBC4]'
          }`}>
          {v ? 'Yes' : 'No'}
        </button>
      ))}
    </div>
  )
}

export default function BrotherLifestyle() {
  const router = useRouter()
  const [occupation,         setOccupation]         = useState('')
  const [educationLevel,     setEducationLevel]     = useState('')
  const [livingSituation,    setLivingSituation]    = useState('')
  const [willingToRelocate,  setWillingToRelocate]  = useState<boolean | null>(null)
  const [financialReadiness, setFinancialReadiness] = useState('')
  const [error,              setError]              = useState<string | null>(null)

  useEffect(() => {
    try {
      const s = JSON.parse(localStorage.getItem(KEY) || '{}')
      if (s.occupation)          setOccupation(s.occupation)
      if (s.education_level)     setEducationLevel(s.education_level)
      if (s.living_situation)    setLivingSituation(s.living_situation)
      if (s.willing_to_relocate !== undefined && s.willing_to_relocate !== null) setWillingToRelocate(s.willing_to_relocate)
      if (s.financial_readiness) setFinancialReadiness(s.financial_readiness)
    } catch {}
  }, [])

  function handleNext(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    if (!educationLevel)     { setError('Please select your education level.'); return }
    if (!livingSituation)    { setError('Please select your living situation.'); return }
    if (!financialReadiness) { setError('Please select your financial readiness.'); return }

    const s = JSON.parse(localStorage.getItem(KEY) || '{}')
    localStorage.setItem(KEY, JSON.stringify({
      ...s,
      occupation:          occupation.trim(),
      education_level:     educationLevel,
      living_situation:    livingSituation,
      willing_to_relocate: willingToRelocate,
      financial_readiness: financialReadiness,
    }))
    router.push('/onboarding/brother/marriage')
  }

  return (
    <div className="min-h-screen bg-[#FDF8F3]">
      <div className="max-w-[480px] mx-auto px-5 py-8 pb-28">
        <h2 className="text-2xl font-medium text-[#1A1A1A] tracking-[-0.02em] mb-1">Lifestyle</h2>
        <p className="text-[15px] text-[#9B9B9B] mb-8">Tell us about your day-to-day life</p>

        <form onSubmit={handleNext} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-[#1A1A1A] mb-1">Occupation</label>
            <input type="text" value={occupation} onChange={e => setOccupation(e.target.value)}
              placeholder="e.g. Software Engineer, Teacher" className={inputCls} />
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

          <div>
            <label className="block text-sm font-medium text-[#1A1A1A] mb-1">Financial Readiness for Marriage</label>
            <select value={financialReadiness} onChange={e => setFinancialReadiness(e.target.value)} className={selectCls}>
              <option value="">Select...</option>
              <option value="fully ready">Fully ready — have a stable income and savings</option>
              <option value="almost ready">Almost ready — minor things to sort</option>
              <option value="working towards it">Working towards it</option>
            </select>
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
