'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'

export default function EditPreferencesPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [toast, setToast] = useState<'success' | 'error' | null>(null)

  const [userId, setUserId] = useState<string>('')
  const [gender, setGender] = useState<string>('')

  const [spouseReligiosityPreference, setSpouseReligiosityPreference] = useState('')
  const [spouseAgeMin, setSpouseAgeMin] = useState<number | ''>('')
  const [spouseAgeMax, setSpouseAgeMax] = useState<number | ''>('')
  const [dealbreakers, setDealbreakers] = useState('')

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/auth/login'); return }
      setUserId(user.id)
      const { data: profile } = await supabase.from('profiles').select('gender').eq('id', user.id).single()
      if (!profile) { router.push('/auth/login'); return }
      setGender(profile.gender)
      const table = profile.gender === 'brother' ? 'brother_profiles' : 'sister_profiles'
      const { data } = await supabase.from(table).select('spouse_religiosity_preference, spouse_age_min, spouse_age_max, dealbreakers').eq('id', user.id).single()
      if (data) {
        setSpouseReligiosityPreference(data.spouse_religiosity_preference ?? '')
        setSpouseAgeMin(data.spouse_age_min ?? '')
        setSpouseAgeMax(data.spouse_age_max ?? '')
        setDealbreakers(Array.isArray(data.dealbreakers) ? data.dealbreakers.join(', ') : (data.dealbreakers ?? ''))
      }
      setLoading(false)
    }
    load()
  }, [])

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    if (spouseAgeMin !== '' && spouseAgeMax !== '' && Number(spouseAgeMin) > Number(spouseAgeMax)) {
      setError('Minimum age cannot be greater than maximum age.')
      return
    }
    setSaving(true)
    setError(null)
    try {
      const supabase = createClient()
      const table = gender === 'brother' ? 'brother_profiles' : 'sister_profiles'
      const dealbreakersArr = dealbreakers.split(',').map(d => d.trim()).filter(Boolean)
      const { error: updateError } = await supabase
        .from(table)
        .update({
          spouse_religiosity_preference: spouseReligiosityPreference.trim() || null,
          spouse_age_min: spouseAgeMin === '' ? null : Number(spouseAgeMin),
          spouse_age_max: spouseAgeMax === '' ? null : Number(spouseAgeMax),
          dealbreakers: dealbreakersArr,
        })
        .eq('id', userId)
      if (updateError) throw updateError
      setToast('success')
      setTimeout(() => router.push('/dashboard/profile'), 1200)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#AF4D98] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      <div className="max-w-lg mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-6">
          <Link href="/dashboard/profile" className="text-[#9B9B9B] hover:text-[#1A1A1A] transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
              <path fillRule="evenodd" d="M17 10a.75.75 0 01-.75.75H5.612l4.158 3.96a.75.75 0 11-1.04 1.08l-5.5-5.25a.75.75 0 010-1.08l5.5-5.25a.75.75 0 111.04 1.08L5.612 9.25H16.25A.75.75 0 0117 10z" clipRule="evenodd" />
            </svg>
          </Link>
          <h1 className="text-lg font-semibold text-[#1A1A1A]">Edit Preferences</h1>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-100 text-red-600 text-sm rounded-xl px-4 py-3 mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSave} className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-medium text-[#1A1A1A] mb-1">Spouse Religiosity Preference</label>
            <input
              type="text"
              value={spouseReligiosityPreference}
              onChange={e => setSpouseReligiosityPreference(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-[#EBEBEB] focus:outline-none focus:ring-2 focus:ring-[#AF4D98] focus:border-transparent text-[#1A1A1A] text-sm bg-white"
              placeholder="Optional"
            />
          </div>

          <div className="flex gap-3">
            <div className="flex-1">
              <label className="block text-sm font-medium text-[#1A1A1A] mb-1">Min Age</label>
              <input
                type="number"
                value={spouseAgeMin}
                onChange={e => setSpouseAgeMin(e.target.value === '' ? '' : Number(e.target.value))}
                min={18}
                className="w-full px-4 py-3 rounded-xl border border-[#EBEBEB] focus:outline-none focus:ring-2 focus:ring-[#AF4D98] focus:border-transparent text-[#1A1A1A] text-sm bg-white"
                placeholder="e.g. 22"
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-[#1A1A1A] mb-1">Max Age</label>
              <input
                type="number"
                value={spouseAgeMax}
                onChange={e => setSpouseAgeMax(e.target.value === '' ? '' : Number(e.target.value))}
                min={18}
                className="w-full px-4 py-3 rounded-xl border border-[#EBEBEB] focus:outline-none focus:ring-2 focus:ring-[#AF4D98] focus:border-transparent text-[#1A1A1A] text-sm bg-white"
                placeholder="e.g. 35"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-[#1A1A1A] mb-1">Dealbreakers</label>
            <textarea
              value={dealbreakers}
              onChange={e => setDealbreakers(e.target.value)}
              rows={3}
              className="w-full px-4 py-3 rounded-xl border border-[#EBEBEB] focus:outline-none focus:ring-2 focus:ring-[#AF4D98] focus:border-transparent text-[#1A1A1A] text-sm bg-white resize-none"
              placeholder="e.g. Smoking, not practising, different values"
            />
            <p className="text-xs text-[#9B9B9B] mt-1">Separate with commas</p>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full bg-[#AF4D98] text-white font-semibold rounded-xl py-3 mt-2 disabled:opacity-60 transition-opacity"
          >
            {saving ? 'Saving...' : 'Save changes'}
          </button>

          <Link href="/dashboard/profile" className="text-center text-sm text-[#9B9B9B] hover:text-[#1A1A1A] transition-colors">
            Cancel
          </Link>
        </form>
      </div>

      {toast && (
        <div className={`fixed bottom-20 left-4 right-4 max-w-lg mx-auto rounded-xl px-4 py-3 shadow-md text-sm font-medium text-center ${toast === 'success' ? 'bg-[#AF4D98] text-white' : 'bg-red-600 text-white'}`}>
          {toast === 'success' ? 'Changes saved' : 'Something went wrong'}
        </div>
      )}
    </div>
  )
}
