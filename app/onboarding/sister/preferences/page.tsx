'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { recalculateCompletion } from '@/app/onboarding/actions'

const inputCls    = 'w-full px-4 py-3 rounded-xl border border-[#EDE8E3] focus:outline-none focus:ring-2 focus:ring-[#AF4D98] focus:border-transparent text-[#1A1A1A] placeholder-gray-400 text-sm'
const textareaCls = 'w-full px-4 py-3 rounded-xl border border-[#EDE8E3] focus:outline-none focus:ring-2 focus:ring-[#AF4D98] focus:border-transparent text-[#1A1A1A] placeholder-gray-400 text-sm resize-none'

export default function SisterPreferences() {
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
        .from('sister_profiles')
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
      .from('sister_profiles')
      .upsert({
        id:                            userId,
        spouse_religiosity_preference: spouseReligiosity.trim() || null,
        spouse_age_min:                minNum,
        spouse_age_max:                maxNum,
        dealbreakers:                  dealbreakers.split(',').map(d => d.trim()).filter(Boolean),
      }, { onConflict: 'id' })
    if (saveErr) { setError(saveErr.message); setSaving(false); return }
    await recalculateCompletion(userId, 'sister')
    router.push('/onboarding/sister/character')
  }

  if (loading) return (
    <div className="min-h-screen bg-[#FDF8F3] flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-[#AF4D98] border-t-transparent rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="max-w-lg mx-auto px-4 py-8">
      <h2 className="text-xl font-medium text-[#1A1A1A] mb-1">Spouse Preferences</h2>
      <p className="text-[#9B9B9B] text-sm mb-8">What are you looking for in a spouse?</p>

      <form onSubmit={handleNext} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-[#1A1A1A] mb-1">
            Religiosity Preference <span className="text-[#9B9B9B] font-normal">(optional)</span>
          </label>
          <input type="text" value={spouseReligiosity} onChange={e => setSpouseReligiosity(e.target.value)}
            placeholder="e.g. Practicing, someone who leads the family in deen" className={inputCls} />
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
            placeholder="e.g. Smoking, no plans for children, not practicing..."
            className={textareaCls} />
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
