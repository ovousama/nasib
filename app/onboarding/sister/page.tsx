'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

const KEY = 'nasib_onboarding_sister'
type ContactMethod = 'email' | 'phone' | 'whatsapp'
const inputCls = 'w-full px-4 py-3 rounded-xl border border-[#EDE8E3] focus:outline-none focus:ring-2 focus:ring-[#AF4D98] focus:border-transparent text-[#1A1A1A] placeholder-gray-400 text-sm'

export default function SisterWali() {
  const router = useRouter()
  const [waliName,     setWaliName]     = useState('')
  const [waliRel,      setWaliRel]      = useState('')
  const [waliEmail,    setWaliEmail]    = useState('')
  const [waliPhone,    setWaliPhone]    = useState('')
  const [contactMethod, setContactMethod] = useState<ContactMethod>('email')
  const [error,        setError]        = useState<string | null>(null)

  useEffect(() => {
    if (typeof window !== 'undefined' && !localStorage.getItem('naseeb_onboarding_started')) {
      router.replace('/onboarding/start')
      return
    }
    try {
      const s = JSON.parse(localStorage.getItem(KEY) || '{}')
      if (s.wali_full_name)          setWaliName(s.wali_full_name)
      if (s.wali_relationship)       setWaliRel(s.wali_relationship)
      if (s.wali_email)              setWaliEmail(s.wali_email)
      if (s.wali_phone)              setWaliPhone(s.wali_phone)
      if (s.wali_preferred_contact)  setContactMethod(s.wali_preferred_contact)
    } catch {}
  }, [])

  function handleNext(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    const s = JSON.parse(localStorage.getItem(KEY) || '{}')
    localStorage.setItem(KEY, JSON.stringify({
      ...s,
      wali_full_name:         waliName.trim(),
      wali_relationship:      waliRel.trim(),
      wali_email:             waliEmail.trim(),
      wali_phone:             waliPhone.trim() || null,
      wali_preferred_contact: contactMethod,
    }))
    router.push('/onboarding/sister/info')
  }

  const CONTACTS: { value: ContactMethod; label: string }[] = [
    { value: 'email',     label: 'Email' },
    { value: 'phone',     label: 'Phone' },
    { value: 'whatsapp',  label: 'WhatsApp' },
  ]

  return (
    <div className="max-w-lg mx-auto px-4 py-8">
      <h2 className="text-xl font-medium text-[#1A1A1A] mb-1">Your Wali</h2>
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
          <input type="text" required value={waliName} onChange={e => setWaliName(e.target.value)}
            placeholder="e.g. Muhammad Ali" className={inputCls} />
        </div>

        <div>
          <label className="block text-sm font-medium text-[#1A1A1A] mb-1">Relationship to You</label>
          <input type="text" required value={waliRel} onChange={e => setWaliRel(e.target.value)}
            placeholder="e.g. Father, Brother, Uncle" className={inputCls} />
        </div>

        <div>
          <label className="block text-sm font-medium text-[#1A1A1A] mb-1">{"Wali's"} Email</label>
          <input type="email" required value={waliEmail} onChange={e => setWaliEmail(e.target.value)}
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

        <button type="submit"
          className="w-full py-3 bg-[#AF4D98] text-white font-medium rounded-full hover:bg-[#9B3D85] transition-colors text-sm">
          Next →
        </button>
      </form>
    </div>
  )
}
