'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'

const selectCls = 'w-full px-4 py-3.5 rounded-[10px] border border-[#EDE8E3] bg-white text-[#1A1A1A] text-[15px] focus:outline-none focus:border-[#AF4D98] focus:ring-2 focus:ring-[#AF4D98]/8 transition-colors appearance-none'
const inputCls  = 'w-full px-4 py-3.5 rounded-[10px] border border-[#EDE8E3] bg-white text-[#1A1A1A] placeholder-[#9B9B9B] text-[15px] focus:outline-none focus:border-[#AF4D98] focus:ring-2 focus:ring-[#AF4D98]/8 transition-colors'

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

const RELOCATE_OPTIONS = [
  { value: 'yes',     label: 'Yes' },
  { value: 'no',      label: 'No' },
  { value: 'depends', label: 'Depends' },
]

const SMOKING_OPTIONS = [
  { value: 'never',          label: 'Never' },
  { value: 'occasionally',   label: 'Occasionally' },
  { value: 'trying_to_quit', label: 'Trying to quit' },
  { value: 'yes',            label: 'Yes' },
]

const HALAL_OPTIONS = [
  { value: 'strictly',           label: 'Strictly halal only' },
  { value: 'mostly',             label: 'Mostly halal' },
  { value: 'not_strict',         label: "Not strict" },
  { value: 'prefer_not_to_say',  label: 'Prefer not to say' },
]

export default function SisterLifestyle() {
  const router = useRouter()
  const [userId,            setUserId]            = useState('')
  const [loading,           setLoading]           = useState(true)
  const [saving,            setSaving]            = useState(false)
  const [occupation,        setOccupation]        = useState('')
  const [educationLevel,    setEducationLevel]    = useState('')
  const [livingSituation,   setLivingSituation]   = useState('')
  const [willingToRelocate, setWillingToRelocate] = useState('')
  const [smoking,           setSmoking]           = useState('')
  const [strictHalalDiet,   setStrictHalalDiet]   = useState('')
  const [error,             setError]             = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.replace('/auth/login'); return }
      setUserId(user.id)
      const { data } = await supabase
        .from('sister_profiles')
        .select('occupation, education_level, living_situation, willing_to_relocate, smoking, strict_halal_diet')
        .eq('id', user.id)
        .single()
      if (data) {
        if (data.occupation)         setOccupation(data.occupation)
        if (data.education_level)    setEducationLevel(data.education_level)
        if (data.living_situation)   setLivingSituation(data.living_situation)
        if (data.willing_to_relocate) setWillingToRelocate(String(data.willing_to_relocate))
        if (data.smoking)            setSmoking(data.smoking)
        if (data.strict_halal_diet)  setStrictHalalDiet(data.strict_halal_diet)
      }
      setLoading(false)
    }
    load()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function handleNext(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    if (!educationLevel)    { setError('Please select your education level.'); return }
    if (!livingSituation)   { setError('Please select your living situation.'); return }
    if (!willingToRelocate) { setError('Please answer: Willing to relocate?'); return }
    if (!smoking)           { setError('Please answer: Do you smoke?'); return }
    if (!strictHalalDiet)   { setError('Please answer: How strictly do you follow a halal diet?'); return }
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
        occupation:          occupation.trim() || null,
        education_level:     educationLevel,
        living_situation:    livingSituation,
        willing_to_relocate: willingToRelocate,
        smoking,
        strict_halal_diet:   strictHalalDiet,
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
    router.push('/onboarding/sister/marriage')
  }

  if (loading) return (
    <div className="min-h-screen bg-[#FDF8F3] flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-[#AF4D98] border-t-transparent rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="min-h-screen bg-[#FDF8F3]">
      <div className="max-w-[480px] mx-auto px-5 py-8 pb-28">
        <h2 className="text-2xl font-medium text-[#1A1A1A] tracking-[-0.02em] mb-1">Lifestyle</h2>
        <p className="text-[15px] text-[#9B9B9B] mb-8">Tell us about your day-to-day life</p>

        <form onSubmit={handleNext} className="space-y-6">

          <div>
            <label className="block text-sm font-medium text-[#1A1A1A] mb-1">
              Occupation <span className="text-[#9B9B9B] font-normal">(optional)</span>
            </label>
            <input type="text" value={occupation} onChange={e => setOccupation(e.target.value)}
              placeholder="e.g. Teacher, Doctor, Student" className={inputCls} />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#1A1A1A] mb-1">Education Level</label>
            <select value={educationLevel} onChange={e => setEducationLevel(e.target.value)} className={selectCls}>
              <option value="">Select...</option>
              <option value="high_school">High School / Secondary</option>
              <option value="bachelors">{"Bachelor's Degree"}</option>
              <option value="masters">{"Master's Degree"}</option>
              <option value="doctorate">PhD / Doctorate</option>
              <option value="trade">Trade / Vocational</option>
              <option value="professional">Professional Degree (MD, JD, etc.)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-[#1A1A1A] mb-1">Living Situation</label>
            <select value={livingSituation} onChange={e => setLivingSituation(e.target.value)} className={selectCls}>
              <option value="">Select...</option>
              <option value="independent">Living independently</option>
              <option value="with_family">With family</option>
              <option value="with_roommates">With roommates</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-[#1A1A1A] mb-3">Willing to Relocate?</label>
            <PillGroup options={RELOCATE_OPTIONS} value={willingToRelocate} onChange={setWillingToRelocate} />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#1A1A1A] mb-3">Do you smoke or use tobacco/vape products?</label>
            <PillGroup options={SMOKING_OPTIONS} value={smoking} onChange={setSmoking} />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#1A1A1A] mb-3">How strictly do you follow a halal diet?</label>
            <PillGroup options={HALAL_OPTIONS} value={strictHalalDiet} onChange={setStrictHalalDiet} />
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
