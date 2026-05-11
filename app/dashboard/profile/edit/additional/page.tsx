'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'

// ─── Pill components ──────────────────────────────────────────────────────────

function Pill({ label, selected, onClick }: { label: string; selected: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-4 py-2 rounded-full text-sm font-medium border transition-all cursor-pointer ${
        selected
          ? 'bg-[#AF4D98] text-white border-[#AF4D98]'
          : 'bg-white text-[#1A1A1A] border-[#EBEBEB] hover:border-[#AF4D98]'
      }`}
    >
      {label}
    </button>
  )
}

function MultiPill({ label, selected, onClick, disabled }: { label: string; selected: boolean; onClick: () => void; disabled: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled && !selected}
      className={`px-4 py-2 rounded-full text-sm font-medium border transition-all cursor-pointer flex items-center gap-1.5 ${
        selected
          ? 'bg-[#AF4D98] text-white border-[#AF4D98]'
          : 'bg-white text-[#1A1A1A] border-[#EBEBEB] hover:border-[#AF4D98] disabled:opacity-40 disabled:cursor-not-allowed'
      }`}
    >
      {selected && (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-3.5 h-3.5">
          <path fillRule="evenodd" d="M12.416 3.376a.75.75 0 0 1 .208 1.04l-5 7.5a.75.75 0 0 1-1.154.114l-3-3a.75.75 0 0 1 1.06-1.06l2.353 2.353 4.493-6.74a.75.75 0 0 1 1.04-.207Z" clipRule="evenodd" />
        </svg>
      )}
      {label}
    </button>
  )
}

function SectionHeader({ title }: { title: string }) {
  return (
    <div className="border-b border-[#EBEBEB] pb-2 mb-1">
      <p className="text-sm font-semibold text-[#6B6B6B] uppercase tracking-wider">{title}</p>
    </div>
  )
}

function PillGroup({ label, options, value, onChange }: { label: string; options: string[]; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <label className="block text-sm font-medium text-[#1A1A1A] mb-2">{label}</label>
      <div className="flex flex-wrap gap-2">
        {options.map(opt => (
          <Pill key={opt} label={opt} selected={value === opt} onClick={() => onChange(value === opt ? '' : opt)} />
        ))}
      </div>
    </div>
  )
}

function MultiPillGroup({ label, options, value, onChange, max }: { label: string; options: string[]; value: string[]; onChange: (v: string[]) => void; max: number }) {
  function toggle(opt: string) {
    if (value.includes(opt)) {
      onChange(value.filter(v => v !== opt))
    } else if (value.length < max) {
      onChange([...value, opt])
    }
  }
  return (
    <div>
      <label className="block text-sm font-medium text-[#1A1A1A] mb-2">{label} <span className="text-[#9B9B9B] font-normal">(up to {max})</span></label>
      <div className="flex flex-wrap gap-2">
        {options.map(opt => (
          <MultiPill key={opt} label={opt} selected={value.includes(opt)} onClick={() => toggle(opt)} disabled={value.length >= max} />
        ))}
      </div>
    </div>
  )
}

function TextareaField({ label, value, onChange, placeholder, optional }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string; optional?: boolean }) {
  return (
    <div>
      <label className="block text-sm font-medium text-[#1A1A1A] mb-1">{label}{optional && <span className="text-[#9B9B9B] font-normal ml-1">(optional)</span>}</label>
      <textarea
        value={value}
        onChange={e => onChange(e.target.value)}
        rows={3}
        placeholder={placeholder}
        className="w-full px-4 py-3 rounded-xl border border-[#EBEBEB] focus:outline-none focus:ring-2 focus:ring-[#AF4D98] focus:border-transparent text-[#1A1A1A] text-sm bg-white resize-none"
      />
    </div>
  )
}

// ─── Option constants ─────────────────────────────────────────────────────────

const MUSIC_OPTS = ['Yes', 'No', 'Nasheeds only', 'Occasionally']
const HOLIDAYS_OPTS = ['Yes', 'No', 'Birthdays only', 'Rarely']
const INCOME_OPTS = ['Under $30k', '$30k–$60k', '$60k–$100k', '$100k–$150k', '$150k+', 'Prefer not to say']
const OWN_RENT_OPTS = ['Own', 'Rent', 'Living with family', 'Other']
const DEBT_OPTS = ['No', 'Yes — student loans', 'Yes — other', 'Prefer not to say']
const SUPPORTING_FAMILY_OPTS = ['Yes — significant', 'Yes — some', 'No', 'Occasionally']
const CHILDREN_WANTED_OPTS = ['1–2', '3–4', '5+', 'Open to whatever Allah wills', 'None']
const INLAWS_OPTS = ['Yes', 'Possibly', 'No', 'Depends on circumstances']
const ISLAMIC_SCHOOL_OPTS = ['Very important — required', 'Important', 'Somewhat important', 'Not a priority']
const MIXED_GENDER_OPTS = ['Yes', 'No', 'Professionally only', 'Working on changing this']
const HALAL_DIET_OPTS = ['Yes — strictly', 'Mostly', 'No pork but not strict', 'Not strictly']
const SMOKING_OPTS = ['No', 'Yes', 'Occasionally', 'Trying to quit']
const CONFLICT_OPTS = ['Need space first then talk', 'Prefer to resolve immediately', 'Depends on situation', 'Still working on this']
const INTROVERT_OPTS = ['Very introverted', 'Mostly introverted', 'Mostly extroverted', 'Very extroverted', 'Ambivert']
const LOVE_LANGUAGE_OPTS = ['Words of affirmation', 'Quality time', 'Acts of service', 'Gift giving', 'Physical affection', 'All of the above']
const ALONE_TIME_OPTS = ['Very important — I need regular alone time', 'Somewhat important', 'Not very important', 'I prefer company']

// Brother-specific
const JUMUAH_OPTS = ['Every week', 'Most weeks', 'When I can', 'Working on it']
const WIFE_HIJAB_OPTS = ['Required', 'Strongly preferred', 'Preferred', 'Not a requirement']
const WIFE_WORKING_OPTS = ['Yes fully', 'Yes with conditions', "Prefer she doesn't", 'No']
const HOUSEHOLD_MGMT_OPTS = ['My wife primarily', 'Shared equally', 'Flexible', 'We would decide together']
const TRAVEL_FREQ_OPTS = ['Rarely', 'A few times a year', 'Monthly', 'Frequently — yes she would join', 'Frequently — independently']

// Sister-specific
const HIJAB_OUTSIDE_OPTS = ['Always', 'Usually', 'Sometimes', 'No', 'Prefer not to say']
const ISLAMIC_CLASSES_OPTS = ['Regularly', 'Occasionally', 'Rarely', 'Not currently but interested', 'Online only']
const WORK_AFTER_MARRIAGE_OPTS = ['Yes — full time', 'Yes — part time', 'Depends on children', 'No', 'Undecided']
const FINANCIAL_INDEPENDENCE_OPTS = ['Very important', 'Somewhat important', 'Not a priority', 'I prefer to be supported']
const PRIMARY_CAREGIVER_OPTS = ['Yes fully', 'Yes with some support', 'I would need significant support', 'I prefer shared equally']
const TRAVEL_IMPORTANCE_OPTS = ['Very important — frequent travel', 'A few times a year', 'Occasionally', 'Not important']

// ─── Main component ───────────────────────────────────────────────────────────

export default function EditAdditionalPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [toast, setToast] = useState<'success' | 'error' | null>(null)

  const [userId, setUserId] = useState<string>('')
  const [gender, setGender] = useState<string>('')

  // ── Shared fields ──────────────────────────────────────────────────────────
  const [doYouListenToMusic, setDoYouListenToMusic] = useState('')
  const [celebrateNonIslamicHolidays, setCelebrateNonIslamicHolidays] = useState('')
  const [differingIslamicOpinions, setDifferingIslamicOpinions] = useState('')
  const [hasSignificantDebt, setHasSignificantDebt] = useState('')
  const [supportingFamilyFinancially, setSupportingFamilyFinancially] = useState('')
  const [numberOfChildrenWanted, setNumberOfChildrenWanted] = useState('')
  const [inlawsLivingTogether, setInlawsLivingTogether] = useState('')
  const [islamicSchoolingImportance, setIslamicSchoolingImportance] = useState('')
  const [weekendLifestyle, setWeekendLifestyle] = useState('')
  const [mixedGenderSocialCircle, setMixedGenderSocialCircle] = useState('')
  const [strictHalalDiet, setStrictHalalDiet] = useState('')
  const [smoking, setSmoking] = useState('')
  const [conflictStyle, setConflictStyle] = useState('')
  const [introvertExtrovert, setIntrovertExtrovert] = useState('')
  const [loveLanguage, setLoveLanguage] = useState<string[]>([])
  const [aloneTimeImportance, setAloneTimeImportance] = useState('')
  const [healthBackgroundDisclosure, setHealthBackgroundDisclosure] = useState('')

  // ── Brother-specific ───────────────────────────────────────────────────────
  const [wifeHijabImportance, setWifeHijabImportance] = useState('')
  const [jumuahAttendance, setJumuahAttendance] = useState('')
  const [annualIncomeRange, setAnnualIncomeRange] = useState('')
  const [ownOrRent, setOwnOrRent] = useState('')
  const [mahrApproach, setMahrApproach] = useState('')
  const [wifeWorkingOpenness, setWifeWorkingOpenness] = useState('')
  const [householdManagement, setHouseholdManagement] = useState('')
  const [travelFrequency, setTravelFrequency] = useState('')

  // ── Sister-specific ────────────────────────────────────────────────────────
  const [hijabOutsideHome, setHijabOutsideHome] = useState('')
  const [islamicClassesAttendance, setIslamicClassesAttendance] = useState('')
  const [planToWorkAfterMarriage, setPlanToWorkAfterMarriage] = useState('')
  const [financialIndependenceImportance, setFinancialIndependenceImportance] = useState('')
  const [careerAmbitions, setCareerAmbitions] = useState('')
  const [primaryCaregiverComfort, setPrimaryCaregiverComfort] = useState('')
  const [householdResponsibilitiesVision, setHouseholdResponsibilitiesVision] = useState('')
  const [travelImportance, setTravelImportance] = useState('')

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
        const { data } = await supabase.from('brother_profiles').select(
          'do_you_listen_to_music, celebrate_non_islamic_holidays, wife_hijab_importance, jumuah_attendance, differing_islamic_opinions, annual_income_range, own_or_rent, has_significant_debt, supporting_family_financially, mahr_approach, number_of_children_wanted, wife_working_openness, household_management, inlaws_living_together, islamic_schooling_importance, weekend_lifestyle, mixed_gender_social_circle, travel_frequency, strict_halal_diet, smoking, conflict_style, introvert_extrovert, love_language, alone_time_importance, health_background_disclosure'
        ).eq('id', user.id).single()
        if (data) {
          setDoYouListenToMusic(data.do_you_listen_to_music ?? '')
          setCelebrateNonIslamicHolidays(data.celebrate_non_islamic_holidays ?? '')
          setWifeHijabImportance(data.wife_hijab_importance ?? '')
          setJumuahAttendance(data.jumuah_attendance ?? '')
          setDifferingIslamicOpinions(data.differing_islamic_opinions ?? '')
          setAnnualIncomeRange(data.annual_income_range ?? '')
          setOwnOrRent(data.own_or_rent ?? '')
          setHasSignificantDebt(data.has_significant_debt ?? '')
          setSupportingFamilyFinancially(data.supporting_family_financially ?? '')
          setMahrApproach(data.mahr_approach ?? '')
          setNumberOfChildrenWanted(data.number_of_children_wanted ?? '')
          setWifeWorkingOpenness(data.wife_working_openness ?? '')
          setHouseholdManagement(data.household_management ?? '')
          setInlawsLivingTogether(data.inlaws_living_together ?? '')
          setIslamicSchoolingImportance(data.islamic_schooling_importance ?? '')
          setWeekendLifestyle(data.weekend_lifestyle ?? '')
          setMixedGenderSocialCircle(data.mixed_gender_social_circle ?? '')
          setTravelFrequency(data.travel_frequency ?? '')
          setStrictHalalDiet(data.strict_halal_diet ?? '')
          setSmoking(data.smoking ?? '')
          setConflictStyle(data.conflict_style ?? '')
          setIntrovertExtrovert(data.introvert_extrovert ?? '')
          setLoveLanguage(Array.isArray(data.love_language) ? data.love_language : [])
          setAloneTimeImportance(data.alone_time_importance ?? '')
          setHealthBackgroundDisclosure(data.health_background_disclosure ?? '')
        }
      } else {
        const { data } = await supabase.from('sister_profiles').select(
          'do_you_listen_to_music, celebrate_non_islamic_holidays, hijab_outside_home, islamic_classes_attendance, differing_islamic_opinions, plan_to_work_after_marriage, financial_independence_importance, has_significant_debt, supporting_family_financially, career_ambitions, number_of_children_wanted, primary_caregiver_comfort, household_responsibilities_vision, inlaws_living_together, islamic_schooling_importance, weekend_lifestyle, mixed_gender_social_circle, travel_importance, strict_halal_diet, smoking, conflict_style, introvert_extrovert, love_language, alone_time_importance, health_background_disclosure'
        ).eq('id', user.id).single()
        if (data) {
          setDoYouListenToMusic(data.do_you_listen_to_music ?? '')
          setCelebrateNonIslamicHolidays(data.celebrate_non_islamic_holidays ?? '')
          setHijabOutsideHome(data.hijab_outside_home ?? '')
          setIslamicClassesAttendance(data.islamic_classes_attendance ?? '')
          setDifferingIslamicOpinions(data.differing_islamic_opinions ?? '')
          setPlanToWorkAfterMarriage(data.plan_to_work_after_marriage ?? '')
          setFinancialIndependenceImportance(data.financial_independence_importance ?? '')
          setHasSignificantDebt(data.has_significant_debt ?? '')
          setSupportingFamilyFinancially(data.supporting_family_financially ?? '')
          setCareerAmbitions(data.career_ambitions ?? '')
          setNumberOfChildrenWanted(data.number_of_children_wanted ?? '')
          setPrimaryCaregiverComfort(data.primary_caregiver_comfort ?? '')
          setHouseholdResponsibilitiesVision(data.household_responsibilities_vision ?? '')
          setInlawsLivingTogether(data.inlaws_living_together ?? '')
          setIslamicSchoolingImportance(data.islamic_schooling_importance ?? '')
          setWeekendLifestyle(data.weekend_lifestyle ?? '')
          setMixedGenderSocialCircle(data.mixed_gender_social_circle ?? '')
          setTravelImportance(data.travel_importance ?? '')
          setStrictHalalDiet(data.strict_halal_diet ?? '')
          setSmoking(data.smoking ?? '')
          setConflictStyle(data.conflict_style ?? '')
          setIntrovertExtrovert(data.introvert_extrovert ?? '')
          setLoveLanguage(Array.isArray(data.love_language) ? data.love_language : [])
          setAloneTimeImportance(data.alone_time_importance ?? '')
          setHealthBackgroundDisclosure(data.health_background_disclosure ?? '')
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
      if (gender === 'brother') {
        const { error: updateError } = await supabase.from('brother_profiles').update({
          do_you_listen_to_music: doYouListenToMusic || null,
          celebrate_non_islamic_holidays: celebrateNonIslamicHolidays || null,
          wife_hijab_importance: wifeHijabImportance || null,
          jumuah_attendance: jumuahAttendance || null,
          differing_islamic_opinions: differingIslamicOpinions.trim() || null,
          annual_income_range: annualIncomeRange || null,
          own_or_rent: ownOrRent || null,
          has_significant_debt: hasSignificantDebt || null,
          supporting_family_financially: supportingFamilyFinancially || null,
          mahr_approach: mahrApproach.trim() || null,
          number_of_children_wanted: numberOfChildrenWanted || null,
          wife_working_openness: wifeWorkingOpenness || null,
          household_management: householdManagement || null,
          inlaws_living_together: inlawsLivingTogether || null,
          islamic_schooling_importance: islamicSchoolingImportance || null,
          weekend_lifestyle: weekendLifestyle.trim() || null,
          mixed_gender_social_circle: mixedGenderSocialCircle || null,
          travel_frequency: travelFrequency || null,
          strict_halal_diet: strictHalalDiet || null,
          smoking: smoking || null,
          conflict_style: conflictStyle || null,
          introvert_extrovert: introvertExtrovert || null,
          love_language: loveLanguage.length > 0 ? loveLanguage : null,
          alone_time_importance: aloneTimeImportance || null,
          health_background_disclosure: healthBackgroundDisclosure.trim() || null,
        }).eq('id', userId)
        if (updateError) throw updateError
      } else {
        const { error: updateError } = await supabase.from('sister_profiles').update({
          do_you_listen_to_music: doYouListenToMusic || null,
          celebrate_non_islamic_holidays: celebrateNonIslamicHolidays || null,
          hijab_outside_home: hijabOutsideHome || null,
          islamic_classes_attendance: islamicClassesAttendance || null,
          differing_islamic_opinions: differingIslamicOpinions.trim() || null,
          plan_to_work_after_marriage: planToWorkAfterMarriage || null,
          financial_independence_importance: financialIndependenceImportance || null,
          has_significant_debt: hasSignificantDebt || null,
          supporting_family_financially: supportingFamilyFinancially || null,
          career_ambitions: careerAmbitions.trim() || null,
          number_of_children_wanted: numberOfChildrenWanted || null,
          primary_caregiver_comfort: primaryCaregiverComfort || null,
          household_responsibilities_vision: householdResponsibilitiesVision.trim() || null,
          inlaws_living_together: inlawsLivingTogether || null,
          islamic_schooling_importance: islamicSchoolingImportance || null,
          weekend_lifestyle: weekendLifestyle.trim() || null,
          mixed_gender_social_circle: mixedGenderSocialCircle || null,
          travel_importance: travelImportance || null,
          strict_halal_diet: strictHalalDiet || null,
          smoking: smoking || null,
          conflict_style: conflictStyle || null,
          introvert_extrovert: introvertExtrovert || null,
          love_language: loveLanguage.length > 0 ? loveLanguage : null,
          alone_time_importance: aloneTimeImportance || null,
          health_background_disclosure: healthBackgroundDisclosure.trim() || null,
        }).eq('id', userId)
        if (updateError) throw updateError
      }
      setToast('success')
      setTimeout(() => router.push('/dashboard/profile'), 1200)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#AF4D98] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA] pb-32">
      <div className="max-w-lg mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-6">
          <Link href="/dashboard/profile" className="text-[#9B9B9B] hover:text-[#1A1A1A] transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
              <path fillRule="evenodd" d="M17 10a.75.75 0 01-.75.75H5.612l4.158 3.96a.75.75 0 11-1.04 1.08l-5.5-5.25a.75.75 0 010-1.08l5.5-5.25a.75.75 0 111.04 1.08L5.612 9.25H16.25A.75.75 0 0117 10z" clipRule="evenodd" />
            </svg>
          </Link>
          <h1 className="text-lg font-semibold text-[#1A1A1A]">Edit Additional Info</h1>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-100 text-red-600 text-sm rounded-xl px-4 py-3 mb-4">
            {error}
          </div>
        )}

        <form id="additional-form" onSubmit={handleSave} className="flex flex-col gap-6">

          {/* ── Section: Faith & Practice ──────────────────────────────────── */}
          <SectionHeader title="Faith & Practice" />

          <PillGroup label="Do you listen to music?" options={MUSIC_OPTS} value={doYouListenToMusic} onChange={setDoYouListenToMusic} />
          <PillGroup label="Do you celebrate non-Islamic holidays?" options={HOLIDAYS_OPTS} value={celebrateNonIslamicHolidays} onChange={setCelebrateNonIslamicHolidays} />

          {gender === 'brother' ? (
            <>
              <PillGroup label="Importance of wife wearing hijab" options={WIFE_HIJAB_OPTS} value={wifeHijabImportance} onChange={setWifeHijabImportance} />
              <PillGroup label="Jumuah attendance" options={JUMUAH_OPTS} value={jumuahAttendance} onChange={setJumuahAttendance} />
            </>
          ) : (
            <>
              <PillGroup label="Hijab outside home" options={HIJAB_OUTSIDE_OPTS} value={hijabOutsideHome} onChange={setHijabOutsideHome} />
              <PillGroup label="Islamic classes attendance" options={ISLAMIC_CLASSES_OPTS} value={islamicClassesAttendance} onChange={setIslamicClassesAttendance} />
            </>
          )}

          <TextareaField label="How do you handle differing Islamic opinions?" value={differingIslamicOpinions} onChange={setDifferingIslamicOpinions} placeholder="Share your thoughts..." optional />

          {/* ── Section: Financial & Practical / Career & Independence ────── */}
          {gender === 'brother' ? (
            <>
              <SectionHeader title="Financial & Practical" />
              <PillGroup label="Annual income range" options={INCOME_OPTS} value={annualIncomeRange} onChange={setAnnualIncomeRange} />
              <PillGroup label="Do you own or rent?" options={OWN_RENT_OPTS} value={ownOrRent} onChange={setOwnOrRent} />
              <PillGroup label="Do you have significant debt?" options={DEBT_OPTS} value={hasSignificantDebt} onChange={setHasSignificantDebt} />
              <PillGroup label="Supporting family financially?" options={SUPPORTING_FAMILY_OPTS} value={supportingFamilyFinancially} onChange={setSupportingFamilyFinancially} />
              <TextareaField label="Your approach to mahr" value={mahrApproach} onChange={setMahrApproach} placeholder="Share your thoughts on mahr..." optional />
            </>
          ) : (
            <>
              <SectionHeader title="Career & Independence" />
              <PillGroup label="Plan to work after marriage?" options={WORK_AFTER_MARRIAGE_OPTS} value={planToWorkAfterMarriage} onChange={setPlanToWorkAfterMarriage} />
              <PillGroup label="Importance of financial independence" options={FINANCIAL_INDEPENDENCE_OPTS} value={financialIndependenceImportance} onChange={setFinancialIndependenceImportance} />
              <PillGroup label="Do you have significant debt?" options={DEBT_OPTS} value={hasSignificantDebt} onChange={setHasSignificantDebt} />
              <PillGroup label="Supporting family financially?" options={SUPPORTING_FAMILY_OPTS} value={supportingFamilyFinancially} onChange={setSupportingFamilyFinancially} />
              <TextareaField label="Career ambitions" value={careerAmbitions} onChange={setCareerAmbitions} placeholder="Describe your career goals and ambitions..." optional />
            </>
          )}

          {/* ── Section: Family & Household ───────────────────────────────── */}
          <SectionHeader title="Family & Household" />

          <PillGroup label="Number of children wanted" options={CHILDREN_WANTED_OPTS} value={numberOfChildrenWanted} onChange={setNumberOfChildrenWanted} />

          {gender === 'brother' ? (
            <>
              <PillGroup label="Openness to wife working" options={WIFE_WORKING_OPTS} value={wifeWorkingOpenness} onChange={setWifeWorkingOpenness} />
              <PillGroup label="Household management" options={HOUSEHOLD_MGMT_OPTS} value={householdManagement} onChange={setHouseholdManagement} />
            </>
          ) : (
            <>
              <PillGroup label="Comfort as primary caregiver" options={PRIMARY_CAREGIVER_OPTS} value={primaryCaregiverComfort} onChange={setPrimaryCaregiverComfort} />
              <TextareaField label="Vision for household responsibilities" value={householdResponsibilitiesVision} onChange={setHouseholdResponsibilitiesVision} placeholder="How do you see household duties being shared?" optional />
            </>
          )}

          <PillGroup label="In-laws living together?" options={INLAWS_OPTS} value={inlawsLivingTogether} onChange={setInlawsLivingTogether} />
          <PillGroup label="Islamic schooling importance" options={ISLAMIC_SCHOOL_OPTS} value={islamicSchoolingImportance} onChange={setIslamicSchoolingImportance} />

          {/* ── Section: Lifestyle & Social ───────────────────────────────── */}
          <SectionHeader title="Lifestyle & Social" />

          <TextareaField label="Weekend lifestyle" value={weekendLifestyle} onChange={setWeekendLifestyle} placeholder="How do you typically spend your weekends?" optional />
          <PillGroup label="Mixed-gender social circle?" options={MIXED_GENDER_OPTS} value={mixedGenderSocialCircle} onChange={setMixedGenderSocialCircle} />

          {gender === 'brother' ? (
            <PillGroup label="Travel frequency" options={TRAVEL_FREQ_OPTS} value={travelFrequency} onChange={setTravelFrequency} />
          ) : (
            <PillGroup label="Importance of travel" options={TRAVEL_IMPORTANCE_OPTS} value={travelImportance} onChange={setTravelImportance} />
          )}

          <PillGroup label="Strict halal diet?" options={HALAL_DIET_OPTS} value={strictHalalDiet} onChange={setStrictHalalDiet} />
          <PillGroup label="Smoking?" options={SMOKING_OPTS} value={smoking} onChange={setSmoking} />

          {/* ── Section: Personality & Communication ─────────────────────── */}
          <SectionHeader title="Personality & Communication" />

          <PillGroup label="Conflict style" options={CONFLICT_OPTS} value={conflictStyle} onChange={setConflictStyle} />
          <PillGroup label="Introvert or extrovert?" options={INTROVERT_OPTS} value={introvertExtrovert} onChange={setIntrovertExtrovert} />
          <MultiPillGroup label="Love language" options={LOVE_LANGUAGE_OPTS} value={loveLanguage} onChange={setLoveLanguage} max={3} />
          <PillGroup label="Importance of alone time" options={ALONE_TIME_OPTS} value={aloneTimeImportance} onChange={setAloneTimeImportance} />
          <TextareaField label="Health background disclosure" value={healthBackgroundDisclosure} onChange={setHealthBackgroundDisclosure} placeholder="Anything relevant you'd like a potential spouse to know..." optional />

        </form>
      </div>

      {/* Fixed bottom bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#EBEBEB] px-4 py-4">
        <div className="max-w-lg mx-auto flex flex-col gap-2">
          <button
            type="submit"
            form="additional-form"
            disabled={saving}
            className="w-full bg-[#AF4D98] text-white font-semibold rounded-xl py-3 disabled:opacity-60 transition-opacity"
          >
            {saving ? 'Saving...' : 'Save changes'}
          </button>
          <Link href="/dashboard/profile" className="text-center text-sm text-[#9B9B9B] hover:text-[#1A1A1A] transition-colors py-1">
            Cancel
          </Link>
        </div>
      </div>

      {toast && (
        <div className={`fixed bottom-20 left-4 right-4 max-w-lg mx-auto rounded-xl px-4 py-3 shadow-md text-sm font-medium text-center ${toast === 'success' ? 'bg-[#AF4D98] text-white' : 'bg-red-600 text-white'}`}>
          {toast === 'success' ? 'Changes saved' : 'Something went wrong'}
        </div>
      )}
    </div>
  )
}
