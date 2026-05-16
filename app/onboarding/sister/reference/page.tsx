'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'

const KEY = 'nasib_onboarding_sister'
const inputCls = 'w-full px-4 py-3 rounded-xl border border-[#EDE8E3] focus:outline-none focus:ring-2 focus:ring-[#AF4D98] focus:border-transparent text-[#1A1A1A] placeholder-gray-400 text-sm'

export default function SisterReference() {
  const router = useRouter()
  const [refName,         setRefName]         = useState('')
  const [refRelationship, setRefRelationship] = useState('')
  const [refEmail,        setRefEmail]        = useState('')
  const [refPhone,        setRefPhone]        = useState('')
  const [loading,         setLoading]         = useState(false)
  const [error,           setError]           = useState<string | null>(null)

  useEffect(() => {
    try {
      const s = JSON.parse(localStorage.getItem(KEY) || '{}')
      if (s._ref_name)         setRefName(s._ref_name)
      if (s._ref_relationship) setRefRelationship(s._ref_relationship)
      if (s._ref_email)        setRefEmail(s._ref_email)
      if (s._ref_phone)        setRefPhone(s._ref_phone)
    } catch {}
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const s = JSON.parse(localStorage.getItem(KEY) || '{}')

      // 1. Upsert sister_profiles
      const { error: profileErr } = await supabase
        .from('sister_profiles')
        .upsert({
          id:                           user.id,
          full_name:                    s.full_name,
          age:                          s.age,
          location:                     s.location     ?? null,
          ethnicity:                    s.ethnicity    ?? null,
          languages:                    s.languages    ?? [],
          religiosity_level:            s.religiosity_level ?? null,
          madhab:                       s.madhab       ?? null,
          prayer_frequency:             s.prayer_frequency ?? null,
          islamic_knowledge_level:      s.islamic_knowledge_level ?? null,
          wears_hijab:                  s.wears_hijab  ?? null,
          occupation:                   s.occupation   ?? null,
          education_level:              s.education_level ?? null,
          living_situation:             s.living_situation ?? null,
          willing_to_relocate:          s.willing_to_relocate ?? null,
          previously_married:           s.previously_married ?? null,
          has_children:                 s.has_children ?? null,
          wants_children:               s.wants_children ?? null,
          timeline_to_marry:            s.timeline_to_marry ?? null,
          spouse_religiosity_preference: s.spouse_religiosity_preference ?? null,
          spouse_age_min:               s.spouse_age_min ?? null,
          spouse_age_max:               s.spouse_age_max ?? null,
          dealbreakers:                 s.dealbreakers ?? [],
          character_description:        s.character_description ?? null,
          goals:                        s.goals ?? null,
          photo_urls:                   s.photo_urls ?? [],
          photos_uploaded:              (s.photo_urls?.length ?? 0) > 0,
        }, { onConflict: 'id' })

      if (profileErr) throw profileErr

      // 2. Insert wali_profiles
      const { error: waliErr } = await supabase
        .from('wali_profiles')
        .insert({
          sister_id:               user.id,
          full_name:               s.wali_full_name,
          relationship:            s.wali_relationship,
          email:                   s.wali_email,
          phone:                   s.wali_phone ?? null,
          preferred_contact_method: s.wali_preferred_contact ?? 'email',
        })

      if (waliErr) throw waliErr

      // 3. Insert reference
      const { error: refErr } = await supabase
        .from('references')
        .insert({
          profile_id:           user.id,
          referee_name:         refName.trim(),
          referee_relationship: refRelationship.trim(),
          referee_email:        refEmail.trim(),
          referee_phone:        refPhone.trim() || null,
          status:               'pending',
        })

      if (refErr) throw refErr

      // 4. Clear onboarding data
      localStorage.removeItem(KEY)

      router.push('/dashboard')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.')
      setLoading(false)
    }
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
            After submitting, your profile will be reviewed by the Nasib team. {"You'll"} be notified once verified,
            inshAllah. Jazakillah khayran for your trust.
          </p>
        </div>

        <button type="submit" disabled={loading}
          className="w-full py-3 bg-[#AF4D98] text-white font-medium rounded-full hover:bg-[#9B3D85] transition-colors text-sm disabled:opacity-60 disabled:cursor-not-allowed">
          {loading ? 'Submitting...' : 'Submit Profile'}
        </button>
      </form>
    </div>
  )
}
