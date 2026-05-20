'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'

const inputCls    = 'w-full px-4 py-3.5 rounded-[10px] border border-[#EDE8E3] bg-white text-[#1A1A1A] placeholder-[#9B9B9B] text-[15px] focus:outline-none focus:border-[#AF4D98] focus:ring-2 focus:ring-[#AF4D98]/8 transition-colors'
const textareaCls = 'w-full px-4 py-3.5 rounded-[10px] border border-[#EDE8E3] bg-white text-[#1A1A1A] placeholder-[#9B9B9B] text-[15px] focus:outline-none focus:border-[#AF4D98] focus:ring-2 focus:ring-[#AF4D98]/8 transition-colors resize-none'

export default function BrotherPreferences() {
  const router = useRouter()
  const [userId,            setUserId]            = useState('')
  const [loading,           setLoading]           = useState(true)
  const [saving,            setSaving]            = useState(false)
  const [spouseReligiosity, setSpouseReligiosity] = useState('')
  const [ageMin,            setAgeMin]            = useState('')
  const [ageMax,            setAgeMax]            = useState('')
  const [dealbreakers,      setDealbreakers]      = useState('')
  const [error,             setError]             = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.replace('/auth/login'); return }
      setUserId(user.id)
      const { data } = await supabase
        .from('brother_profiles')
        .select('spouse_religiosity_preference, spouse_age_min, spouse_age_max, dealbreakers')
        .eq('id', user.id)
        .single()
      if (data) {
        if (data.spouse_religiosity_preference) setSpouseReligiosity(data.spouse_religiosity_preference)
        if (data.spouse_age_min) setAgeMin(String(data.spouse_age_min))
        if (data.spouse_age_max) setAgeMax(String(data.spouse_age_max))
        if (data.dealbreakers && Array.isArray(data.dealbreakers)) setDealbreakers(data.dealbreakers.join(', '))
      }
      setLoading(false)
    }
    load()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function handleNext(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    const minNum = ageMin ? parseInt(ageMin) : null
    const maxNum = ageMax ? parseInt(ageMax) : null
    if (minNum !== null && maxNum !== null && minNum > maxNum) {
      setError('Minimum age cannot be greater than maximum age.')
      return
    }
    setSaving(true)
    const supabase = createClient()
    const { error: saveErr } = await supabase
      .from('brother_profiles')
      .upsert({
        id:                            userId,
        spouse_religiosity_preference: spouseReligiosity.trim() || null,
        spouse_age_min:                minNum,
        spouse_age_max:                maxNum,
        dealbreakers:                  dealbreakers.split(',').map(d => d.trim()).filter(Boolean),
      }, { onConflict: 'id' })
    if (saveErr) { setError(saveErr.message); setSaving(false); return }
    const { data: fullProfile } = await supabase
      .from('brother_profiles')
      .select('*')
      .eq('id', userId)
      .single()

    if (fullProfile) {
      const { calculateCompletion } = await import('@/lib/profile-completion')
      const { percentage, isComplete } = calculateCompletion(fullProfile as Record<string, unknown>, 'brother')
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
    router.push('/onboarding/brother/character')
  }

  if (loading) return (
    <div className="min-h-screen bg-[#FDF8F3] flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-[#AF4D98] border-t-transparent rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="min-h-screen bg-[#FDF8F3]">
      <div className="max-w-[480px] mx-auto px-5 py-8 pb-28">
        <h2 className="text-2xl font-medium text-[#1A1A1A] tracking-[-0.02em] mb-1">Spouse Preferences</h2>
        <p className="text-[15px] text-[#9B9B9B] mb-8">What are you looking for in a spouse?</p>

        <form onSubmit={handleNext} className="space-y-5">

          <div>
            <label className="block text-sm font-medium text-[#1A1A1A] mb-1">
              Religiosity Preference <span className="text-[#9B9B9B] font-normal">(optional)</span>
            </label>
            <input type="text" value={spouseReligiosity} onChange={e => setSpouseReligiosity(e.target.value)}
              placeholder="e.g. Practicing, similar to me" className={inputCls} />
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
              placeholder="e.g. Smoking, not willing to make hijab, no plans for children..."
              className={textareaCls} />
            <p className="text-xs text-[#9B9B9B] mt-1">Separate with commas</p>
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
