'use client'

/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @next/next/no-img-element */

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { getFieldLabel } from '@/lib/field-labels'

type FieldDef = {
  label: string
  value: any
  type?: 'text' | 'slider' | 'array' | 'longtext'
  fullWidth?: boolean
}

type Props = {
  profileData: Record<string, any>
  gender: 'brother' | 'sister'
  photoUrls: string[]
  connectionId: string | null
  verificationBadge: boolean
  isInterestContext: boolean
}

// ─── FieldRow ─────────────────────────────────────────────────────────────────

function FieldRow({ label, value, type = 'text', fullWidth = false }: FieldDef) {
  if (value === null || value === undefined || value === '') return null
  if (Array.isArray(value) && value.length === 0) return null

  const renderValue = () => {
    if (type === 'slider') {
      const pct = Number(value)
      return (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ flex: 1, maxWidth: '80px', height: '4px', background: '#EDE8E3', borderRadius: '2px', overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${pct}%`, background: '#AF4D98', borderRadius: '2px' }} />
          </div>
          <span style={{ fontSize: '12px', color: '#9B9B9B' }}>{pct}%</span>
        </div>
      )
    }

    if (Array.isArray(value)) {
      return (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
          {value.map((v: string, i: number) => (
            <span key={i} style={{ background: '#F5E6F2', color: '#7B2F6E', borderRadius: '999px', padding: '2px 10px', fontSize: '12px', fontWeight: 500 }}>
              {v}
            </span>
          ))}
        </div>
      )
    }

    if (typeof value === 'boolean') {
      return (
        <span style={{ color: value ? '#0A8A7A' : '#9B9B9B', fontSize: '13px', fontWeight: 500 }}>
          {value ? 'Yes' : 'No'}
        </span>
      )
    }

    if (type === 'longtext' || (typeof value === 'string' && value.length > 80)) {
      return (
        <p style={{ fontSize: '14px', color: '#5C5C5C', lineHeight: 1.7, margin: 0, background: '#FDFAF7', border: '1px solid #EDE8E3', borderRadius: '8px', padding: '10px 12px' }}>
          {value}
        </p>
      )
    }

    return <span style={{ fontSize: '13px', fontWeight: 500, color: '#1A1A1A' }}>{String(value)}</span>
  }

  if (fullWidth) {
    return (
      <div style={{ padding: '12px 16px', borderBottom: '1px solid #F5F5F5' }}>
        <p style={{ fontSize: '11px', color: '#9B9B9B', margin: '0 0 6px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          {label}
        </p>
        {renderValue()}
      </div>
    )
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', padding: '11px 16px', borderBottom: '1px solid #F5F5F5', alignItems: 'start' }}>
      <span style={{ fontSize: '13px', color: '#9B9B9B', paddingTop: '1px' }}>{label}</span>
      <div>{renderValue()}</div>
    </div>
  )
}

// ─── SectionCard ──────────────────────────────────────────────────────────────

function SectionCard({ title, fields }: { title: string; fields: FieldDef[] }) {
  const hasAny = fields.some(f => {
    const v = f.value
    if (v === null || v === undefined || v === '') return false
    if (Array.isArray(v)) return v.length > 0
    return true
  })
  if (!hasAny) return null

  return (
    <div style={{ background: 'white', border: '1px solid #EDE8E3', borderRadius: '16px', marginBottom: '12px', overflow: 'hidden' }}>
      <div style={{ padding: '14px 16px', borderBottom: '1px solid #EDE8E3' }}>
        <p style={{ fontSize: '11px', fontWeight: 500, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#9B9B9B', margin: 0 }}>
          {title}
        </p>
      </div>
      {fields.map((f, i) => <FieldRow key={i} {...f} />)}
    </div>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function ViewProfileClient({
  profileData,
  gender,
  photoUrls,
  connectionId,
  verificationBadge,
  isInterestContext,
}: Props) {
  const router = useRouter()
  const [activePhotoIndex, setActivePhotoIndex] = useState(0)
  const p = profileData
  const lbl = (key: string) => getFieldLabel(key, gender)
  const isBrother = gender === 'brother'
  const firstName = String(p.full_name ?? '').split(' ')[0] || 'Profile'

  // ── Header stat pills ──────────────────────────────────────────────────────
  const statPills = [
    p.religiosity_level,
    p.prayer_frequency,
    gender === 'sister'
      ? (p.wears_hijab ? 'Wears hijab' : null)
      : (p.has_beard ? 'Has beard' : null),
    p.madhab,
  ].filter(Boolean) as string[]

  // ── Quick facts (top 3 cards) ──────────────────────────────────────────────
  const quickFacts = [
    { label: 'Occupation', value: p.occupation },
    { label: 'Education', value: p.education_level },
    { label: 'Lives', value: p.living_situation },
  ].filter(item => item.value)

  const ageRange =
    p.spouse_age_min && p.spouse_age_max
      ? `${p.spouse_age_min}–${p.spouse_age_max}`
      : null

  // ── Section field arrays ───────────────────────────────────────────────────

  const deenFields: FieldDef[] = [
    { label: lbl('religiosity_level'), value: p.religiosity_level },
    { label: lbl('prayer_frequency'), value: p.prayer_frequency },
    { label: lbl('madhab'), value: p.madhab },
    { label: lbl('islamic_knowledge_level'), value: p.islamic_knowledge_level },
    isBrother
      ? { label: lbl('has_beard'), value: p.has_beard }
      : { label: lbl('wears_hijab'), value: p.wears_hijab },
    isBrother
      ? { label: lbl('jumuah_attendance'), value: p.jumuah_attendance }
      : { label: lbl('islamic_classes_attendance'), value: p.islamic_classes_attendance },
    { label: lbl('do_you_listen_to_music'), value: p.do_you_listen_to_music },
    { label: lbl('celebrate_non_islamic_holidays'), value: p.celebrate_non_islamic_holidays },
    { label: lbl('differing_islamic_opinions'), value: p.differing_islamic_opinions, fullWidth: true, type: 'longtext' as const },
  ]

  const familyFields: FieldDef[] = [
    { label: lbl('parent_relationship'), value: p.parent_relationship, fullWidth: true, type: 'longtext' as const },
    { label: lbl('family_conflict_style'), value: p.family_conflict_style },
    { label: lbl('family_spouse_disagreement'), value: p.family_spouse_disagreement, fullWidth: true, type: 'longtext' as const },
    ...(isBrother ? [
      { label: lbl('wife_family_interaction'), value: p.wife_family_interaction },
      { label: lbl('living_near_parents'), value: p.living_near_parents },
      { label: lbl('wife_family_relationship'), value: p.wife_family_relationship },
      { label: lbl('eldest_responsibilities'), value: p.eldest_responsibilities },
      { label: lbl('child_caregiving'), value: p.child_caregiving },
    ] : [
      { label: lbl('family_balance_after_marriage'), value: p.family_balance_after_marriage },
      { label: lbl('inlaws_comfort'), value: p.inlaws_comfort },
      { label: lbl('husband_family_relationship'), value: p.husband_family_relationship },
      { label: lbl('family_traditional_vs_modern'), value: p.family_traditional_vs_modern, type: 'slider' as const },
    ]),
  ]

  const lifestyleFields: FieldDef[] = [
    { label: lbl('occupation'), value: p.occupation },
    { label: lbl('education_level'), value: p.education_level },
    { label: lbl('living_situation'), value: p.living_situation },
    { label: lbl('willing_to_relocate'), value: p.willing_to_relocate },
    { label: lbl('strict_halal_diet'), value: p.strict_halal_diet },
    { label: lbl('smoking'), value: p.smoking },
    { label: lbl('mixed_gender_social_circle'), value: p.mixed_gender_social_circle },
    { label: lbl('alone_time_importance'), value: p.alone_time_importance },
    isBrother
      ? { label: lbl('travel_frequency'), value: p.travel_frequency }
      : { label: lbl('travel_importance'), value: p.travel_importance },
    { label: lbl('weekend_lifestyle'), value: p.weekend_lifestyle, fullWidth: true, type: 'longtext' as const },
  ]

  const marriageFields: FieldDef[] = [
    { label: lbl('timeline_to_marry'), value: p.timeline_to_marry },
    { label: lbl('wants_children'), value: p.wants_children },
    { label: lbl('number_of_children_wanted'), value: p.number_of_children_wanted },
    { label: lbl('previously_married'), value: p.previously_married },
    { label: lbl('has_children'), value: p.has_children },
    { label: lbl('islamic_schooling_importance'), value: p.islamic_schooling_importance },
    { label: lbl('inlaws_living_together'), value: p.inlaws_living_together },
    ...(isBrother ? [{ label: lbl('polygamy_openness'), value: p.polygamy_openness }] : []),
  ]

  const spouseFields: FieldDef[] = [
    { label: lbl('spouse_religiosity_preference'), value: p.spouse_religiosity_preference },
    { label: 'Preferred Age Range', value: ageRange },
    { label: lbl('dealbreakers'), value: p.dealbreakers, type: 'array' as const, fullWidth: true },
    { label: lbl('cultural_background_importance'), value: p.cultural_background_importance, type: 'slider' as const },
  ]

  const financialFields: FieldDef[] = isBrother ? [
    { label: lbl('financial_readiness'), value: p.financial_readiness },
    { label: lbl('annual_income_range'), value: p.annual_income_range },
    { label: lbl('own_or_rent'), value: p.own_or_rent },
    { label: lbl('has_significant_debt'), value: p.has_significant_debt },
    { label: lbl('supporting_family_financially'), value: p.supporting_family_financially },
    { label: lbl('wife_working_openness'), value: p.wife_working_openness },
    { label: lbl('savings_plan'), value: p.savings_plan },
    { label: lbl('financial_planning_approach'), value: p.financial_planning_approach },
    { label: lbl('hajj_status'), value: p.hajj_status },
    { label: lbl('financial_stress_approach'), value: p.financial_stress_approach, fullWidth: true, type: 'longtext' as const },
    { label: lbl('mahr_approach'), value: p.mahr_approach, fullWidth: true, type: 'longtext' as const },
  ] : [
    { label: lbl('plan_to_work_after_marriage'), value: p.plan_to_work_after_marriage },
    { label: lbl('financial_independence_importance'), value: p.financial_independence_importance },
    { label: lbl('has_significant_debt'), value: p.has_significant_debt },
    { label: lbl('supporting_family_financially'), value: p.supporting_family_financially },
    { label: lbl('primary_caregiver_comfort'), value: p.primary_caregiver_comfort },
    { label: lbl('savings_plan'), value: p.savings_plan },
    { label: lbl('financial_stress_approach'), value: p.financial_stress_approach, fullWidth: true, type: 'longtext' as const },
    { label: lbl('career_ambitions'), value: p.career_ambitions, fullWidth: true, type: 'longtext' as const },
  ]

  const emotionalFields: FieldDef[] = [
    { label: lbl('stress_management'), value: p.stress_management, fullWidth: true, type: 'longtext' as const },
    { label: lbl('therapy_experience'), value: p.therapy_experience },
    { label: lbl('couples_therapy_view'), value: p.couples_therapy_view },
    { label: lbl('mental_health_challenges'), value: p.mental_health_challenges },
    { label: lbl('emotional_support_style'), value: p.emotional_support_style, fullWidth: true, type: 'longtext' as const },
    { label: lbl('emotional_availability'), value: p.emotional_availability, type: 'slider' as const },
    { label: lbl('significant_hardship'), value: p.significant_hardship, fullWidth: true, type: 'longtext' as const },
    { label: lbl('emotional_expression_view'), value: p.emotional_expression_view },
  ]

  const conflictFields: FieldDef[] = [
    { label: lbl('healthy_argument_view'), value: p.healthy_argument_view, fullWidth: true, type: 'longtext' as const },
    { label: lbl('apology_speed'), value: p.apology_speed },
    { label: lbl('communication_when_upset'), value: p.communication_when_upset },
    { label: lbl('introvert_extrovert'), value: p.introvert_extrovert },
    { label: lbl('love_language'), value: p.love_language, type: 'array' as const },
    ...(isBrother ? [
      { label: lbl('husband_final_say'), value: p.husband_final_say },
      { label: lbl('wife_opinion_importance'), value: p.wife_opinion_importance },
    ] : [
      { label: lbl('qawwam_view'), value: p.qawwam_view },
      { label: lbl('receiving_love_language'), value: p.receiving_love_language },
    ]),
  ]

  const householdCareerFields: FieldDef[] = isBrother ? [
    { label: lbl('household_management'), value: p.household_management },
    { label: lbl('home_organisation'), value: p.home_organisation, type: 'slider' as const },
    { label: lbl('household_responsibilities_vision'), value: p.household_responsibilities_vision, fullWidth: true, type: 'longtext' as const },
  ] : [
    { label: lbl('career_five_years'), value: p.career_five_years, fullWidth: true, type: 'longtext' as const },
    { label: lbl('career_identity_importance'), value: p.career_identity_importance, type: 'slider' as const },
    { label: lbl('career_pause_for_children'), value: p.career_pause_for_children },
  ]

  const visionFields: FieldDef[] = [
    { label: lbl('marriage_vision_10_years'), value: p.marriage_vision_10_years, fullWidth: true, type: 'longtext' as const },
    { label: lbl('first_year_vision'), value: p.first_year_vision, fullWidth: true, type: 'longtext' as const },
    { label: lbl('romance_view'), value: p.romance_view, fullWidth: true, type: 'longtext' as const },
    { label: lbl('marriage_fear'), value: p.marriage_fear, fullWidth: true, type: 'longtext' as const },
    { label: lbl('unique_contribution'), value: p.unique_contribution, fullWidth: true, type: 'longtext' as const },
    { label: lbl('physical_intimacy_importance'), value: p.physical_intimacy_importance },
    { label: lbl('spouse_friendships_view'), value: p.spouse_friendships_view },
    ...(!isBrother ? [{ label: lbl('ideal_husband_description'), value: p.ideal_husband_description, fullWidth: true, type: 'longtext' as const }] : []),
  ]

  const faithFields: FieldDef[] = [
    { label: lbl('deen_growth'), value: p.deen_growth, fullWidth: true, type: 'longtext' as const },
    { label: lbl('quran_listening'), value: p.quran_listening },
    { label: lbl('quran_memorisation'), value: p.quran_memorisation },
    { label: lbl('traditional_vs_reformist'), value: p.traditional_vs_reformist, type: 'slider' as const },
    { label: lbl('zakah_sadaqah'), value: p.zakah_sadaqah },
    { label: lbl('mawlid_view'), value: p.mawlid_view },
    { label: lbl('madhab_consistency'), value: p.madhab_consistency },
    { label: lbl('spouse_islamic_knowledge'), value: p.spouse_islamic_knowledge },
    { label: lbl('ramadan_routine'), value: p.ramadan_routine, fullWidth: true, type: 'longtext' as const },
    ...(isBrother ? [
      { label: lbl('wife_niqab_preference'), value: p.wife_niqab_preference },
      { label: lbl('missed_prayer_approach'), value: p.missed_prayer_approach },
    ] : [
      { label: lbl('deen_when_busy'), value: p.deen_when_busy, fullWidth: true, type: 'longtext' as const },
      { label: lbl('islamic_home_importance'), value: p.islamic_home_importance },
    ]),
  ]

  const characterFields: FieldDef[] = [
    { label: 'About Me', value: p.character_description, fullWidth: true, type: 'longtext' as const },
    { label: 'Goals', value: p.goals, fullWidth: true, type: 'longtext' as const },
  ]

  const ref = p.reference as any
  const hasRef = ref && typeof ref === 'object'

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div style={{ background: '#FDF8F3', minHeight: '100vh' }}>

      {/* ── Sticky header ─────────────────────────────────────────────────── */}
      <div style={{
        position: 'sticky',
        top: 0,
        background: 'white',
        zIndex: 10,
        borderBottom: '1px solid #EDE8E3',
        padding: '12px 20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <button
          onClick={() => router.back()}
          style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#9B9B9B', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '14px', padding: 0 }}
        >
          ← Back
        </button>
        <p style={{ fontSize: '15px', fontWeight: 500, color: '#1A1A1A', margin: 0 }}>
          {firstName}&apos;s Profile
        </p>
        {connectionId ? (
          <button
            onClick={() => router.push(`/dashboard/chat/${connectionId}`)}
            style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#AF4D98', fontSize: '14px', fontWeight: 500, padding: 0 }}
          >
            Back to chat
          </button>
        ) : (
          <div style={{ width: '80px' }} />
        )}
      </div>

      {/* ── Scrollable content ─────────────────────────────────────────────── */}
      <div style={{ maxWidth: '640px', margin: '0 auto', padding: `24px 20px ${isInterestContext ? '112px' : '80px'}` }}>

        {/* ── Photo gallery ────────────────────────────────────────────────── */}
        <div style={{ textAlign: 'center', marginBottom: '4px' }}>
          {photoUrls.length === 0 ? (
            <div style={{
              width: '100px', height: '100px', borderRadius: '50%',
              background: 'linear-gradient(135deg, #F5E6F2, #F4E4BA)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto', border: '3px solid white', boxShadow: '0 0 0 2px #AF4D98'
            }}>
              <span style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '38px', fontWeight: 400, color: '#AF4D98' }}>
                {String(p.full_name ?? 'N')[0]?.toUpperCase() ?? 'N'}
              </span>
            </div>
          ) : (
            <>
              <div style={{
                width: '100px', height: '100px', borderRadius: '50%',
                overflow: 'hidden', margin: '0 auto',
                border: '3px solid white', boxShadow: '0 0 0 2px #AF4D98',
                transition: 'opacity 0.2s ease'
              }}>
                <img
                  src={photoUrls[activePhotoIndex]}
                  alt={String(p.full_name ?? '')}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </div>
              {photoUrls.length > 1 && (
                <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '10px' }}>
                  {photoUrls.map((url, index) => (
                    <button
                      key={index}
                      onClick={() => setActivePhotoIndex(index)}
                      style={{
                        width: '40px', height: '40px', borderRadius: '50%',
                        overflow: 'hidden',
                        border: activePhotoIndex === index ? '2px solid #AF4D98' : '2px solid transparent',
                        padding: 0, cursor: 'pointer', flexShrink: 0,
                        transition: 'border 0.15s ease'
                      }}
                    >
                      <img src={url} alt={`Photo ${index + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
        </div>

        {/* ── Name ─────────────────────────────────────────────────────────── */}
        <h1 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '28px', fontWeight: 400, color: '#1A1A1A', margin: '16px 0 6px', textAlign: 'center' }}>
          {String(p.full_name ?? '')}
        </h1>

        {/* ── Age · Location ────────────────────────────────────────────────── */}
        {(p.age || p.location) && (
          <p style={{ fontSize: '14px', color: '#9B9B9B', margin: '0 0 12px', textAlign: 'center' }}>
            {[p.age ? `${p.age} yrs` : null, p.location].filter(Boolean).join(' · ')}
          </p>
        )}

        {/* ── Stat pills ───────────────────────────────────────────────────── */}
        {statPills.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '6px', marginBottom: '10px' }}>
            {statPills.map(val => (
              <span key={val} style={{ background: '#F5E6F2', color: '#7B2F6E', fontSize: '12px', fontWeight: 500, padding: '4px 12px', borderRadius: '999px' }}>
                {val}
              </span>
            ))}
          </div>
        )}

        {/* ── Verified badge ────────────────────────────────────────────────── */}
        {verificationBadge && (
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '10px' }}>
            <span style={{ background: '#E6F7F5', color: '#0A8A7A', fontSize: '12px', fontWeight: 500, padding: '4px 12px', borderRadius: '999px', display: 'flex', alignItems: 'center', gap: '5px' }}>
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <circle cx="6" cy="6" r="6" fill="#0A8A7A" />
                <path d="M3 6L5 8L9 4" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
              Verified
            </span>
          </div>
        )}

        {/* ── Ethnicity · Languages ─────────────────────────────────────────── */}
        {(p.ethnicity || p.languages) && (
          <p style={{ fontSize: '13px', color: '#9B9B9B', textAlign: 'center', margin: '0 0 8px' }}>
            {[p.ethnicity, Array.isArray(p.languages) ? p.languages.join(', ') : p.languages]
              .filter(Boolean).join(' · ')}
          </p>
        )}

        {/* ── Character quote card ─────────────────────────────────────────── */}
        {p.character_description && (
          <div style={{ background: '#FDFAF7', border: '1px solid #EDE8E3', borderRadius: '16px', padding: '16px 20px', margin: '24px 0 16px' }}>
            <p style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '16px', color: '#5C5C5C', lineHeight: 1.7, margin: 0, fontStyle: 'italic' }}>
              &ldquo;{String(p.character_description)}&rdquo;
            </p>
          </div>
        )}

        {/* ── Quick facts ───────────────────────────────────────────────────── */}
        {quickFacts.length > 0 && (
          <div style={{ display: 'grid', gridTemplateColumns: `repeat(${quickFacts.length}, 1fr)`, gap: '10px', marginBottom: '20px' }}>
            {quickFacts.map(item => (
              <div key={item.label} style={{ background: 'white', border: '1px solid #EDE8E3', borderRadius: '12px', padding: '14px 10px', textAlign: 'center' }}>
                <p style={{ fontSize: '11px', color: '#9B9B9B', textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 4px' }}>
                  {item.label}
                </p>
                <p style={{ fontSize: '13px', fontWeight: 500, color: '#1A1A1A', margin: 0 }}>
                  {String(item.value)}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* ── Profile sections ──────────────────────────────────────────────── */}
        <SectionCard title="Deen & Practice" fields={deenFields} />
        <SectionCard title="Family Dynamics" fields={familyFields} />
        <SectionCard title="Lifestyle" fields={lifestyleFields} />
        <SectionCard title="Marriage Goals" fields={marriageFields} />
        <SectionCard title="Spouse Preferences" fields={spouseFields} />
        <SectionCard title={isBrother ? 'Financial' : 'Career & Financial'} fields={financialFields} />
        <SectionCard title="Emotional & Mental Health" fields={emotionalFields} />
        <SectionCard title="Conflict & Communication" fields={conflictFields} />
        <SectionCard title={isBrother ? 'Household' : 'Career'} fields={householdCareerFields} />
        <SectionCard title="Marriage Vision" fields={visionFields} />
        <SectionCard title="Faith & Deen" fields={faithFields} />
        <SectionCard title="Character & Goals" fields={characterFields} />

        {/* ── Character Reference ───────────────────────────────────────────── */}
        <div style={{ background: 'white', border: '1px solid #EDE8E3', borderRadius: '16px', marginBottom: '12px', overflow: 'hidden' }}>
          <div style={{ padding: '14px 16px', borderBottom: '1px solid #EDE8E3' }}>
            <p style={{ fontSize: '11px', fontWeight: 500, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#9B9B9B', margin: 0 }}>
              Character Reference
            </p>
          </div>
          {!hasRef ? (
            <div style={{ padding: '16px' }}>
              <p style={{ fontSize: '14px', color: '#9B9B9B', margin: 0 }}>
                Reference questionnaire has been sent and is awaiting response.
              </p>
            </div>
          ) : ref.status === 'pending' ? (
            <div style={{ padding: '16px' }}>
              <span style={{ background: '#FFF8E6', color: '#92600A', fontSize: '12px', fontWeight: 500, padding: '4px 12px', borderRadius: '999px' }}>
                Reference pending verification
              </span>
            </div>
          ) : (
            <>
              <div style={{ padding: '12px 16px', borderBottom: '1px solid #F5F5F5' }}>
                <span style={{ background: '#E6F7F5', color: '#0A8A7A', fontSize: '12px', fontWeight: 500, padding: '4px 12px', borderRadius: '999px', display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <circle cx="6" cy="6" r="6" fill="#0A8A7A" />
                    <path d="M3 6L5 8L9 4" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                  Verified reference
                </span>
              </div>
              <FieldRow label="Referee" value={ref.referee_name} />
              <FieldRow label="Relationship" value={ref.referee_relationship} />
              <FieldRow label="How Long Known" value={ref.how_long_known} />
              <FieldRow label="Ready for Marriage" value={ref.ready_for_marriage} />
              <FieldRow label="Would Recommend" value={ref.would_recommend} />
              {ref.character_description && (
                <FieldRow label="Character" value={ref.character_description} fullWidth type="longtext" />
              )}
              {ref.islamic_practice_description && (
                <FieldRow label="Islamic Practice" value={ref.islamic_practice_description} fullWidth type="longtext" />
              )}
            </>
          )}
        </div>

      </div>
    </div>
  )
}
