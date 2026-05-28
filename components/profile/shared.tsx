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

export function buildProfileSections(p: Record<string, any>, gender: 'brother' | 'sister', editPaths?: Record<string, string>): SectionDef[] {
  const lbl = (key: string) => getFieldLabel(key, gender)
  const ed = (k: string) => editPaths?.[k]
  const brother = gender === 'brother'

  const ageRange = p.spouse_age_min && p.spouse_age_max ? `${p.spouse_age_min}–${p.spouse_age_max}` : null

  return [
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
        { label: lbl('traditional_vs_reformist'), value: p.traditional_vs_reformist, type: 'slider' as FieldType, fieldKey: 'traditional_vs_reformist' },
        { label: lbl('do_you_listen_to_music'), value: p.do_you_listen_to_music, fieldKey: 'do_you_listen_to_music' },
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
        { label: lbl('smoking'), value: p.smoking, fieldKey: 'smoking' },
        { label: lbl('strict_halal_diet'), value: p.strict_halal_diet, fieldKey: 'strict_halal_diet' },
      ],
    },

    {
      key: 'marriage',
      title: 'Marriage',
      editHref: ed('marriage'),
      fields: [
        { label: lbl('timeline_to_marry'), value: p.timeline_to_marry, fieldKey: 'timeline_to_marry' },
        { label: lbl('previously_married'), value: p.previously_married, fieldKey: 'previously_married' },
        { label: lbl('has_children'), value: p.has_children, fieldKey: 'has_children' },
        { label: lbl('wants_children'), value: p.wants_children, fieldKey: 'wants_children' },
        { label: lbl('number_of_children_wanted'), value: p.number_of_children_wanted, fieldKey: 'number_of_children_wanted' },
        { label: lbl('polygamy_openness'), value: p.polygamy_openness, fieldKey: 'polygamy_openness' },
        ...(brother ? [{ label: lbl('wife_working_openness'), value: p.wife_working_openness, fieldKey: 'wife_working_openness' }] : []),
        { label: lbl('inlaws_living_together'), value: p.inlaws_living_together, fieldKey: 'inlaws_living_together' },
      ],
    },

    {
      key: 'preferences',
      title: 'Spouse Preferences',
      editHref: ed('preferences'),
      fields: [
        { label: lbl('spouse_religiosity_preference'), value: p.spouse_religiosity_preference, fieldKey: 'spouse_religiosity_preference' },
        { label: 'Preferred age range', value: ageRange },
        { label: lbl('dealbreakers'), value: p.dealbreakers, type: 'array' as FieldType, fieldKey: 'dealbreakers' },
      ],
    },

    {
      key: 'financial',
      title: brother ? 'Financial' : 'Career & Financial',
      editHref: ed('financial'),
      fields: brother
        ? [
            { label: lbl('financial_readiness'), value: p.financial_readiness, fieldKey: 'financial_readiness' },
            { label: lbl('has_significant_debt'), value: p.has_significant_debt, fieldKey: 'has_significant_debt' },
            { label: lbl('mahr_approach'), value: p.mahr_approach, type: 'longtext' as FieldType, fieldKey: 'mahr_approach' },
          ]
        : [
            { label: lbl('plan_to_work_after_marriage'), value: p.plan_to_work_after_marriage, fieldKey: 'plan_to_work_after_marriage' },
            { label: lbl('financial_independence_importance'), value: p.financial_independence_importance, fieldKey: 'financial_independence_importance' },
            { label: lbl('has_significant_debt'), value: p.has_significant_debt, fieldKey: 'has_significant_debt' },
          ],
    },

    {
      key: 'character',
      title: 'Character & Goals',
      editHref: ed('character'),
      fields: [
        { label: lbl('character_description'), value: p.character_description, type: 'longtext' as FieldType, fieldKey: 'character_description' },
        { label: lbl('goals'), value: p.goals, type: 'longtext' as FieldType, fieldKey: 'goals' },
        { label: lbl('conflict_style'), value: p.conflict_style, fieldKey: 'conflict_style' },
        { label: lbl('love_language'), value: p.love_language, type: 'array' as FieldType, fieldKey: 'love_language' },
        { label: lbl('introvert_extrovert'), value: p.introvert_extrovert, fieldKey: 'introvert_extrovert' },
        { label: lbl('marriage_vision_10_years'), value: p.marriage_vision_10_years, type: 'longtext' as FieldType, fieldKey: 'marriage_vision_10_years' },
        { label: lbl('romance_view'), value: p.romance_view, type: 'longtext' as FieldType, fieldKey: 'romance_view' },
        { label: lbl('marriage_fear'), value: p.marriage_fear, type: 'longtext' as FieldType, fieldKey: 'marriage_fear' },
        { label: lbl('unique_contribution'), value: p.unique_contribution, type: 'longtext' as FieldType, fieldKey: 'unique_contribution' },
      ],
    },

    {
      key: 'emotional',
      title: 'Emotional',
      editHref: ed('emotional'),
      fields: [
        { label: lbl('emotional_availability'), value: p.emotional_availability, type: 'slider' as FieldType, fieldKey: 'emotional_availability' },
        { label: lbl('stress_management'), value: p.stress_management, type: 'longtext' as FieldType, fieldKey: 'stress_management' },
        { label: lbl('health_background_disclosure'), value: p.health_background_disclosure, type: 'longtext' as FieldType, fieldKey: 'health_background_disclosure' },
      ],
    },

    {
      key: 'family',
      title: 'Family',
      editHref: ed('family'),
      fields: [
        { label: lbl('parent_relationship'), value: p.parent_relationship, type: 'longtext' as FieldType, fieldKey: 'parent_relationship' },
        { label: lbl('family_spouse_disagreement'), value: p.family_spouse_disagreement, type: 'longtext' as FieldType, fieldKey: 'family_spouse_disagreement' },
      ],
    },
  ]
}
