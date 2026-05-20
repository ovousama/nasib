'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'
import { recalculateProfileCompletion } from '../recalculate-action'
import Slider from '@/components/ui/Slider'

const EDUCATION_OPTIONS = ['high school', 'bachelors', 'masters', 'phd', 'trade', 'other']
const LIVING_OPTIONS = ['alone', 'with family', 'with roommates']
const FINANCIAL_OPTIONS = ['fully ready', 'almost ready', 'working towards it']

const EXERCISE_FREQ = ['Daily', 'Several times a week', 'Weekly', 'Occasionally', 'Rarely']
const HALAL_DIET = ['Always strictly halal', 'Halal but flexible on source', 'Vegetarian/vegan', 'Not strict']
const SMOKING = ['Never', 'Occasionally', 'Regularly', 'Trying to quit']
const PETS_VIEW = ['Love them', 'Fine with them', 'Prefer not', 'Allergic/no']
const HEALTHY_EATING = ['Very important', 'Important', 'Somewhat important', 'Not a priority']
const SOCIAL_MEDIA = ['Very active', 'Moderate use', 'Minimal', 'Avoid it']
const HOME_ORGANISATION = ['Very organised', 'Mostly organised', 'Somewhere in between', 'More relaxed']
const POLITICAL_VIEWS = ['Conservative', 'Moderate', 'Progressive', 'Prefer not to say']
const WEEKEND_LIFESTYLE = ['Very social — always out', 'Mix of social and home', 'Mostly home', 'Prefer quiet weekends']
const MIXED_GENDER = ['Yes — mixed freely', 'Some — professional/unavoidable', 'Prefer gender-separated', 'Strictly separated']
const MUSIC = ['Yes — regularly', 'Occasionally', 'Nasheeds/instrumentals only', 'No music']
const TRAVEL_FREQ_OPTS = ['Rarely', 'A few times a year', 'Monthly', 'Frequently — yes she would join', 'Frequently — independently']
const TRAVEL_IMPORTANCE_OPTS = ['Very important — frequent travel', 'A few times a year', 'Occasionally', 'Not important']
const NON_ISLAMIC_HOLIDAYS_OPTS = ['Yes', 'No', 'Birthdays only', 'Rarely']

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

function PillGroup({ label, options, value, onChange, optional }: { label: string; options: string[]; value: string; onChange: (v: string) => void; optional?: boolean }) {
  return (
    <div>
      <label className="block text-sm font-medium text-[#1A1A1A] mb-2">{label}{optional && <span className="text-[#9B9B9B] font-normal"> (optional)</span>}</label>
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

function YesNo({ label, value, onChange }: { label: string; value: boolean | null; onChange: (v: boolean) => void }) {
  return (
    <div>
      <label className="block text-sm font-medium text-[#1A1A1A] mb-2">{label}</label>
      <div className="flex gap-3">
        {([true, false] as const).map(v => (
          <button key={String(v)} type="button" onClick={() => onChange(v)}
            className={`flex-1 py-3 rounded-xl border-2 font-medium text-sm transition-all ${
              value === v ? 'border-[#AF4D98] bg-[#AF4D98] text-white' : 'border-[#EDE8E3] text-[#5C5C5C] hover:border-[#AF4D98]'
            }`}>
            {v ? 'Yes' : 'No'}
          </button>
        ))}
      </div>
    </div>
  )
}

export default function EditLifestylePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [toast, setToast] = useState<'success' | 'error' | null>(null)

  const [userId, setUserId] = useState<string>('')
  const [gender, setGender] = useState<string>('')

  // Core fields
  const [occupation, setOccupation] = useState('')
  const [educationLevel, setEducationLevel] = useState('')
  const [livingSituation, setLivingSituation] = useState('')
  const [willingToRelocate, setWillingToRelocate] = useState<boolean | null>(null)
  const [financialReadiness, setFinancialReadiness] = useState('')

  // Deepdive lifestyle fields
  const [exerciseFrequency, setExerciseFrequency] = useState('')
  const [strictHalalDiet, setStrictHalalDiet] = useState('')
  const [smoking, setSmoking] = useState('')
  const [petsView, setPetsView] = useState('')
  const [healthyEatingImportance, setHealthyEatingImportance] = useState('')
  const [socialMediaView, setSocialMediaView] = useState('')
  const [homeOrganisation, setHomeOrganisation] = useState('')
  const [politicalViews, setPoliticalViews] = useState('')
  const [culturalBackgroundImportance, setCulturalBackgroundImportance] = useState(50)
  const [weekendLifestyle, setWeekendLifestyle] = useState('')
  const [mixedGenderSocialCircle, setMixedGenderSocialCircle] = useState('')
  const [doYouListenToMusic, setDoYouListenToMusic] = useState('')
  const [travelImportance, setTravelImportance] = useState('')
  const [travelFrequency, setTravelFrequency] = useState('')
  const [celebrateNonIslamicHolidays, setCelebrateNonIslamicHolidays] = useState('')
  const [ramadanRoutine, setRamadanRoutine] = useState('')

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
        setOccupation(data.occupation ?? '')
        setEducationLevel(data.education_level ?? '')
        setLivingSituation(data.living_situation ?? '')
        setWillingToRelocate(data.willing_to_relocate ?? null)
        setExerciseFrequency(data.exercise_frequency ?? '')
        setStrictHalalDiet(data.strict_halal_diet ?? '')
        setSmoking(data.smoking ?? '')
        setPetsView(data.pets_view ?? '')
        setHealthyEatingImportance(data.healthy_eating_importance ?? '')
        setSocialMediaView(data.social_media_view ?? '')
        setHomeOrganisation(data.home_organisation ?? '')
        setPoliticalViews(data.political_views ?? '')
        setCulturalBackgroundImportance(data.cultural_background_importance ?? 50)
        setWeekendLifestyle(data.weekend_lifestyle ?? '')
        setMixedGenderSocialCircle(data.mixed_gender_social_circle ?? '')
        setDoYouListenToMusic(data.do_you_listen_to_music ?? '')
        setCelebrateNonIslamicHolidays(data.celebrate_non_islamic_holidays ?? '')
        setRamadanRoutine(data.ramadan_routine ?? '')
        if (profile.gender === 'brother') {
          setFinancialReadiness(data.financial_readiness ?? '')
          setTravelFrequency(data.travel_frequency ?? '')
        } else {
          setTravelImportance(data.travel_importance ?? '')
        }
      }
      setLoading(false)
    }
    load()
  }, [])

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError(null)
    try {
      const supabase = createClient()
      const shared = {
        occupation: occupation.trim() || null,
        education_level: educationLevel || null,
        living_situation: livingSituation || null,
        willing_to_relocate: willingToRelocate,
        exercise_frequency: exerciseFrequency || null,
        strict_halal_diet: strictHalalDiet || null,
        smoking: smoking || null,
        pets_view: petsView || null,
        healthy_eating_importance: healthyEatingImportance || null,
        social_media_view: socialMediaView || null,
        home_organisation: homeOrganisation || null,
        political_views: politicalViews || null,
        cultural_background_importance: culturalBackgroundImportance,
        weekend_lifestyle: weekendLifestyle || null,
        mixed_gender_social_circle: mixedGenderSocialCircle || null,
        do_you_listen_to_music: doYouListenToMusic || null,
        celebrate_non_islamic_holidays: celebrateNonIslamicHolidays || null,
        ramadan_routine: ramadanRoutine || null,
      }
      if (gender === 'brother') {
        const { error: e2 } = await supabase.from('brother_profiles').update({
          ...shared,
          financial_readiness: financialReadiness || null,
          travel_frequency: travelFrequency || null,
        }).eq('id', userId)
        if (e2) throw e2
      } else {
        const { error: e2 } = await supabase.from('sister_profiles').update({
          ...shared,
          travel_importance: travelImportance || null,
        }).eq('id', userId)
        if (e2) throw e2
      }
      recalculateProfileCompletion().catch(() => {})
      setToast('success')
      setTimeout(() => router.push('/dashboard/profile'), 1200)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div className="min-h-screen bg-[#FDF8F3] flex items-center justify-center"><div className="w-8 h-8 border-2 border-[#AF4D98] border-t-transparent rounded-full animate-spin" /></div>

  return (
    <div className="min-h-screen bg-[#FDF8F3]">
      <div className="max-w-lg mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-6">
          <Link href="/dashboard/profile" className="text-[#9B9B9B] hover:text-[#1A1A1A] transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5"><path fillRule="evenodd" d="M17 10a.75.75 0 01-.75.75H5.612l4.158 3.96a.75.75 0 11-1.04 1.08l-5.5-5.25a.75.75 0 010-1.08l5.5-5.25a.75.75 0 111.04 1.08L5.612 9.25H16.25A.75.75 0 0117 10z" clipRule="evenodd" /></svg>
          </Link>
          <h1 className="text-base font-medium text-[#1A1A1A]">Edit Lifestyle</h1>
        </div>

        {error && <div className="bg-red-50 border border-red-100 text-red-600 text-sm rounded-xl px-4 py-3 mb-4">{error}</div>}

        <form onSubmit={handleSave} className="flex flex-col gap-5">
          <div>
            <label className="block text-sm font-medium text-[#1A1A1A] mb-1">Occupation <span className="text-[#9B9B9B] font-normal">(optional)</span></label>
            <input type="text" value={occupation} onChange={e => setOccupation(e.target.value)}
              className="w-full px-4 py-3 rounded-[10px] border border-[#EDE8E3] focus:outline-none focus:border-[#AF4D98] focus:ring-2 focus:ring-[#AF4D98]/8 text-[#1A1A1A] text-[15px] bg-white"
              placeholder="e.g. Software Engineer, Teacher, Doctor..." />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#1A1A1A] mb-1">Education Level</label>
            <select value={educationLevel} onChange={e => setEducationLevel(e.target.value)}
              className="w-full px-4 py-3 rounded-[10px] border border-[#EDE8E3] focus:outline-none focus:border-[#AF4D98] focus:ring-2 focus:ring-[#AF4D98]/8 text-[#1A1A1A] text-[15px] bg-white">
              <option value="">Select...</option>
              {EDUCATION_OPTIONS.map(opt => <option key={opt} value={opt}>{opt.charAt(0).toUpperCase() + opt.slice(1)}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-[#1A1A1A] mb-1">Living Situation</label>
            <select value={livingSituation} onChange={e => setLivingSituation(e.target.value)}
              className="w-full px-4 py-3 rounded-[10px] border border-[#EDE8E3] focus:outline-none focus:border-[#AF4D98] focus:ring-2 focus:ring-[#AF4D98]/8 text-[#1A1A1A] text-[15px] bg-white">
              <option value="">Select...</option>
              {LIVING_OPTIONS.map(opt => <option key={opt} value={opt}>{opt.charAt(0).toUpperCase() + opt.slice(1)}</option>)}
            </select>
          </div>

          <YesNo label="Willing to relocate?" value={willingToRelocate} onChange={setWillingToRelocate} />

          {gender === 'brother' && (
            <div>
              <label className="block text-sm font-medium text-[#1A1A1A] mb-1">Financial Readiness for Marriage</label>
              <select value={financialReadiness} onChange={e => setFinancialReadiness(e.target.value)}
                className="w-full px-4 py-3 rounded-[10px] border border-[#EDE8E3] focus:outline-none focus:border-[#AF4D98] focus:ring-2 focus:ring-[#AF4D98]/8 text-[#1A1A1A] text-[15px] bg-white">
                <option value="">Select...</option>
                {FINANCIAL_OPTIONS.map(opt => <option key={opt} value={opt}>{opt.charAt(0).toUpperCase() + opt.slice(1)}</option>)}
              </select>
            </div>
          )}

          <PillGroup label="How often do you exercise?" options={EXERCISE_FREQ} value={exerciseFrequency} onChange={setExerciseFrequency} optional />
          <PillGroup label="Do you follow a strict halal diet?" options={HALAL_DIET} value={strictHalalDiet} onChange={setStrictHalalDiet} optional />
          <PillGroup label="Do you smoke or use tobacco products?" options={SMOKING} value={smoking} onChange={setSmoking} optional />
          <PillGroup label="What is your view on pets?" options={PETS_VIEW} value={petsView} onChange={setPetsView} optional />
          <PillGroup label="How important is healthy eating to you?" options={HEALTHY_EATING} value={healthyEatingImportance} onChange={setHealthyEatingImportance} optional />
          <PillGroup label="What is your view on social media use in marriage?" options={SOCIAL_MEDIA} value={socialMediaView} onChange={setSocialMediaView} optional />
          <PillGroup label="How organised do you like your home to be?" options={HOME_ORGANISATION} value={homeOrganisation} onChange={setHomeOrganisation} optional />
          <PillGroup label="How would you describe your political views?" options={POLITICAL_VIEWS} value={politicalViews} onChange={setPoliticalViews} optional />

          <Slider
            value={culturalBackgroundImportance}
            onChange={setCulturalBackgroundImportance}
            label="How important is sharing the same cultural background?"
            leftLabel="Not important"
            rightLabel="Very important"
          />

          <PillGroup label="How do you spend your weekends typically?" options={WEEKEND_LIFESTYLE} value={weekendLifestyle} onChange={setWeekendLifestyle} optional />
          <PillGroup label="Do you have a mixed gender social circle?" options={MIXED_GENDER} value={mixedGenderSocialCircle} onChange={setMixedGenderSocialCircle} optional />
          <PillGroup label="Do you listen to music?" options={MUSIC} value={doYouListenToMusic} onChange={setDoYouListenToMusic} optional />
          <PillGroup label="Do you celebrate birthdays or non-Islamic holidays?" options={NON_ISLAMIC_HOLIDAYS_OPTS} value={celebrateNonIslamicHolidays} onChange={setCelebrateNonIslamicHolidays} optional />
          {gender === 'brother'
            ? <PillGroup label="How often do you travel and would you expect your wife to travel with you?" options={TRAVEL_FREQ_OPTS} value={travelFrequency} onChange={setTravelFrequency} optional />
            : <PillGroup label="How important is travel to you?" options={TRAVEL_IMPORTANCE_OPTS} value={travelImportance} onChange={setTravelImportance} optional />}

          <TA label="Describe your Ramadan routine" value={ramadanRoutine} onChange={setRamadanRoutine} placeholder="How do you spend Ramadan? Daily habits, routines, community..." optional />

          <button type="submit" disabled={saving} className="w-full bg-[#AF4D98] text-white font-medium rounded-full py-3.5 mt-2 disabled:opacity-60 transition-opacity">
            {saving ? 'Saving...' : 'Save changes'}
          </button>
          <Link href="/dashboard/profile" className="text-center text-sm text-[#9B9B9B] hover:text-[#1A1A1A] transition-colors">Cancel</Link>
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
