'use client'

/* eslint-disable @typescript-eslint/no-explicit-any */

import { useRouter } from 'next/navigation'
import ProfileHeader from './ProfileHeader'
import {
  SectionCard,
  FieldRow,
  MatchReasonCard,
  QuickFacts,
  CharacterBio,
  buildProfileSections,
} from './shared'

type Props = {
  profileData: Record<string, any>
  gender: 'brother' | 'sister'
  photoUrls: string[]
  connectionId: string | null
  verificationBadge: boolean
  isInterestContext: boolean
  photosVisible?: boolean
  matchReason?: string | null
}

const PAGE_BG = 'linear-gradient(160deg, #F5E6F2 0%, #F4E4BA 60%, #FDF8F3 100%)'

export default function ViewProfileClient({
  profileData,
  gender,
  photoUrls,
  connectionId,
  verificationBadge,
  isInterestContext,
  photosVisible = true,
  matchReason = null,
}: Props) {
  const router = useRouter()
  const p = profileData
  const firstName = String(p.full_name ?? '').split(' ')[0] || 'Profile'
  const sections = buildProfileSections(p, gender)

  const ref = p.reference as any
  const hasVerifiedRef = ref && typeof ref === 'object' && ref.status === 'completed'

  return (
    <div className="pt-14 lg:pt-[60px]" style={{ background: PAGE_BG, minHeight: '100vh' }}>
      {/* ── Sticky back nav ───────────────────────────────────────────────── */}
      <div className="sticky top-14 lg:top-[60px]" style={{
        background: 'rgba(255,255,255,0.85)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        zIndex: 10,
        borderBottom: '1px solid rgba(175,77,152,0.08)',
        padding: '12px 20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
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
            Chat
          </button>
        ) : (
          <div style={{ width: '60px' }} />
        )}
      </div>

      {/* ── Content wrapper ──────────────────────────────────────────────── */}
      <div style={{
        maxWidth: '720px',
        margin: '0 auto',
        padding: `24px 20px ${isInterestContext ? '112px' : '60px'}`,
      }}>
        <ProfileHeader
          fullName={String(p.full_name ?? '')}
          age={p.age}
          location={p.location}
          ethnicity={p.ethnicity}
          languages={p.languages}
          photoUrls={photoUrls}
          photosVisible={photosVisible}
          verificationBadge={verificationBadge}
        />

        <MatchReasonCard matchReason={matchReason} />

        <QuickFacts profileData={p} />

        <CharacterBio description={p.character_description} />

        {sections.map(section => (
          <SectionCard key={section.key} title={section.title} fields={section.fields} />
        ))}

        {hasVerifiedRef && (
          <SectionCard title="Character Reference">
            <div style={{ padding: '12px 18px', borderBottom: '1px solid rgba(175,77,152,0.06)' }}>
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
              <FieldRow label="Character" value={ref.character_description} type="longtext" />
            )}
            {ref.islamic_practice_description && (
              <FieldRow label="Islamic Practice" value={ref.islamic_practice_description} type="longtext" />
            )}
          </SectionCard>
        )}
      </div>
    </div>
  )
}
