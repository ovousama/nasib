'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'

const selectCls = 'w-full px-4 py-3 rounded-[10px] border border-[#EDE8E3] focus:outline-none focus:border-[#AF4D98] focus:ring-2 focus:ring-[#AF4D98]/8 text-[#1A1A1A] text-[15px] bg-white'
const inputCls  = 'w-full px-4 py-3 rounded-xl border border-[#EDE8E3] focus:outline-none focus:ring-2 focus:ring-[#AF4D98] focus:border-transparent text-[#1A1A1A] placeholder-gray-400 text-sm'

function YesNo({ value, onChange }: { value: boolean | null; onChange: (v: boolean) => void }) {
  return (
    <div className="flex gap-3">
      {([true, false] as const).map(v => (
        <button key={String(v)} type="button" onClick={() => onChange(v)}
          className={`flex-1 py-3 rounded-xl border-2 font-medium text-sm transition-all ${
            value === v
              ? 'border-[#AF4D98] bg-[#AF4D98] text-white'
              : 'border-[#EDE8E3] text-[#5C5C5C] hover:border-[#AF4D98]'
          }`}>
          {v ? 'Yes' : 'No'}
        </button>
      ))}
    </div>
  )
}

export default function SisterLifestyle() {
  const router = useRouter()
  const [userId,            setUserId]            = useState('')
  const [loading,           setLoading]           = useState(true)
  const [saving,            setSaving]            = useState(false)
  const [occupation,        setOccupation]        = useState('')
  const [educationLevel,    setEducationLevel]    = useState('')
  const [livingSituation,   setLivingSituation]   = useState('')
  const [willingToRelocate, setWillingToRelocate] = useState<boolean | null>(null)
  const [error,             setError]             = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.replace('/auth/login'); return }
      setUserId(user.id)
      const { data } = await supabase
        .from('sister_profiles')
        .select('occupation, education_level, living_situation, willing_to_relocate')
        .eq('id', user.id)
        .single()
      if (data) {
        if (data.occupation)       setOccupation(data.occupation)
        if (data.education_level)  setEducationLevel(data.education_level)
        if (data.living_situation) setLivingSituation(data.living_situation)
        if (data.willing_to_relocate !== null && data.willing_to_relocate !== undefined) setWillingToRelocate(data.willing_to_relocate)
      }
      setLoading(false)
    }
    load()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function handleNext(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    if (!educationLevel)  { setError('Please select your education level.'); return }
    if (!livingSituation) { setError('Please select your living situation.'); return }
    setSaving(true)
    const supabase = createClient()
    const { error: saveErr } = await supabase
      .from('sister_profiles')
      .upsert({
        id:                  userId,
        occupation:          occupation.trim() || null,
        education_level:     educationLevel,
        living_situation:    livingSituation,
        willing_to_relocate: willingToRelocate,
      }, { onConflict: 'id' })
    if (saveErr) { setError(saveErr.message); setSaving(false); return }
    const { data: fullProfile } = await supabase
      .from('sister_profiles')
      .select('*')
      .eq('id', userId)
      .single()

    if (fullProfile) {
      const { calculateCompletion } = await import('@/lib/profile-completion')
      const { percentage, isComplete } = calculateCompletion(fullProfile as Record<string, unknown>, 'sister')
      const { data: currentProfile } = await supabase
        .from('profiles')
        .select('status, profile_complete')
        .eq('id', userId)
        .single()
      await supabase
        .from('profiles')
        .update({
          profile_completion_percentage: percentage,
          profile_complete: currentProfile?.profile_complete || isComplete,
          status: currentProfile?.status === 'active' ? 'active' : (isComplete ? 'active' : 'pending_verification'),
        })
        .eq('id', userId)
    }
    router.push('/onboarding/sister/marriage')
  }

  if (loading) return (
    <div className="min-h-screen bg-[#FDF8F3] flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-[#AF4D98] border-t-transparent rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="max-w-lg mx-auto px-4 py-8">
      <h2 className="text-xl font-medium text-[#1A1A1A] mb-1">Lifestyle</h2>
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

        <button type="submit" disabled={saving}
          className="w-full py-3 bg-[#AF4D98] text-white font-medium rounded-full hover:bg-[#9B3D85] transition-colors text-sm disabled:opacity-50">
          {saving ? 'Saving...' : 'Next →'}
        </button>
      </form>
    </div>
  )
}
