'use client'
/* eslint-disable @typescript-eslint/no-explicit-any */

import React from 'react'
import { formatFieldValue, SLIDER_LABELS } from '@/lib/field-labels'

// ─── SVG Icons ────────────────────────────────────────────────────────────────

function IconMoon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  )
}
function IconBriefcase() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="16" height="16">
      <rect x="2" y="7" width="20" height="14" rx="2" />
      <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
    </svg>
  )
}
function IconHeart() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  )
}
function IconWallet() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="16" height="16">
      <path d="M20 12V8H6a2 2 0 0 1-2-2c0-1.1.9-2 2-2h12v4" />
      <path d="M4 6v12c0 1.1.9 2 2 2h14v-4" />
      <path d="M18 12a2 2 0 0 0-2 2c0 1.1.9 2 2 2h4v-4h-4z" />
    </svg>
  )
}
function IconStar() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  )
}
function IconSmile() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="16" height="16">
      <circle cx="12" cy="12" r="10" />
      <path d="M8 14s1.5 2 4 2 4-2 4-2" />
      <line x1="9" y1="9" x2="9.01" y2="9" />
      <line x1="15" y1="9" x2="15.01" y2="9" />
    </svg>
  )
}
function IconUsers() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="16" height="16">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  )
}
function IconSliders() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="16" height="16">
      <line x1="4" y1="21" x2="4" y2="14" />
      <line x1="4" y1="10" x2="4" y2="3" />
      <line x1="12" y1="21" x2="12" y2="12" />
      <line x1="12" y1="8" x2="12" y2="3" />
      <line x1="20" y1="21" x2="20" y2="16" />
      <line x1="20" y1="12" x2="20" y2="3" />
      <line x1="1" y1="14" x2="7" y2="14" />
      <line x1="9" y1="8" x2="15" y2="8" />
      <line x1="17" y1="16" x2="23" y2="16" />
    </svg>
  )
}

// ─── Types ────────────────────────────────────────────────────────────────────

type FieldType = 'short' | 'longtext' | 'array' | 'slider'

interface FieldConfig {
  key: string
  label: string
  type: FieldType
}

interface SectionConfig {
  key: string
  title: string
  icon: React.ReactNode
  summaryKeys: string[]
  getFields: (gender: 'brother' | 'sister') => FieldConfig[]
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function isEmpty(v: any): boolean {
  if (v === null || v === undefined || v === '') return true
  if (Array.isArray(v) && v.length === 0) return true
  return false
}

const EDUCATION_SHORT: Record<string, string> = {
  high_school: 'High school',
  some_college: 'Some college',
  bachelors: "Bachelor's",
  masters: "Master's",
  doctorate: 'PhD',
  professional: 'Professional',
  trade: 'Trade',
}

function getSummaryValue(key: string, value: any): string | null {
  if (isEmpty(value)) return null
  if (key === 'smoking' && value === 'never') return 'Non-smoker'
  if (key === 'education_level') return EDUCATION_SHORT[value] ?? formatFieldValue(value, key)
  if (key === 'emotional_availability') return `${Math.round(Number(value))}% open`
  if (Array.isArray(value)) {
    const first = formatFieldValue(value[0], key)
    return value.length > 1 ? `${first} +${value.length - 1}` : first
  }
  return formatFieldValue(value, key) || null
}

// ─── SECTIONS config ──────────────────────────────────────────────────────────

const SECTIONS: SectionConfig[] = [
  {
    key: 'deen',
    title: 'Deen & Practice',
    icon: <IconMoon />,
    summaryKeys: ['prayer_frequency', 'madhab'],
    getFields: (gender) => [
      { key: 'religiosity_level', label: 'Level of Islamic practice', type: 'short' },
      { key: 'prayer_frequency', label: 'How often do you pray?', type: 'short' },
      { key: 'madhab', label: 'Do you follow a specific madhab?', type: 'short' },
      { key: 'islamic_knowledge_level', label: 'Islamic knowledge level', type: 'short' },
      gender === 'brother'
        ? { key: 'has_beard', label: 'Do you have a beard?', type: 'short' as FieldType }
        : { key: 'wears_hijab', label: 'Do you wear hijab?', type: 'short' as FieldType },
      { key: 'traditional_vs_reformist', label: 'Traditional or reformist in Islamic approach?', type: 'slider' },
      { key: 'do_you_listen_to_music', label: 'Do you listen to music?', type: 'short' },
    ],
  },
  {
    key: 'lifestyle',
    title: 'Lifestyle',
    icon: <IconBriefcase />,
    summaryKeys: ['occupation', 'education_level', 'smoking'],
    getFields: () => [
      { key: 'occupation', label: 'What is your occupation?', type: 'short' },
      { key: 'education_level', label: 'Highest level of education', type: 'short' },
      { key: 'living_situation', label: 'Where are you currently living?', type: 'short' },
      { key: 'willing_to_relocate', label: 'Would you be willing to relocate for marriage?', type: 'short' },
      { key: 'smoking', label: 'Do you smoke or use tobacco/vape products?', type: 'short' },
      { key: 'strict_halal_diet', label: 'How strictly do you follow a halal diet?', type: 'short' },
    ],
  },
  {
    key: 'marriage',
    title: 'Marriage',
    icon: <IconHeart />,
    summaryKeys: ['timeline_to_marry', 'wants_children', 'previously_married'],
    getFields: (gender) => [
      { key: 'timeline_to_marry', label: 'What is your timeline for getting married?', type: 'short' },
      { key: 'previously_married', label: 'Have you been married before?', type: 'short' },
      { key: 'has_children', label: 'Do you have children?', type: 'short' },
      { key: 'wants_children', label: 'Do you want children?', type: 'short' },
      { key: 'number_of_children_wanted', label: 'How many children would you like?', type: 'short' },
      { key: 'polygamy_openness', label: 'What is your view on polygamy?', type: 'short' },
      ...(gender === 'brother'
        ? [{ key: 'wife_working_openness', label: "Are you open to your wife working after marriage?", type: 'short' as FieldType }]
        : []),
      { key: 'inlaws_living_together', label: 'Would you be open to in-laws living with you?', type: 'short' },
    ],
  },
  {
    key: 'financial',
    title: 'Financial',
    icon: <IconWallet />,
    summaryKeys: ['financial_readiness', 'plan_to_work_after_marriage', 'has_significant_debt'],
    getFields: (gender) => gender === 'brother'
      ? [
          { key: 'financial_readiness', label: 'How financially ready are you for marriage?', type: 'short' },
          { key: 'has_significant_debt', label: 'Do you have significant debt?', type: 'short' },
          { key: 'mahr_approach', label: 'What is your approach to mahr?', type: 'longtext' },
        ]
      : [
          { key: 'plan_to_work_after_marriage', label: 'Do you plan to work after marriage?', type: 'short' },
          { key: 'financial_independence_importance', label: 'How important is financial independence to you?', type: 'short' },
          { key: 'has_significant_debt', label: 'Do you have significant debt?', type: 'short' },
        ],
  },
  {
    key: 'character',
    title: 'Character & Goals',
    icon: <IconStar />,
    summaryKeys: ['introvert_extrovert', 'conflict_style'],
    getFields: () => [
      { key: 'conflict_style', label: 'How do you handle conflict?', type: 'short' },
      { key: 'love_language', label: 'What are your love languages?', type: 'array' },
      { key: 'introvert_extrovert', label: 'Are you more of an introvert or extrovert?', type: 'short' },
      { key: 'marriage_vision_10_years', label: 'Where do you see your marriage in 10 years?', type: 'longtext' },
      { key: 'romance_view', label: 'What role does romance play in long-term marriage?', type: 'longtext' },
      { key: 'marriage_fear', label: 'What is your biggest fear about marriage?', type: 'longtext' },
      { key: 'unique_contribution', label: 'What do you uniquely bring to a marriage?', type: 'longtext' },
    ],
  },
  {
    key: 'emotional',
    title: 'Emotional',
    icon: <IconSmile />,
    summaryKeys: ['emotional_availability'],
    getFields: () => [
      { key: 'emotional_availability', label: 'How emotionally available are you in relationships?', type: 'slider' },
      { key: 'stress_management', label: 'How do you manage stress?', type: 'longtext' },
      { key: 'health_background_disclosure', label: 'Is there anything about your health or background a potential spouse should know?', type: 'longtext' },
    ],
  },
  {
    key: 'family',
    title: 'Family',
    icon: <IconUsers />,
    summaryKeys: ['inlaws_living_together'],
    getFields: () => [
      { key: 'parent_relationship', label: 'How would you describe your relationship with your parents?', type: 'longtext' },
      { key: 'family_spouse_disagreement', label: 'How would you handle a conflict between your family and your spouse?', type: 'longtext' },
    ],
  },
  {
    key: 'preferences',
    title: 'Spouse Preferences',
    icon: <IconSliders />,
    summaryKeys: ['spouse_religiosity_preference'],
    getFields: () => [
      { key: 'spouse_religiosity_preference', label: 'What level of practice do you prefer in a spouse?', type: 'short' },
      { key: '_age_range', label: 'Preferred age range', type: 'short' },
      { key: 'dealbreakers', label: 'What are your dealbreakers?', type: 'array' },
    ],
  },
]

// ─── Field renderers ──────────────────────────────────────────────────────────

const QUOTE_STYLE: React.CSSProperties = {
  fontFamily: 'var(--font-cormorant), Cormorant Garamond, serif',
  fontSize: '15px',
  fontStyle: 'italic',
  color: '#3D3D3D',
  lineHeight: 1.75,
  margin: 0,
}

function ShortField({ label, value, fieldKey }: { label: string; value: any; fieldKey: string }) {
  if (isEmpty(value)) return null
  const display = typeof value === 'boolean'
    ? (value ? 'Yes' : 'No')
    : formatFieldValue(value, fieldKey)
  if (!display) return null
  return (
    <div style={{
      background: 'rgba(245,230,242,0.18)',
      border: '1px solid rgba(175,77,152,0.09)',
      borderRadius: '12px',
      padding: '12px 14px',
    }}>
      <p style={{ fontSize: '11px', color: '#9B7090', margin: '0 0 5px', fontWeight: 500, lineHeight: 1.3 }}>
        {label}
      </p>
      <p style={{ fontSize: '14px', color: '#1A1A1A', fontWeight: 500, margin: 0, lineHeight: 1.4 }}>
        {display}
      </p>
    </div>
  )
}

function LongTextField({ label, value }: { label: string; value: any }) {
  if (isEmpty(value)) return null
  return (
    <div style={{ marginTop: '4px' }}>
      <p style={{ fontSize: '12px', color: '#9B7090', margin: '0 0 8px', fontWeight: 500 }}>
        {label}
      </p>
      <div style={{
        background: 'rgba(175,77,152,0.04)',
        borderLeft: '3px solid rgba(175,77,152,0.25)',
        borderRadius: '0 10px 10px 0',
        padding: '12px 16px',
      }}>
        <p style={QUOTE_STYLE}>
          &ldquo;{String(value)}&rdquo;
        </p>
      </div>
    </div>
  )
}

function ArrayField({ label, value, fieldKey }: { label: string; value: any; fieldKey: string }) {
  if (!Array.isArray(value) || value.length === 0) return null
  return (
    <div style={{ marginTop: '4px' }}>
      <p style={{ fontSize: '12px', color: '#9B7090', margin: '0 0 8px', fontWeight: 500 }}>
        {label}
      </p>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
        {value.map((v: any, i: number) => (
          <span key={i} style={{
            background: '#F5E6F2',
            color: '#7B2F6E',
            fontSize: '12px',
            fontWeight: 500,
            padding: '4px 12px',
            borderRadius: '999px',
          }}>
            {formatFieldValue(v, fieldKey)}
          </span>
        ))}
      </div>
    </div>
  )
}

function SliderField({ label, fieldKey, value }: { label: string; fieldKey: string; value: any }) {
  if (isEmpty(value)) return null
  const cfg = SLIDER_LABELS[fieldKey] ?? { left: 'Low', right: 'High' }
  const pct = Math.max(0, Math.min(100, Number(value) || 0))
  return (
    <div style={{
      background: 'rgba(245,230,242,0.18)',
      border: '1px solid rgba(175,77,152,0.09)',
      borderRadius: '12px',
      padding: '12px 14px',
    }}>
      <p style={{ fontSize: '11px', color: '#9B7090', margin: '0 0 10px', fontWeight: 500 }}>
        {label}
      </p>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span style={{ fontSize: '10px', color: '#9B7090', flexShrink: 0 }}>{cfg.left}</span>
        <div style={{ flex: 1, height: '5px', background: 'rgba(175,77,152,0.15)', borderRadius: '3px', overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${pct}%`, background: 'linear-gradient(90deg, #AF4D98, #D66BA0)', borderRadius: '3px' }} />
        </div>
        <span style={{ fontSize: '10px', color: '#9B7090', flexShrink: 0 }}>{cfg.right}</span>
      </div>
    </div>
  )
}

// ─── Section Card ─────────────────────────────────────────────────────────────

interface SectionCardProps {
  section: SectionConfig
  profileData: Record<string, any>
  gender: 'brother' | 'sister'
  editHref?: string
}

function StorySectionCard({ section, profileData, gender, editHref }: SectionCardProps) {
  const p = profileData
  const fields = section.getFields(gender)

  // Build age range synthetic field
  const resolvedData: Record<string, any> = { ...p }
  if (p.spouse_age_min && p.spouse_age_max) {
    resolvedData['_age_range'] = `${p.spouse_age_min}–${p.spouse_age_max}`
  }

  const hasAnyValue = fields.some(f => !isEmpty(resolvedData[f.key]))
  if (!hasAnyValue) return null

  const shortFields = fields.filter(f => f.type === 'short')
  const otherFields = fields.filter(f => f.type !== 'short')

  const summaryPills = section.summaryKeys
    .map(k => getSummaryValue(k, resolvedData[k]))
    .filter(Boolean) as string[]

  return (
    <div style={{
      background: 'rgba(255,255,255,0.88)',
      border: '1px solid rgba(175,77,152,0.12)',
      borderRadius: '18px',
      marginBottom: '14px',
      overflow: 'hidden',
    }}>
      {/* Header */}
      <div style={{
        padding: '14px 18px',
        borderBottom: '1px solid rgba(175,77,152,0.08)',
        display: 'flex',
        alignItems: 'flex-start',
        gap: '10px',
      }}>
        <div style={{
          width: '32px',
          height: '32px',
          borderRadius: '10px',
          background: 'linear-gradient(135deg, rgba(175,77,152,0.15), rgba(175,77,152,0.08))',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#AF4D98',
          flexShrink: 0,
          marginTop: '1px',
        }}>
          {section.icon}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: summaryPills.length > 0 ? '8px' : '0' }}>
            <p style={{ fontSize: '13px', fontWeight: 600, color: '#1A1A1A', margin: 0 }}>
              {section.title}
            </p>
            {editHref && (
              <a href={editHref} style={{ fontSize: '12px', color: '#AF4D98', fontWeight: 500, textDecoration: 'none', flexShrink: 0, marginLeft: '8px' }}>
                Edit
              </a>
            )}
          </div>
          {summaryPills.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
              {summaryPills.map((pill, i) => (
                <span key={i} style={{
                  background: 'rgba(175,77,152,0.08)',
                  color: '#7B2F6E',
                  fontSize: '11px',
                  fontWeight: 500,
                  padding: '3px 9px',
                  borderRadius: '999px',
                }}>
                  {pill}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Body */}
      <div style={{ padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {/* Short fields — 2-col responsive grid */}
        {shortFields.some(f => !isEmpty(resolvedData[f.key])) && (
          <div className="grid grid-cols-1 sm:grid-cols-2" style={{ gap: '10px' }}>
            {shortFields.map(f => (
              <ShortField key={f.key} label={f.label} value={resolvedData[f.key]} fieldKey={f.key} />
            ))}
          </div>
        )}

        {/* Other fields (longtext, array, slider) */}
        {otherFields.map(f => {
          const val = resolvedData[f.key]
          if (f.type === 'longtext') return <LongTextField key={f.key} label={f.label} value={val} />
          if (f.type === 'array') return <ArrayField key={f.key} label={f.label} value={val} fieldKey={f.key} />
          if (f.type === 'slider') return <SliderField key={f.key} label={f.label} fieldKey={f.key} value={val} />
          return null
        })}
      </div>
    </div>
  )
}

// ─── Bio card ─────────────────────────────────────────────────────────────────

export function BioCard({ description, editHref }: { description?: string | null; editHref?: string }) {
  if (!description) return null
  return (
    <div style={{
      background: 'rgba(255,255,255,0.88)',
      border: '1px solid rgba(175,77,152,0.12)',
      borderRadius: '18px',
      padding: '20px 22px',
      marginBottom: '14px',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
        <p style={{ fontSize: '11px', fontWeight: 600, color: '#AF4D98', textTransform: 'uppercase', letterSpacing: '0.1em', margin: 0 }}>
          In their own words
        </p>
        {editHref && (
          <a href={editHref} style={{ fontSize: '12px', color: '#AF4D98', fontWeight: 500, textDecoration: 'none' }}>
            Edit
          </a>
        )}
      </div>
      <p style={{ ...QUOTE_STYLE, fontSize: '16px' }}>
        &ldquo;{description}&rdquo;
      </p>
    </div>
  )
}

// ─── Goals card ───────────────────────────────────────────────────────────────

export function GoalsCard({ goals, editHref }: { goals?: string | null; editHref?: string }) {
  if (!goals) return null
  return (
    <div style={{
      background: 'linear-gradient(135deg, rgba(175,77,152,0.06) 0%, rgba(244,228,186,0.25) 100%)',
      border: '1px solid rgba(175,77,152,0.12)',
      borderRadius: '18px',
      padding: '20px 22px',
      marginBottom: '14px',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
        <p style={{ fontSize: '11px', fontWeight: 600, color: '#AF4D98', textTransform: 'uppercase', letterSpacing: '0.1em', margin: 0 }}>
          What they hope to build together
        </p>
        {editHref && (
          <a href={editHref} style={{ fontSize: '12px', color: '#AF4D98', fontWeight: 500, textDecoration: 'none' }}>
            Edit
          </a>
        )}
      </div>
      <p style={QUOTE_STYLE}>
        &ldquo;{goals}&rdquo;
      </p>
    </div>
  )
}

// ─── ProfileSections (main export) ───────────────────────────────────────────

interface ProfileSectionsProps {
  profileData: Record<string, any>
  gender: 'brother' | 'sister'
  editPaths?: Record<string, string>
}

export default function ProfileSections({ profileData, gender, editPaths }: ProfileSectionsProps) {
  return (
    <>
      {SECTIONS.map(section => (
        <StorySectionCard
          key={section.key}
          section={section}
          profileData={profileData}
          gender={gender}
          editHref={editPaths?.[section.key]}
        />
      ))}
    </>
  )
}
