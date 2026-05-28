'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
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

const INLAWS_OPTIONS = [
  { value: 'yes', label: 'Yes, open to it' },
  { value: 'no', label: 'No, prefer separate' },
  { value: 'temporarily', label: 'Temporarily if needed' },
  { value: 'undecided', label: 'Undecided' },
]

const WIFE_WORKING_OPTIONS = [
  { value: 'yes', label: 'Yes, fully supportive' },
  { value: 'part_time', label: 'Part-time is fine' },
  { value: 'depends', label: 'Depends on the situation' },
  { value: 'prefer_home', label: 'Prefer she focuses on home' },
]

export default function BrotherDeepdive() {
  const router = useRouter()
  const [userId,      setUserId]      = useState('')
  const [dataLoading, setDataLoading] = useState(true)
  const [loading,     setLoading]     = useState(false)
  const [error,       setError]       = useState<string | null>(null)

  const [parentRelationship,     setParentRelationship]     = useState('')
  const [inlawsLivingTogether,   setInlawsLivingTogether]   = useState('')
  const [familySpouseDisagreement, setFamilySpouseDisagreement] = useState('')
  const [wifeWorkingOpenness,    setWifeWorkingOpenness]    = useState('')
  const [marriageVision10Years,  setMarriageVision10Years]  = useState('')
  const [romanceView,            setRomanceView]            = useState('')
  const [marriageFear,           setMarriageFear]           = useState('')
  const [uniqueContribution,     setUniqueContribution]     = useState('')
  const [healthBackground,       setHealthBackground]       = useState('')

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.replace('/auth/login'); return }
      setUserId(user.id)
      const { data } = await supabase
        .from('brother_profiles')
        .select('parent_relationship, inlaws_living_together, family_spouse_disagreement, wife_working_openness, marriage_vision_10_years, romance_view, marriage_fear, unique_contribution, health_background_disclosure')
        .eq('id', user.id)
        .single()
      if (data) {
        if (data.parent_relationship)       setParentRelationship(data.parent_relationship)
        if (data.inlaws_living_together)    setInlawsLivingTogether(data.inlaws_living_together)
        if (data.family_spouse_disagreement) setFamilySpouseDisagreement(data.family_spouse_disagreement)
        if (data.wife_working_openness)     setWifeWorkingOpenness(data.wife_working_openness)
        if (data.marriage_vision_10_years)  setMarriageVision10Years(data.marriage_vision_10_years)
        if (data.romance_view)              setRomanceView(data.romance_view)
        if (data.marriage_fear)             setMarriageFear(data.marriage_fear)
        if (data.unique_contribution)       setUniqueContribution(data.unique_contribution)
        if (data.health_background_disclosure) setHealthBackground(data.health_background_disclosure)
      }
      setDataLoading(false)
    }
    load()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    if (!parentRelationship.trim())       { setError('Please describe your relationship with your parents.'); return }
    if (!inlawsLivingTogether)            { setError('Please answer: In-laws living together?'); return }
    if (!familySpouseDisagreement.trim()) { setError('Please answer: How would you handle a family vs spouse disagreement?'); return }
    if (!wifeWorkingOpenness)             { setError('Please answer: Are you open to your wife working?'); return }
    if (!marriageVision10Years.trim())    { setError('Please answer: What does your marriage look like in 10 years?'); return }
    if (!romanceView.trim())              { setError('Please answer: What does romance look like to you?'); return }
    if (!marriageFear.trim())             { setError('Please answer: What is your biggest fear about marriage?'); return }
    if (!uniqueContribution.trim())       { setError('Please answer: What unique thing do you bring to a marriage?'); return }

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
        parent_relationship:        parentRelationship.trim(),
        inlaws_living_together:     inlawsLivingTogether,
        family_spouse_disagreement: familySpouseDisagreement.trim(),
        wife_working_openness:      wifeWorkingOpenness,
        marriage_vision_10_years:   marriageVision10Years.trim(),
        romance_view:               romanceView.trim(),
        marriage_fear:              marriageFear.trim(),
        unique_contribution:        uniqueContribution.trim(),
        health_background_disclosure: healthBackground.trim() || null,
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
    router.push('/onboarding/brother/photo')
  }

  if (dataLoading) return (
    <div className="min-h-screen bg-[#FDF8F3] flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-[#AF4D98] border-t-transparent rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="min-h-screen bg-[#FDF8F3]">
      <div className="max-w-[480px] mx-auto px-5 py-8 pb-28">
        <h2 className="text-2xl font-medium text-[#1A1A1A] tracking-[-0.02em] mb-1">Going deeper</h2>
        <p className="text-[15px] text-[#9B9B9B] mb-8">A few final questions about family and your vision for marriage</p>

        <form id="brother-deepdive-form" onSubmit={handleSubmit} className="space-y-8">

          <Question label="Describe your relationship with your parents">
            <textarea
              value={parentRelationship}
              onChange={e => setParentRelationship(e.target.value)}
              rows={3}
              placeholder="e.g. I have a close relationship with both parents..."
              className={textareaCls}
            />
          </Question>

          <Question label="Would you be open to your in-laws living with you?">
            <PillGroup options={INLAWS_OPTIONS} value={inlawsLivingTogether} onChange={setInlawsLivingTogether} />
          </Question>

          <Question label="How would you handle a conflict between your family and your spouse?">
            <textarea
              value={familySpouseDisagreement}
              onChange={e => setFamilySpouseDisagreement(e.target.value)}
              rows={3}
              placeholder="e.g. I would listen to both sides and try to find a fair resolution..."
              className={textareaCls}
            />
          </Question>

          <Question label="Are you open to your wife working after marriage?">
            <PillGroup options={WIFE_WORKING_OPTIONS} value={wifeWorkingOpenness} onChange={setWifeWorkingOpenness} />
          </Question>

          <Question label="What does your marriage look like in 10 years?">
            <textarea
              value={marriageVision10Years}
              onChange={e => setMarriageVision10Years(e.target.value)}
              rows={3}
              placeholder="e.g. A stable home, children who love Allah, mutual growth..."
              className={textareaCls}
            />
          </Question>

          <Question label="What does romance look like to you in a marriage?">
            <textarea
              value={romanceView}
              onChange={e => setRomanceView(e.target.value)}
              rows={3}
              placeholder="e.g. Small gestures, quality time, acts of service..."
              className={textareaCls}
            />
          </Question>

          <Question label="What is your biggest fear about marriage?">
            <textarea
              value={marriageFear}
              onChange={e => setMarriageFear(e.target.value)}
              rows={3}
              placeholder="Be honest — this is private..."
              className={textareaCls}
            />
          </Question>

          <Question label="What unique thing do you bring to a marriage?">
            <textarea
              value={uniqueContribution}
              onChange={e => setUniqueContribution(e.target.value)}
              rows={3}
              placeholder="e.g. My patience, my sense of humour, my commitment to growth..."
              className={textareaCls}
            />
          </Question>

          <Question
            label="Is there anything about your health or background a potential spouse should know?"
            note="Optional — only shared with matches."
          >
            <textarea
              value={healthBackground}
              onChange={e => setHealthBackground(e.target.value)}
              rows={3}
              placeholder="Optional..."
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
              form="brother-deepdive-form"
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
