'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'
import { recalculateProfileCompletion } from '../recalculate-action'

const CONTACT_METHODS = ['email', 'phone', 'whatsapp']
const inputCls = 'w-full px-4 py-3 rounded-[10px] border border-[#EDE8E3] focus:outline-none focus:border-[#AF4D98] focus:ring-2 focus:ring-[#AF4D98]/8 text-[#1A1A1A] text-[15px] bg-white'

export default function EditWaliPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [removing, setRemoving] = useState(false)
  const [confirmRemove, setConfirmRemove] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [toast, setToast] = useState<string | null>(null)

  const [userId, setUserId] = useState<string>('')
  const [hasWali, setHasWali] = useState(false)

  const [fullName, setFullName] = useState('')
  const [relationship, setRelationship] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [contactMethod, setContactMethod] = useState('email')

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/auth/login'); return }
      const { data: profile } = await supabase.from('profiles').select('gender').eq('id', user.id).single()
      if (!profile || profile.gender !== 'sister') { router.push('/dashboard/profile'); return }
      setUserId(user.id)
      const { data } = await supabase.from('wali_profiles').select('*').eq('sister_id', user.id).single()
      if (data) {
        setHasWali(true)
        setFullName(data.full_name ?? '')
        setRelationship(data.relationship ?? '')
        setEmail(data.email ?? '')
        setPhone(data.phone ?? '')
        setContactMethod(data.preferred_contact_method ?? 'email')
      }
      setLoading(false)
    }
    load()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    if (!fullName.trim()) { setError("Wali's name is required."); return }
    if (!email.trim())    { setError("Wali's email is required."); return }
    setSaving(true)
    setError(null)
    try {
      const supabase = createClient()
      const waliData = {
        full_name:               fullName.trim(),
        relationship:            relationship.trim() || null,
        email:                   email.trim(),
        phone:                   phone.trim() || null,
        preferred_contact_method: contactMethod,
      }
      if (hasWali) {
        const { error: updateErr } = await supabase
          .from('wali_profiles')
          .update(waliData)
          .eq('sister_id', userId)
        if (updateErr) throw updateErr
      } else {
        const { error: insertErr } = await supabase
          .from('wali_profiles')
          .insert({ sister_id: userId, ...waliData })
        if (insertErr) throw insertErr
      }
      recalculateProfileCompletion().catch(() => {})
      setToast('Wali details saved.')
      setTimeout(() => router.push('/dashboard/profile'), 1400)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  async function handleRemove() {
    setRemoving(true)
    setError(null)
    try {
      const supabase = createClient()
      const { error: delErr } = await supabase.from('wali_profiles').delete().eq('sister_id', userId)
      if (delErr) throw delErr
      recalculateProfileCompletion().catch(() => {})
      setToast('Wali removed.')
      setTimeout(() => router.push('/dashboard/profile'), 1400)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.')
      setConfirmRemove(false)
    } finally {
      setRemoving(false)
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
          <h1 className="text-base font-medium text-[#1A1A1A]">{hasWali ? 'Edit Wali' : 'Add Wali'}</h1>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-100 text-red-600 text-sm rounded-xl px-4 py-3 mb-4">{error}</div>
        )}

        <form onSubmit={handleSave} className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-medium text-[#1A1A1A] mb-1">{"Wali's"} Full Name <span className="text-red-500">*</span></label>
            <input type="text" value={fullName} onChange={e => setFullName(e.target.value)}
              className={inputCls} placeholder="e.g. Muhammad Ali" />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#1A1A1A] mb-1">Relationship <span className="text-[#9B9B9B] font-normal">(optional)</span></label>
            <input type="text" value={relationship} onChange={e => setRelationship(e.target.value)}
              className={inputCls} placeholder="e.g. Father, Brother, Uncle" />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#1A1A1A] mb-1">{"Wali's"} Email <span className="text-red-500">*</span></label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)}
              className={inputCls} placeholder="wali@example.com" />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#1A1A1A] mb-1">Phone <span className="text-[#9B9B9B] font-normal">(optional)</span></label>
            <input type="tel" value={phone} onChange={e => setPhone(e.target.value)}
              className={inputCls} placeholder="+44 7700 000000" />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#1A1A1A] mb-2">Preferred Contact Method</label>
            <div className="flex gap-3">
              {CONTACT_METHODS.map(m => (
                <button key={m} type="button" onClick={() => setContactMethod(m)}
                  className={`flex-1 py-3 rounded-full border font-medium text-sm transition-colors ${
                    contactMethod === m
                      ? 'border-[#AF4D98] bg-[#AF4D98] text-white'
                      : 'border-[#EDE8E3] text-[#5C5C5C] bg-white hover:border-[#D4CBC4]'
                  }`}>
                  {m.charAt(0).toUpperCase() + m.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <button type="submit" disabled={saving}
            className="w-full bg-[#AF4D98] text-white font-medium rounded-full py-3.5 mt-2 disabled:opacity-60 transition-opacity">
            {saving ? 'Saving...' : hasWali ? 'Save changes' : 'Add wali'}
          </button>

          {hasWali && (
            <button type="button" onClick={() => setConfirmRemove(true)}
              className="w-full text-center text-sm text-red-500 hover:text-red-700 transition-colors mt-1">
              Remove wali
            </button>
          )}

          <Link href="/dashboard/profile" className="text-center text-sm text-[#9B9B9B] hover:text-[#1A1A1A] transition-colors">
            Cancel
          </Link>
        </form>
      </div>

      {/* Remove confirm modal */}
      {confirmRemove && (
        <div className="fixed inset-0 bg-black/40 flex items-end justify-center z-50 px-4 pb-8">
          <div className="bg-white rounded-[20px] p-6 w-full max-w-sm shadow-xl">
            <h3 className="text-[16px] font-medium text-[#1A1A1A] mb-2">Remove wali?</h3>
            <p className="text-[13px] text-[#5C5C5C] mb-5">
              This will remove your wali&apos;s access. You can add them again at any time from your profile.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setConfirmRemove(false)}
                className="flex-1 py-3 rounded-full border border-[#EDE8E3] text-sm font-medium text-[#5C5C5C] hover:border-[#D4CBC4] transition-colors">
                Cancel
              </button>
              <button onClick={handleRemove} disabled={removing}
                className="flex-1 py-3 rounded-full bg-red-500 text-white text-sm font-medium hover:bg-red-600 transition-colors disabled:opacity-60">
                {removing ? 'Removing...' : 'Remove'}
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <div className="fixed bottom-20 left-4 right-4 max-w-lg mx-auto rounded-[10px] px-4 py-3 shadow-[0_2px_8px_rgba(0,0,0,0.1)] text-sm font-medium text-center bg-[#AF4D98] text-white">
          {toast}
        </div>
      )}
    </div>
  )
}
