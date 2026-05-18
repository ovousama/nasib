'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'
import { recalculateProfileCompletion } from '../recalculate-action'

const CONTACT_METHODS = ['email', 'phone', 'whatsapp']

export default function EditWaliPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [toast, setToast] = useState<'success' | 'error' | null>(null)

  const [userId, setUserId] = useState<string>('')
  const [hasWali, setHasWali] = useState(false)

  const [fullName, setFullName] = useState('')
  const [relationship, setRelationship] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [preferredContactMethod, setPreferredContactMethod] = useState('')

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/auth/login'); return }
      const { data: profile } = await supabase.from('profiles').select('gender').eq('id', user.id).single()
      if (!profile || profile.gender !== 'sister') {
        router.push('/dashboard/profile')
        return
      }
      setUserId(user.id)
      const { data } = await supabase.from('wali_profiles').select('full_name, relationship, email, phone, preferred_contact_method').eq('sister_id', user.id).single()
      if (data) {
        setHasWali(true)
        setFullName(data.full_name ?? '')
        setRelationship(data.relationship ?? '')
        setEmail(data.email ?? '')
        setPhone(data.phone ?? '')
        setPreferredContactMethod(data.preferred_contact_method ?? '')
      }
      setLoading(false)
    }
    load()
  }, [])

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    if (!fullName.trim()) { setError('Full name is required.'); return }
    if (!relationship.trim()) { setError('Relationship is required.'); return }
    if (!email.trim()) { setError('Email is required.'); return }
    setSaving(true)
    setError(null)
    try {
      const supabase = createClient()
      const { error: updateError } = await supabase
        .from('wali_profiles')
        .update({ full_name: fullName.trim(), relationship: relationship.trim(), email: email.trim(), phone: phone.trim() || null, preferred_contact_method: preferredContactMethod || null })
        .eq('sister_id', userId)
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
          <h1 className="text-base font-medium text-[#1A1A1A]">Edit Wali</h1>
        </div>

        {!hasWali ? (
          <div className="text-center py-10">
            <p className="text-[#5C5C5C] text-sm mb-4">No wali profile found. Please complete the onboarding flow to add your wali information.</p>
            <Link href="/dashboard/profile" className="text-[#AF4D98] text-sm font-medium hover:underline">
              Back to profile
            </Link>
          </div>
        ) : (
          <>
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
                  placeholder="Wali's full name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#1A1A1A] mb-1">Relationship <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  value={relationship}
                  onChange={e => setRelationship(e.target.value)}
                  className="w-full px-4 py-3 rounded-[10px] border border-[#EDE8E3] focus:outline-none focus:border-[#AF4D98] focus:ring-2 focus:ring-[#AF4D98]/8 text-[#1A1A1A] text-[15px] bg-white"
                  placeholder="e.g. Father, Brother, Uncle"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#1A1A1A] mb-1">Email <span className="text-red-500">*</span></label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full px-4 py-3 rounded-[10px] border border-[#EDE8E3] focus:outline-none focus:border-[#AF4D98] focus:ring-2 focus:ring-[#AF4D98]/8 text-[#1A1A1A] text-[15px] bg-white"
                  placeholder="wali@email.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#1A1A1A] mb-1">Phone (optional)</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  className="w-full px-4 py-3 rounded-[10px] border border-[#EDE8E3] focus:outline-none focus:border-[#AF4D98] focus:ring-2 focus:ring-[#AF4D98]/8 text-[#1A1A1A] text-[15px] bg-white"
                  placeholder="+1 (555) 000-0000"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#1A1A1A] mb-1">Preferred Contact Method</label>
                <select
                  value={preferredContactMethod}
                  onChange={e => setPreferredContactMethod(e.target.value)}
                  className="w-full px-4 py-3 rounded-[10px] border border-[#EDE8E3] focus:outline-none focus:border-[#AF4D98] focus:ring-2 focus:ring-[#AF4D98]/8 text-[#1A1A1A] text-[15px] bg-white"
                >
                  <option value="">Select...</option>
                  {CONTACT_METHODS.map(opt => (
                    <option key={opt} value={opt}>{opt.charAt(0).toUpperCase() + opt.slice(1)}</option>
                  ))}
                </select>
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
          </>
        )}
      </div>

      {toast && (
        <div className={`fixed bottom-20 left-4 right-4 max-w-lg mx-auto rounded-[10px] px-4 py-3 shadow-[0_2px_8px_rgba(0,0,0,0.1)] text-sm font-medium text-center ${toast === 'success' ? 'bg-[#AF4D98] text-white' : 'bg-red-600 text-white'}`}>
          {toast === 'success' ? 'Changes saved' : 'Something went wrong'}
        </div>
      )}
    </div>
  )
}
