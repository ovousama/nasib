'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'
import { recalculateProfileCompletion } from '../recalculate-action'

export default function EditBasicPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [toast, setToast] = useState<'success' | 'error' | null>(null)

  const [userId, setUserId] = useState<string>('')
  const [gender, setGender] = useState<string>('')
  const [fullName, setFullName] = useState('')
  const [age, setAge] = useState<number | ''>('')
  const [location, setLocation] = useState('')
  const [ethnicity, setEthnicity] = useState('')
  const [languages, setLanguages] = useState('')

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/auth/login'); return }
      setUserId(user.id)
      const { data: profile } = await supabase.from('profiles').select('gender').eq('id', user.id).single()
      if (!profile) { router.push('/auth/login'); return }
      setGender(profile.gender)
      if (profile.gender === 'brother') {
        const { data } = await supabase.from('brother_profiles').select('full_name, age, location, ethnicity, languages').eq('id', user.id).single()
        if (data) {
          setFullName(data.full_name ?? '')
          setAge(data.age ?? '')
          setLocation(data.location ?? '')
          setEthnicity(data.ethnicity ?? '')
          setLanguages(Array.isArray(data.languages) ? data.languages.join(', ') : '')
        }
      } else {
        const { data } = await supabase.from('sister_profiles').select('full_name, age, location, ethnicity, languages').eq('id', user.id).single()
        if (data) {
          setFullName(data.full_name ?? '')
          setAge(data.age ?? '')
          setLocation(data.location ?? '')
          setEthnicity(data.ethnicity ?? '')
          setLanguages(Array.isArray(data.languages) ? data.languages.join(', ') : '')
        }
      }
      setLoading(false)
    }
    load()
  }, [])

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    if (!fullName.trim()) { setError('Full name is required.'); return }
    if (age === '' || Number(age) < 18) { setError('Age must be 18 or older.'); return }
    if (!location.trim()) { setError('Location is required.'); return }
    setSaving(true)
    setError(null)
    try {
      const supabase = createClient()
      const languagesArr = languages.split(',').map(l => l.trim()).filter(Boolean)
      const table = gender === 'brother' ? 'brother_profiles' : 'sister_profiles'
      const { error: updateError } = await supabase
        .from(table)
        .update({ full_name: fullName.trim(), age: Number(age), location: location.trim(), ethnicity: ethnicity.trim() || null, languages: languagesArr })
        .eq('id', userId)
      if (updateError) throw updateError
      recalculateProfileCompletion().catch(() => {})
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
      <div className="min-h-screen bg-[#FDF8F3] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#AF4D98] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#FDF8F3]">
      <div className="max-w-lg mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-6">
          <Link href="/dashboard/profile" className="text-[#9B9B9B] hover:text-[#1A1A1A] transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
              <path fillRule="evenodd" d="M17 10a.75.75 0 01-.75.75H5.612l4.158 3.96a.75.75 0 11-1.04 1.08l-5.5-5.25a.75.75 0 010-1.08l5.5-5.25a.75.75 0 111.04 1.08L5.612 9.25H16.25A.75.75 0 0117 10z" clipRule="evenodd" />
            </svg>
          </Link>
          <h1 className="text-base font-medium text-[#1A1A1A]">Edit Basic Info</h1>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-100 text-red-600 text-sm rounded-xl px-4 py-3 mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSave} className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-medium text-[#1A1A1A] mb-1">Full Name <span className="text-red-500">*</span></label>
            <input
              type="text"
              value={fullName}
              onChange={e => setFullName(e.target.value)}
              className="w-full px-4 py-3 rounded-[10px] border border-[#EDE8E3] focus:outline-none focus:border-[#AF4D98] focus:ring-2 focus:ring-[#AF4D98]/8 text-[#1A1A1A] text-[15px] bg-white"
              placeholder="Your full name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#1A1A1A] mb-1">Age <span className="text-red-500">*</span></label>
            <input
              type="number"
              value={age}
              onChange={e => setAge(e.target.value === '' ? '' : Number(e.target.value))}
              min={18}
              className="w-full px-4 py-3 rounded-[10px] border border-[#EDE8E3] focus:outline-none focus:border-[#AF4D98] focus:ring-2 focus:ring-[#AF4D98]/8 text-[#1A1A1A] text-[15px] bg-white"
              placeholder="Your age"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#1A1A1A] mb-1">Location <span className="text-red-500">*</span></label>
            <input
              type="text"
              value={location}
              onChange={e => setLocation(e.target.value)}
              className="w-full px-4 py-3 rounded-[10px] border border-[#EDE8E3] focus:outline-none focus:border-[#AF4D98] focus:ring-2 focus:ring-[#AF4D98]/8 text-[#1A1A1A] text-[15px] bg-white"
              placeholder="City, Country"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#1A1A1A] mb-1">Ethnicity</label>
            <input
              type="text"
              value={ethnicity}
              onChange={e => setEthnicity(e.target.value)}
              className="w-full px-4 py-3 rounded-[10px] border border-[#EDE8E3] focus:outline-none focus:border-[#AF4D98] focus:ring-2 focus:ring-[#AF4D98]/8 text-[#1A1A1A] text-[15px] bg-white"
              placeholder="Optional"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#1A1A1A] mb-1">Languages</label>
            <input
              type="text"
              value={languages}
              onChange={e => setLanguages(e.target.value)}
              className="w-full px-4 py-3 rounded-[10px] border border-[#EDE8E3] focus:outline-none focus:border-[#AF4D98] focus:ring-2 focus:ring-[#AF4D98]/8 text-[#1A1A1A] text-[15px] bg-white"
              placeholder="e.g. English, Arabic, Urdu"
            />
            <p className="text-xs text-[#9B9B9B] mt-1">Separate with commas</p>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full bg-[#AF4D98] text-white font-medium rounded-full py-3.5 mt-2 disabled:opacity-60 transition-opacity"
          >
            {saving ? 'Saving...' : 'Save changes'}
          </button>

          <Link href="/dashboard/profile" className="text-center text-sm text-[#9B9B9B] hover:text-[#1A1A1A] transition-colors">
            Cancel
          </Link>
        </form>
      </div>

      {toast && (
        <div className={`fixed bottom-20 left-4 right-4 max-w-lg mx-auto rounded-[10px] px-4 py-3 shadow-[0_2px_8px_rgba(0,0,0,0.1)] text-sm font-medium text-center ${toast === 'success' ? 'bg-[#AF4D98] text-white' : 'bg-red-600 text-white'}`}>
          {toast === 'success' ? 'Changes saved' : 'Something went wrong'}
        </div>
      )}
    </div>
  )
}
