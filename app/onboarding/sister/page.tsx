'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'

type ContactMethod = 'email' | 'phone' | 'whatsapp'

const inputCls = 'w-full px-4 py-3 rounded-xl border border-[#EDE8E3] focus:outline-none focus:ring-2 focus:ring-[#AF4D98] focus:border-transparent text-[#1A1A1A] placeholder-gray-400 text-sm'

export default function SisterWali() {
  const router = useRouter()
  const [userId,         setUserId]         = useState('')
  const [loading,        setLoading]        = useState(true)
  const [saving,         setSaving]         = useState(false)
  const [waliName,       setWaliName]       = useState('')
  const [waliRel,        setWaliRel]        = useState('')
  const [waliEmail,      setWaliEmail]      = useState('')
  const [waliPhone,      setWaliPhone]      = useState('')
  const [contactMethod,  setContactMethod]  = useState<ContactMethod>('email')
  const [error,          setError]          = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.replace('/auth/login'); return }
      setUserId(user.id)
      const { data } = await supabase
        .from('wali_profiles')
        .select('full_name, relationship, email, phone, preferred_contact_method')
        .eq('sister_id', user.id)
        .single()
      if (data) {
        if (data.full_name)                setWaliName(data.full_name)
        if (data.relationship)             setWaliRel(data.relationship)
        if (data.email)                    setWaliEmail(data.email)
        if (data.phone)                    setWaliPhone(data.phone)
        if (data.preferred_contact_method) setContactMethod(data.preferred_contact_method)
      }
      setLoading(false)
    }
    load()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function handleNext(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    const hasWali = waliName.trim() || waliEmail.trim()
    if (hasWali) {
      if (!waliName.trim())  { setError("Please enter your wali's name."); return }
      if (!waliEmail.trim()) { setError("Please enter your wali's email."); return }
    }
    if (hasWali) {
      setSaving(true)
      const supabase = createClient()
      const waliData = {
        full_name:               waliName.trim(),
        relationship:            waliRel.trim() || null,
        email:                   waliEmail.trim(),
        phone:                   waliPhone.trim() || null,
        preferred_contact_method: contactMethod,
      }
      const { data: existingWali } = await supabase
        .from('wali_profiles')
        .select('id')
        .eq('sister_id', userId)
        .maybeSingle()
      if (existingWali) {
        const { error: saveErr } = await supabase
          .from('wali_profiles')
          .update(waliData)
          .eq('sister_id', userId)
        if (saveErr) { setError(saveErr.message); setSaving(false); return }
      } else {
        const { error: saveErr } = await supabase
          .from('wali_profiles')
          .insert({ sister_id: userId, ...waliData })
        if (saveErr) { setError(saveErr.message); setSaving(false); return }
      }
    }
    router.push('/onboarding/sister/info')
  }

  function handleSkip() {
    router.push('/onboarding/sister/info')
  }

  if (loading) return (
    <div className="min-h-screen bg-[#FDF8F3] flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-[#AF4D98] border-t-transparent rounded-full animate-spin" />
    </div>
  )

  const CONTACTS: { value: ContactMethod; label: string }[] = [
    { value: 'email',    label: 'Email' },
    { value: 'phone',    label: 'Phone' },
    { value: 'whatsapp', label: 'WhatsApp' },
  ]

  return (
    <div className="max-w-lg mx-auto px-4 py-8">
      <h2 className="text-xl font-medium text-[#1A1A1A] mb-1">Your Wali</h2>
      <p className="text-[#9B9B9B] text-sm mb-4">Optional — you can add or update this later from your profile.</p>
      <div className="bg-[#F5E6F2] border border-[#AF4D98]/20 rounded-xl p-4 mb-8">
        <p className="text-sm text-[#AF4D98] font-medium mb-1">About your wali&apos;s role</p>
        <p className="text-sm text-[#5C5C5C] leading-relaxed">
          Your wali will have read-only visibility into your journey — they can see your matches,
          messages, and meeting requests. They will <strong>not</strong> need to approve anything.
          This is about transparency, not gatekeeping.
        </p>
      </div>

      <form onSubmit={handleNext} className="space-y-5">

        <div>
          <label className="block text-sm font-medium text-[#1A1A1A] mb-1">{"Wali's"} Full Name</label>
          <input type="text" value={waliName} onChange={e => setWaliName(e.target.value)}
            placeholder="e.g. Muhammad Ali" className={inputCls} />
        </div>

        <div>
          <label className="block text-sm font-medium text-[#1A1A1A] mb-1">Relationship to You</label>
          <input type="text" value={waliRel} onChange={e => setWaliRel(e.target.value)}
            placeholder="e.g. Father, Brother, Uncle" className={inputCls} />
        </div>

        <div>
          <label className="block text-sm font-medium text-[#1A1A1A] mb-1">{"Wali's"} Email</label>
          <input type="email" value={waliEmail} onChange={e => setWaliEmail(e.target.value)}
            placeholder="wali@example.com" className={inputCls} />
        </div>

        <div>
          <label className="block text-sm font-medium text-[#1A1A1A] mb-1">
            {"Wali's"} Phone <span className="text-[#9B9B9B] font-normal">(optional)</span>
          </label>
          <input type="tel" value={waliPhone} onChange={e => setWaliPhone(e.target.value)}
            placeholder="+44 7700 000000" className={inputCls} />
        </div>

        <div>
          <label className="block text-sm font-medium text-[#1A1A1A] mb-2">Preferred Contact Method</label>
          <div className="flex gap-3">
            {CONTACTS.map(c => (
              <button key={c.value} type="button" onClick={() => setContactMethod(c.value)}
                className={`flex-1 py-3 rounded-xl border-2 font-medium text-sm transition-all ${
                  contactMethod === c.value
                    ? 'border-[#AF4D98] bg-[#AF4D98] text-white'
                    : 'border-[#EDE8E3] text-[#5C5C5C] hover:border-[#AF4D98]'
                }`}>
                {c.label}
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-100 text-red-600 text-sm rounded-xl px-4 py-3">{error}</div>
        )}

        <button type="submit" disabled={saving}
          className="w-full py-3 bg-[#AF4D98] text-white font-medium rounded-full hover:bg-[#9B3D85] transition-colors text-sm disabled:opacity-50">
          {saving ? 'Saving...' : 'Next →'}
        </button>

        <button type="button" onClick={handleSkip}
          className="w-full text-center text-sm text-[#9B9B9B] hover:text-[#1A1A1A] transition-colors mt-3">
          Skip for now
        </button>
      </form>
    </div>
  )
}
