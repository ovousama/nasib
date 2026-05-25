'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { recalculateProfileCompletion } from '../recalculate-action'
import {
  PAGE_BG, EditSpinner, EditPageHeader, ErrorAlert,
  YesNo, SimpleDropdown, SaveButton, EditToast,
} from '../EditHelpers'

const TIMELINE_OPTIONS = ['asap', 'within 6 months', 'within a year', '1-2 years']

export default function EditMarriagePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [toast, setToast] = useState<'success' | 'error' | null>(null)
  const [userId, setUserId] = useState<string>('')
  const [gender, setGender] = useState<string>('')

  const [polygamyOpenness, setPolygamyOpenness] = useState<boolean | null>(null)
  const [previouslyMarried, setPreviouslyMarried] = useState<boolean | null>(null)
  const [hasChildren, setHasChildren] = useState<boolean | null>(null)
  const [wantsChildren, setWantsChildren] = useState<boolean | null>(null)
  const [timelineToMarry, setTimelineToMarry] = useState('')

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
        const { data } = await supabase.from('brother_profiles').select('polygamy_openness, previously_married, has_children, wants_children, timeline_to_marry').eq('id', user.id).single()
        if (data) {
          setPolygamyOpenness(data.polygamy_openness ?? null)
          setPreviouslyMarried(data.previously_married ?? null)
          setHasChildren(data.has_children ?? null)
          setWantsChildren(data.wants_children ?? null)
          setTimelineToMarry(data.timeline_to_marry ?? '')
        }
      } else {
        const { data } = await supabase.from('sister_profiles').select('previously_married, has_children, wants_children, timeline_to_marry').eq('id', user.id).single()
        if (data) {
          setPreviouslyMarried(data.previously_married ?? null)
          setHasChildren(data.has_children ?? null)
          setWantsChildren(data.wants_children ?? null)
          setTimelineToMarry(data.timeline_to_marry ?? '')
        }
      }
      setLoading(false)
    }
    load()
  }, [])

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true); setError(null)
    try {
      const supabase = createClient()
      if (gender === 'brother') {
        const { error: updateError } = await supabase.from('brother_profiles').update({
          polygamy_openness: polygamyOpenness, previously_married: previouslyMarried,
          has_children: hasChildren, wants_children: wantsChildren,
          timeline_to_marry: timelineToMarry || null,
        }).eq('id', userId)
        if (updateError) throw updateError
      } else {
        const { error: updateError } = await supabase.from('sister_profiles').update({
          previously_married: previouslyMarried, has_children: hasChildren,
          wants_children: wantsChildren, timeline_to_marry: timelineToMarry || null,
        }).eq('id', userId)
        if (updateError) throw updateError
      }
      recalculateProfileCompletion().catch(() => {})
      setToast('success')
      setTimeout(() => router.push('/dashboard/profile'), 1200)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.')
    } finally { setSaving(false) }
  }

  if (loading) return <EditSpinner />

  return (
    <div className="min-h-screen pt-[72px] lg:pt-[76px]" style={{ background: PAGE_BG }}>
      <div style={{ maxWidth: '560px', margin: '0 auto', padding: '24px 20px 80px' }}>
        <EditPageHeader title="Edit Marriage" />

        {error && <ErrorAlert message={error} />}

        <form onSubmit={handleSave} className="flex flex-col gap-6">
          {gender === 'brother' && (
            <YesNo label="Are you open to polygamy?" value={polygamyOpenness} onChange={setPolygamyOpenness} />
          )}
          <YesNo label="Have you been previously married?" value={previouslyMarried} onChange={setPreviouslyMarried} />
          <YesNo label="Do you have children?" value={hasChildren} onChange={setHasChildren} />
          <YesNo label="Do you want children?" value={wantsChildren} onChange={setWantsChildren} />
          <SimpleDropdown label="What is your timeline to marry?" value={timelineToMarry} onChange={setTimelineToMarry} options={TIMELINE_OPTIONS} />

          <SaveButton saving={saving} />
        </form>
      </div>
      <EditToast toast={toast} />
    </div>
  )
}
