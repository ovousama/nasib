'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { recalculateProfileCompletion } from '../recalculate-action'
import Slider from '@/components/ui/Slider'
import {
  PAGE_BG, EditSpinner, EditPageHeader, ErrorAlert,
  PillGroup, TA, SaveButton, EditToast,
} from '../EditHelpers'

const THERAPY_EXP = ['Yes — and it was helpful', 'Yes — mixed experience', 'No but open to it', 'No and not open to it']
const COUPLES_THERAPY = ['Absolutely — would seek it proactively', 'Yes if we needed it', 'Unlikely', 'No']
const MH_CHALLENGES = ['Yes — currently managing', 'Yes — in the past', 'No']
const EMOTIONAL_EXPR = ['Very openly', 'With trusted people', 'Privately', 'I find it difficult']

export default function EditEmotionalPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [toast, setToast] = useState<'success' | 'error' | null>(null)
  const [userId, setUserId] = useState('')
  const [gender, setGender] = useState('')

  const [therapyExperience, setTherapyExperience] = useState('')
  const [couplesTherapyView, setCouplesTherapyView] = useState('')
  const [mentalHealthChallenges, setMentalHealthChallenges] = useState('')
  const [emotionalExpressionView, setEmotionalExpressionView] = useState('')
  const [emotionalAvailability, setEmotionalAvailability] = useState(50)
  const [stressManagement, setStressManagement] = useState('')
  const [emotionalSupportStyle, setEmotionalSupportStyle] = useState('')
  const [significantHardship, setSignificantHardship] = useState('')

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
      const { data } = await supabase.from(table).select('therapy_experience,couples_therapy_view,mental_health_challenges,emotional_expression_view,emotional_availability,stress_management,emotional_support_style,significant_hardship').eq('id', user.id).single()
      if (data) {
        setTherapyExperience(data.therapy_experience ?? '')
        setCouplesTherapyView(data.couples_therapy_view ?? '')
        setMentalHealthChallenges(data.mental_health_challenges ?? '')
        setEmotionalExpressionView(data.emotional_expression_view ?? '')
        setEmotionalAvailability(data.emotional_availability ?? 50)
        setStressManagement(data.stress_management ?? '')
        setEmotionalSupportStyle(data.emotional_support_style ?? '')
        setSignificantHardship(data.significant_hardship ?? '')
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
        therapy_experience: therapyExperience || null,
        couples_therapy_view: couplesTherapyView || null,
        mental_health_challenges: mentalHealthChallenges || null,
        emotional_expression_view: emotionalExpressionView || null,
        emotional_availability: emotionalAvailability,
        stress_management: stressManagement || null,
        emotional_support_style: emotionalSupportStyle || null,
        significant_hardship: significantHardship || null,
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
        <EditPageHeader title="Edit Emotional & Mental Health" />

        {error && <ErrorAlert message={error} />}

        <form onSubmit={handleSave} className="flex flex-col gap-6">
          <PillGroup label="Have you ever been to therapy or counselling?" options={THERAPY_EXP} value={therapyExperience} onChange={setTherapyExperience} optional />
          <PillGroup label="How do you feel about couples therapy?" options={COUPLES_THERAPY} value={couplesTherapyView} onChange={setCouplesTherapyView} optional />
          <PillGroup label="Do you have any mental health challenges?" options={MH_CHALLENGES} value={mentalHealthChallenges} onChange={setMentalHealthChallenges} optional />
          <PillGroup label="How comfortable are you expressing your emotions?" options={EMOTIONAL_EXPR} value={emotionalExpressionView} onChange={setEmotionalExpressionView} optional />

          <Slider
            value={emotionalAvailability}
            onChange={setEmotionalAvailability}
            label="How emotionally available are you in relationships?"
            leftLabel="Reserved"
            rightLabel="Very open"
          />

          <TA label="How do you manage stress?" value={stressManagement} onChange={setStressManagement} placeholder="e.g. I take space to reflect, then talk..." optional />
          <TA label="How do you show up emotionally for those you love?" value={emotionalSupportStyle} onChange={setEmotionalSupportStyle} placeholder="e.g. I need words of reassurance and presence..." optional />
          <TA label="Have you experienced any significant hardship that shaped you?" value={significantHardship} onChange={setSignificantHardship} placeholder="Optional — share only if comfortable" optional />

          <SaveButton saving={saving} />
        </form>
      </div>
      <EditToast toast={toast} />
    </div>
  )
}
