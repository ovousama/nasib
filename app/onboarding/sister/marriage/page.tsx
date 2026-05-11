'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

const KEY = 'nasib_onboarding_sister'
const selectCls = 'w-full px-4 py-3 rounded-xl border border-[#EBEBEB] focus:outline-none focus:ring-2 focus:ring-[#AF4D98] focus:border-transparent text-[#1A1A1A] text-sm bg-white'

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

export default function SisterMarriage() {
  const router = useRouter()
  const [previouslyMarried, setPreviouslyMarried] = useState<boolean | null>(null)
  const [hasChildren,       setHasChildren]       = useState<boolean | null>(null)
  const [wantsChildren,     setWantsChildren]     = useState<boolean | null>(null)
  const [timeline,          setTimeline]          = useState('')
  const [error,             setError]             = useState<string | null>(null)

  useEffect(() => {
    try {
      const s = JSON.parse(localStorage.getItem(KEY) || '{}')
      if (s.previously_married !== undefined && s.previously_married !== null) setPreviouslyMarried(s.previously_married)
      if (s.has_children       !== undefined && s.has_children       !== null) setHasChildren(s.has_children)
      if (s.wants_children     !== undefined && s.wants_children     !== null) setWantsChildren(s.wants_children)
      if (s.timeline_to_marry) setTimeline(s.timeline_to_marry)
    } catch {}
  }, [])

  function handleNext(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    if (!timeline) { setError('Please select your timeline to marry.'); return }

    const s = JSON.parse(localStorage.getItem(KEY) || '{}')
    localStorage.setItem(KEY, JSON.stringify({
      ...s,
      previously_married: previouslyMarried,
      has_children:       hasChildren,
      wants_children:     wantsChildren,
      timeline_to_marry:  timeline,
    }))
    router.push('/onboarding/sister/preferences')
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-8">
      <h2 className="text-xl font-semibold text-[#1A1A1A] mb-1">Marriage Goals</h2>
      <p className="text-[#9B9B9B] text-sm mb-8">Be honest — the right match depends on it</p>

      <form onSubmit={handleNext} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-[#1A1A1A] mb-2">Previously married?</label>
          <YesNo value={previouslyMarried} onChange={setPreviouslyMarried} />
        </div>

        <div>
          <label className="block text-sm font-medium text-[#1A1A1A] mb-2">Do you have children?</label>
          <YesNo value={hasChildren} onChange={setHasChildren} />
        </div>

        <div>
          <label className="block text-sm font-medium text-[#1A1A1A] mb-2">Do you want children?</label>
          <YesNo value={wantsChildren} onChange={setWantsChildren} />
        </div>

        <div>
          <label className="block text-sm font-medium text-[#1A1A1A] mb-1">Timeline to Marry</label>
          <select value={timeline} onChange={e => setTimeline(e.target.value)} className={selectCls}>
            <option value="">Select...</option>
            <option value="asap">As soon as possible</option>
            <option value="within 6 months">Within 6 months</option>
            <option value="within a year">Within a year</option>
            <option value="1-2 years">1–2 years</option>
          </select>
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
