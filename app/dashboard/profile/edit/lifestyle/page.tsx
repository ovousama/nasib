'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'
import { recalculateProfileCompletion } from '../recalculate-action'

const EDUCATION_OPTIONS = ['high school', 'bachelors', 'masters', 'phd', 'trade', 'other']
const LIVING_OPTIONS = ['alone', 'with family', 'with roommates']
const FINANCIAL_OPTIONS = ['fully ready', 'almost ready', 'working towards it']

function YesNo({ label, value, onChange }: { label: string; value: boolean | null; onChange: (v: boolean) => void }) {
  return (
    <div>
      <label className="block text-sm font-medium text-[#1A1A1A] mb-2">{label}</label>
      <div className="flex gap-3">
        {([true, false] as const).map(v => (
          <button key={String(v)} type="button" onClick={() => onChange(v)}
            className={`flex-1 py-3 rounded-xl border-2 font-medium text-sm transition-all ${
              value === v ? 'border-[#AF4D98] bg-[#AF4D98] text-white' : 'border-[#EDE8E3] text-[#5C5C5C] hover:border-[#AF4D98]'
            }`}>
            {v ? 'Yes' : 'No'}
          </button>
        ))}
      </div>
    </div>
  )
}

export default function EditLifestylePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [toast, setToast] = useState<'success' | 'error' | null>(null)

  const [userId, setUserId] = useState<string>('')
  const [gender, setGender] = useState<string>('')

  const [occupation, setOccupation] = useState('')
  const [educationLevel, setEducationLevel] = useState('')
  const [livingSituation, setLivingSituation] = useState('')
  const [willingToRelocate, setWillingToRelocate] = useState<boolean | null>(null)
  const [financialReadiness, setFinancialReadiness] = useState('')

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
        const { data } = await supabase.from('brother_profiles').select('occupation, education_level, living_situation, willing_to_relocate, financial_readiness').eq('id', user.id).single()
        if (data) {
          setOccupation(data.occupation ?? '')
          setEducationLevel(data.education_level ?? '')
          setLivingSituation(data.living_situation ?? '')
          setWillingToRelocate(data.willing_to_relocate ?? null)
          setFinancialReadiness(data.financial_readiness ?? '')
        }
      } else {
        const { data } = await supabase.from('sister_profiles').select('occupation, education_level, living_situation, willing_to_relocate').eq('id', user.id).single()
        if (data) {
          setOccupation(data.occupation ?? '')
          setEducationLevel(data.education_level ?? '')
          setLivingSituation(data.living_situation ?? '')
          setWillingToRelocate(data.willing_to_relocate ?? null)
        }
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
      if (gender === 'brother') {
        const { error: updateError } = await supabase
          .from('brother_profiles')
          .update({ occupation: occupation.trim() || null, education_level: educationLevel || null, living_situation: livingSituation || null, willing_to_relocate: willingToRelocate, financial_readiness: financialReadiness || null })
          .eq('id', userId)
        if (updateError) throw updateError
      } else {
        const { error: updateError } = await supabase
          .from('sister_profiles')
          .update({ occupation: occupation.trim() || null, education_level: educationLevel || null, living_situation: livingSituation || null, willing_to_relocate: willingToRelocate })
          .eq('id', userId)
        if (updateError) throw updateError
      }
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
          <h1 className="text-base font-medium text-[#1A1A1A]">Edit Lifestyle</h1>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-100 text-red-600 text-sm rounded-xl px-4 py-3 mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSave} className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-medium text-[#1A1A1A] mb-1">Occupation</label>
            <input
              type="text"
              value={occupation}
              onChange={e => setOccupation(e.target.value)}
              className="w-full px-4 py-3 rounded-[10px] border border-[#EDE8E3] focus:outline-none focus:border-[#AF4D98] focus:ring-2 focus:ring-[#AF4D98]/8 text-[#1A1A1A] text-[15px] bg-white"
              placeholder="Optional"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#1A1A1A] mb-1">Education Level</label>
            <select
              value={educationLevel}
              onChange={e => setEducationLevel(e.target.value)}
              className="w-full px-4 py-3 rounded-[10px] border border-[#EDE8E3] focus:outline-none focus:border-[#AF4D98] focus:ring-2 focus:ring-[#AF4D98]/8 text-[#1A1A1A] text-[15px] bg-white"
            >
              <option value="">Select...</option>
              {EDUCATION_OPTIONS.map(opt => (
                <option key={opt} value={opt}>{opt.charAt(0).toUpperCase() + opt.slice(1)}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-[#1A1A1A] mb-1">Living Situation</label>
            <select
              value={livingSituation}
              onChange={e => setLivingSituation(e.target.value)}
              className="w-full px-4 py-3 rounded-[10px] border border-[#EDE8E3] focus:outline-none focus:border-[#AF4D98] focus:ring-2 focus:ring-[#AF4D98]/8 text-[#1A1A1A] text-[15px] bg-white"
            >
              <option value="">Select...</option>
              {LIVING_OPTIONS.map(opt => (
                <option key={opt} value={opt}>{opt.charAt(0).toUpperCase() + opt.slice(1)}</option>
              ))}
            </select>
          </div>

          <YesNo label="Willing to relocate?" value={willingToRelocate} onChange={setWillingToRelocate} />

          {gender === 'brother' && (
            <div>
              <label className="block text-sm font-medium text-[#1A1A1A] mb-1">Financial Readiness</label>
              <select
                value={financialReadiness}
                onChange={e => setFinancialReadiness(e.target.value)}
                className="w-full px-4 py-3 rounded-[10px] border border-[#EDE8E3] focus:outline-none focus:border-[#AF4D98] focus:ring-2 focus:ring-[#AF4D98]/8 text-[#1A1A1A] text-[15px] bg-white"
              >
                <option value="">Select...</option>
                {FINANCIAL_OPTIONS.map(opt => (
                  <option key={opt} value={opt}>{opt.charAt(0).toUpperCase() + opt.slice(1)}</option>
                ))}
              </select>
            </div>
          )}

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
