'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'

const inputCls = 'w-full px-4 py-3.5 rounded-[10px] border border-[#EDE8E3] bg-white text-[#1A1A1A] placeholder-[#9B9B9B] text-[15px] focus:outline-none focus:border-[#AF4D98] focus:ring-2 focus:ring-[#AF4D98]/8 transition-colors'

export default function SisterReference() {
  const router = useRouter()
  const [userId,          setUserId]          = useState('')
  const [refName,         setRefName]         = useState('')
  const [refRelationship, setRefRelationship] = useState('')
  const [refEmail,        setRefEmail]        = useState('')
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
        .select('referee_name,referee_relationship,referee_email')
        .eq('profile_id', user.id)
        .single()
      if (data) {
        if (data.referee_name)         setRefName(data.referee_name)
        if (data.referee_relationship) setRefRelationship(data.referee_relationship)
        if (data.referee_email)        setRefEmail(data.referee_email)
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
    const refData = {
      referee_name:         refName.trim(),
      referee_relationship: refRelationship.trim(),
      referee_email:        refEmail.trim(),
      status:               'pending',
    }
    const { data: existingRef } = await supabase
      .from('references')
      .select('id')
      .eq('profile_id', userId)
      .maybeSingle()
    if (existingRef) {
      const { error: refErr } = await supabase
        .from('references')
        .update(refData)
        .eq('profile_id', userId)
      if (refErr) { setError(refErr.message); setLoading(false); return }
    } else {
      const { error: refErr } = await supabase
        .from('references')
        .insert({ profile_id: userId, ...refData })
      if (refErr) { setError(refErr.message); setLoading(false); return }
    }

    const { recalculateProfileCompletion } = await import('@/lib/profile-utils')
    await recalculateProfileCompletion(userId, 'sister')
    router.push('/dashboard')
  }

  return (
    <div className="min-h-screen bg-[#FDF8F3]">
      <div className="max-w-[480px] mx-auto px-5 py-8 pb-28">
        <h2 className="text-2xl font-medium text-[#1A1A1A] tracking-[-0.02em] mb-1">Character Reference</h2>
        <p className="text-[15px] text-[#9B9B9B] mb-2">
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

          {error && (
            <div className="border border-[#C13515]/20 bg-[#FDECEA] text-[#C13515] text-sm rounded-[10px] px-4 py-3">{error}</div>
          )}

          <div className="bg-[#F9F0F6] border border-[#AF4D98]/20 rounded-[10px] p-4">
            <p className="text-sm text-[#AF4D98] font-medium mb-1">Almost there, mashAllah!</p>
            <p className="text-xs text-[#5C5C5C]">
              After submitting, your profile will be reviewed by the Naseeb team. {"You'll"} be notified once verified,
              inshAllah. Jazakillah khayran for your trust.
            </p>
          </div>

          <button type="submit" disabled={loading || !userId}
            className="w-full py-3.5 bg-[#AF4D98] text-white font-medium rounded-full text-[15px] hover:bg-[#9B3D85] transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
            {loading ? 'Submitting...' : 'Submit Profile'}
          </button>
        </form>
      </div>
    </div>
  )
}
