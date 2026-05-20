'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'

const textareaCls =
  'w-full px-4 py-3.5 rounded-[10px] border border-[#EDE8E3] bg-white text-[#1A1A1A] placeholder-[#9B9B9B] text-[15px] focus:outline-none focus:border-[#AF4D98] focus:ring-2 focus:ring-[#AF4D98]/8 transition-colors resize-none'

function SectionHeader({ title }: { title: string }) {
  return (
    <div className="text-[11px] font-medium uppercase tracking-[0.06em] text-[#9B9B9B] border-b border-[#EDE8E3] pb-2 mb-5">
      {title}
    </div>
  )
}

function Question({ label, note, children }: { label: string; note?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2.5">
      <label className="block text-sm font-medium text-[#1A1A1A]">{label}</label>
      {note && <p className="text-xs text-[#9B9B9B] -mt-1">{note}</p>}
      {children}
    </div>
  )
}

function Pill({ label, selected, onClick }: { label: string; selected: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-4 py-2 rounded-full text-sm font-medium border transition-colors cursor-pointer ${
        selected
          ? 'bg-[#AF4D98] text-white border-[#AF4D98]'
          : 'bg-white text-[#1A1A1A] border-[#EDE8E3] hover:border-[#D4CBC4]'
      }`}
    >
      {label}
    </button>
  )
}

function MultiPill({ label, selected, onClick }: { label: string; selected: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium border transition-colors cursor-pointer ${
        selected
          ? 'bg-[#AF4D98] text-white border-[#AF4D98]'
          : 'bg-white text-[#1A1A1A] border-[#EDE8E3] hover:border-[#D4CBC4]'
      }`}
    >
      {selected && (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5 flex-shrink-0">
          <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
        </svg>
      )}
      {label}
    </button>
  )
}

function PillGroup({ options, value, onChange }: { options: string[]; value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map(opt => (
        <Pill key={opt} label={opt} selected={value === opt} onClick={() => onChange(opt)} />
      ))}
    </div>
  )
}

function MultiPillGroup({
  options, values, onChange, max,
}: { options: string[]; values: string[]; onChange: (v: string[]) => void; max: number }) {
  const toggle = (opt: string) => {
    if (values.includes(opt)) {
      onChange(values.filter(v => v !== opt))
    } else if (values.length < max) {
      onChange([...values, opt])
    }
  }
  return (
    <div className="flex flex-wrap gap-2">
      {options.map(opt => (
        <MultiPill key={opt} label={opt} selected={values.includes(opt)} onClick={() => toggle(opt)} />
      ))}
    </div>
  )
}

export default function BrotherAdditional() {
  const router = useRouter()
  const formRef = useRef<HTMLFormElement>(null)
  const [userId,   setUserId]   = useState('')
  const [dataLoading, setDataLoading] = useState(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [doYouListenToMusic, setDoYouListenToMusic] = useState('')
  const [celebrateNonIslamicHolidays, setCelebrateNonIslamicHolidays] = useState('')
  const [wifeHijabImportance, setWifeHijabImportance] = useState('')
  const [jumuahAttendance, setJumuahAttendance] = useState('')
  const [differingIslamicOpinions, setDifferingIslamicOpinions] = useState('')

  const [annualIncomeRange, setAnnualIncomeRange] = useState('')
  const [ownOrRent, setOwnOrRent] = useState('')
  const [hasSignificantDebt, setHasSignificantDebt] = useState('')
  const [supportingFamilyFinancially, setSupportingFamilyFinancially] = useState('')
  const [mahrApproach, setMahrApproach] = useState('')

  const [numberOfChildrenWanted, setNumberOfChildrenWanted] = useState('')
  const [wifeWorkingOpenness, setWifeWorkingOpenness] = useState('')
  const [householdManagement, setHouseholdManagement] = useState('')
  const [inlawsLivingTogether, setInlawsLivingTogether] = useState('')
  const [islamicSchoolingImportance, setIslamicSchoolingImportance] = useState('')

  const [weekendLifestyle, setWeekendLifestyle] = useState('')
  const [mixedGenderSocialCircle, setMixedGenderSocialCircle] = useState('')
  const [travelFrequency, setTravelFrequency] = useState('')
  const [strictHalalDiet, setStrictHalalDiet] = useState('')
  const [smoking, setSmoking] = useState('')

  const [conflictStyle, setConflictStyle] = useState('')
  const [introvertExtrovert, setIntrovertExtrovert] = useState('')
  const [loveLanguage, setLoveLanguage] = useState<string[]>([])
  const [aloneTimeImportance, setAloneTimeImportance] = useState('')
  const [healthBackgroundDisclosure, setHealthBackgroundDisclosure] = useState('')

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.replace('/auth/login'); return }
      setUserId(user.id)
      const { data } = await supabase
        .from('brother_profiles')
        .select('do_you_listen_to_music, celebrate_non_islamic_holidays, wife_hijab_importance, jumuah_attendance, differing_islamic_opinions, annual_income_range, own_or_rent, has_significant_debt, supporting_family_financially, mahr_approach, number_of_children_wanted, wife_working_openness, household_management, inlaws_living_together, islamic_schooling_importance, weekend_lifestyle, mixed_gender_social_circle, travel_frequency, strict_halal_diet, smoking, conflict_style, introvert_extrovert, love_language, alone_time_importance, health_background_disclosure')
        .eq('id', user.id)
        .single()
      if (data) {
        if (data.do_you_listen_to_music)        setDoYouListenToMusic(data.do_you_listen_to_music)
        if (data.celebrate_non_islamic_holidays) setCelebrateNonIslamicHolidays(data.celebrate_non_islamic_holidays)
        if (data.wife_hijab_importance)          setWifeHijabImportance(data.wife_hijab_importance)
        if (data.jumuah_attendance)              setJumuahAttendance(data.jumuah_attendance)
        if (data.differing_islamic_opinions)     setDifferingIslamicOpinions(data.differing_islamic_opinions)
        if (data.annual_income_range)            setAnnualIncomeRange(data.annual_income_range)
        if (data.own_or_rent)                    setOwnOrRent(data.own_or_rent)
        if (data.has_significant_debt)           setHasSignificantDebt(data.has_significant_debt)
        if (data.supporting_family_financially)  setSupportingFamilyFinancially(data.supporting_family_financially)
        if (data.mahr_approach)                  setMahrApproach(data.mahr_approach)
        if (data.number_of_children_wanted)      setNumberOfChildrenWanted(data.number_of_children_wanted)
        if (data.wife_working_openness)          setWifeWorkingOpenness(data.wife_working_openness)
        if (data.household_management)           setHouseholdManagement(data.household_management)
        if (data.inlaws_living_together)         setInlawsLivingTogether(data.inlaws_living_together)
        if (data.islamic_schooling_importance)   setIslamicSchoolingImportance(data.islamic_schooling_importance)
        if (data.weekend_lifestyle)              setWeekendLifestyle(data.weekend_lifestyle)
        if (data.mixed_gender_social_circle)     setMixedGenderSocialCircle(data.mixed_gender_social_circle)
        if (data.travel_frequency)               setTravelFrequency(data.travel_frequency)
        if (data.strict_halal_diet)              setStrictHalalDiet(data.strict_halal_diet)
        if (data.smoking)                        setSmoking(data.smoking)
        if (data.conflict_style)                 setConflictStyle(data.conflict_style)
        if (data.introvert_extrovert)            setIntrovertExtrovert(data.introvert_extrovert)
        if (data.love_language && Array.isArray(data.love_language)) setLoveLanguage(data.love_language)
        if (data.alone_time_importance)          setAloneTimeImportance(data.alone_time_importance)
        if (data.health_background_disclosure)   setHealthBackgroundDisclosure(data.health_background_disclosure)
      }
      setDataLoading(false)
    }
    load()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    const requiredPills: [string, string][] = [
      [doYouListenToMusic,          'Do you listen to music?'],
      [celebrateNonIslamicHolidays, 'Birthdays or non-Islamic holidays?'],
      [wifeHijabImportance,         'Wife hijab importance'],
      [jumuahAttendance,            "Jumu'ah attendance"],
      [annualIncomeRange,           'Annual income range'],
      [ownOrRent,                   'Own or rent'],
      [hasSignificantDebt,          'Significant debt'],
      [supportingFamilyFinancially, 'Supporting family financially'],
      [numberOfChildrenWanted,      'Number of children wanted'],
      [wifeWorkingOpenness,         'Wife working after marriage'],
      [householdManagement,         'Household management'],
      [inlawsLivingTogether,        'In-laws living with you'],
      [islamicSchoolingImportance,  'Islamic schooling importance'],
      [mixedGenderSocialCircle,     'Mixed gender social circle'],
      [travelFrequency,             'Travel frequency'],
      [strictHalalDiet,             'Halal diet'],
      [smoking,                     'Smoking'],
      [conflictStyle,               'Conflict style'],
      [introvertExtrovert,          'Introvert or extrovert'],
      [aloneTimeImportance,         'Alone time importance'],
    ]

    for (const [val, label] of requiredPills) {
      if (!val) { setError(`Please answer: ${label}`); return }
    }
    if (!differingIslamicOpinions.trim()) { setError('Please answer: Differing Islamic opinions'); return }
    if (!mahrApproach.trim())             { setError('Please answer: Mahr approach'); return }
    if (!weekendLifestyle.trim())         { setError('Please answer: Weekend lifestyle'); return }
    if (loveLanguage.length === 0)        { setError('Please select at least one love language'); return }

    setLoading(true)
    const supabase = createClient()
    const { error: saveErr } = await supabase
      .from('brother_profiles')
      .upsert({
        id:                             userId,
        do_you_listen_to_music:         doYouListenToMusic,
        celebrate_non_islamic_holidays: celebrateNonIslamicHolidays,
        wife_hijab_importance:          wifeHijabImportance,
        jumuah_attendance:              jumuahAttendance,
        differing_islamic_opinions:     differingIslamicOpinions.trim(),
        annual_income_range:            annualIncomeRange,
        own_or_rent:                    ownOrRent,
        has_significant_debt:           hasSignificantDebt,
        supporting_family_financially:  supportingFamilyFinancially,
        mahr_approach:                  mahrApproach.trim(),
        number_of_children_wanted:      numberOfChildrenWanted,
        wife_working_openness:          wifeWorkingOpenness,
        household_management:           householdManagement,
        inlaws_living_together:         inlawsLivingTogether,
        islamic_schooling_importance:   islamicSchoolingImportance,
        weekend_lifestyle:              weekendLifestyle.trim(),
        mixed_gender_social_circle:     mixedGenderSocialCircle,
        travel_frequency:               travelFrequency,
        strict_halal_diet:              strictHalalDiet,
        smoking:                        smoking,
        conflict_style:                 conflictStyle,
        introvert_extrovert:            introvertExtrovert,
        love_language:                  loveLanguage,
        alone_time_importance:          aloneTimeImportance,
        health_background_disclosure:   healthBackgroundDisclosure.trim() || null,
      }, { onConflict: 'id' })
    if (saveErr) { setError(saveErr.message); setLoading(false); return }
    const { data: fullProfile } = await supabase
      .from('brother_profiles')
      .select('*')
      .eq('id', userId)
      .single()

    if (fullProfile) {
      const { calculateCompletion } = await import('@/lib/profile-completion')
      const { percentage, isComplete } = calculateCompletion(fullProfile as Record<string, unknown>, 'brother')
      await supabase
        .from('profiles')
        .update({
          profile_completion_percentage: percentage,
          profile_complete: isComplete,
          status: isComplete ? 'active' : 'pending_verification',
        })
        .eq('id', userId)
    }
    router.push('/onboarding/brother/deepdive')
  }

  if (dataLoading) return (
    <div className="min-h-screen bg-[#FDF8F3] flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-[#AF4D98] border-t-transparent rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="min-h-screen bg-[#FDF8F3]">
      <div className="max-w-[480px] mx-auto px-5 py-8 pb-28">
        <h2 className="text-2xl font-medium text-[#1A1A1A] tracking-[-0.02em] mb-1">A little more about you</h2>
        <p className="text-[15px] text-[#9B9B9B] mb-8">These help us find you a truly compatible match</p>

        <form id="brother-additional-form" ref={formRef} onSubmit={handleSubmit} className="space-y-8">

          {/* Faith & Practice */}
          <div>
            <SectionHeader title="Faith & Practice" />
            <div className="space-y-6">
              <Question label="Do you listen to music?">
                <PillGroup
                  options={['Yes', 'No', 'Nasheeds only', 'Occasionally']}
                  value={doYouListenToMusic}
                  onChange={v => { setDoYouListenToMusic(v) }}
                />
              </Question>
              <Question label="Do you celebrate birthdays or non-Islamic holidays?">
                <PillGroup
                  options={['Yes', 'No', 'Birthdays only', 'Rarely']}
                  value={celebrateNonIslamicHolidays}
                  onChange={v => { setCelebrateNonIslamicHolidays(v) }}
                />
              </Question>
              <Question label="How important is it that your wife wears hijab?">
                <PillGroup
                  options={['Required', 'Strongly preferred', 'Preferred', 'Not a requirement']}
                  value={wifeHijabImportance}
                  onChange={v => { setWifeHijabImportance(v) }}
                />
              </Question>
              <Question label="How often do you attend Jumu'ah and congregational prayers?">
                <PillGroup
                  options={['Every week', 'Most weeks', 'When I can', 'Working on it']}
                  value={jumuahAttendance}
                  onChange={v => { setJumuahAttendance(v) }}
                />
              </Question>
              <Question label="How do you approach differences in Islamic opinion between spouses?">
                <textarea
                  value={differingIslamicOpinions}
                  onChange={e => { setDifferingIslamicOpinions(e.target.value) }}
                  rows={3}
                  placeholder="e.g. I believe we should discuss openly and respect each other's madhab..."
                  className={textareaCls}
                />
              </Question>
            </div>
          </div>

          {/* Financial & Practical */}
          <div>
            <SectionHeader title="Financial & Practical" />
            <div className="space-y-6">
              <Question label="What is your annual income range?">
                <PillGroup
                  options={['Under $30k', '$30k–$60k', '$60k–$100k', '$100k–$150k', '$150k+', 'Prefer not to say']}
                  value={annualIncomeRange}
                  onChange={v => { setAnnualIncomeRange(v) }}
                />
              </Question>
              <Question label="Do you own or rent your home?">
                <PillGroup
                  options={['Own', 'Rent', 'Living with family', 'Other']}
                  value={ownOrRent}
                  onChange={v => { setOwnOrRent(v) }}
                />
              </Question>
              <Question label="Do you have any significant debt?">
                <PillGroup
                  options={['No', 'Yes — student loans', 'Yes — other', 'Prefer not to say']}
                  value={hasSignificantDebt}
                  onChange={v => { setHasSignificantDebt(v) }}
                />
              </Question>
              <Question label="Are you currently financially supporting parents or family members?">
                <PillGroup
                  options={['Yes — significant', 'Yes — some', 'No', 'Occasionally']}
                  value={supportingFamilyFinancially}
                  onChange={v => { setSupportingFamilyFinancially(v) }}
                />
              </Question>
              <Question label="How do you approach mahr?">
                <textarea
                  value={mahrApproach}
                  onChange={e => { setMahrApproach(e.target.value) }}
                  rows={3}
                  placeholder="e.g. I believe mahr should be meaningful but not a burden..."
                  className={textareaCls}
                />
              </Question>
            </div>
          </div>

          {/* Family & Household */}
          <div>
            <SectionHeader title="Family & Household" />
            <div className="space-y-6">
              <Question label="How many children do you want?">
                <PillGroup
                  options={['1–2', '3–4', '5+', 'Open to whatever Allah wills', 'None']}
                  value={numberOfChildrenWanted}
                  onChange={v => { setNumberOfChildrenWanted(v) }}
                />
              </Question>
              <Question label="Are you open to your wife working after marriage?">
                <PillGroup
                  options={["Yes fully", "Yes with conditions", "Prefer she doesn't", "No"]}
                  value={wifeWorkingOpenness}
                  onChange={v => { setWifeWorkingOpenness(v) }}
                />
              </Question>
              <Question label="Who do you expect to manage the household day to day?">
                <PillGroup
                  options={['My wife primarily', 'Shared equally', 'Flexible', 'We would decide together']}
                  value={householdManagement}
                  onChange={v => { setHouseholdManagement(v) }}
                />
              </Question>
              <Question label="Would you be open to your in-laws living with you?">
                <PillGroup
                  options={['Yes', 'Possibly', 'No', 'Depends on circumstances']}
                  value={inlawsLivingTogether}
                  onChange={v => { setInlawsLivingTogether(v) }}
                />
              </Question>
              <Question label="How important is Islamic schooling for your children?">
                <PillGroup
                  options={['Very important — required', 'Important', 'Somewhat important', 'Not a priority']}
                  value={islamicSchoolingImportance}
                  onChange={v => { setIslamicSchoolingImportance(v) }}
                />
              </Question>
            </div>
          </div>

          {/* Lifestyle & Social */}
          <div>
            <SectionHeader title="Lifestyle & Social" />
            <div className="space-y-6">
              <Question label="How do you spend your weekends typically?">
                <textarea
                  value={weekendLifestyle}
                  onChange={e => { setWeekendLifestyle(e.target.value) }}
                  rows={3}
                  placeholder="e.g. Family time, outdoor activities, Islamic studies..."
                  className={textareaCls}
                />
              </Question>
              <Question label="Do you have a mixed gender social circle?">
                <PillGroup
                  options={['Yes', 'No', 'Professionally only', 'Working on changing this']}
                  value={mixedGenderSocialCircle}
                  onChange={v => { setMixedGenderSocialCircle(v) }}
                />
              </Question>
              <Question label="How often do you travel and would you expect your wife to travel with you?">
                <PillGroup
                  options={['Rarely', 'A few times a year', 'Monthly', 'Frequently — yes she would join', 'Frequently — independently']}
                  value={travelFrequency}
                  onChange={v => { setTravelFrequency(v) }}
                />
              </Question>
              <Question label="Do you follow a strict halal diet?">
                <PillGroup
                  options={['Yes — strictly', 'Mostly', 'No pork but not strict', 'Not strictly']}
                  value={strictHalalDiet}
                  onChange={v => { setStrictHalalDiet(v) }}
                />
              </Question>
              <Question label="Do you smoke or use tobacco products?">
                <PillGroup
                  options={['No', 'Yes', 'Occasionally', 'Trying to quit']}
                  value={smoking}
                  onChange={v => { setSmoking(v) }}
                />
              </Question>
            </div>
          </div>

          {/* Personality & Communication */}
          <div>
            <SectionHeader title="Personality & Communication" />
            <div className="space-y-6">
              <Question label="How do you handle conflict?">
                <PillGroup
                  options={['Need space first then talk', 'Prefer to resolve immediately', 'Depends on situation', 'Still working on this']}
                  value={conflictStyle}
                  onChange={v => { setConflictStyle(v) }}
                />
              </Question>
              <Question label="Are you more introverted or extroverted?">
                <PillGroup
                  options={['Very introverted', 'Mostly introverted', 'Mostly extroverted', 'Very extroverted', 'Ambivert']}
                  value={introvertExtrovert}
                  onChange={v => { setIntrovertExtrovert(v) }}
                />
              </Question>
              <Question label="How do you express love and affection?" note="Choose up to 3">
                <MultiPillGroup
                  options={['Words of affirmation', 'Quality time', 'Acts of service', 'Gift giving', 'Physical affection', 'All of the above']}
                  values={loveLanguage}
                  onChange={v => { setLoveLanguage(v) }}
                  max={3}
                />
              </Question>
              <Question label="How important is alone time to you?">
                <PillGroup
                  options={['Very important — I need regular alone time', 'Somewhat important', 'Not very important', 'I prefer company']}
                  value={aloneTimeImportance}
                  onChange={v => { setAloneTimeImportance(v) }}
                />
              </Question>
              <Question
                label="Is there anything about your health or background a potential spouse should know?"
                note="Optional but encouraged for transparency. This information is private and only shared with matches."
              >
                <textarea
                  value={healthBackgroundDisclosure}
                  onChange={e => { setHealthBackgroundDisclosure(e.target.value) }}
                  rows={3}
                  placeholder="This is optional but encouraged for transparency. This information is private and only shared with matches."
                  className={textareaCls}
                />
              </Question>
            </div>
          </div>

          {error && (
            <div className="border border-[#C13515]/20 bg-[#FDECEA] text-[#C13515] text-sm rounded-[10px] px-4 py-3">{error}</div>
          )}
        </form>

        {/* Fixed bottom submit */}
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#EDE8E3] px-4 py-4 z-20">
          <div className="max-w-[480px] mx-auto">
            <button
              type="submit"
              form="brother-additional-form"
              disabled={loading}
              className="w-full py-3.5 bg-[#AF4D98] text-white font-medium rounded-full text-[15px] hover:bg-[#9B3D85] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {loading ? 'Saving...' : 'Next →'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
