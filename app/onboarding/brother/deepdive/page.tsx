'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Slider from '@/components/ui/Slider'
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

function PillGroup({ options, value, onChange }: { options: string[]; value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map(opt => (
        <Pill key={opt} label={opt} selected={value === opt} onClick={() => onChange(opt)} />
      ))}
    </div>
  )
}

export default function BrotherDeepdive() {
  const router = useRouter()
  const formRef = useRef<HTMLFormElement>(null)
  const [userId,      setUserId]      = useState('')
  const [dataLoading, setDataLoading] = useState(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Section 1: Faith & Deen
  const [deenGrowth, setDeenGrowth] = useState('')
  const [wifeNiqabPreference, setWifeNiqabPreference] = useState('')
  const [quranListening, setQuranListening] = useState('')
  const [missedPrayerApproach, setMissedPrayerApproach] = useState('')
  const [traditionalVsReformist, setTraditionalVsReformist] = useState(50)
  const [spouseIslamicKnowledge, setSpouseIslamicKnowledge] = useState('')
  const [zakahSadaqah, setZakahSadaqah] = useState('')
  const [mawlidView, setMawlidView] = useState('')
  const [madhabhConsistency, setMadhabConsistency] = useState('')
  const [quranMemorisation, setQuranMemorisation] = useState('')

  // Section 2: Family Dynamics
  const [parentRelationship, setParentRelationship] = useState('')
  const [wifeFamilyInteraction, setWifeFamilyInteraction] = useState('')
  const [eldestResponsibilities, setEldestResponsibilities] = useState('')
  const [familyConflictStyle, setFamilyConflictStyle] = useState('')
  const [childCaregiving, setChildCaregiving] = useState('')
  const [wifeFamilyRelationship, setWifeFamilyRelationship] = useState('')
  const [livingNearParents, setLivingNearParents] = useState('')
  const [familySpouseDisagreement, setFamilySpouseDisagreement] = useState('')

  // Section 3: Mental & Emotional Health
  const [stressManagement, setStressManagement] = useState('')
  const [therapyExperience, setTherapyExperience] = useState('')
  const [couplesTherapyView, setCouplesTherapyView] = useState('')
  const [mentalHealthChallenges, setMentalHealthChallenges] = useState('')
  const [emotionalSupportStyle, setEmotionalSupportStyle] = useState('')
  const [emotionalAvailability, setEmotionalAvailability] = useState(50)
  const [significantHardship, setSignificantHardship] = useState('')
  const [emotionalExpressionView, setEmotionalExpressionView] = useState('')

  // Section 4: Conflict & Communication
  const [healthyArgumentView, setHealthyArgumentView] = useState('')
  const [friendshipEnded, setFriendshipEnded] = useState('')
  const [apologySpeed, setApologySpeed] = useState('')
  const [husbandFinalSay, setHusbandFinalSay] = useState('')
  const [communicationWhenUpset, setCommunicationWhenUpset] = useState('')
  const [wifeOpinionImportance, setWifeOpinionImportance] = useState('')

  // Section 5: Financial
  const [savingsPlan, setSavingsPlan] = useState('')
  const [financialPlanningApproach, setFinancialPlanningApproach] = useState('')
  const [wifeFinancialIndependence, setWifeFinancialIndependence] = useState('')
  const [hajjStatus, setHajjStatus] = useState('')
  const [financialStressApproach, setFinancialStressApproach] = useState('')
  const [wifeEarningMore, setWifeEarningMore] = useState('')

  // Section 6: Lifestyle & Values
  const [politicalViews, setPoliticalViews] = useState('')
  const [culturalBackgroundImportance, setCulturalBackgroundImportance] = useState(50)
  const [exerciseFrequency, setExerciseFrequency] = useState('')
  const [socialMediaView, setSocialMediaView] = useState('')
  const [homeOrganisation, setHomeOrganisation] = useState(50)
  const [petsView, setPetsView] = useState('')
  const [healthyEatingImportance, setHealthyEatingImportance] = useState('')
  const [ramadanRoutine, setRamadanRoutine] = useState('')

  // Section 7: Marriage Vision
  const [marriageVision10Years, setMarriageVision10Years] = useState('')
  const [firstYearVision, setFirstYearVision] = useState('')
  const [physicalIntimacyImportance, setPhysicalIntimacyImportance] = useState('')
  const [spouseFriendshipsView, setSpouseFriendshipsView] = useState('')
  const [romanceView, setRomanceView] = useState('')
  const [polygamyOwnMarriage, setPolygamyOwnMarriage] = useState('')
  const [marriageFear, setMarriageFear] = useState('')
  const [uniqueContribution, setUniqueContribution] = useState('')

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.replace('/auth/login'); return }
      setUserId(user.id)
      const { data } = await supabase
        .from('brother_profiles')
        .select('deen_growth, wife_niqab_preference, quran_listening, missed_prayer_approach, traditional_vs_reformist, spouse_islamic_knowledge, zakah_sadaqah, mawlid_view, madhab_consistency, quran_memorisation, parent_relationship, wife_family_interaction, eldest_responsibilities, family_conflict_style, child_caregiving, wife_family_relationship, living_near_parents, family_spouse_disagreement, stress_management, therapy_experience, couples_therapy_view, mental_health_challenges, emotional_support_style, emotional_availability, significant_hardship, emotional_expression_view, healthy_argument_view, friendship_ended, apology_speed, husband_final_say, communication_when_upset, wife_opinion_importance, savings_plan, financial_planning_approach, wife_financial_independence, hajj_status, financial_stress_approach, wife_earning_more, political_views, cultural_background_importance, exercise_frequency, social_media_view, home_organisation, pets_view, healthy_eating_importance, ramadan_routine, marriage_vision_10_years, first_year_vision, physical_intimacy_importance, spouse_friendships_view, romance_view, polygamy_own_marriage, marriage_fear, unique_contribution')
        .eq('id', user.id)
        .single()
      if (data) {
        if (data.deen_growth)                    setDeenGrowth(data.deen_growth)
        if (data.wife_niqab_preference)          setWifeNiqabPreference(data.wife_niqab_preference)
        if (data.quran_listening)                setQuranListening(data.quran_listening)
        if (data.missed_prayer_approach)         setMissedPrayerApproach(data.missed_prayer_approach)
        if (data.traditional_vs_reformist !== null && data.traditional_vs_reformist !== undefined) setTraditionalVsReformist(data.traditional_vs_reformist)
        if (data.spouse_islamic_knowledge)       setSpouseIslamicKnowledge(data.spouse_islamic_knowledge)
        if (data.zakah_sadaqah)                  setZakahSadaqah(data.zakah_sadaqah)
        if (data.mawlid_view)                    setMawlidView(data.mawlid_view)
        if (data.madhab_consistency)             setMadhabConsistency(data.madhab_consistency)
        if (data.quran_memorisation)             setQuranMemorisation(data.quran_memorisation)
        if (data.parent_relationship)            setParentRelationship(data.parent_relationship)
        if (data.wife_family_interaction)        setWifeFamilyInteraction(data.wife_family_interaction)
        if (data.eldest_responsibilities)        setEldestResponsibilities(data.eldest_responsibilities)
        if (data.family_conflict_style)          setFamilyConflictStyle(data.family_conflict_style)
        if (data.child_caregiving)               setChildCaregiving(data.child_caregiving)
        if (data.wife_family_relationship)       setWifeFamilyRelationship(data.wife_family_relationship)
        if (data.living_near_parents)            setLivingNearParents(data.living_near_parents)
        if (data.family_spouse_disagreement)     setFamilySpouseDisagreement(data.family_spouse_disagreement)
        if (data.stress_management)              setStressManagement(data.stress_management)
        if (data.therapy_experience)             setTherapyExperience(data.therapy_experience)
        if (data.couples_therapy_view)           setCouplesTherapyView(data.couples_therapy_view)
        if (data.mental_health_challenges)       setMentalHealthChallenges(data.mental_health_challenges)
        if (data.emotional_support_style)        setEmotionalSupportStyle(data.emotional_support_style)
        if (data.emotional_availability !== null && data.emotional_availability !== undefined) setEmotionalAvailability(data.emotional_availability)
        if (data.significant_hardship)           setSignificantHardship(data.significant_hardship)
        if (data.emotional_expression_view)      setEmotionalExpressionView(data.emotional_expression_view)
        if (data.healthy_argument_view)          setHealthyArgumentView(data.healthy_argument_view)
        if (data.friendship_ended)               setFriendshipEnded(data.friendship_ended)
        if (data.apology_speed)                  setApologySpeed(data.apology_speed)
        if (data.husband_final_say)              setHusbandFinalSay(data.husband_final_say)
        if (data.communication_when_upset)       setCommunicationWhenUpset(data.communication_when_upset)
        if (data.wife_opinion_importance)        setWifeOpinionImportance(data.wife_opinion_importance)
        if (data.savings_plan)                   setSavingsPlan(data.savings_plan)
        if (data.financial_planning_approach)    setFinancialPlanningApproach(data.financial_planning_approach)
        if (data.wife_financial_independence)    setWifeFinancialIndependence(data.wife_financial_independence)
        if (data.hajj_status)                    setHajjStatus(data.hajj_status)
        if (data.financial_stress_approach)      setFinancialStressApproach(data.financial_stress_approach)
        if (data.wife_earning_more)              setWifeEarningMore(data.wife_earning_more)
        if (data.political_views)                setPoliticalViews(data.political_views)
        if (data.cultural_background_importance !== null && data.cultural_background_importance !== undefined) setCulturalBackgroundImportance(data.cultural_background_importance)
        if (data.exercise_frequency)             setExerciseFrequency(data.exercise_frequency)
        if (data.social_media_view)              setSocialMediaView(data.social_media_view)
        if (data.home_organisation !== null && data.home_organisation !== undefined) setHomeOrganisation(data.home_organisation)
        if (data.pets_view)                      setPetsView(data.pets_view)
        if (data.healthy_eating_importance)      setHealthyEatingImportance(data.healthy_eating_importance)
        if (data.ramadan_routine)                setRamadanRoutine(data.ramadan_routine)
        if (data.marriage_vision_10_years)       setMarriageVision10Years(data.marriage_vision_10_years)
        if (data.first_year_vision)              setFirstYearVision(data.first_year_vision)
        if (data.physical_intimacy_importance)   setPhysicalIntimacyImportance(data.physical_intimacy_importance)
        if (data.spouse_friendships_view)        setSpouseFriendshipsView(data.spouse_friendships_view)
        if (data.romance_view)                   setRomanceView(data.romance_view)
        if (data.polygamy_own_marriage)          setPolygamyOwnMarriage(data.polygamy_own_marriage)
        if (data.marriage_fear)                  setMarriageFear(data.marriage_fear)
        if (data.unique_contribution)            setUniqueContribution(data.unique_contribution)
      }
      setDataLoading(false)
    }
    load()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    // Validate required pills
    const requiredPills: [string, string][] = [
      [wifeNiqabPreference,          'Wife niqab preference'],
      [quranListening,               'Quran listening'],
      [missedPrayerApproach,         'Missed prayer approach'],
      [spouseIslamicKnowledge,       'Spouse Islamic knowledge'],
      [zakahSadaqah,                 'Zakah & sadaqah'],
      [mawlidView,                   'Mawlid view'],
      [madhabhConsistency,           'Madhab consistency'],
      [quranMemorisation,            'Quran memorisation'],
      [wifeFamilyInteraction,        'Wife family interaction'],
      [eldestResponsibilities,       'Eldest responsibilities'],
      [familyConflictStyle,          'Family conflict style'],
      [childCaregiving,              'Child caregiving'],
      [wifeFamilyRelationship,       'Wife family relationship'],
      [livingNearParents,            'Living near parents'],
      [therapyExperience,            'Therapy experience'],
      [couplesTherapyView,           'Couples therapy view'],
      [mentalHealthChallenges,       'Mental health challenges'],
      [emotionalExpressionView,      'Emotional expression view'],
      [friendshipEnded,              'Friendship ended'],
      [apologySpeed,                 'Apology speed'],
      [husbandFinalSay,              'Husband final say'],
      [communicationWhenUpset,       'Communication when upset'],
      [wifeOpinionImportance,        'Wife opinion importance'],
      [savingsPlan,                  'Savings plan'],
      [financialPlanningApproach,    'Financial planning approach'],
      [wifeFinancialIndependence,    'Wife financial independence'],
      [hajjStatus,                   'Hajj status'],
      [wifeEarningMore,              'Wife earning more'],
      [politicalViews,               'Political views'],
      [exerciseFrequency,            'Exercise frequency'],
      [socialMediaView,              'Social media view'],
      [petsView,                     'Pets view'],
      [healthyEatingImportance,      'Healthy eating importance'],
      [physicalIntimacyImportance,   'Physical intimacy importance'],
      [spouseFriendshipsView,        'Spouse friendships view'],
      [polygamyOwnMarriage,          'Polygamy in own marriage'],
    ]
    for (const [val, label] of requiredPills) {
      if (!val) { setError(`Please answer: ${label}`); return }
    }
    // Validate required textareas
    if (!deenGrowth.trim())               { setError('Please answer: How do you actively grow in your deen?'); return }
    if (!parentRelationship.trim())       { setError('Please answer: Describe your relationship with your parents'); return }
    if (!familySpouseDisagreement.trim()) { setError('Please answer: Family vs spouse disagreement'); return }
    if (!stressManagement.trim())         { setError('Please answer: How do you manage stress?'); return }
    if (!emotionalSupportStyle.trim())    { setError('Please answer: Emotional support style'); return }
    if (!healthyArgumentView.trim())      { setError('Please answer: What does a healthy argument look like?'); return }
    if (!financialStressApproach.trim())  { setError('Please answer: Financial stress approach'); return }
    if (!ramadanRoutine.trim())           { setError('Please answer: Ramadan routine'); return }
    if (!marriageVision10Years.trim())    { setError('Please answer: Marriage vision in 10 years'); return }
    if (!firstYearVision.trim())          { setError('Please answer: First year vision'); return }
    if (!romanceView.trim())              { setError('Please answer: Romance view'); return }
    if (!marriageFear.trim())             { setError('Please answer: Marriage fear'); return }
    if (!uniqueContribution.trim())       { setError('Please answer: Unique contribution'); return }

    setLoading(true)
    const supabase = createClient()
    const { error: saveErr } = await supabase
      .from('brother_profiles')
      .upsert({
        id:                              userId,
        deen_growth:                     deenGrowth.trim(),
        wife_niqab_preference:           wifeNiqabPreference,
        quran_listening:                 quranListening,
        missed_prayer_approach:          missedPrayerApproach,
        traditional_vs_reformist:        traditionalVsReformist,
        spouse_islamic_knowledge:        spouseIslamicKnowledge,
        zakah_sadaqah:                   zakahSadaqah,
        mawlid_view:                     mawlidView,
        madhab_consistency:              madhabhConsistency,
        quran_memorisation:              quranMemorisation,
        parent_relationship:             parentRelationship.trim(),
        wife_family_interaction:         wifeFamilyInteraction,
        eldest_responsibilities:         eldestResponsibilities,
        family_conflict_style:           familyConflictStyle,
        child_caregiving:                childCaregiving,
        wife_family_relationship:        wifeFamilyRelationship,
        living_near_parents:             livingNearParents,
        family_spouse_disagreement:      familySpouseDisagreement.trim(),
        stress_management:               stressManagement.trim(),
        therapy_experience:              therapyExperience,
        couples_therapy_view:            couplesTherapyView,
        mental_health_challenges:        mentalHealthChallenges,
        emotional_support_style:         emotionalSupportStyle.trim(),
        emotional_availability:          emotionalAvailability,
        significant_hardship:            significantHardship.trim() || null,
        emotional_expression_view:       emotionalExpressionView,
        healthy_argument_view:           healthyArgumentView.trim(),
        friendship_ended:                friendshipEnded,
        apology_speed:                   apologySpeed,
        husband_final_say:               husbandFinalSay,
        communication_when_upset:        communicationWhenUpset,
        wife_opinion_importance:         wifeOpinionImportance,
        savings_plan:                    savingsPlan,
        financial_planning_approach:     financialPlanningApproach,
        wife_financial_independence:     wifeFinancialIndependence,
        hajj_status:                     hajjStatus,
        financial_stress_approach:       financialStressApproach.trim(),
        wife_earning_more:               wifeEarningMore,
        political_views:                 politicalViews,
        cultural_background_importance:  culturalBackgroundImportance,
        exercise_frequency:              exerciseFrequency,
        social_media_view:               socialMediaView,
        home_organisation:               homeOrganisation,
        pets_view:                       petsView,
        healthy_eating_importance:       healthyEatingImportance,
        ramadan_routine:                 ramadanRoutine.trim(),
        marriage_vision_10_years:        marriageVision10Years.trim(),
        first_year_vision:               firstYearVision.trim(),
        physical_intimacy_importance:    physicalIntimacyImportance,
        spouse_friendships_view:         spouseFriendshipsView,
        romance_view:                    romanceView.trim(),
        polygamy_own_marriage:           polygamyOwnMarriage,
        marriage_fear:                   marriageFear.trim(),
        unique_contribution:             uniqueContribution.trim(),
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
      const { data: currentProfile } = await supabase
        .from('profiles')
        .select('status, profile_complete')
        .eq('id', userId)
        .single()
      await supabase
        .from('profiles')
        .update({
          profile_completion_percentage: percentage,
          profile_complete: currentProfile?.profile_complete || isComplete,
          status: currentProfile?.status === 'active' ? 'active' : (isComplete ? 'active' : 'pending_verification'),
        })
        .eq('id', userId)
    }
    router.push('/onboarding/brother/photo')
  }

  if (dataLoading) return (
    <div className="min-h-screen bg-[#FDF8F3] flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-[#AF4D98] border-t-transparent rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="min-h-screen bg-[#FDF8F3]">
      <div className="max-w-[480px] mx-auto px-5 py-8 pb-28">
        <h2 className="text-2xl font-medium text-[#1A1A1A] tracking-[-0.02em] mb-1">Going deeper</h2>
        <p className="text-[15px] text-[#9B9B9B] mb-2">These questions help us understand who you really are</p>
        <p className="text-xs text-[#9B9B9B] mb-8">Your answers are saved when you click Next.</p>

        <form id="brother-deepdive-form" ref={formRef} onSubmit={handleSubmit} className="space-y-8">

          {/* Section 1: Faith & Deen */}
          <div>
            <SectionHeader title="Faith & Deen" />
            <div className="space-y-6">
              <Question label="How do you actively grow in your deen?">
                <textarea
                  value={deenGrowth}
                  onChange={e => { setDeenGrowth(e.target.value) }}
                  rows={3}
                  placeholder="e.g. I attend weekly halaqas, read tafsir regularly..."
                  className={textareaCls}
                />
              </Question>
              <Question label="Do you have a preference for whether your wife wears niqab?">
                <PillGroup
                  options={['Required', 'Strongly preferred', 'Her choice entirely', 'Not important']}
                  value={wifeNiqabPreference}
                  onChange={v => { setWifeNiqabPreference(v) }}
                />
              </Question>
              <Question label="How often do you listen to Quran?">
                <PillGroup
                  options={['Daily', 'Weekly', 'Occasionally', 'Rarely']}
                  value={quranListening}
                  onChange={v => { setQuranListening(v) }}
                />
              </Question>
              <Question label="How do you approach a missed prayer?">
                <PillGroup
                  options={['Make it up immediately', 'Try my best', 'I struggle with this', 'Working on it']}
                  value={missedPrayerApproach}
                  onChange={v => { setMissedPrayerApproach(v) }}
                />
              </Question>
              <Question label="Where do you sit on the traditional to reformist spectrum?">
                <Slider
                  value={traditionalVsReformist}
                  onChange={v => { setTraditionalVsReformist(v) }}
                  leftLabel="Traditional"
                  rightLabel="Reformist"
                  centerLabel="Balanced"
                />
              </Question>
              <Question label="How important is your spouse's Islamic knowledge to you?">
                <PillGroup
                  options={['Essential', 'Very important', 'Somewhat important', 'Not a priority']}
                  value={spouseIslamicKnowledge}
                  onChange={v => { setSpouseIslamicKnowledge(v) }}
                />
              </Question>
              <Question label="Do you give zakah and sadaqah regularly?">
                <PillGroup
                  options={['Yes — regularly', 'Yes — occasionally', 'Not yet but intend to', 'No']}
                  value={zakahSadaqah}
                  onChange={v => { setZakahSadaqah(v) }}
                />
              </Question>
              <Question label="What is your view on celebrating Mawlid an-Nabi?">
                <PillGroup
                  options={['I celebrate it', "I don't but respect those who do", 'I disagree with it', 'No strong opinion']}
                  value={mawlidView}
                  onChange={v => { setMawlidView(v) }}
                />
              </Question>
              <Question label="How important is following a consistent madhab to you?">
                <PillGroup
                  options={['Very important', 'Somewhat important', 'Not important', 'Open to discussion']}
                  value={madhabhConsistency}
                  onChange={v => { setMadhabConsistency(v) }}
                />
              </Question>
              <Question label="How much of the Quran have you memorised?">
                <PillGroup
                  options={['Full hafiz', '10+ juz', '5-10 juz', '1-5 juz', 'Some surahs', 'Working on it']}
                  value={quranMemorisation}
                  onChange={v => { setQuranMemorisation(v) }}
                />
              </Question>
            </div>
          </div>

          {/* Section 2: Family Dynamics */}
          <div>
            <SectionHeader title="Family Dynamics" />
            <div className="space-y-6">
              <Question label="Describe your relationship with your parents">
                <textarea
                  value={parentRelationship}
                  onChange={e => { setParentRelationship(e.target.value) }}
                  rows={3}
                  placeholder="e.g. I have a close relationship with both parents..."
                  className={textareaCls}
                />
              </Question>
              <Question label="How involved do you expect your wife to be with your family?">
                <PillGroup
                  options={['Very involved — close relationship', 'Respectful but independent', 'Minimal involvement', 'Flexible']}
                  value={wifeFamilyInteraction}
                  onChange={v => { setWifeFamilyInteraction(v) }}
                />
              </Question>
              <Question label="As the eldest or only son, do you carry significant family responsibilities?">
                <PillGroup
                  options={['Yes — significant responsibilities', 'Yes — some', 'No', 'Not applicable']}
                  value={eldestResponsibilities}
                  onChange={v => { setEldestResponsibilities(v) }}
                />
              </Question>
              <Question label="How does conflict typically play out in your family?">
                <PillGroup
                  options={['Openly discussed', 'Avoided', 'Sometimes heated', 'Calmly resolved']}
                  value={familyConflictStyle}
                  onChange={v => { setFamilyConflictStyle(v) }}
                />
              </Question>
              <Question label="Who do you see as primary caregiver for young children?">
                <PillGroup
                  options={['Wife primarily', 'Shared equally', 'Extended family involved', 'Open to discussion']}
                  value={childCaregiving}
                  onChange={v => { setChildCaregiving(v) }}
                />
              </Question>
              <Question label="How do you view your wife maintaining a close relationship with her own family?">
                <PillGroup
                  options={['Very supportive', 'Supportive within reason', 'Prefer she prioritises our home', 'Depends']}
                  value={wifeFamilyRelationship}
                  onChange={v => { setWifeFamilyRelationship(v) }}
                />
              </Question>
              <Question label="Do you plan to live near your parents?">
                <PillGroup
                  options={['Yes — that is my plan', 'Possibly', 'No', 'Open to discussion']}
                  value={livingNearParents}
                  onChange={v => { setLivingNearParents(v) }}
                />
              </Question>
              <Question label="How would you handle a conflict between your family and your spouse?">
                <textarea
                  value={familySpouseDisagreement}
                  onChange={e => { setFamilySpouseDisagreement(e.target.value) }}
                  rows={3}
                  placeholder="e.g. I would listen to both sides and try to find a fair resolution..."
                  className={textareaCls}
                />
              </Question>
            </div>
          </div>

          {/* Section 3: Mental & Emotional Health */}
          <div>
            <SectionHeader title="Mental & Emotional Health" />
            <div className="space-y-6">
              <Question label="How do you manage stress?">
                <textarea
                  value={stressManagement}
                  onChange={e => { setStressManagement(e.target.value) }}
                  rows={3}
                  placeholder="e.g. Exercise, prayer, talking to a trusted friend..."
                  className={textareaCls}
                />
              </Question>
              <Question label="Have you ever been to therapy or counselling?">
                <PillGroup
                  options={['Yes — currently', 'Yes — in the past', 'No but open to it', 'No and not interested']}
                  value={therapyExperience}
                  onChange={v => { setTherapyExperience(v) }}
                />
              </Question>
              <Question label="How do you feel about couples therapy?">
                <PillGroup
                  options={['Very open — proactive', 'Open if needed', 'Hesitant', 'Not interested']}
                  value={couplesTherapyView}
                  onChange={v => { setCouplesTherapyView(v) }}
                />
              </Question>
              <Question label="Do you have any mental health challenges?">
                <PillGroup
                  options={['Yes — being managed', 'Yes — working on it', 'Occasionally', 'No']}
                  value={mentalHealthChallenges}
                  onChange={v => { setMentalHealthChallenges(v) }}
                />
              </Question>
              <Question label="How do you show up emotionally for those you love?">
                <textarea
                  value={emotionalSupportStyle}
                  onChange={e => { setEmotionalSupportStyle(e.target.value) }}
                  rows={3}
                  placeholder="e.g. I try to listen actively and be present..."
                  className={textareaCls}
                />
              </Question>
              <Question label="How emotionally available are you in relationships?">
                <Slider
                  value={emotionalAvailability}
                  onChange={v => { setEmotionalAvailability(v) }}
                  leftLabel="Reserved"
                  rightLabel="Very open"
                  centerLabel="Balanced"
                />
              </Question>
              <Question
                label="Have you experienced any significant hardship that shaped you?"
                note="Optional — only share what you are comfortable sharing."
              >
                <textarea
                  value={significantHardship}
                  onChange={e => { setSignificantHardship(e.target.value) }}
                  rows={3}
                  placeholder="Optional..."
                  className={textareaCls}
                />
              </Question>
              <Question label="How comfortable are you expressing your emotions?">
                <PillGroup
                  options={['Very comfortable', 'Mostly comfortable', 'Working on it', 'Prefer to keep things private']}
                  value={emotionalExpressionView}
                  onChange={v => { setEmotionalExpressionView(v) }}
                />
              </Question>
            </div>
          </div>

          {/* Section 4: Conflict & Communication */}
          <div>
            <SectionHeader title="Conflict & Communication" />
            <div className="space-y-6">
              <Question label="What does a healthy argument look like to you?">
                <textarea
                  value={healthyArgumentView}
                  onChange={e => { setHealthyArgumentView(e.target.value) }}
                  rows={3}
                  placeholder="e.g. Both people feel heard, no name-calling, resolution focused..."
                  className={textareaCls}
                />
              </Question>
              <Question label="Have you ever ended a friendship due to a serious falling out?">
                <PillGroup
                  options={['Yes', 'No', 'Once or twice', 'Prefer not to say']}
                  value={friendshipEnded}
                  onChange={v => { setFriendshipEnded(v) }}
                />
              </Question>
              <Question label="How quickly do you typically apologise after a disagreement?">
                <PillGroup
                  options={['Immediately', 'Within hours', 'Within a day', 'Takes me time']}
                  value={apologySpeed}
                  onChange={v => { setApologySpeed(v) }}
                />
              </Question>
              <Question label="Do you believe the husband should have the final say?">
                <PillGroup
                  options={['Yes always', 'Yes in major decisions', 'Depends on situation', 'Decisions are mutual']}
                  value={husbandFinalSay}
                  onChange={v => { setHusbandFinalSay(v) }}
                />
              </Question>
              <Question label="How do you communicate when you are upset?">
                <PillGroup
                  options={['Talk it out immediately', 'Need space first', 'Go quiet', 'Struggle to communicate when upset']}
                  value={communicationWhenUpset}
                  onChange={v => { setCommunicationWhenUpset(v) }}
                />
              </Question>
              <Question label="How important is your wife's opinion in your decision-making?">
                <PillGroup
                  options={['Essential', 'Very important', 'Somewhat important', 'I prefer a traditional dynamic']}
                  value={wifeOpinionImportance}
                  onChange={v => { setWifeOpinionImportance(v) }}
                />
              </Question>
            </div>
          </div>

          {/* Section 5: Financial */}
          <div>
            <SectionHeader title="Financial" />
            <div className="space-y-6">
              <Question label="Do you have a savings plan?">
                <PillGroup
                  options={['Yes — clear plan', 'Yes — general goals', 'Working on it', 'Not yet']}
                  value={savingsPlan}
                  onChange={v => { setSavingsPlan(v) }}
                />
              </Question>
              <Question label="What is your approach to financial planning as a couple?">
                <PillGroup
                  options={['Joint accounts', 'Separate accounts', 'Mixed approach', 'Open to discussion']}
                  value={financialPlanningApproach}
                  onChange={v => { setFinancialPlanningApproach(v) }}
                />
              </Question>
              <Question label="How do you feel about your wife having financial independence?">
                <PillGroup
                  options={['Very supportive', 'Supportive', 'Neutral', 'Prefer she relies on me']}
                  value={wifeFinancialIndependence}
                  onChange={v => { setWifeFinancialIndependence(v) }}
                />
              </Question>
              <Question label="Have you completed Hajj?">
                <PillGroup
                  options={['Already completed', 'Planning soon', 'Intend to in the future', 'Not yet prioritised']}
                  value={hajjStatus}
                  onChange={v => { setHajjStatus(v) }}
                />
              </Question>
              <Question label="How do you handle financial stress?">
                <textarea
                  value={financialStressApproach}
                  onChange={e => { setFinancialStressApproach(e.target.value) }}
                  rows={3}
                  placeholder="e.g. I communicate openly, review our budget together..."
                  className={textareaCls}
                />
              </Question>
              <Question label="How would you feel if your wife earned more than you?">
                <PillGroup
                  options={['Yes completely', 'Yes with some adjustment', 'I would find it difficult', 'No']}
                  value={wifeEarningMore}
                  onChange={v => { setWifeEarningMore(v) }}
                />
              </Question>
            </div>
          </div>

          {/* Section 6: Lifestyle & Values */}
          <div>
            <SectionHeader title="Lifestyle & Values" />
            <div className="space-y-6">
              <Question label="How would you describe your political views?">
                <PillGroup
                  options={['Conservative', 'Moderate', 'Progressive', 'I avoid political labels', 'Prefer not to say']}
                  value={politicalViews}
                  onChange={v => { setPoliticalViews(v) }}
                />
              </Question>
              <Question label="How important is sharing the same cultural background?">
                <Slider
                  value={culturalBackgroundImportance}
                  onChange={v => { setCulturalBackgroundImportance(v) }}
                  leftLabel="Not important"
                  rightLabel="Very important"
                />
              </Question>
              <Question label="How often do you exercise?">
                <PillGroup
                  options={['Daily', 'A few times a week', 'Occasionally', 'Rarely']}
                  value={exerciseFrequency}
                  onChange={v => { setExerciseFrequency(v) }}
                />
              </Question>
              <Question label="What is your view on social media use in marriage?">
                <PillGroup
                  options={['Very open', 'Open within boundaries', 'Prefer limited use', 'Prefer no use']}
                  value={socialMediaView}
                  onChange={v => { setSocialMediaView(v) }}
                />
              </Question>
              <Question label="How organised do you like your home to be?">
                <Slider
                  value={homeOrganisation}
                  onChange={v => { setHomeOrganisation(v) }}
                  leftLabel="Very relaxed"
                  rightLabel="Very organised"
                />
              </Question>
              <Question label="What is your view on pets?">
                <PillGroup
                  options={['Have pets', 'Want pets', 'No pets', 'Open to discussion']}
                  value={petsView}
                  onChange={v => { setPetsView(v) }}
                />
              </Question>
              <Question label="How important is healthy eating to you?">
                <PillGroup
                  options={['Very — strict diet', 'Mostly healthy', 'Balanced', 'Not a priority']}
                  value={healthyEatingImportance}
                  onChange={v => { setHealthyEatingImportance(v) }}
                />
              </Question>
              <Question label="Describe your Ramadan routine">
                <textarea
                  value={ramadanRoutine}
                  onChange={e => { setRamadanRoutine(e.target.value) }}
                  rows={3}
                  placeholder="e.g. Tarawih every night, increased Quran, family iftars..."
                  className={textareaCls}
                />
              </Question>
            </div>
          </div>

          {/* Section 7: Marriage Vision */}
          <div>
            <SectionHeader title="Marriage Vision" />
            <div className="space-y-6">
              <Question label="What does your marriage look like in 10 years?">
                <textarea
                  value={marriageVision10Years}
                  onChange={e => { setMarriageVision10Years(e.target.value) }}
                  rows={3}
                  placeholder="e.g. A stable home, children who love Allah, mutual growth..."
                  className={textareaCls}
                />
              </Question>
              <Question label="What does your first year of marriage look like?">
                <textarea
                  value={firstYearVision}
                  onChange={e => { setFirstYearVision(e.target.value) }}
                  rows={3}
                  placeholder="e.g. Building routines together, travelling, establishing our home..."
                  className={textareaCls}
                />
              </Question>
              <Question label="How important is physical intimacy to you in a marriage?">
                <PillGroup
                  options={['Very important', 'Important', 'Somewhat important', 'Prefer not to say']}
                  value={physicalIntimacyImportance}
                  onChange={v => { setPhysicalIntimacyImportance(v) }}
                />
              </Question>
              <Question label="How do you feel about your spouse maintaining close friendships?">
                <PillGroup
                  options={['Very supportive', 'Supportive within reason', 'Prefer limited outside friendships', 'Depends']}
                  value={spouseFriendshipsView}
                  onChange={v => { setSpouseFriendshipsView(v) }}
                />
              </Question>
              <Question label="What does romance look like to you in a marriage?">
                <textarea
                  value={romanceView}
                  onChange={e => { setRomanceView(e.target.value) }}
                  rows={3}
                  placeholder="e.g. Small gestures, quality time, acts of service..."
                  className={textareaCls}
                />
              </Question>
              <Question label="What is your view on polygamy in your own marriage?">
                <PillGroup
                  options={['Open to it', 'Not for me but I respect it', 'Firmly against', 'Have not decided']}
                  value={polygamyOwnMarriage}
                  onChange={v => { setPolygamyOwnMarriage(v) }}
                />
              </Question>
              <Question label="What is your biggest fear about marriage?">
                <textarea
                  value={marriageFear}
                  onChange={e => { setMarriageFear(e.target.value) }}
                  rows={3}
                  placeholder="Be honest — this is private..."
                  className={textareaCls}
                />
              </Question>
              <Question label="What unique thing do you bring to a marriage?">
                <textarea
                  value={uniqueContribution}
                  onChange={e => { setUniqueContribution(e.target.value) }}
                  rows={3}
                  placeholder="e.g. My patience, my sense of humour, my commitment to growth..."
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
              form="brother-deepdive-form"
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
