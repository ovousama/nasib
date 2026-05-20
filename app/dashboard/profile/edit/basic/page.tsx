'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'
import { recalculateProfileCompletion } from '../recalculate-action'

function Pill({ label, selected, onClick }: { label: string; selected: boolean; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick}
      className={`px-4 py-2 rounded-full text-sm font-medium border transition-all cursor-pointer ${
        selected ? 'bg-[#AF4D98] text-white border-[#AF4D98]' : 'bg-white text-[#1A1A1A] border-[#EDE8E3] hover:border-[#AF4D98]'
      }`}>
      {label}
    </button>
  )
}

export default function EditBasicPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [toast, setToast] = useState<'success' | 'error' | null>(null)

  const [userId, setUserId] = useState<string>('')
  const [gender, setGender] = useState<string>('')

  // Read-only display fields (set at registration)
  const [fullName, setFullName] = useState('')
  const [age, setAge] = useState<number | ''>('')
  const [location, setLocation] = useState('')

  // Editable fields
  const [ethnicity, setEthnicity] = useState('')
  const [languages, setLanguages] = useState('')
  const [willingToRelocate, setWillingToRelocate] = useState<boolean | null>(null)

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
      const table = profile.gender === 'brother' ? 'brother_profiles' : 'sister_profiles'
      const { data } = await supabase.from(table).select('full_name, age, location, ethnicity, languages, willing_to_relocate').eq('id', user.id).single()
      if (data) {
        setFullName(data.full_name ?? '')
        setAge(data.age ?? '')
        setLocation(data.location ?? '')
        setEthnicity(data.ethnicity ?? '')
        setLanguages(Array.isArray(data.languages) ? data.languages.join(', ') : '')
        setWillingToRelocate(data.willing_to_relocate ?? null)
      }
      setLoading(false)
    }
    load()
  }, [])

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError(null)
    try {
      const supabase = createClient()
      const languagesArr = languages.split(',').map(l => l.trim()).filter(Boolean)
      const table = gender === 'brother' ? 'brother_profiles' : 'sister_profiles'
      const { error: updateError } = await supabase
        .from(table)
        .update({
          ethnicity: ethnicity.trim() || null,
          languages: languagesArr,
          willing_to_relocate: willingToRelocate,
        })
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

        {/* Read-only identity block */}
        <div className="bg-[#F5F5F5] border border-[#EDE8E3] rounded-[12px] px-4 py-3 mb-5">
          <p className="text-[11px] font-medium uppercase tracking-[0.06em] text-[#9B9B9B] mb-2">Set at registration · Cannot be changed</p>
          <div className="flex flex-col gap-1.5">
            <div className="flex justify-between text-[14px]">
              <span className="text-[#9B9B9B]">Full name</span>
              <span className="text-[#1A1A1A] font-medium">{fullName || '—'}</span>
            </div>
            <div className="flex justify-between text-[14px]">
              <span className="text-[#9B9B9B]">Age</span>
              <span className="text-[#1A1A1A] font-medium">{age || '—'}</span>
            </div>
            <div className="flex justify-between text-[14px]">
              <span className="text-[#9B9B9B]">Location</span>
              <span className="text-[#1A1A1A] font-medium">{location || '—'}</span>
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-100 text-red-600 text-sm rounded-xl px-4 py-3 mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSave} className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-medium text-[#1A1A1A] mb-1">Ethnicity <span className="text-[#9B9B9B] font-normal">(optional)</span></label>
            <input
              type="text"
              value={ethnicity}
              onChange={e => setEthnicity(e.target.value)}
              className="w-full px-4 py-3 rounded-[10px] border border-[#EDE8E3] focus:outline-none focus:border-[#AF4D98] focus:ring-2 focus:ring-[#AF4D98]/8 text-[#1A1A1A] text-[15px] bg-white"
              placeholder="e.g. Pakistani, Moroccan, Somali"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#1A1A1A] mb-1">Languages spoken <span className="text-[#9B9B9B] font-normal">(optional)</span></label>
            <input
              type="text"
              value={languages}
              onChange={e => setLanguages(e.target.value)}
              className="w-full px-4 py-3 rounded-[10px] border border-[#EDE8E3] focus:outline-none focus:border-[#AF4D98] focus:ring-2 focus:ring-[#AF4D98]/8 text-[#1A1A1A] text-[15px] bg-white"
              placeholder="e.g. English, Arabic, Urdu"
            />
            <p className="text-xs text-[#9B9B9B] mt-1">Separate with commas</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-[#1A1A1A] mb-2">Are you willing to relocate after marriage?</label>
            <div className="flex gap-2">
              <Pill label="Yes" selected={willingToRelocate === true} onClick={() => setWillingToRelocate(true)} />
              <Pill label="No" selected={willingToRelocate === false} onClick={() => setWillingToRelocate(false)} />
            </div>
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
