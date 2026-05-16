'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

const KEY = 'nasib_onboarding_brother'
const selectCls = 'w-full px-4 py-3.5 rounded-[10px] border border-[#EDE8E3] bg-white text-[#1A1A1A] text-[15px] focus:outline-none focus:border-[#AF4D98] focus:ring-2 focus:ring-[#AF4D98]/8 transition-colors appearance-none'

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

export default function BrotherMarriage() {
  const router = useRouter()
  const [polygamyOpenness,   setPolygamyOpenness]   = useState<boolean | null>(null)
  const [previouslyMarried,  setPreviouslyMarried]  = useState<boolean | null>(null)
  const [hasChildren,        setHasChildren]        = useState<boolean | null>(null)
  const [wantsChildren,      setWantsChildren]      = useState<boolean | null>(null)
  const [timelineToMarry,    setTimelineToMarry]    = useState('')
  const [error,              setError]              = useState<string | null>(null)

  useEffect(() => {
    try {
      const s = JSON.parse(localStorage.getItem(KEY) || '{}')
      if (s.polygamy_openness  !== undefined && s.polygamy_openness  !== null) setPolygamyOpenness(s.polygamy_openness)
      if (s.previously_married !== undefined && s.previously_married !== null) setPreviouslyMarried(s.previously_married)
      if (s.has_children       !== undefined && s.has_children       !== null) setHasChildren(s.has_children)
      if (s.wants_children     !== undefined && s.wants_children     !== null) setWantsChildren(s.wants_children)
      if (s.timeline_to_marry) setTimelineToMarry(s.timeline_to_marry)
    } catch {}
  }, [])

  function handleNext(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    if (!timelineToMarry) { setError('Please select your timeline to marry.'); return }

    const s = JSON.parse(localStorage.getItem(KEY) || '{}')
    localStorage.setItem(KEY, JSON.stringify({
      ...s,
      polygamy_openness:  polygamyOpenness,
      previously_married: previouslyMarried,
      has_children:       hasChildren,
      wants_children:     wantsChildren,
      timeline_to_marry:  timelineToMarry,
    }))
    router.push('/onboarding/brother/preferences')
  }

  return (
    <div className="min-h-screen bg-[#FDF8F3]">
      <div className="max-w-[480px] mx-auto px-5 py-8 pb-28">
        <h2 className="text-2xl font-medium text-[#1A1A1A] tracking-[-0.02em] mb-1">Marriage Goals</h2>
        <p className="text-[15px] text-[#9B9B9B] mb-8">Be honest — the right match depends on it</p>

        <form onSubmit={handleNext} className="space-y-6">

          <div>
            <label className="block text-sm font-medium text-[#1A1A1A] mb-2">Open to polygamy?</label>
            <YesNo value={polygamyOpenness} onChange={setPolygamyOpenness} />
          </div>

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
            <select value={timelineToMarry} onChange={e => setTimelineToMarry(e.target.value)} className={selectCls}>
              <option value="">Select...</option>
              <option value="asap">As soon as possible</option>
              <option value="within 6 months">Within 6 months</option>
              <option value="within a year">Within a year</option>
              <option value="1-2 years">1–2 years</option>
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
