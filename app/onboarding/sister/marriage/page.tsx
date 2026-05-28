'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'

const selectCls = 'w-full px-4 py-3.5 rounded-[10px] border border-[#EDE8E3] bg-white text-[#1A1A1A] text-[15px] focus:outline-none focus:border-[#AF4D98] focus:ring-2 focus:ring-[#AF4D98]/8 transition-colors appearance-none'

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

const YES_NO_OPTIONS = [
  { value: 'yes', label: 'Yes' },
  { value: 'no',  label: 'No' },
]

const WANTS_CHILDREN_OPTIONS = [
  { value: 'yes',  label: 'Yes' },
  { value: 'no',   label: 'No' },
  { value: 'open', label: 'Open to it' },
]

const NUM_CHILDREN_OPTIONS = [
  { value: '1',      label: '1' },
  { value: '2',      label: '2' },
  { value: '3',      label: '3' },
  { value: '4',      label: '4' },
  { value: '5_plus', label: '5+' },
  { value: 'open',   label: 'Open' },
]

const POLYGAMY_OPTIONS = [
  { value: 'open',       label: 'Open to it' },
  { value: 'not_for_me', label: 'Not for me' },
  { value: 'against',    label: 'Against it' },
  { value: 'undecided',  label: 'Undecided' },
]

export default function SisterMarriage() {
  const router = useRouter()
  const [userId,             setUserId]             = useState('')
  const [loading,            setLoading]            = useState(true)
  const [saving,             setSaving]             = useState(false)
  const [previouslyMarried,  setPreviouslyMarried]  = useState('')
  const [hasChildren,        setHasChildren]        = useState('')
  const [wantsChildren,      setWantsChildren]      = useState('')
  const [numChildrenWanted,  setNumChildrenWanted]  = useState('')
  const [polygamyOpenness,   setPolygamyOpenness]   = useState('')
  const [timeline,           setTimeline]           = useState('')
  const [error,              setError]              = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.replace('/auth/login'); return }
      setUserId(user.id)
      const { data } = await supabase
        .from('sister_profiles')
        .select('previously_married, has_children, wants_children, number_of_children_wanted, polygamy_openness, timeline_to_marry')
        .eq('id', user.id)
        .single()
      if (data) {
        if (data.previously_married)       setPreviouslyMarried(String(data.previously_married))
        if (data.has_children)             setHasChildren(String(data.has_children))
        if (data.wants_children)           setWantsChildren(String(data.wants_children))
        if (data.number_of_children_wanted) setNumChildrenWanted(data.number_of_children_wanted)
        if (data.polygamy_openness)        setPolygamyOpenness(String(data.polygamy_openness))
        if (data.timeline_to_marry)        setTimeline(data.timeline_to_marry)
      }
      setLoading(false)
    }
    load()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function handleNext(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    if (!previouslyMarried) { setError('Please answer: Previously married?'); return }
    if (!hasChildren)        { setError('Please answer: Do you have children?'); return }
    if (!wantsChildren)      { setError('Please answer: Do you want children?'); return }
    if (!numChildrenWanted)  { setError('Please answer: How many children do you want?'); return }
    if (!polygamyOpenness)   { setError('Please answer: What is your view on polygamy?'); return }
    if (!timeline)           { setError('Please select your timeline to marry.'); return }
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
        previously_married:        previouslyMarried,
        has_children:              hasChildren,
        wants_children:            wantsChildren,
        number_of_children_wanted: numChildrenWanted,
        polygamy_openness:         polygamyOpenness,
        timeline_to_marry:         timeline,
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
    router.push('/onboarding/sister/preferences')
  }

  if (loading) return (
    <div className="min-h-screen bg-[#FDF8F3] flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-[#AF4D98] border-t-transparent rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="min-h-screen bg-[#FDF8F3]">
      <div className="max-w-[480px] mx-auto px-5 py-8 pb-28">
        <h2 className="text-2xl font-medium text-[#1A1A1A] tracking-[-0.02em] mb-1">Marriage Goals</h2>
        <p className="text-[15px] text-[#9B9B9B] mb-8">Be honest — the right match depends on it</p>

        <form onSubmit={handleNext} className="space-y-6">

          <div>
            <label className="block text-sm font-medium text-[#1A1A1A] mb-3">Previously married?</label>
            <PillGroup options={YES_NO_OPTIONS} value={previouslyMarried} onChange={setPreviouslyMarried} />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#1A1A1A] mb-3">Do you have children?</label>
            <PillGroup options={YES_NO_OPTIONS} value={hasChildren} onChange={setHasChildren} />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#1A1A1A] mb-3">Do you want children?</label>
            <PillGroup options={WANTS_CHILDREN_OPTIONS} value={wantsChildren} onChange={setWantsChildren} />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#1A1A1A] mb-3">How many children do you want?</label>
            <PillGroup options={NUM_CHILDREN_OPTIONS} value={numChildrenWanted} onChange={setNumChildrenWanted} />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#1A1A1A] mb-3">What is your view on polygamy?</label>
            <PillGroup options={POLYGAMY_OPTIONS} value={polygamyOpenness} onChange={setPolygamyOpenness} />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#1A1A1A] mb-1">Timeline to Marry</label>
            <select value={timeline} onChange={e => setTimeline(e.target.value)} className={selectCls}>
              <option value="">Select...</option>
              <option value="within_3_months">Within 3 months</option>
              <option value="within_6_months">Within 6 months</option>
              <option value="within_a_year">Within a year</option>
              <option value="flexible">Flexible / not rushed</option>
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
