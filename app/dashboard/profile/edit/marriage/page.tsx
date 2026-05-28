'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { recalculateProfileCompletion } from '../recalculate-action'
import {
  PAGE_BG, EditSpinner, EditPageHeader, ErrorAlert,
  PillGroupKV, SaveButton, EditToast,
} from '../EditHelpers'

const YES_NO_OPTIONS = [
  { value: 'yes', label: 'Yes' },
  { value: 'no',  label: 'No' },
]

const WANTS_CHILDREN_OPTIONS = [
  { value: 'yes',  label: 'Yes' },
  { value: 'no',   label: 'No' },
  { value: 'open', label: 'Open to it' },
]

const NUM_CHILDREN_OPTIONS = [
  { value: '1',      label: '1' },
  { value: '2',      label: '2' },
  { value: '3',      label: '3' },
  { value: '4',      label: '4' },
  { value: '5_plus', label: '5+' },
  { value: 'open',   label: 'Open' },
]

const POLYGAMY_OPTIONS = [
  { value: 'open',       label: 'Open to it' },
  { value: 'not_for_me', label: 'Not for me' },
  { value: 'against',    label: 'Against it' },
  { value: 'undecided',  label: 'Undecided' },
]

const INLAWS_OPTIONS = [
  { value: 'yes',         label: 'Yes, open to it' },
  { value: 'no',          label: 'No, prefer separate' },
  { value: 'temporarily', label: 'Temporarily if needed' },
  { value: 'undecided',   label: 'Undecided' },
]

const WIFE_WORKING_OPTIONS = [
  { value: 'yes',         label: 'Yes, fully supportive' },
  { value: 'part_time',   label: 'Part-time is fine' },
  { value: 'depends',     label: 'Depends on the situation' },
  { value: 'prefer_home', label: 'Prefer she focuses on home' },
]

const TIMELINE_OPTIONS = [
  { value: 'within_3_months', label: 'Within 3 months' },
  { value: 'within_6_months', label: 'Within 6 months' },
  { value: 'within_a_year',   label: 'Within a year' },
  { value: 'flexible',        label: 'Flexible / not rushed' },
]

export default function EditMarriagePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [toast, setToast] = useState<'success' | 'error' | null>(null)
  const [userId, setUserId] = useState<string>('')
  const [gender, setGender] = useState<string>('')

  const [polygamyOpenness, setPolygamyOpenness] = useState('')
  const [previouslyMarried, setPreviouslyMarried] = useState('')
  const [hasChildren, setHasChildren] = useState('')
  const [wantsChildren, setWantsChildren] = useState('')
  const [numChildrenWanted, setNumChildrenWanted] = useState('')
  const [inlawsLivingTogether, setInlawsLivingTogether] = useState('')
  const [wifeWorkingOpenness, setWifeWorkingOpenness] = useState('')
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
      const table = profile.gender === 'brother' ? 'brother_profiles' : 'sister_profiles'
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data } = await supabase.from(table).select('*').eq('id', user.id).single() as { data: any }
      if (data) {
        const boolToStr = (v: unknown) => v === true ? 'yes' : v === false ? 'no' : (v as string ?? '')
        setPreviouslyMarried(boolToStr(data.previously_married))
        setHasChildren(boolToStr(data.has_children))
        setWantsChildren(boolToStr(data.wants_children))
        setPolygamyOpenness(boolToStr(data.polygamy_openness))
        setNumChildrenWanted(data.number_of_children_wanted ?? '')
        setInlawsLivingTogether(data.inlaws_living_together ?? '')
        setTimelineToMarry(data.timeline_to_marry ?? '')
        if (profile.gender === 'brother') {
          setWifeWorkingOpenness(data.wife_working_openness ?? '')
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
      const shared = {
        previously_married:        previouslyMarried || null,
        has_children:              hasChildren || null,
        wants_children:            wantsChildren || null,
        polygamy_openness:         polygamyOpenness || null,
        number_of_children_wanted: numChildrenWanted || null,
        inlaws_living_together:    inlawsLivingTogether || null,
        timeline_to_marry:         timelineToMarry || null,
      }
      if (gender === 'brother') {
        const { error: updateError } = await supabase.from('brother_profiles').update({
          ...shared, wife_working_openness: wifeWorkingOpenness || null,
        }).eq('id', userId)
        if (updateError) throw updateError
      } else {
        const { error: updateError } = await supabase.from('sister_profiles').update(shared).eq('id', userId)
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
          <PillGroupKV label="Previously married?" options={YES_NO_OPTIONS} value={previouslyMarried} onChange={setPreviouslyMarried} optional />
          <PillGroupKV label="Do you have children?" options={YES_NO_OPTIONS} value={hasChildren} onChange={setHasChildren} optional />
          <PillGroupKV label="Do you want children?" options={WANTS_CHILDREN_OPTIONS} value={wantsChildren} onChange={setWantsChildren} optional />
          <PillGroupKV label="How many children do you want?" options={NUM_CHILDREN_OPTIONS} value={numChildrenWanted} onChange={setNumChildrenWanted} optional />
          <PillGroupKV label="What is your view on polygamy?" options={POLYGAMY_OPTIONS} value={polygamyOpenness} onChange={setPolygamyOpenness} optional />
          <PillGroupKV label="Would you be open to in-laws living with you?" options={INLAWS_OPTIONS} value={inlawsLivingTogether} onChange={setInlawsLivingTogether} optional />

          {gender === 'brother' && (
            <PillGroupKV label="Are you open to your wife working after marriage?" options={WIFE_WORKING_OPTIONS} value={wifeWorkingOpenness} onChange={setWifeWorkingOpenness} optional />
          )}

          <PillGroupKV label="Timeline to marry" options={TIMELINE_OPTIONS} value={timelineToMarry} onChange={setTimelineToMarry} optional />

          <SaveButton saving={saving} />
        </form>
      </div>
      <EditToast toast={toast} />
    </div>
  )
}
