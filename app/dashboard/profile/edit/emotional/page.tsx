'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { recalculateProfileCompletion } from '../recalculate-action'
import Slider from '@/components/ui/Slider'
import {
  PAGE_BG, EditSpinner, EditPageHeader, ErrorAlert,
  TA, SaveButton, EditToast,
} from '../EditHelpers'

export default function EditEmotionalPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [toast, setToast] = useState<'success' | 'error' | null>(null)
  const [userId, setUserId] = useState('')
  const [gender, setGender] = useState('')

  const [emotionalAvailability, setEmotionalAvailability] = useState(50)
  const [stressManagement, setStressManagement] = useState('')
  const [healthBackgroundDisclosure, setHealthBackgroundDisclosure] = useState('')

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/auth/login'); return }
      setUserId(user.id)
      const { data: prof } = await supabase.from('profiles').select('gender').eq('id', user.id).single()
      if (!prof) { router.push('/auth/login'); return }
      setGender(prof.gender)
      const table = prof.gender === 'brother' ? 'brother_profiles' : 'sister_profiles'
      const { data } = await supabase.from(table).select('emotional_availability, stress_management, health_background_disclosure').eq('id', user.id).single()
      if (data) {
        setEmotionalAvailability(data.emotional_availability ?? 50)
        setStressManagement(data.stress_management ?? '')
        setHealthBackgroundDisclosure(data.health_background_disclosure ?? '')
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
      const table = gender === 'brother' ? 'brother_profiles' : 'sister_profiles'
      const { error: e2 } = await supabase.from(table).update({
        emotional_availability:      emotionalAvailability,
        stress_management:           stressManagement || null,
        health_background_disclosure: healthBackgroundDisclosure || null,
      }).eq('id', userId)
      if (e2) throw e2
      recalculateProfileCompletion().catch(() => {})
      setToast('success')
      setTimeout(() => router.push('/dashboard/profile'), 1200)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong.')
    } finally { setSaving(false) }
  }

  if (loading) return <EditSpinner />

  return (
    <div className="min-h-screen pt-[72px] lg:pt-[76px]" style={{ background: PAGE_BG }}>
      <div style={{ maxWidth: '560px', margin: '0 auto', padding: '24px 20px 80px' }}>
        <EditPageHeader title="Edit Emotional" />

        {error && <ErrorAlert message={error} />}

        <form onSubmit={handleSave} className="flex flex-col gap-6">
          <Slider
            value={emotionalAvailability}
            onChange={setEmotionalAvailability}
            label="How emotionally available are you in relationships?"
            leftLabel="Reserved"
            rightLabel="Very open"
          />

          <TA label="How do you manage stress?" value={stressManagement} onChange={setStressManagement} placeholder="e.g. Prayer, journaling, talking to a trusted friend..." optional />
          <TA label="Is there anything about your health or background a potential spouse should know?" value={healthBackgroundDisclosure} onChange={setHealthBackgroundDisclosure} placeholder="Optional — only shared with matches." optional />

          <SaveButton saving={saving} />
        </form>
      </div>
      <EditToast toast={toast} />
    </div>
  )
}
