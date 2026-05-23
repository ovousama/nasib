'use client'

import { useRouter } from 'next/navigation'

type Section = {
  key: string
  label: string
  complete: boolean
  editPath: string
}

type Props = {
  gender: 'brother' | 'sister'
  profile: Record<string, unknown>
  completionPercentage: number
  referenceComplete: boolean
}

export default function ProfileChecklist({ gender, profile: p, completionPercentage, referenceComplete }: Props) {
  const router = useRouter()

  if (completionPercentage >= 80) return null

  const brotherSections: Section[] = [
    {
      key: 'basic',
      label: 'Basic information',
      complete: !!(p?.full_name && p?.age && p?.location),
      editPath: '/dashboard/profile/edit/basic',
    },
    {
      key: 'deen',
      label: 'Deen & practice',
      complete: !!(p?.religiosity_level && p?.prayer_frequency),
      editPath: '/dashboard/profile/edit/deen',
    },
    {
      key: 'family',
      label: 'Family values',
      complete: !!(p?.parent_relationship && p?.family_conflict_style),
      editPath: '/dashboard/profile/edit/family',
    },
    {
      key: 'lifestyle',
      label: 'Lifestyle',
      complete: !!(p?.occupation && p?.education_level && p?.strict_halal_diet),
      editPath: '/dashboard/profile/edit/lifestyle',
    },
    {
      key: 'marriage',
      label: 'Marriage goals',
      complete: !!(p?.timeline_to_marry && p?.wants_children),
      editPath: '/dashboard/profile/edit/marriage',
    },
    {
      key: 'preferences',
      label: 'Spouse preferences',
      complete: !!((p?.dealbreakers as unknown[])?.length > 0 && p?.spouse_age_min),
      editPath: '/dashboard/profile/edit/preferences',
    },
    {
      key: 'financial',
      label: 'Financial',
      complete: !!(p?.annual_income_range && p?.savings_plan),
      editPath: '/dashboard/profile/edit/financial',
    },
    {
      key: 'emotional',
      label: 'Emotional & mental health',
      complete: !!(p?.stress_management && p?.therapy_experience),
      editPath: '/dashboard/profile/edit/emotional',
    },
    {
      key: 'communication',
      label: 'Conflict & communication',
      complete: !!(p?.conflict_style && p?.apology_speed),
      editPath: '/dashboard/profile/edit/communication',
    },
    {
      key: 'character',
      label: 'Character & goals',
      complete: !!(p?.character_description && p?.goals),
      editPath: '/dashboard/profile/edit/character',
    },
    {
      key: 'vision',
      label: 'Marriage vision',
      complete: !!(p?.marriage_vision_10_years && p?.marriage_fear),
      editPath: '/dashboard/profile/edit/vision',
    },
    {
      key: 'photos',
      label: `Profile photos (${(p?.photo_urls as string[])?.length ?? 0}/3 minimum)`,
      complete: ((p?.photo_urls as string[])?.length ?? 0) >= 3,
      editPath: '/dashboard/profile/edit/photo',
    },
    {
      key: 'reference',
      label: 'Reference',
      complete: referenceComplete,
      editPath: '/dashboard/profile/edit/reference',
    },
  ]

  const sisterSections: Section[] = [
    {
      key: 'basic',
      label: 'Basic information',
      complete: !!(p?.full_name && p?.age && p?.location),
      editPath: '/dashboard/profile/edit/basic',
    },
    {
      key: 'deen',
      label: 'Deen & practice',
      complete: !!(p?.religiosity_level && p?.prayer_frequency),
      editPath: '/dashboard/profile/edit/deen',
    },
    {
      key: 'family',
      label: 'Family values',
      complete: !!(p?.parent_relationship && p?.family_conflict_style),
      editPath: '/dashboard/profile/edit/family',
    },
    {
      key: 'lifestyle',
      label: 'Lifestyle',
      complete: !!(p?.occupation && p?.education_level && p?.strict_halal_diet),
      editPath: '/dashboard/profile/edit/lifestyle',
    },
    {
      key: 'marriage',
      label: 'Marriage goals',
      complete: !!(p?.timeline_to_marry && p?.wants_children),
      editPath: '/dashboard/profile/edit/marriage',
    },
    {
      key: 'preferences',
      label: 'Spouse preferences',
      complete: !!((p?.dealbreakers as unknown[])?.length > 0 && p?.spouse_age_min),
      editPath: '/dashboard/profile/edit/preferences',
    },
    {
      key: 'career',
      label: 'Career & finances',
      complete: !!(p?.plan_to_work_after_marriage || p?.career_pause_for_children),
      editPath: '/dashboard/profile/edit/career',
    },
    {
      key: 'emotional',
      label: 'Emotional & mental health',
      complete: !!(p?.stress_management && p?.therapy_experience),
      editPath: '/dashboard/profile/edit/emotional',
    },
    {
      key: 'communication',
      label: 'Conflict & communication',
      complete: !!(p?.conflict_style && p?.apology_speed),
      editPath: '/dashboard/profile/edit/communication',
    },
    {
      key: 'character',
      label: 'Character & goals',
      complete: !!(p?.character_description && p?.goals),
      editPath: '/dashboard/profile/edit/character',
    },
    {
      key: 'vision',
      label: 'Marriage vision',
      complete: !!(p?.marriage_vision_10_years && p?.marriage_fear),
      editPath: '/dashboard/profile/edit/vision',
    },
    {
      key: 'photos',
      label: `Profile photos (${(p?.photo_urls as string[])?.length ?? 0}/3 minimum)`,
      complete: ((p?.photo_urls as string[])?.length ?? 0) >= 3,
      editPath: '/dashboard/profile/edit/photos',
    },
    {
      key: 'reference',
      label: 'Reference',
      complete: referenceComplete,
      editPath: '/dashboard/profile/edit/reference',
    },
  ]

  const sections = gender === 'brother' ? brotherSections : sisterSections

  return (
    <div style={{
      background: 'white',
      border: '1px solid #EDE8E3',
      borderRadius: '20px',
      padding: '24px',
      marginBottom: '32px',
    }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
        <div>
          <p style={{ fontSize: '16px', fontWeight: 500, color: '#1A1A1A', marginBottom: '4px' }}>
            Complete your profile
          </p>
          <p style={{ fontSize: '13px', color: '#9B9B9B' }}>
            Reach 80% to unlock your matches
          </p>
        </div>
        <span style={{ fontSize: '20px', fontWeight: 500, color: '#AF4D98' }}>
          {completionPercentage}%
        </span>
      </div>

      {/* Progress bar */}
      <div style={{ height: '6px', background: '#EDE8E3', borderRadius: '3px', overflow: 'hidden', marginBottom: '20px' }}>
        <div style={{
          height: '100%',
          width: `${completionPercentage}%`,
          background: 'linear-gradient(90deg, #AF4D98, #D66BA0)',
          borderRadius: '3px',
          transition: 'width 0.5s ease',
        }} />
      </div>

      {/* Section checklist */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
        {sections.map(section => (
          <div
            key={section.key}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '10px 12px',
              borderRadius: '10px',
              background: section.complete ? '#F9F9F9' : 'white',
              cursor: section.complete ? 'default' : 'pointer',
            }}
            onClick={() => !section.complete && router.push(section.editPath)}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{
                width: '20px',
                height: '20px',
                borderRadius: '50%',
                background: section.complete ? '#AF4D98' : 'transparent',
                border: section.complete ? 'none' : '2px solid #EDE8E3',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}>
                {section.complete && (
                  <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                    <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </div>
              <span style={{
                fontSize: '14px',
                color: section.complete ? '#9B9B9B' : '#1A1A1A',
                textDecoration: section.complete ? 'line-through' : 'none',
              }}>
                {section.label}
              </span>
            </div>
            {!section.complete && (
              <span style={{ fontSize: '13px', color: '#AF4D98', fontWeight: 500 }}>
                Complete →
              </span>
            )}
          </div>
        ))}
      </div>

      {/* Bottom actions */}
      <div style={{
        display: 'flex',
        gap: '12px',
        marginTop: '20px',
        paddingTop: '20px',
        borderTop: '1px solid #EDE8E3',
      }}>
        <button
          onClick={() => router.push('/onboarding')}
          style={{
            flex: 1,
            background: '#AF4D98',
            color: 'white',
            border: 'none',
            borderRadius: '999px',
            padding: '12px 20px',
            fontSize: '14px',
            fontWeight: 500,
            cursor: 'pointer',
          }}
        >
          Guided tour →
        </button>
        <button
          onClick={() => router.push('/dashboard/profile')}
          style={{
            flex: 1,
            background: 'white',
            color: '#AF4D98',
            border: '1px solid #AF4D98',
            borderRadius: '999px',
            padding: '12px 20px',
            fontSize: '14px',
            fontWeight: 500,
            cursor: 'pointer',
          }}
        >
          Edit by section
        </button>
      </div>
    </div>
  )
}
