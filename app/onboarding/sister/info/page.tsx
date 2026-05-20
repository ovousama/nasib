'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'

const inputCls = 'w-full px-4 py-3 rounded-xl border border-[#EDE8E3] focus:outline-none focus:ring-2 focus:ring-[#AF4D98] focus:border-transparent text-[#1A1A1A] placeholder-gray-400 text-sm'

export default function SisterBasicInfo() {
  const router = useRouter()
  const [userId,    setUserId]    = useState('')
  const [loading,   setLoading]   = useState(true)
  const [saving,    setSaving]    = useState(false)
  const [fullName,  setFullName]  = useState('')
  const [age,       setAge]       = useState('')
  const [location,  setLocation]  = useState('')
  const [ethnicity, setEthnicity] = useState('')
  const [languages, setLanguages] = useState('')
  const [error,     setError]     = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.replace('/auth/login'); return }
      setUserId(user.id)
      const { data } = await supabase
        .from('sister_profiles')
        .select('full_name, age, location, ethnicity, languages')
        .eq('id', user.id)
        .single()
      if (data) {
        if (data.full_name)  setFullName(data.full_name)
        if (data.age)        setAge(String(data.age))
        if (data.location)   setLocation(data.location)
        if (data.ethnicity)  setEthnicity(data.ethnicity)
        if (data.languages && Array.isArray(data.languages)) setLanguages(data.languages.join(', '))
      }
      setLoading(false)
    }
    load()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function handleNext(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    const ageNum = parseInt(age)
    if (isNaN(ageNum) || ageNum < 18) { setError('You must be at least 18 years old.'); return }
    setSaving(true)
    const supabase = createClient()
    const { error: saveErr } = await supabase
      .from('sister_profiles')
      .upsert({
        id:        userId,
        full_name: fullName.trim(),
        age:       ageNum,
        location:  location.trim() || null,
        ethnicity: ethnicity.trim() || null,
        languages: languages.split(',').map(l => l.trim()).filter(Boolean),
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
      await supabase
        .from('profiles')
        .update({
          profile_completion_percentage: percentage,
          profile_complete: isComplete,
          status: isComplete ? 'active' : 'pending_verification',
        })
        .eq('id', userId)
    }
    router.push('/onboarding/sister/religiosity')
  }

  if (loading) return (
    <div className="min-h-screen bg-[#FDF8F3] flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-[#AF4D98] border-t-transparent rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="max-w-lg mx-auto px-4 py-8">
      <h2 className="text-xl font-medium text-[#1A1A1A] mb-1">Basic Information</h2>
      <p className="text-[#9B9B9B] text-sm mb-8">Tell us a little about yourself</p>

      <form onSubmit={handleNext} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-[#1A1A1A] mb-1">Full Name</label>
          <input type="text" required value={fullName} onChange={e => setFullName(e.target.value)}
            placeholder="e.g. Fatima Ahmed" className={inputCls} />
        </div>

        <div>
          <label className="block text-sm font-medium text-[#1A1A1A] mb-1">Age</label>
          <input type="number" required min={18} max={99} value={age} onChange={e => setAge(e.target.value)}
            placeholder="e.g. 25" className={inputCls} />
        </div>

        <div>
          <label className="block text-sm font-medium text-[#1A1A1A] mb-1">Location</label>
          <input type="text" required value={location} onChange={e => setLocation(e.target.value)}
            placeholder="e.g. Birmingham, UK" className={inputCls} />
        </div>

        <div>
          <label className="block text-sm font-medium text-[#1A1A1A] mb-1">
            Ethnicity <span className="text-[#9B9B9B] font-normal">(optional)</span>
          </label>
          <input type="text" value={ethnicity} onChange={e => setEthnicity(e.target.value)}
            placeholder="e.g. British Bangladeshi" className={inputCls} />
        </div>

        <div>
          <label className="block text-sm font-medium text-[#1A1A1A] mb-1">Languages Spoken</label>
          <input type="text" value={languages} onChange={e => setLanguages(e.target.value)}
            placeholder="e.g. English, Bengali, Arabic" className={inputCls} />
          <p className="text-xs text-[#9B9B9B] mt-1">Separate with commas</p>
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
