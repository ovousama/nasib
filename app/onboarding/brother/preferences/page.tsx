'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'

const inputCls = 'w-full px-4 py-3.5 rounded-[10px] border border-[#EDE8E3] bg-white text-[#1A1A1A] placeholder-[#9B9B9B] text-[15px] focus:outline-none focus:border-[#AF4D98] focus:ring-2 focus:ring-[#AF4D98]/8 transition-colors'

const RELIGIOSITY_OPTIONS = [
  { value: 'more_practicing', label: 'More practicing than me' },
  { value: 'similar', label: 'Similar to me' },
  { value: 'less_is_fine', label: 'Less practicing is fine' },
  { value: 'open', label: 'Open' },
]

const DEALBREAKER_OPTIONS = [
  'Smoking',
  'Drinking',
  'Not practicing',
  'No hijab',
  'Previously married',
  'Has children',
  'Unwilling to relocate',
  'Other',
]

export default function BrotherPreferences() {
  const router = useRouter()
  const [userId,            setUserId]            = useState('')
  const [loading,           setLoading]           = useState(true)
  const [saving,            setSaving]            = useState(false)
  const [spouseReligiosity, setSpouseReligiosity] = useState('')
  const [ageMin,            setAgeMin]            = useState('')
  const [ageMax,            setAgeMax]            = useState('')
  const [dealbreakers,      setDealbreakers]      = useState<string[]>([])
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
        if (data.dealbreakers && Array.isArray(data.dealbreakers)) setDealbreakers(data.dealbreakers)
      }
      setLoading(false)
    }
    load()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function toggleDealbreaker(item: string) {
    setDealbreakers(prev =>
      prev.includes(item) ? prev.filter(d => d !== item) : [...prev, item]
    )
  }

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
    const { data: existingRow } = await supabase.from('brother_profiles').select('id').eq('id', userId).maybeSingle()
    if (!existingRow) {
      const { error: insertErr } = await supabase.from('brother_profiles').insert({ id: userId })
      if (insertErr) { setError(insertErr.message); setSaving(false); return }
    }
    const { error: saveErr } = await supabase
      .from('brother_profiles')
      .update({
        spouse_religiosity_preference: spouseReligiosity || null,
        spouse_age_min:                minNum,
        spouse_age_max:                maxNum,
        dealbreakers,
      })
      .eq('id', userId)
    if (saveErr) { setError(saveErr.message); setSaving(false); return }
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

        <form onSubmit={handleNext} className="space-y-6">

          <div>
            <label className="block text-sm font-medium text-[#1A1A1A] mb-3">
              What level of practice do you prefer in a spouse?{' '}
              <span className="text-[#9B9B9B] font-normal">(optional)</span>
            </label>
            <div className="flex flex-wrap gap-2">
              {RELIGIOSITY_OPTIONS.map(opt => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setSpouseReligiosity(spouseReligiosity === opt.value ? '' : opt.value)}
                  className={`px-4 py-2 rounded-full text-sm font-medium border transition-colors ${
                    spouseReligiosity === opt.value
                      ? 'bg-[#AF4D98] text-white border-[#AF4D98]'
                      : 'bg-white text-[#1A1A1A] border-[#EDE8E3] hover:border-[#D4CBC4]'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-[#1A1A1A] mb-2">
              Preferred Age Range <span className="text-[#9B9B9B] font-normal">(optional)</span>
            </label>
            <div className="flex gap-3 items-center">
              <input type="number" min={18} max={99} value={ageMin} onChange={e => setAgeMin(e.target.value)}
                placeholder="Min" className={inputCls} />
              <span className="text-[#9B9B9B] text-sm shrink-0">to</span>
              <input type="number" min={18} max={99} value={ageMax} onChange={e => setAgeMax(e.target.value)}
                placeholder="Max" className={inputCls} />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-[#1A1A1A] mb-3">
              Dealbreakers <span className="text-[#9B9B9B] font-normal">(optional — select all that apply)</span>
            </label>
            <div className="flex flex-wrap gap-2">
              {DEALBREAKER_OPTIONS.map(item => (
                <button
                  key={item}
                  type="button"
                  onClick={() => toggleDealbreaker(item)}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium border transition-colors ${
                    dealbreakers.includes(item)
                      ? 'bg-[#AF4D98] text-white border-[#AF4D98]'
                      : 'bg-white text-[#1A1A1A] border-[#EDE8E3] hover:border-[#D4CBC4]'
                  }`}
                >
                  {dealbreakers.includes(item) && (
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5 flex-shrink-0">
                      <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
                    </svg>
                  )}
                  {item}
                </button>
              ))}
            </div>
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
