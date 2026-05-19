'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { recalculateCompletion } from '@/app/onboarding/actions'

const inputCls = 'w-full px-4 py-3 rounded-xl border border-[#EDE8E3] focus:outline-none focus:ring-2 focus:ring-[#AF4D98] focus:border-transparent text-[#1A1A1A] placeholder-gray-400 text-sm'

export default function SisterReference() {
  const router = useRouter()
  const [userId,          setUserId]          = useState('')
  const [refName,         setRefName]         = useState('')
  const [refRelationship, setRefRelationship] = useState('')
  const [refEmail,        setRefEmail]        = useState('')
  const [refPhone,        setRefPhone]        = useState('')
  const [loading,         setLoading]         = useState(false)
  const [error,           setError]           = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.replace('/auth/login'); return }
      setUserId(user.id)
      const { data } = await supabase
        .from('references')
        .select('referee_name,referee_relationship,referee_email,referee_phone')
        .eq('profile_id', user.id)
        .single()
      if (data) {
        if (data.referee_name)         setRefName(data.referee_name)
        if (data.referee_relationship) setRefRelationship(data.referee_relationship)
        if (data.referee_email)        setRefEmail(data.referee_email)
        if (data.referee_phone)        setRefPhone(data.referee_phone)
      }
    }
    load()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const supabase = createClient()
    const { error: refErr } = await supabase
      .from('references')
      .upsert({
        profile_id:           userId,
        referee_name:         refName.trim(),
        referee_relationship: refRelationship.trim(),
        referee_email:        refEmail.trim(),
        referee_phone:        refPhone.trim() || null,
        status:               'pending',
      }, { onConflict: 'profile_id' })

    if (refErr) { setError(refErr.message); setLoading(false); return }
    await recalculateCompletion(userId, 'sister')
    router.push('/dashboard')
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-8">
      <h2 className="text-xl font-medium text-[#1A1A1A] mb-1">Character Reference</h2>
      <p className="text-[#9B9B9B] text-sm mb-2">
        Provide someone who can speak to your character — a close friend, teacher, or community member.
      </p>
      <p className="text-xs text-[#9B9B9B] mb-8">
        {"They'll"} receive a short questionnaire by email. A sister friend, teacher, or family member works well.
      </p>

      <form onSubmit={handleSubmit} className="space-y-5">

        <div>
          <label className="block text-sm font-medium text-[#1A1A1A] mb-1">{"Referee's"} Full Name</label>
          <input type="text" required value={refName} onChange={e => setRefName(e.target.value)}
            placeholder="e.g. Sister Maryam Hassan" className={inputCls} />
        </div>

        <div>
          <label className="block text-sm font-medium text-[#1A1A1A] mb-1">Relationship to You</label>
          <input type="text" required value={refRelationship} onChange={e => setRefRelationship(e.target.value)}
            placeholder="e.g. Close friend, teacher, colleague" className={inputCls} />
        </div>

        <div>
          <label className="block text-sm font-medium text-[#1A1A1A] mb-1">{"Referee's"} Email</label>
          <input type="email" required value={refEmail} onChange={e => setRefEmail(e.target.value)}
            placeholder="referee@example.com" className={inputCls} />
        </div>

        <div>
          <label className="block text-sm font-medium text-[#1A1A1A] mb-1">
            {"Referee's"} Phone <span className="text-[#9B9B9B] font-normal">(optional)</span>
          </label>
          <input type="tel" value={refPhone} onChange={e => setRefPhone(e.target.value)}
            placeholder="+44 7700 000000" className={inputCls} />
        </div>

        {error && (
          <div className="bg-red-50 border border-red-100 text-red-600 text-sm rounded-xl px-4 py-3">{error}</div>
        )}

        <div className="bg-[#F5E6F2] border border-[#AF4D98]/20 rounded-xl p-4">
          <p className="text-sm text-[#AF4D98] font-medium mb-1">Almost there, mashAllah!</p>
          <p className="text-xs text-[#5C5C5C]">
            After submitting, your profile will be reviewed by the Naseeb team. {"You'll"} be notified once verified,
            inshAllah. Jazakillah khayran for your trust.
          </p>
        </div>

        <button type="submit" disabled={loading || !userId}
          className="w-full py-3 bg-[#AF4D98] text-white font-medium rounded-full hover:bg-[#9B3D85] transition-colors text-sm disabled:opacity-60 disabled:cursor-not-allowed">
          {loading ? 'Submitting...' : 'Submit Profile'}
        </button>
      </form>
    </div>
  )
}
