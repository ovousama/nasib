'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Slider from '@/components/ui/Slider'

const KEY = 'naseeb_sister_deepdive'

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

function save(updates: Record<string, unknown>) {
  try {
    const s = JSON.parse(localStorage.getItem(KEY) || '{}')
    localStorage.setItem(KEY, JSON.stringify({ ...s, ...updates }))
  } catch {}
}

export default function SisterDeepdive() {
  const router = useRouter()
  const formRef = useRef<HTMLFormElement>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Section 1: Faith & Deen
  const [deenGrowth, setDeenGrowth] = useState('')
  const [quranListening, setQuranListening] = useState('')
  const [traditionalVsReformist, setTraditionalVsReformist] = useState(50)
  const [mawlidView, setMawlidView] = useState('')
  const [spouseIslamicKnowledge, setSpouseIslamicKnowledge] = useState('')
  const [zakahSadaqah, setZakahSadaqah] = useState('')
  const [madhabConsistency, setMadhabConsistency] = useState('')
  const [quranMemorisation, setQuranMemorisation] = useState('')
  const [deenWhenBusy, setDeenWhenBusy] = useState('')
  const [islamicHomeImportance, setIslamicHomeImportance] = useState('')

  // Section 2: Family Dynamics
  const [parentRelationship, setParentRelationship] = useState('')
  const [familyBalanceAfterMarriage, setFamilyBalanceAfterMarriage] = useState('')
  const [familyFinancialResponsibility, setFamilyFinancialResponsibility] = useState('')
  const [familyConflictStyle, setFamilyConflictStyle] = useState('')
  const [inlawsComfort, setInlawsComfort] = useState('')
  const [husbandFamilyRelationship, setHusbandFamilyRelationship] = useState('')
  const [familyTraditionalVsModern, setFamilyTraditionalVsModern] = useState(50)
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
  const [apologySpeed, setApologySpeed] = useState('')
  const [communicationWhenUpset, setCommunicationWhenUpset] = useState('')
  const [husbandOpinionImportance, setHusbandOpinionImportance] = useState('')
  const [receivingLoveLanguage, setReceivingLoveLanguage] = useState('')
  const [qawwamView, setQawwamView] = useState('')

  // Section 5: Career
  const [careerFiveYears, setCareerFiveYears] = useState('')
  const [careerIdentityImportance, setCareerIdentityImportance] = useState(50)
  const [careerPauseForChildren, setCareerPauseForChildren] = useState('')
  const [financialDependenceView, setFinancialDependenceView] = useState('')
  const [savingsPlan, setSavingsPlan] = useState('')
  const [financialStressApproach, setFinancialStressApproach] = useState('')

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
  const [marriageFear, setMarriageFear] = useState('')
  const [uniqueContribution, setUniqueContribution] = useState('')
  const [idealHusbandDescription, setIdealHusbandDescription] = useState('')

  useEffect(() => {
    try {
      const s = JSON.parse(localStorage.getItem(KEY) || '{}')
      if (s.deen_growth)                      setDeenGrowth(s.deen_growth)
      if (s.quran_listening)                  setQuranListening(s.quran_listening)
      if (s.traditional_vs_reformist !== undefined) setTraditionalVsReformist(s.traditional_vs_reformist)
      if (s.mawlid_view)                      setMawlidView(s.mawlid_view)
      if (s.spouse_islamic_knowledge)         setSpouseIslamicKnowledge(s.spouse_islamic_knowledge)
      if (s.zakah_sadaqah)                    setZakahSadaqah(s.zakah_sadaqah)
      if (s.madhab_consistency)               setMadhabConsistency(s.madhab_consistency)
      if (s.quran_memorisation)               setQuranMemorisation(s.quran_memorisation)
      if (s.deen_when_busy)                   setDeenWhenBusy(s.deen_when_busy)
      if (s.islamic_home_importance)          setIslamicHomeImportance(s.islamic_home_importance)
      if (s.parent_relationship)              setParentRelationship(s.parent_relationship)
      if (s.family_balance_after_marriage)    setFamilyBalanceAfterMarriage(s.family_balance_after_marriage)
      if (s.family_financial_responsibility)  setFamilyFinancialResponsibility(s.family_financial_responsibility)
      if (s.family_conflict_style)            setFamilyConflictStyle(s.family_conflict_style)
      if (s.inlaws_comfort)                   setInlawsComfort(s.inlaws_comfort)
      if (s.husband_family_relationship)      setHusbandFamilyRelationship(s.husband_family_relationship)
      if (s.family_traditional_vs_modern !== undefined) setFamilyTraditionalVsModern(s.family_traditional_vs_modern)
      if (s.family_spouse_disagreement)       setFamilySpouseDisagreement(s.family_spouse_disagreement)
      if (s.stress_management)               setStressManagement(s.stress_management)
      if (s.therapy_experience)              setTherapyExperience(s.therapy_experience)
      if (s.couples_therapy_view)            setCouplesTherapyView(s.couples_therapy_view)
      if (s.mental_health_challenges)        setMentalHealthChallenges(s.mental_health_challenges)
      if (s.emotional_support_style)         setEmotionalSupportStyle(s.emotional_support_style)
      if (s.emotional_availability !== undefined) setEmotionalAvailability(s.emotional_availability)
      if (s.significant_hardship)            setSignificantHardship(s.significant_hardship)
      if (s.emotional_expression_view)       setEmotionalExpressionView(s.emotional_expression_view)
      if (s.healthy_argument_view)           setHealthyArgumentView(s.healthy_argument_view)
      if (s.apology_speed)                   setApologySpeed(s.apology_speed)
      if (s.communication_when_upset)        setCommunicationWhenUpset(s.communication_when_upset)
      if (s.husband_opinion_importance)      setHusbandOpinionImportance(s.husband_opinion_importance)
      if (s.receiving_love_language)         setReceivingLoveLanguage(s.receiving_love_language)
      if (s.qawwam_view)                     setQawwamView(s.qawwam_view)
      if (s.career_five_years)               setCareerFiveYears(s.career_five_years)
      if (s.career_identity_importance !== undefined) setCareerIdentityImportance(s.career_identity_importance)
      if (s.career_pause_for_children)       setCareerPauseForChildren(s.career_pause_for_children)
      if (s.financial_dependence_view)       setFinancialDependenceView(s.financial_dependence_view)
      if (s.savings_plan)                    setSavingsPlan(s.savings_plan)
      if (s.financial_stress_approach)       setFinancialStressApproach(s.financial_stress_approach)
      if (s.political_views)                 setPoliticalViews(s.political_views)
      if (s.cultural_background_importance !== undefined) setCulturalBackgroundImportance(s.cultural_background_importance)
      if (s.exercise_frequency)              setExerciseFrequency(s.exercise_frequency)
      if (s.social_media_view)               setSocialMediaView(s.social_media_view)
      if (s.home_organisation !== undefined) setHomeOrganisation(s.home_organisation)
      if (s.pets_view)                       setPetsView(s.pets_view)
      if (s.healthy_eating_importance)       setHealthyEatingImportance(s.healthy_eating_importance)
      if (s.ramadan_routine)                 setRamadanRoutine(s.ramadan_routine)
      if (s.marriage_vision_10_years)        setMarriageVision10Years(s.marriage_vision_10_years)
      if (s.first_year_vision)               setFirstYearVision(s.first_year_vision)
      if (s.physical_intimacy_importance)    setPhysicalIntimacyImportance(s.physical_intimacy_importance)
      if (s.spouse_friendships_view)         setSpouseFriendshipsView(s.spouse_friendships_view)
      if (s.romance_view)                    setRomanceView(s.romance_view)
      if (s.marriage_fear)                   setMarriageFear(s.marriage_fear)
      if (s.unique_contribution)             setUniqueContribution(s.unique_contribution)
      if (s.ideal_husband_description)       setIdealHusbandDescription(s.ideal_husband_description)
    } catch {}
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    const requiredPills: [string, string][] = [
      [quranListening,               'Quran listening'],
      [mawlidView,                   'Mawlid view'],
      [spouseIslamicKnowledge,       'Spouse Islamic knowledge'],
      [zakahSadaqah,                 'Zakah & sadaqah'],
      [madhabConsistency,            'Madhab consistency'],
      [quranMemorisation,            'Quran memorisation'],
      [islamicHomeImportance,        'Islamic home importance'],
      [familyBalanceAfterMarriage,   'Family balance after marriage'],
      [familyFinancialResponsibility,'Family financial responsibility'],
      [familyConflictStyle,          'Family conflict style'],
      [inlawsComfort,                'In-laws comfort'],
      [husbandFamilyRelationship,    'Husband family relationship'],
      [therapyExperience,            'Therapy experience'],
      [couplesTherapyView,           'Couples therapy view'],
      [mentalHealthChallenges,       'Mental health challenges'],
      [emotionalExpressionView,      'Emotional expression view'],
      [apologySpeed,                 'Apology speed'],
      [communicationWhenUpset,       'Communication when upset'],
      [husbandOpinionImportance,     'Husband opinion importance'],
      [receivingLoveLanguage,        'Receiving love language'],
      [qawwamView,                   'Qawwam view'],
      [careerPauseForChildren,       'Career pause for children'],
      [financialDependenceView,      'Financial dependence view'],
      [savingsPlan,                  'Savings plan'],
      [politicalViews,               'Political views'],
      [exerciseFrequency,            'Exercise frequency'],
      [socialMediaView,              'Social media view'],
      [petsView,                     'Pets view'],
      [healthyEatingImportance,      'Healthy eating importance'],
      [physicalIntimacyImportance,   'Physical intimacy importance'],
      [spouseFriendshipsView,        'Spouse friendships view'],
    ]
    for (const [val, label] of requiredPills) {
      if (!val) { setError(`Please answer: ${label}`); return }
    }
    if (!deenGrowth.trim())               { setError('Please answer: How do you actively grow in your deen?'); return }
    if (!deenWhenBusy.trim())             { setError('Please answer: How do you protect your deen when life gets busy?'); return }
    if (!parentRelationship.trim())       { setError('Please answer: Describe your relationship with your parents'); return }
    if (!familySpouseDisagreement.trim()) { setError('Please answer: Family vs spouse disagreement'); return }
    if (!stressManagement.trim())         { setError('Please answer: How do you manage stress?'); return }
    if (!emotionalSupportStyle.trim())    { setError('Please answer: Emotional support style'); return }
    if (!healthyArgumentView.trim())      { setError('Please answer: What does a healthy argument look like?'); return }
    if (!careerFiveYears.trim())          { setError('Please answer: Career in 5 years'); return }
    if (!financialStressApproach.trim())  { setError('Please answer: Financial stress approach'); return }
    if (!ramadanRoutine.trim())           { setError('Please answer: Ramadan routine'); return }
    if (!marriageVision10Years.trim())    { setError('Please answer: Marriage vision in 10 years'); return }
    if (!firstYearVision.trim())          { setError('Please answer: First year vision'); return }
    if (!romanceView.trim())              { setError('Please answer: Romance view'); return }
    if (!marriageFear.trim())             { setError('Please answer: Marriage fear'); return }
    if (!uniqueContribution.trim())       { setError('Please answer: Unique contribution'); return }
    if (!idealHusbandDescription.trim())  { setError('Please answer: Ideal husband description'); return }

    setLoading(true)

    const deepdiveData = {
      deen_growth:                  deenGrowth.trim(),
      quran_listening:              quranListening,
      traditional_vs_reformist:     traditionalVsReformist,
      mawlid_view:                  mawlidView,
      spouse_islamic_knowledge:     spouseIslamicKnowledge,
      zakah_sadaqah:                zakahSadaqah,
      madhab_consistency:           madhabConsistency,
      quran_memorisation:           quranMemorisation,
      deen_when_busy:               deenWhenBusy.trim(),
      islamic_home_importance:      islamicHomeImportance,
      parent_relationship:          parentRelationship.trim(),
      family_balance_after_marriage: familyBalanceAfterMarriage,
      family_financial_responsibility: familyFinancialResponsibility,
      family_conflict_style:        familyConflictStyle,
      inlaws_comfort:               inlawsComfort,
      husband_family_relationship:  husbandFamilyRelationship,
      family_traditional_vs_modern: familyTraditionalVsModern,
      family_spouse_disagreement:   familySpouseDisagreement.trim(),
      stress_management:            stressManagement.trim(),
      therapy_experience:           therapyExperience,
      couples_therapy_view:         couplesTherapyView,
      mental_health_challenges:     mentalHealthChallenges,
      emotional_support_style:      emotionalSupportStyle.trim(),
      emotional_availability:       emotionalAvailability,
      significant_hardship:         significantHardship.trim() || null,
      emotional_expression_view:    emotionalExpressionView,
      healthy_argument_view:        healthyArgumentView.trim(),
      apology_speed:                apologySpeed,
      communication_when_upset:     communicationWhenUpset,
      husband_opinion_importance:   husbandOpinionImportance,
      receiving_love_language:      receivingLoveLanguage,
      qawwam_view:                  qawwamView,
      career_five_years:            careerFiveYears.trim(),
      career_identity_importance:   careerIdentityImportance,
      career_pause_for_children:    careerPauseForChildren,
      financial_dependence_view:    financialDependenceView,
      savings_plan:                 savingsPlan,
      financial_stress_approach:    financialStressApproach.trim(),
      political_views:              politicalViews,
      cultural_background_importance: culturalBackgroundImportance,
      exercise_frequency:           exerciseFrequency,
      social_media_view:            socialMediaView,
      home_organisation:            homeOrganisation,
      pets_view:                    petsView,
      healthy_eating_importance:    healthyEatingImportance,
      ramadan_routine:              ramadanRoutine.trim(),
      marriage_vision_10_years:     marriageVision10Years.trim(),
      first_year_vision:            firstYearVision.trim(),
      physical_intimacy_importance: physicalIntimacyImportance,
      spouse_friendships_view:      spouseFriendshipsView,
      romance_view:                 romanceView.trim(),
      marriage_fear:                marriageFear.trim(),
      unique_contribution:          uniqueContribution.trim(),
      ideal_husband_description:    idealHusbandDescription.trim(),
    }

    save(deepdiveData)
    router.push('/onboarding/sister/photos')
  }

  return (
    <div className="min-h-screen bg-[#FDF8F3]">
      <div className="max-w-[480px] mx-auto px-5 py-8 pb-28">
        <h2 className="text-2xl font-medium text-[#1A1A1A] tracking-[-0.02em] mb-1">Going deeper</h2>
        <p className="text-[15px] text-[#9B9B9B] mb-2">These questions help us understand who you really are</p>
        <p className="text-xs text-[#9B9B9B] mb-8">Your answers are saved automatically as you go.</p>

        <form id="sister-deepdive-form" ref={formRef} onSubmit={handleSubmit} className="space-y-8">

          {/* Section 1: Faith & Deen */}
          <div>
            <SectionHeader title="Faith & Deen" />
            <div className="space-y-6">
              <Question label="How do you actively grow in your deen?">
                <textarea
                  value={deenGrowth}
                  onChange={e => { setDeenGrowth(e.target.value); save({ deen_growth: e.target.value }) }}
                  rows={3}
                  placeholder="e.g. I attend Islamic classes, listen to lectures daily..."
                  className={textareaCls}
                />
              </Question>
              <Question label="How often do you listen to Quran?">
                <PillGroup
                  options={['Daily', 'Weekly', 'Occasionally', 'Rarely']}
                  value={quranListening}
                  onChange={v => { setQuranListening(v); save({ quran_listening: v }) }}
                />
              </Question>
              <Question label="Where do you sit on the traditional to reformist spectrum?">
                <Slider
                  value={traditionalVsReformist}
                  onChange={v => { setTraditionalVsReformist(v); save({ traditional_vs_reformist: v }) }}
                  leftLabel="Traditional"
                  rightLabel="Reformist"
                  centerLabel="Balanced"
                />
              </Question>
              <Question label="What is your view on celebrating Mawlid an-Nabi?">
                <PillGroup
                  options={['I celebrate it', "I don't but respect those who do", 'I disagree with it', 'No strong opinion']}
                  value={mawlidView}
                  onChange={v => { setMawlidView(v); save({ mawlid_view: v }) }}
                />
              </Question>
              <Question label="How important is your spouse's Islamic knowledge to you?">
                <PillGroup
                  options={['Essential', 'Very important', 'Somewhat important', 'Not a priority']}
                  value={spouseIslamicKnowledge}
                  onChange={v => { setSpouseIslamicKnowledge(v); save({ spouse_islamic_knowledge: v }) }}
                />
              </Question>
              <Question label="Do you give zakah and sadaqah regularly?">
                <PillGroup
                  options={['Yes — regularly', 'Yes — occasionally', 'Not yet but intend to', 'No']}
                  value={zakahSadaqah}
                  onChange={v => { setZakahSadaqah(v); save({ zakah_sadaqah: v }) }}
                />
              </Question>
              <Question label="How important is following a consistent madhab to you?">
                <PillGroup
                  options={['Very important', 'Somewhat important', 'Not important', 'Open to discussion']}
                  value={madhabConsistency}
                  onChange={v => { setMadhabConsistency(v); save({ madhab_consistency: v }) }}
                />
              </Question>
              <Question label="How much of the Quran have you memorised?">
                <PillGroup
                  options={['Full hafiza', '10+ juz', '5-10 juz', '1-5 juz', 'Some surahs', 'Working on it']}
                  value={quranMemorisation}
                  onChange={v => { setQuranMemorisation(v); save({ quran_memorisation: v }) }}
                />
              </Question>
              <Question label="How do you protect your deen when life gets busy?">
                <textarea
                  value={deenWhenBusy}
                  onChange={e => { setDeenWhenBusy(e.target.value); save({ deen_when_busy: e.target.value }) }}
                  rows={3}
                  placeholder="e.g. I protect my salah first..."
                  className={textareaCls}
                />
              </Question>
              <Question label="How important is creating an Islamic home environment to you?">
                <PillGroup
                  options={['Essential', 'Very important', 'Somewhat important', 'I am flexible']}
                  value={islamicHomeImportance}
                  onChange={v => { setIslamicHomeImportance(v); save({ islamic_home_importance: v }) }}
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
                  onChange={e => { setParentRelationship(e.target.value); save({ parent_relationship: e.target.value }) }}
                  rows={3}
                  placeholder="e.g. I have a very close relationship with my family..."
                  className={textareaCls}
                />
              </Question>
              <Question label="After marriage, how will you balance your family ties?">
                <PillGroup
                  options={['I will maintain close ties', 'I will balance both', 'My new family comes first', 'Depends']}
                  value={familyBalanceAfterMarriage}
                  onChange={v => { setFamilyBalanceAfterMarriage(v); save({ family_balance_after_marriage: v }) }}
                />
              </Question>
              <Question label="Do you have financial responsibilities towards your family?">
                <PillGroup
                  options={['I help financially', 'Emotionally only', 'Both', 'They are independent']}
                  value={familyFinancialResponsibility}
                  onChange={v => { setFamilyFinancialResponsibility(v); save({ family_financial_responsibility: v }) }}
                />
              </Question>
              <Question label="How does conflict typically play out in your family?">
                <PillGroup
                  options={['Openly discussed', 'Avoided', 'Sometimes heated', 'Calmly resolved']}
                  value={familyConflictStyle}
                  onChange={v => { setFamilyConflictStyle(v); save({ family_conflict_style: v }) }}
                />
              </Question>
              <Question label="How comfortable are you with living near or with your in-laws?">
                <PillGroup
                  options={['Very comfortable', 'Comfortable with boundaries', 'I would need space', 'Depends']}
                  value={inlawsComfort}
                  onChange={v => { setInlawsComfort(v); save({ inlaws_comfort: v }) }}
                />
              </Question>
              <Question label="How do you expect to relate to your husband's family?">
                <PillGroup
                  options={['Very involved — close relationship', 'Respectful but independent', 'With clear boundaries', 'Flexible']}
                  value={husbandFamilyRelationship}
                  onChange={v => { setHusbandFamilyRelationship(v); save({ husband_family_relationship: v }) }}
                />
              </Question>
              <Question label="How traditional vs modern is your family dynamic?">
                <Slider
                  value={familyTraditionalVsModern}
                  onChange={v => { setFamilyTraditionalVsModern(v); save({ family_traditional_vs_modern: v }) }}
                  leftLabel="Traditional"
                  rightLabel="Modern"
                />
              </Question>
              <Question label="How would you handle a conflict between your family and your spouse?">
                <textarea
                  value={familySpouseDisagreement}
                  onChange={e => { setFamilySpouseDisagreement(e.target.value); save({ family_spouse_disagreement: e.target.value }) }}
                  rows={3}
                  placeholder="e.g. I would try to hear both sides and mediate..."
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
                  onChange={e => { setStressManagement(e.target.value); save({ stress_management: e.target.value }) }}
                  rows={3}
                  placeholder="e.g. Prayer, journaling, talking to close friends..."
                  className={textareaCls}
                />
              </Question>
              <Question label="Have you ever been to therapy or counselling?">
                <PillGroup
                  options={['Yes — currently', 'Yes — in the past', 'No but open to it', 'No and not interested']}
                  value={therapyExperience}
                  onChange={v => { setTherapyExperience(v); save({ therapy_experience: v }) }}
                />
              </Question>
              <Question label="How do you feel about couples therapy?">
                <PillGroup
                  options={['Very open — proactive', 'Open if needed', 'Hesitant', 'Not interested']}
                  value={couplesTherapyView}
                  onChange={v => { setCouplesTherapyView(v); save({ couples_therapy_view: v }) }}
                />
              </Question>
              <Question label="Do you have any mental health challenges?">
                <PillGroup
                  options={['Yes — being managed', 'Yes — working on it', 'Occasionally', 'No']}
                  value={mentalHealthChallenges}
                  onChange={v => { setMentalHealthChallenges(v); save({ mental_health_challenges: v }) }}
                />
              </Question>
              <Question label="How do you show up emotionally for those you love?">
                <textarea
                  value={emotionalSupportStyle}
                  onChange={e => { setEmotionalSupportStyle(e.target.value); save({ emotional_support_style: e.target.value }) }}
                  rows={3}
                  placeholder="e.g. I am very nurturing and try to be present..."
                  className={textareaCls}
                />
              </Question>
              <Question label="How emotionally available are you in relationships?">
                <Slider
                  value={emotionalAvailability}
                  onChange={v => { setEmotionalAvailability(v); save({ emotional_availability: v }) }}
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
                  onChange={e => { setSignificantHardship(e.target.value); save({ significant_hardship: e.target.value }) }}
                  rows={3}
                  placeholder="Optional..."
                  className={textareaCls}
                />
              </Question>
              <Question label="How comfortable are you expressing your emotions?">
                <PillGroup
                  options={['Very comfortable', 'Mostly comfortable', 'Working on it', 'Prefer to keep things private']}
                  value={emotionalExpressionView}
                  onChange={v => { setEmotionalExpressionView(v); save({ emotional_expression_view: v }) }}
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
                  onChange={e => { setHealthyArgumentView(e.target.value); save({ healthy_argument_view: e.target.value }) }}
                  rows={3}
                  placeholder="e.g. Both people feel heard, no name-calling, resolution focused..."
                  className={textareaCls}
                />
              </Question>
              <Question label="How quickly do you typically apologise after a disagreement?">
                <PillGroup
                  options={['Immediately', 'Within hours', 'Within a day', 'Takes me time']}
                  value={apologySpeed}
                  onChange={v => { setApologySpeed(v); save({ apology_speed: v }) }}
                />
              </Question>
              <Question label="How do you communicate when you are upset?">
                <PillGroup
                  options={['Talk it out immediately', 'Need space first', 'Go quiet', 'Struggle to communicate when upset']}
                  value={communicationWhenUpset}
                  onChange={v => { setCommunicationWhenUpset(v); save({ communication_when_upset: v }) }}
                />
              </Question>
              <Question label="How important is your husband's opinion in your decision-making?">
                <PillGroup
                  options={['Essential', 'Very important', 'Somewhat important', 'I form my own views first']}
                  value={husbandOpinionImportance}
                  onChange={v => { setHusbandOpinionImportance(v); save({ husband_opinion_importance: v }) }}
                />
              </Question>
              <Question label="How do you prefer to receive love?">
                <PillGroup
                  options={['Words of affirmation', 'Acts of service', 'Quality time', 'Gifts', 'Physical affection']}
                  value={receivingLoveLanguage}
                  onChange={v => { setReceivingLoveLanguage(v); save({ receiving_love_language: v }) }}
                />
              </Question>
              <Question label="What is your view on qawwam — the husband's responsibility to lead and protect?">
                <PillGroup
                  options={['I embrace it fully', 'I embrace it with mutual respect', 'I have some reservations', 'I disagree with traditional interpretations']}
                  value={qawwamView}
                  onChange={v => { setQawwamView(v); save({ qawwam_view: v }) }}
                />
              </Question>
            </div>
          </div>

          {/* Section 5: Career */}
          <div>
            <SectionHeader title="Career" />
            <div className="space-y-6">
              <Question label="Where do you see your career in 5 years?">
                <textarea
                  value={careerFiveYears}
                  onChange={e => { setCareerFiveYears(e.target.value); save({ career_five_years: e.target.value }) }}
                  rows={3}
                  placeholder="e.g. I plan to..."
                  className={textareaCls}
                />
              </Question>
              <Question label="How central is your career to your identity?">
                <Slider
                  value={careerIdentityImportance}
                  onChange={v => { setCareerIdentityImportance(v); save({ career_identity_importance: v }) }}
                  leftLabel="Career is secondary"
                  rightLabel="Career is central"
                />
              </Question>
              <Question label="Would you pause your career for young children?">
                <PillGroup
                  options={['Yes — happily', 'Yes with some adjustment', 'I would need significant support', 'I prefer to keep working']}
                  value={careerPauseForChildren}
                  onChange={v => { setCareerPauseForChildren(v); save({ career_pause_for_children: v }) }}
                />
              </Question>
              <Question label="What is your view on financial dependence in marriage?">
                <PillGroup
                  options={['I prefer to be financially supported', 'I want some independence', 'I want full financial independence', 'Open to discussion']}
                  value={financialDependenceView}
                  onChange={v => { setFinancialDependenceView(v); save({ financial_dependence_view: v }) }}
                />
              </Question>
              <Question label="Do you have a savings plan?">
                <PillGroup
                  options={['Yes — clear plan', 'Yes — general goals', 'Working on it', 'Not yet']}
                  value={savingsPlan}
                  onChange={v => { setSavingsPlan(v); save({ savings_plan: v }) }}
                />
              </Question>
              <Question label="How do you handle financial stress?">
                <textarea
                  value={financialStressApproach}
                  onChange={e => { setFinancialStressApproach(e.target.value); save({ financial_stress_approach: e.target.value }) }}
                  rows={3}
                  placeholder="e.g. I communicate openly and try to make a plan..."
                  className={textareaCls}
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
                  onChange={v => { setPoliticalViews(v); save({ political_views: v }) }}
                />
              </Question>
              <Question label="How important is sharing the same cultural background?">
                <Slider
                  value={culturalBackgroundImportance}
                  onChange={v => { setCulturalBackgroundImportance(v); save({ cultural_background_importance: v }) }}
                  leftLabel="Not important"
                  rightLabel="Very important"
                />
              </Question>
              <Question label="How often do you exercise?">
                <PillGroup
                  options={['Daily', 'A few times a week', 'Occasionally', 'Rarely']}
                  value={exerciseFrequency}
                  onChange={v => { setExerciseFrequency(v); save({ exercise_frequency: v }) }}
                />
              </Question>
              <Question label="What is your view on social media use in marriage?">
                <PillGroup
                  options={['Very open', 'Open within boundaries', 'Prefer limited use', 'Prefer no use']}
                  value={socialMediaView}
                  onChange={v => { setSocialMediaView(v); save({ social_media_view: v }) }}
                />
              </Question>
              <Question label="How organised do you like your home to be?">
                <Slider
                  value={homeOrganisation}
                  onChange={v => { setHomeOrganisation(v); save({ home_organisation: v }) }}
                  leftLabel="Very relaxed"
                  rightLabel="Very organised"
                />
              </Question>
              <Question label="What is your view on pets?">
                <PillGroup
                  options={['Have pets', 'Want pets', 'No pets', 'Open to discussion']}
                  value={petsView}
                  onChange={v => { setPetsView(v); save({ pets_view: v }) }}
                />
              </Question>
              <Question label="How important is healthy eating to you?">
                <PillGroup
                  options={['Very — strict diet', 'Mostly healthy', 'Balanced', 'Not a priority']}
                  value={healthyEatingImportance}
                  onChange={v => { setHealthyEatingImportance(v); save({ healthy_eating_importance: v }) }}
                />
              </Question>
              <Question label="Describe your Ramadan routine">
                <textarea
                  value={ramadanRoutine}
                  onChange={e => { setRamadanRoutine(e.target.value); save({ ramadan_routine: e.target.value }) }}
                  rows={3}
                  placeholder="e.g. Tarawih, increased Quran, family gatherings..."
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
                  onChange={e => { setMarriageVision10Years(e.target.value); save({ marriage_vision_10_years: e.target.value }) }}
                  rows={3}
                  placeholder="e.g. A loving home, children who love Allah, mutual growth..."
                  className={textareaCls}
                />
              </Question>
              <Question label="What does your first year of marriage look like?">
                <textarea
                  value={firstYearVision}
                  onChange={e => { setFirstYearVision(e.target.value); save({ first_year_vision: e.target.value }) }}
                  rows={3}
                  placeholder="e.g. Building routines together, establishing our home..."
                  className={textareaCls}
                />
              </Question>
              <Question label="How important is physical intimacy to you in a marriage?">
                <PillGroup
                  options={['Very important', 'Important', 'Somewhat important', 'Prefer not to say']}
                  value={physicalIntimacyImportance}
                  onChange={v => { setPhysicalIntimacyImportance(v); save({ physical_intimacy_importance: v }) }}
                />
              </Question>
              <Question label="How do you feel about your spouse maintaining close friendships?">
                <PillGroup
                  options={['Very supportive', 'Supportive within reason', 'Prefer limited outside friendships', 'Depends']}
                  value={spouseFriendshipsView}
                  onChange={v => { setSpouseFriendshipsView(v); save({ spouse_friendships_view: v }) }}
                />
              </Question>
              <Question label="What does romance look like to you in a marriage?">
                <textarea
                  value={romanceView}
                  onChange={e => { setRomanceView(e.target.value); save({ romance_view: e.target.value }) }}
                  rows={3}
                  placeholder="e.g. Small gestures, quality time, acts of service..."
                  className={textareaCls}
                />
              </Question>
              <Question label="What is your biggest fear about marriage?">
                <textarea
                  value={marriageFear}
                  onChange={e => { setMarriageFear(e.target.value); save({ marriage_fear: e.target.value }) }}
                  rows={3}
                  placeholder="Be honest — this is private..."
                  className={textareaCls}
                />
              </Question>
              <Question label="What unique thing do you bring to a marriage?">
                <textarea
                  value={uniqueContribution}
                  onChange={e => { setUniqueContribution(e.target.value); save({ unique_contribution: e.target.value }) }}
                  rows={3}
                  placeholder="e.g. My empathy, my sense of humour, my dedication..."
                  className={textareaCls}
                />
              </Question>
              <Question label="What kind of husband are you looking for in your own words?">
                <textarea
                  value={idealHusbandDescription}
                  onChange={e => { setIdealHusbandDescription(e.target.value); save({ ideal_husband_description: e.target.value }) }}
                  rows={4}
                  placeholder="Beyond the checklist — describe him..."
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
              form="sister-deepdive-form"
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
