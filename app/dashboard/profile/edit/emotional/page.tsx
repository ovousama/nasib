'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'
import { recalculateProfileCompletion } from '../recalculate-action'
import Slider from '@/components/ui/Slider'

const THERAPY_EXP = ['Yes — and it was helpful', 'Yes — mixed experience', 'No but open to it', 'No and not open to it']
const COUPLES_THERAPY = ['Absolutely — would seek it proactively', 'Yes if we needed it', 'Unlikely', 'No']
const MH_CHALLENGES = ['Yes — currently managing', 'Yes — in the past', 'No']
const EMOTIONAL_EXPR = ['Very openly', 'With trusted people', 'Privately', 'I find it difficult']

function Pill({ label, selected, onClick }: { label: string; selected: boolean; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick}
      className={`px-4 py-2 rounded-full text-sm font-medium border transition-all cursor-pointer ${
        selected ? 'bg-[#AF4D98] text-white border-[#AF4D98]' : 'bg-white text-[#1A1A1A] border-[#EDE8E3] hover:border-[#AF4D98]'
      }`}>
      {label}
    </button>
  )
}

function PillGroup({ label, options, value, onChange }: { label: string; options: string[]; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <label className="block text-sm font-medium text-[#1A1A1A] mb-2">{label}</label>
      <div className="flex flex-wrap gap-2">
        {options.map(o => <Pill key={o} label={o} selected={value === o} onClick={() => onChange(o)} />)}
      </div>
    </div>
  )
}

function TA({ label, value, onChange, placeholder, optional }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string; optional?: boolean }) {
  return (
    <div>
      <label className="block text-sm font-medium text-[#1A1A1A] mb-1.5">{label}{optional && <span className="text-[#9B9B9B] font-normal"> (optional)</span>}</label>
      <textarea value={value} onChange={e => onChange(e.target.value)} rows={3} placeholder={placeholder}
        className="w-full px-4 py-3 rounded-[10px] border border-[#EDE8E3] bg-white text-[#1A1A1A] text-[15px] focus:outline-none focus:border-[#AF4D98] focus:ring-2 focus:ring-[#AF4D98]/8 resize-none" />
    </div>
  )
}

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

  if (loading) return <div className="min-h-screen bg-[#FDF8F3] flex items-center justify-center"><div className="w-8 h-8 border-2 border-[#AF4D98] border-t-transparent rounded-full animate-spin" /></div>

  return (
    <div className="min-h-screen bg-[#FDF8F3]">
      <div className="max-w-lg mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-6">
          <Link href="/dashboard/profile" className="text-[#9B9B9B] hover:text-[#1A1A1A] transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5"><path fillRule="evenodd" d="M17 10a.75.75 0 01-.75.75H5.612l4.158 3.96a.75.75 0 11-1.04 1.08l-5.5-5.25a.75.75 0 010-1.08l5.5-5.25a.75.75 0 111.04 1.08L5.612 9.25H16.25A.75.75 0 0117 10z" clipRule="evenodd" /></svg>
          </Link>
          <h1 className="text-base font-medium text-[#1A1A1A]">Edit Emotional & Mental Health</h1>
        </div>

        {error && <div className="bg-red-50 border border-red-100 text-red-600 text-sm rounded-xl px-4 py-3 mb-4">{error}</div>}

        <form onSubmit={handleSave} className="flex flex-col gap-5">
          <PillGroup label="Have you ever been to therapy or counselling?" options={THERAPY_EXP} value={therapyExperience} onChange={setTherapyExperience} />
          <PillGroup label="How do you feel about couples therapy?" options={COUPLES_THERAPY} value={couplesTherapyView} onChange={setCouplesTherapyView} />
          <PillGroup label="Do you have any mental health challenges?" options={MH_CHALLENGES} value={mentalHealthChallenges} onChange={setMentalHealthChallenges} />
          <PillGroup label="How comfortable are you expressing your emotions?" options={EMOTIONAL_EXPR} value={emotionalExpressionView} onChange={setEmotionalExpressionView} />
          <Slider
            value={emotionalAvailability}
            onChange={setEmotionalAvailability}
            label="How emotionally available are you in relationships?"
            leftLabel="Reserved"
            rightLabel="Very open"
          />
          <TA label="How do you manage stress?" value={stressManagement} onChange={setStressManagement} placeholder="e.g. I take space to reflect, then talk..." />
          <TA label="How do you show up emotionally for those you love?" value={emotionalSupportStyle} onChange={setEmotionalSupportStyle} placeholder="e.g. I need words of reassurance and presence..." />
          <TA label="Have you experienced any significant hardship that shaped you?" value={significantHardship} onChange={setSignificantHardship} placeholder="Optional — share only if comfortable" optional />

          <button type="submit" disabled={saving} className="w-full bg-[#AF4D98] text-white font-medium rounded-full py-3.5 mt-2 disabled:opacity-60">
            {saving ? 'Saving...' : 'Save changes'}
          </button>
          <Link href="/dashboard/profile" className="text-center text-sm text-[#9B9B9B] hover:text-[#1A1A1A]">Cancel</Link>
        </form>
      </div>
      {toast && (
        <div className={`fixed bottom-20 left-4 right-4 max-w-lg mx-auto rounded-[10px] px-4 py-3 shadow-[0_2px_8px_rgba(0,0,0,0.1)] text-sm font-medium text-center ${toast === 'success' ? 'bg-[#AF4D98] text-white' : 'bg-red-600 text-white'}`}>
          {toast === 'success' ? 'Changes saved' : 'Something went wrong'}
        </div>
      )}
    </div>
  )
}
