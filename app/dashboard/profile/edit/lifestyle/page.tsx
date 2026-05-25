'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { recalculateProfileCompletion } from '../recalculate-action'
import Slider from '@/components/ui/Slider'
import {
  PAGE_BG, EditSpinner, EditPageHeader, ErrorAlert,
  PillGroup, YesNo, TA, SimpleDropdown, SaveButton, EditToast,
} from '../EditHelpers'

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

export default function EditLifestylePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [toast, setToast] = useState<'success' | 'error' | null>(null)
  const [userId, setUserId] = useState<string>('')
  const [gender, setGender] = useState<string>('')

  const [occupation, setOccupation] = useState('')
  const [educationLevel, setEducationLevel] = useState('')
  const [livingSituation, setLivingSituation] = useState('')
  const [willingToRelocate, setWillingToRelocate] = useState<boolean | null>(null)
  const [financialReadiness, setFinancialReadiness] = useState('')
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
    setSaving(true); setError(null)
    try {
      const supabase = createClient()
      const shared = {
        occupation: occupation.trim() || null, education_level: educationLevel || null,
        living_situation: livingSituation || null, willing_to_relocate: willingToRelocate,
        exercise_frequency: exerciseFrequency || null, strict_halal_diet: strictHalalDiet || null,
        smoking: smoking || null, pets_view: petsView || null,
        healthy_eating_importance: healthyEatingImportance || null,
        social_media_view: socialMediaView || null, home_organisation: homeOrganisation || null,
        political_views: politicalViews || null, cultural_background_importance: culturalBackgroundImportance,
        weekend_lifestyle: weekendLifestyle || null, mixed_gender_social_circle: mixedGenderSocialCircle || null,
        do_you_listen_to_music: doYouListenToMusic || null,
        celebrate_non_islamic_holidays: celebrateNonIslamicHolidays || null,
        ramadan_routine: ramadanRoutine || null,
      }
      if (gender === 'brother') {
        const { error: e2 } = await supabase.from('brother_profiles').update({
          ...shared, financial_readiness: financialReadiness || null,
          travel_frequency: travelFrequency || null,
        }).eq('id', userId)
        if (e2) throw e2
      } else {
        const { error: e2 } = await supabase.from('sister_profiles').update({
          ...shared, travel_importance: travelImportance || null,
        }).eq('id', userId)
        if (e2) throw e2
      }
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
        <EditPageHeader title="Edit Lifestyle" />

        {error && <ErrorAlert message={error} />}

        <form onSubmit={handleSave} className="flex flex-col gap-6">
          <div>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: '#1A1A1A', marginBottom: '10px' }}>
              Occupation <span style={{ fontSize: '12px', color: '#9B9B9B', fontWeight: 400, marginLeft: '6px' }}>(optional)</span>
            </label>
            <input
              type="text" value={occupation} onChange={e => setOccupation(e.target.value)}
              placeholder="e.g. Software Engineer, Teacher, Doctor..."
              style={{
                width: '100%', padding: '12px 14px', border: '1px solid #EDE8E3',
                borderRadius: '12px', fontSize: '14px', color: '#1A1A1A',
                background: 'white', outline: 'none', boxSizing: 'border-box',
              }}
              onFocus={e => { e.currentTarget.style.border = '1.5px solid #AF4D98' }}
              onBlur={e => { e.currentTarget.style.border = '1px solid #EDE8E3' }}
            />
          </div>

          <SimpleDropdown label="Education Level" value={educationLevel} onChange={setEducationLevel} options={EDUCATION_OPTIONS} />
          <SimpleDropdown label="Living Situation" value={livingSituation} onChange={setLivingSituation} options={LIVING_OPTIONS} />
          <YesNo label="Willing to relocate?" value={willingToRelocate} onChange={setWillingToRelocate} />

          {gender === 'brother' && (
            <SimpleDropdown label="Financial Readiness for Marriage" value={financialReadiness} onChange={setFinancialReadiness} options={FINANCIAL_OPTIONS} />
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

          <SaveButton saving={saving} />
        </form>
      </div>
      <EditToast toast={toast} />
    </div>
  )
}
