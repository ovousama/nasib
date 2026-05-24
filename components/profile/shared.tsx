/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react'
import { formatFieldValue, getFieldLabel, SLIDER_LABELS, SLIDER_FIELDS } from '@/lib/field-labels'

export type FieldType = 'text' | 'longtext' | 'array' | 'slider' | 'boolean'

export type FieldDef = {
  label: string
  value: any
  type?: FieldType
  fieldKey?: string
}

export type SectionDef = {
  key: string
  title: string
  fields: FieldDef[]
  editHref?: string
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function isEmptyValue(v: any): boolean {
  if (v === null || v === undefined || v === '') return true
  if (Array.isArray(v) && v.length === 0) return true
  return false
}

function detectType(value: any, explicit?: FieldType, fieldKey?: string): FieldType {
  if (explicit) return explicit
  if (fieldKey && SLIDER_FIELDS.includes(fieldKey)) return 'slider'
  if (Array.isArray(value)) return 'array'
  if (typeof value === 'boolean') return 'boolean'
  if (typeof value === 'number') return 'text'
  if (typeof value === 'string' && value.length > 80) return 'longtext'
  return 'text'
}

// ─── FieldRow ─────────────────────────────────────────────────────────────────

export function FieldRow({ label, value, type, fieldKey }: FieldDef) {
  if (isEmptyValue(value)) return null
  const detected = detectType(value, type, fieldKey)

  // LONG TEXT — full width, label above, italic quote box below
  if (detected === 'longtext') {
    return (
      <div style={{ padding: '14px 18px 16px', borderBottom: '1px solid rgba(175,77,152,0.06)' }}>
        <p style={{ fontSize: '12px', color: '#9B7090', margin: '0 0 8px', fontWeight: 500 }}>
          {label}
        </p>
        <div style={{ background: 'rgba(245,230,242,0.4)', borderRadius: '10px', padding: '12px 14px' }}>
          <p style={{ fontSize: '14px', color: '#5C5C5C', lineHeight: 1.7, fontStyle: 'italic', margin: 0 }}>
            &ldquo;{String(value)}&rdquo;
          </p>
        </div>
      </div>
    )
  }

  // SLIDER — label left, slider with endpoint labels right
  if (detected === 'slider') {
    const sliderConfig = SLIDER_LABELS[fieldKey ?? ''] ?? { left: 'Low', right: 'High' }
    const pct = Math.max(0, Math.min(100, Number(value) || 0))
    return (
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 18px', borderBottom: '1px solid rgba(175,77,152,0.06)', gap: '12px' }}>
        <span style={{ fontSize: '13px', color: '#9B7090', flexShrink: 0 }}>{label}</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '10px', color: '#9B7090' }}>{sliderConfig.left}</span>
          <div style={{ width: '80px', height: '4px', background: 'rgba(175,77,152,0.15)', borderRadius: '2px', overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${pct}%`, background: '#AF4D98' }} />
          </div>
          <span style={{ fontSize: '10px', color: '#9B7090' }}>{sliderConfig.right}</span>
        </div>
      </div>
    )
  }

  // ARRAY — label left, pills aligned right
  if (detected === 'array') {
    return (
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', padding: '12px 18px', borderBottom: '1px solid rgba(175,77,152,0.06)', gap: '12px' }}>
        <span style={{ fontSize: '13px', color: '#9B7090', flexShrink: 0, paddingTop: '2px' }}>{label}</span>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', justifyContent: 'flex-end' }}>
          {(value as any[]).map((v, i) => (
            <span key={i} style={{ background: '#F5E6F2', color: '#7B2F6E', fontSize: '11px', fontWeight: 500, padding: '3px 9px', borderRadius: '999px' }}>
              {formatFieldValue(v, fieldKey)}
            </span>
          ))}
        </div>
      </div>
    )
  }

  // BOOLEAN — label left, Yes/No right
  if (detected === 'boolean') {
    return (
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 18px', borderBottom: '1px solid rgba(175,77,152,0.06)', gap: '12px' }}>
        <span style={{ fontSize: '13px', color: '#9B7090' }}>{label}</span>
        <span style={{ fontSize: '14px', color: value ? '#1A1A1A' : '#9B9B9B', fontWeight: 500 }}>
          {value ? 'Yes' : 'No'}
        </span>
      </div>
    )
  }

  // TEXT (default)
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 18px', borderBottom: '1px solid rgba(175,77,152,0.06)', gap: '12px' }}>
      <span style={{ fontSize: '13px', color: '#9B7090', flexShrink: 0 }}>{label}</span>
      <span style={{ fontSize: '14px', color: '#1A1A1A', fontWeight: 500, textAlign: 'right' }}>
        {formatFieldValue(value, fieldKey)}
      </span>
    </div>
  )
}

// ─── SectionCard ──────────────────────────────────────────────────────────────

export function SectionCard({ title, fields, editHref, children }: {
  title: string
  fields?: FieldDef[]
  editHref?: string
  children?: React.ReactNode
}) {
  const visibleFields = (fields ?? []).filter(f => !isEmptyValue(f.value))
  if (!children && visibleFields.length === 0) return null

  return (
    <div style={{
      background: 'rgba(255,255,255,0.85)',
      border: '1px solid rgba(175,77,152,0.12)',
      borderRadius: '16px',
      marginBottom: '14px',
      overflow: 'hidden',
    }}>
      <div style={{
        padding: '14px 18px',
        borderBottom: '1px solid rgba(175,77,152,0.1)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        <p style={{ fontSize: '11px', fontWeight: 600, color: '#9B7090', textTransform: 'uppercase', letterSpacing: '0.12em', margin: 0 }}>
          {title}
        </p>
        {editHref && (
          <a
            href={editHref}
            style={{ fontSize: '12px', color: '#AF4D98', fontWeight: 500, textDecoration: 'none' }}
          >
            Edit
          </a>
        )}
      </div>
      <div className="profile-section-rows">
        {children ?? visibleFields.map((f, i) => <FieldRow key={`${f.fieldKey ?? f.label}-${i}`} {...f} />)}
      </div>
    </div>
  )
}

// ─── Match reason card ────────────────────────────────────────────────────────

export function MatchReasonCard({ matchReason }: { matchReason?: string | null }) {
  if (matchReason === undefined || matchReason === null) return null
  if (matchReason.trim().length <= 10) {
    return (
      <p style={{ fontSize: '13px', color: '#9B9B9B', fontStyle: 'italic', margin: '8px 0 20px', textAlign: 'center' }}>
        Our team carefully selected this match based on your shared values and compatibility.
      </p>
    )
  }
  return (
    <div style={{
      background: 'rgba(175,77,152,0.06)',
      borderLeft: '3px solid #AF4D98',
      borderRadius: '0 12px 12px 0',
      padding: '14px 16px',
      marginBottom: '20px',
    }}>
      <p style={{ fontSize: '10px', fontWeight: 600, color: '#9B7090', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '6px', margin: '0 0 6px' }}>
        Why you matched
      </p>
      <p style={{ fontSize: '14px', color: '#5C5C5C', fontStyle: 'italic', lineHeight: 1.6, margin: 0 }}>
        &ldquo;{matchReason}&rdquo;
      </p>
    </div>
  )
}

// ─── Quick facts row ──────────────────────────────────────────────────────────

export function QuickFacts({ profileData }: { profileData: Record<string, any> }) {
  const items = [
    { label: 'Occupation', value: profileData.occupation ? formatFieldValue(profileData.occupation, 'occupation') : '' },
    { label: 'Education', value: profileData.education_level ? formatFieldValue(profileData.education_level, 'education_level') : '' },
    { label: 'Lives', value: profileData.living_situation ? formatFieldValue(profileData.living_situation, 'living_situation') : '' },
  ].filter(item => item.value)

  if (items.length === 0) return null

  return (
    <div style={{ display: 'grid', gridTemplateColumns: `repeat(${items.length}, 1fr)`, gap: '10px', marginBottom: '16px' }}>
      {items.map(item => (
        <div key={item.label} style={{
          background: 'rgba(255,255,255,0.85)',
          border: '1px solid rgba(175,77,152,0.12)',
          borderRadius: '12px',
          padding: '14px 10px',
          textAlign: 'center',
        }}>
          <p style={{ fontSize: '10px', color: '#9B7090', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 5px', fontWeight: 500 }}>
            {item.label}
          </p>
          <p style={{ fontSize: '13px', color: '#1A1A1A', fontWeight: 500, margin: 0 }}>
            {item.value}
          </p>
        </div>
      ))}
    </div>
  )
}

// ─── Character bio card ───────────────────────────────────────────────────────

export function CharacterBio({ description }: { description?: string | null }) {
  if (!description) return null
  return (
    <div style={{
      background: 'rgba(255,255,255,0.85)',
      border: '1px solid rgba(175,77,152,0.12)',
      borderRadius: '16px',
      padding: '18px 20px',
      marginBottom: '16px',
    }}>
      <p style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '16px', color: '#5C5C5C', lineHeight: 1.7, fontStyle: 'italic', margin: 0 }}>
        &ldquo;{description}&rdquo;
      </p>
    </div>
  )
}

// ─── buildProfileSections ─────────────────────────────────────────────────────

const isBro = (g: 'brother' | 'sister') => g === 'brother'

export function buildProfileSections(p: Record<string, any>, gender: 'brother' | 'sister', editPaths?: Record<string, string>): SectionDef[] {
  const lbl = (key: string) => getFieldLabel(key, gender)
  const ed = (k: string) => editPaths?.[k]
  const brother = isBro(gender)

  const childrenDisplay = (() => {
    if (p.has_children) return 'Has children'
    if (p.wants_children === true) return 'Wants children'
    if (p.wants_children === false) return 'Does not want children'
    if (p.wants_children === null || p.wants_children === undefined) return null
    return 'Open to children'
  })()

  const ageRange = p.spouse_age_min && p.spouse_age_max ? `${p.spouse_age_min}–${p.spouse_age_max}` : null

  const sections: SectionDef[] = [
    {
      key: 'deen',
      title: 'Deen & Practice',
      editHref: ed('deen'),
      fields: [
        { label: lbl('religiosity_level'), value: p.religiosity_level, fieldKey: 'religiosity_level' },
        { label: lbl('prayer_frequency'), value: p.prayer_frequency, fieldKey: 'prayer_frequency' },
        { label: lbl('madhab'), value: p.madhab, fieldKey: 'madhab' },
        { label: lbl('islamic_knowledge_level'), value: p.islamic_knowledge_level, fieldKey: 'islamic_knowledge_level' },
        brother
          ? { label: lbl('has_beard'), value: p.has_beard, fieldKey: 'has_beard' }
          : { label: lbl('wears_hijab'), value: p.wears_hijab, fieldKey: 'wears_hijab' },
        ...(brother
          ? [{ label: lbl('jumuah_attendance'), value: p.jumuah_attendance, fieldKey: 'jumuah_attendance' }]
          : [
              { label: lbl('hijab_outside_home'), value: p.hijab_outside_home, fieldKey: 'hijab_outside_home' },
              { label: lbl('islamic_classes_attendance'), value: p.islamic_classes_attendance, fieldKey: 'islamic_classes_attendance' },
            ]),
        { label: lbl('quran_listening'), value: p.quran_listening, fieldKey: 'quran_listening' },
        { label: lbl('quran_memorisation'), value: p.quran_memorisation, fieldKey: 'quran_memorisation' },
        { label: lbl('zakah_sadaqah'), value: p.zakah_sadaqah, fieldKey: 'zakah_sadaqah' },
        { label: lbl('traditional_vs_reformist'), value: p.traditional_vs_reformist, type: 'slider' as FieldType, fieldKey: 'traditional_vs_reformist' },
        { label: lbl('do_you_listen_to_music'), value: p.do_you_listen_to_music, fieldKey: 'do_you_listen_to_music' },
        { label: lbl('celebrate_non_islamic_holidays'), value: p.celebrate_non_islamic_holidays, fieldKey: 'celebrate_non_islamic_holidays' },
        { label: lbl('mawlid_view'), value: p.mawlid_view, fieldKey: 'mawlid_view' },
        { label: lbl('madhab_consistency'), value: p.madhab_consistency, fieldKey: 'madhab_consistency' },
        { label: lbl('spouse_islamic_knowledge'), value: p.spouse_islamic_knowledge, fieldKey: 'spouse_islamic_knowledge' },
        ...(brother
          ? [
              { label: lbl('wife_niqab_preference'), value: p.wife_niqab_preference, fieldKey: 'wife_niqab_preference' },
              { label: lbl('missed_prayer_approach'), value: p.missed_prayer_approach, fieldKey: 'missed_prayer_approach' },
            ]
          : [
              { label: lbl('islamic_home_importance'), value: p.islamic_home_importance, fieldKey: 'islamic_home_importance' },
            ]),
        { label: lbl('ramadan_routine'), value: p.ramadan_routine, type: 'longtext' as FieldType, fieldKey: 'ramadan_routine' },
        { label: lbl('deen_growth'), value: p.deen_growth, type: 'longtext' as FieldType, fieldKey: 'deen_growth' },
        ...(!brother ? [{ label: lbl('deen_when_busy'), value: p.deen_when_busy, type: 'longtext' as FieldType, fieldKey: 'deen_when_busy' }] : []),
        { label: lbl('differing_islamic_opinions'), value: p.differing_islamic_opinions, type: 'longtext' as FieldType, fieldKey: 'differing_islamic_opinions' },
      ],
    },

    {
      key: 'family',
      title: 'Family & Background',
      editHref: ed('family'),
      fields: [
        { label: lbl('ethnicity'), value: p.ethnicity, fieldKey: 'ethnicity' },
        { label: lbl('languages'), value: p.languages, type: 'array' as FieldType, fieldKey: 'languages' },
        { label: lbl('family_conflict_style'), value: p.family_conflict_style, fieldKey: 'family_conflict_style' },
        ...(brother
          ? [
              { label: lbl('wife_family_interaction'), value: p.wife_family_interaction, fieldKey: 'wife_family_interaction' },
              { label: lbl('eldest_responsibilities'), value: p.eldest_responsibilities, fieldKey: 'eldest_responsibilities' },
              { label: lbl('living_near_parents'), value: p.living_near_parents, fieldKey: 'living_near_parents' },
              { label: lbl('wife_family_relationship'), value: p.wife_family_relationship, fieldKey: 'wife_family_relationship' },
              { label: lbl('child_caregiving'), value: p.child_caregiving, fieldKey: 'child_caregiving' },
            ]
          : [
              { label: lbl('family_balance_after_marriage'), value: p.family_balance_after_marriage, fieldKey: 'family_balance_after_marriage' },
              { label: lbl('inlaws_comfort'), value: p.inlaws_comfort, fieldKey: 'inlaws_comfort' },
              { label: lbl('husband_family_relationship'), value: p.husband_family_relationship, fieldKey: 'husband_family_relationship' },
              { label: lbl('family_traditional_vs_modern'), value: p.family_traditional_vs_modern, type: 'slider' as FieldType, fieldKey: 'family_traditional_vs_modern' },
            ]),
        { label: lbl('cultural_background_importance'), value: p.cultural_background_importance, type: 'slider' as FieldType, fieldKey: 'cultural_background_importance' },
        { label: lbl('parent_relationship'), value: p.parent_relationship, type: 'longtext' as FieldType, fieldKey: 'parent_relationship' },
        { label: lbl('family_spouse_disagreement'), value: p.family_spouse_disagreement, type: 'longtext' as FieldType, fieldKey: 'family_spouse_disagreement' },
      ],
    },

    {
      key: 'lifestyle',
      title: 'Lifestyle',
      editHref: ed('lifestyle'),
      fields: [
        { label: lbl('occupation'), value: p.occupation, fieldKey: 'occupation' },
        { label: lbl('education_level'), value: p.education_level, fieldKey: 'education_level' },
        { label: lbl('living_situation'), value: p.living_situation, fieldKey: 'living_situation' },
        { label: lbl('willing_to_relocate'), value: p.willing_to_relocate, fieldKey: 'willing_to_relocate' },
        { label: lbl('strict_halal_diet'), value: p.strict_halal_diet, fieldKey: 'strict_halal_diet' },
        { label: lbl('smoking'), value: p.smoking, fieldKey: 'smoking' },
        { label: lbl('exercise_frequency'), value: p.exercise_frequency, fieldKey: 'exercise_frequency' },
        { label: lbl('healthy_eating_importance'), value: p.healthy_eating_importance, fieldKey: 'healthy_eating_importance' },
        { label: lbl('mixed_gender_social_circle'), value: p.mixed_gender_social_circle, fieldKey: 'mixed_gender_social_circle' },
        { label: lbl('pets_view'), value: p.pets_view, fieldKey: 'pets_view' },
        { label: lbl('social_media_view'), value: p.social_media_view, fieldKey: 'social_media_view' },
        brother
          ? { label: lbl('travel_frequency'), value: p.travel_frequency, fieldKey: 'travel_frequency' }
          : { label: lbl('travel_importance'), value: p.travel_importance, fieldKey: 'travel_importance' },
        { label: lbl('home_organisation'), value: p.home_organisation, type: 'slider' as FieldType, fieldKey: 'home_organisation' },
        { label: lbl('political_views'), value: p.political_views, fieldKey: 'political_views' },
        { label: lbl('alone_time_importance'), value: p.alone_time_importance, fieldKey: 'alone_time_importance' },
        { label: lbl('weekend_lifestyle'), value: p.weekend_lifestyle, type: 'longtext' as FieldType, fieldKey: 'weekend_lifestyle' },
      ],
    },

    {
      key: 'marriage',
      title: 'Marriage Vision',
      editHref: ed('marriage'),
      fields: [
        { label: lbl('timeline_to_marry'), value: p.timeline_to_marry, fieldKey: 'timeline_to_marry' },
        { label: 'Children', value: childrenDisplay },
        { label: lbl('number_of_children_wanted'), value: p.number_of_children_wanted, fieldKey: 'number_of_children_wanted' },
        { label: lbl('previously_married'), value: p.previously_married, fieldKey: 'previously_married' },
        { label: lbl('islamic_schooling_importance'), value: p.islamic_schooling_importance, fieldKey: 'islamic_schooling_importance' },
        { label: lbl('inlaws_living_together'), value: p.inlaws_living_together, fieldKey: 'inlaws_living_together' },
        { label: lbl('physical_intimacy_importance'), value: p.physical_intimacy_importance, fieldKey: 'physical_intimacy_importance' },
        { label: lbl('spouse_friendships_view'), value: p.spouse_friendships_view, fieldKey: 'spouse_friendships_view' },
        { label: lbl('marriage_vision_10_years'), value: p.marriage_vision_10_years, type: 'longtext' as FieldType, fieldKey: 'marriage_vision_10_years' },
        { label: lbl('first_year_vision'), value: p.first_year_vision, type: 'longtext' as FieldType, fieldKey: 'first_year_vision' },
        { label: lbl('romance_view'), value: p.romance_view, type: 'longtext' as FieldType, fieldKey: 'romance_view' },
        ...(!brother ? [{ label: lbl('ideal_husband_description'), value: p.ideal_husband_description, type: 'longtext' as FieldType, fieldKey: 'ideal_husband_description' }] : []),
      ],
    },

    {
      key: 'preferences',
      title: 'Spouse Preferences',
      editHref: ed('preferences'),
      fields: [
        { label: lbl('spouse_religiosity_preference'), value: p.spouse_religiosity_preference, fieldKey: 'spouse_religiosity_preference' },
        { label: 'Preferred Age Range', value: ageRange },
        { label: lbl('dealbreakers'), value: p.dealbreakers, type: 'array' as FieldType, fieldKey: 'dealbreakers' },
      ],
    },

    {
      key: 'financial',
      title: 'Career & Financial',
      editHref: ed('financial'),
      fields: brother
        ? [
            { label: lbl('annual_income_range'), value: p.annual_income_range, fieldKey: 'annual_income_range' },
            { label: lbl('own_or_rent'), value: p.own_or_rent, fieldKey: 'own_or_rent' },
            { label: lbl('financial_readiness'), value: p.financial_readiness, fieldKey: 'financial_readiness' },
            { label: lbl('has_significant_debt'), value: p.has_significant_debt, fieldKey: 'has_significant_debt' },
            { label: lbl('savings_plan'), value: p.savings_plan, fieldKey: 'savings_plan' },
            { label: lbl('supporting_family_financially'), value: p.supporting_family_financially, fieldKey: 'supporting_family_financially' },
            { label: lbl('wife_working_openness'), value: p.wife_working_openness, fieldKey: 'wife_working_openness' },
            { label: lbl('wife_financial_independence'), value: p.wife_financial_independence, fieldKey: 'wife_financial_independence' },
            { label: lbl('wife_earning_more'), value: p.wife_earning_more, fieldKey: 'wife_earning_more' },
            { label: lbl('hajj_status'), value: p.hajj_status, fieldKey: 'hajj_status' },
            { label: lbl('financial_planning_approach'), value: p.financial_planning_approach, type: 'longtext' as FieldType, fieldKey: 'financial_planning_approach' },
            { label: lbl('financial_stress_approach'), value: p.financial_stress_approach, type: 'longtext' as FieldType, fieldKey: 'financial_stress_approach' },
            { label: lbl('mahr_approach'), value: p.mahr_approach, type: 'longtext' as FieldType, fieldKey: 'mahr_approach' },
          ]
        : [
            { label: lbl('plan_to_work_after_marriage'), value: p.plan_to_work_after_marriage, fieldKey: 'plan_to_work_after_marriage' },
            { label: lbl('career_pause_for_children'), value: p.career_pause_for_children, fieldKey: 'career_pause_for_children' },
            { label: lbl('primary_caregiver_comfort'), value: p.primary_caregiver_comfort, fieldKey: 'primary_caregiver_comfort' },
            { label: lbl('financial_dependence_view'), value: p.financial_dependence_view, fieldKey: 'financial_dependence_view' },
            { label: lbl('financial_independence_importance'), value: p.financial_independence_importance, fieldKey: 'financial_independence_importance' },
            { label: lbl('has_significant_debt'), value: p.has_significant_debt, fieldKey: 'has_significant_debt' },
            { label: lbl('savings_plan'), value: p.savings_plan, fieldKey: 'savings_plan' },
            { label: lbl('supporting_family_financially'), value: p.supporting_family_financially, fieldKey: 'supporting_family_financially' },
            { label: lbl('career_identity_importance'), value: p.career_identity_importance, type: 'slider' as FieldType, fieldKey: 'career_identity_importance' },
            { label: lbl('career_five_years'), value: p.career_five_years, type: 'longtext' as FieldType, fieldKey: 'career_five_years' },
            { label: lbl('career_ambitions'), value: p.career_ambitions, type: 'longtext' as FieldType, fieldKey: 'career_ambitions' },
            { label: lbl('financial_stress_approach'), value: p.financial_stress_approach, type: 'longtext' as FieldType, fieldKey: 'financial_stress_approach' },
          ],
    },

    {
      key: 'emotional',
      title: 'Emotional & Mental Health',
      editHref: ed('emotional'),
      fields: [
        { label: lbl('therapy_experience'), value: p.therapy_experience, fieldKey: 'therapy_experience' },
        { label: lbl('couples_therapy_view'), value: p.couples_therapy_view, fieldKey: 'couples_therapy_view' },
        { label: lbl('mental_health_challenges'), value: p.mental_health_challenges, fieldKey: 'mental_health_challenges' },
        { label: lbl('emotional_expression_view'), value: p.emotional_expression_view, fieldKey: 'emotional_expression_view' },
        { label: lbl('emotional_availability'), value: p.emotional_availability, type: 'slider' as FieldType, fieldKey: 'emotional_availability' },
        { label: lbl('conflict_style'), value: p.conflict_style, fieldKey: 'conflict_style' },
        { label: lbl('introvert_extrovert'), value: p.introvert_extrovert, fieldKey: 'introvert_extrovert' },
        { label: lbl('apology_speed'), value: p.apology_speed, fieldKey: 'apology_speed' },
        { label: lbl('love_language'), value: p.love_language, type: 'array' as FieldType, fieldKey: 'love_language' },
        { label: lbl('stress_management'), value: p.stress_management, type: 'longtext' as FieldType, fieldKey: 'stress_management' },
        { label: lbl('healthy_argument_view'), value: p.healthy_argument_view, type: 'longtext' as FieldType, fieldKey: 'healthy_argument_view' },
        { label: lbl('emotional_support_style'), value: p.emotional_support_style, type: 'longtext' as FieldType, fieldKey: 'emotional_support_style' },
        { label: lbl('communication_when_upset'), value: p.communication_when_upset, type: 'longtext' as FieldType, fieldKey: 'communication_when_upset' },
        { label: lbl('significant_hardship'), value: p.significant_hardship, type: 'longtext' as FieldType, fieldKey: 'significant_hardship' },
      ],
    },

    {
      key: 'character',
      title: 'Character & Goals',
      editHref: ed('character'),
      fields: [
        { label: lbl('goals'), value: p.goals, type: 'longtext' as FieldType, fieldKey: 'goals' },
        { label: lbl('unique_contribution'), value: p.unique_contribution, type: 'longtext' as FieldType, fieldKey: 'unique_contribution' },
        { label: lbl('marriage_fear'), value: p.marriage_fear, type: 'longtext' as FieldType, fieldKey: 'marriage_fear' },
      ],
    },
  ]

  if (brother) {
    sections.push({
      key: 'polygamy',
      title: 'Polygamy',
      editHref: ed('marriage'),
      fields: [
        { label: lbl('polygamy_openness'), value: p.polygamy_openness, fieldKey: 'polygamy_openness' },
        { label: lbl('polygamy_own_marriage'), value: p.polygamy_own_marriage, type: 'longtext' as FieldType, fieldKey: 'polygamy_own_marriage' },
      ],
    })
  }

  return sections
}
