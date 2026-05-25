'use client'

/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @next/next/no-img-element */

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'
import ProfileHeader from './ProfileHeader'
import { SectionCard, FieldRow, buildProfileSections } from './shared'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
function toBrotherPhotoUrl(path: string | null | undefined): string | null {
  if (!path) return null
  if (path.startsWith('http')) return path
  return `${SUPABASE_URL}/storage/v1/object/public/brother-photos/${path}`
}

type Props = {
  gender: 'brother' | 'sister'
  genderProfile: Record<string, any>
  waliProfile: Record<string, any> | null
  reference: Record<string, any> | null
  completionPercentage: number
  isComplete: boolean
  verificationBadge: boolean
  userEmail: string
  memberSince: string
}

const PAGE_BG = 'linear-gradient(160deg, #F5E6F2 0%, #F4E4BA 60%, #FDF8F3 100%)'

const EDIT_PATHS: Record<string, string> = {
  deen: '/dashboard/profile/edit/deen',
  family: '/dashboard/profile/edit/family',
  lifestyle: '/dashboard/profile/edit/lifestyle',
  marriage: '/dashboard/profile/edit/marriage',
  preferences: '/dashboard/profile/edit/preferences',
  financial: '/dashboard/profile/edit/financial',
  emotional: '/dashboard/profile/edit/emotional',
  character: '/dashboard/profile/edit/character',
}

function CompletionBanner({ percentage }: { percentage: number }) {
  if (percentage >= 80) return null
  return (
    <div style={{
      background: 'rgba(255,255,255,0.85)',
      border: '1px solid rgba(175,77,152,0.12)',
      borderRadius: '16px',
      padding: '16px 18px',
      marginBottom: '16px',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
        <p style={{ fontSize: '13px', fontWeight: 500, color: '#1A1A1A', margin: 0 }}>
          Your profile is {percentage}% complete
        </p>
        <span style={{ fontSize: '12px', fontWeight: 500, color: '#AF4D98' }}>{percentage}%</span>
      </div>
      <div style={{ height: '6px', background: 'rgba(175,77,152,0.12)', borderRadius: '3px', overflow: 'hidden', marginBottom: '10px' }}>
        <div style={{ height: '100%', width: `${percentage}%`, background: 'linear-gradient(90deg, #AF4D98, #D66BA0)', borderRadius: '3px', transition: 'width 0.5s ease' }} />
      </div>
      <p style={{ fontSize: '12px', color: '#9B7090', margin: 0 }}>
        Reach 80% to unlock your matches. Each section below has an Edit button.
      </p>
    </div>
  )
}

export default function ProfilePageClient({
  gender,
  genderProfile: p,
  waliProfile,
  reference,
  completionPercentage,
  verificationBadge,
  userEmail,
  memberSince,
}: Props) {
  const isBrother = gender === 'brother'
  const [sisterSignedUrls, setSisterSignedUrls] = useState<string[]>([])

  useEffect(() => {
    if (isBrother) return
    const paths: string[] = Array.isArray(p?.photo_urls) ? p.photo_urls : []
    if (paths.length === 0) return
    const supabase = createClient()
    Promise.all(
      paths.map(async (path: string) => {
        const storagePath = path.includes('/object/sign/')
          ? path.split('sister-photos/')[1]?.split('?')[0]
          : path
        if (!storagePath) return null
        const { data } = await supabase.storage.from('sister-photos').createSignedUrl(storagePath, 3600)
        return data?.signedUrl ?? null
      })
    ).then(urls => setSisterSignedUrls(urls.filter(Boolean) as string[]))
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const photoUrls: string[] = isBrother
    ? ((Array.isArray(p?.photo_urls) && p.photo_urls.length > 0)
        ? p.photo_urls.map((path: string) => toBrotherPhotoUrl(path)).filter(Boolean) as string[]
        : p?.photo_url ? [toBrotherPhotoUrl(p.photo_url)!] : [])
    : sisterSignedUrls

  const sections = buildProfileSections(p ?? {}, gender, EDIT_PATHS)
  const photoEditHref = isBrother ? '/dashboard/profile/edit/photo' : '/dashboard/profile/edit/photos'

  return (
    <div className="pt-[72px] lg:pt-[76px]" style={{ background: PAGE_BG, minHeight: '100vh' }} data-testid="profile-page">
      <div style={{ maxWidth: '720px', margin: '0 auto', padding: '24px 20px 60px' }}>

        <ProfileHeader
          fullName={p?.full_name ?? '—'}
          age={p?.age}
          location={p?.location}
          ethnicity={p?.ethnicity}
          languages={p?.languages}
          photoUrls={photoUrls}
          photosVisible={true}
          verificationBadge={verificationBadge}
        />

        <CompletionBanner percentage={completionPercentage} />

        {/* ── Account (own profile only) ─────────────────────────────────── */}
        <SectionCard title="Account" editHref="/auth/reset-password">
          <FieldRow label="Email" value={userEmail} />
          <FieldRow label="Gender" value={isBrother ? 'Brother' : 'Sister'} />
          <FieldRow
            label="Member since"
            value={memberSince ? new Date(memberSince).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' }) : null}
          />
        </SectionCard>

        {/* ── Wali (sisters only) ────────────────────────────────────────── */}
        {!isBrother && (
          waliProfile ? (
            <SectionCard title="Wali" editHref="/dashboard/profile/edit/wali">
              <FieldRow label="Name" value={waliProfile.full_name} />
              <FieldRow label="Relationship" value={waliProfile.relationship} />
              <FieldRow label="Email" value={waliProfile.email} />
              <FieldRow label="Phone" value={waliProfile.phone} />
              <FieldRow label="Preferred Contact" value={waliProfile.preferred_contact_method} />
            </SectionCard>
          ) : (
            <Link
              href="/dashboard/profile/edit/wali"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                background: 'rgba(255,255,255,0.6)',
                border: '1.5px dashed rgba(175,77,152,0.3)',
                borderRadius: '16px',
                padding: '14px 18px',
                marginBottom: '14px',
                textDecoration: 'none',
              }}
            >
              <div>
                <p style={{ fontSize: '13px', fontWeight: 500, color: '#1A1A1A', margin: '0 0 2px' }}>Add a wali</p>
                <p style={{ fontSize: '12px', color: '#9B7090', margin: 0 }}>Optional — they receive read-only visibility</p>
              </div>
              <span style={{ fontSize: '13px', color: '#AF4D98', fontWeight: 500 }}>Add →</span>
            </Link>
          )
        )}

        {/* ── Profile sections ───────────────────────────────────────────── */}
        {sections.map(section => (
          <SectionCard key={section.key} title={section.title} fields={section.fields} editHref={section.editHref} />
        ))}

        {/* ── Photos (own profile, with upload link) ─────────────────────── */}
        <SectionCard title="Photos" editHref={photoEditHref}>
          <div style={{ padding: '14px 18px' }}>
            {photoUrls.length > 0 ? (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {photoUrls.map((url, i) => (
                  <img
                    key={i}
                    src={url}
                    alt={`Photo ${i + 1}`}
                    style={{ width: '72px', height: '72px', borderRadius: '12px', objectFit: 'cover', border: '1px solid rgba(175,77,152,0.15)' }}
                  />
                ))}
              </div>
            ) : (
              <p style={{ fontSize: '13px', color: '#9B7090', margin: 0 }}>No photos uploaded yet</p>
            )}
            {!isBrother && photoUrls.length > 0 && (
              <p style={{ fontSize: '11px', color: '#0A8A7A', marginTop: '10px', margin: '10px 0 0' }}>
                🔒 Private — only shared when you accept an interest
              </p>
            )}
          </div>
        </SectionCard>

        {/* ── Reference ──────────────────────────────────────────────────── */}
        <SectionCard title="Character Reference" editHref="/dashboard/profile/edit/reference">
          {reference ? (
            <>
              <FieldRow label="Referee" value={reference.referee_name} />
              <FieldRow label="Relationship" value={reference.referee_relationship} />
              <FieldRow label="Email" value={reference.referee_email} />
              <div style={{ padding: '12px 18px' }}>
                {reference.status === 'completed' ? (
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', background: '#E6F7F5', color: '#0A8A7A', fontSize: '12px', fontWeight: 500, padding: '4px 12px', borderRadius: '999px' }}>
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                      <circle cx="6" cy="6" r="6" fill="#0A8A7A" />
                      <path d="M3 6L5 8L9 4" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
                    </svg>
                    Verified
                  </span>
                ) : (
                  <span style={{ background: '#FEF9EC', color: '#8A6A00', fontSize: '12px', fontWeight: 500, padding: '4px 12px', borderRadius: '999px' }}>
                    Pending
                  </span>
                )}
              </div>
            </>
          ) : (
            <p style={{ padding: '14px 18px', fontSize: '13px', color: '#9B7090', margin: 0 }}>
              No reference submitted yet
            </p>
          )}
        </SectionCard>

        {/* ── Verse card ─────────────────────────────────────────────────── */}
        <div style={{
          marginTop: '8px',
          background: 'linear-gradient(135deg, rgba(175,77,152,0.08) 0%, rgba(244,228,186,0.4) 100%)',
          border: '1px solid rgba(175,77,152,0.12)',
          borderRadius: '16px',
          padding: '28px 24px',
          textAlign: 'center',
        }}>
          <p style={{
            fontFamily: 'Noto Naskh Arabic, serif',
            fontSize: '20px',
            color: '#AF4D98',
            lineHeight: 1.8,
            marginBottom: '12px',
            letterSpacing: '0.02em',
          }}>
            وَمِنْ آيَاتِهِ أَنْ خَلَقَ لَكُم مِّنْ أَنفُسِكُمْ أَزْوَاجًا لِّتَسْكُنُوا إِلَيْهَا وَجَعَلَ بَيْنَكُم مَّوَدَّةً وَرَحْمَةً
          </p>
          <p style={{
            fontFamily: 'Cormorant Garamond, serif',
            fontSize: '16px',
            fontStyle: 'italic',
            color: '#5C5C5C',
            lineHeight: 1.7,
            marginBottom: '10px',
          }}>
            &ldquo;And of His signs is that He created for you from yourselves mates that you may find tranquillity in them, and He placed between you affection and mercy.&rdquo;
          </p>
          <p style={{
            fontSize: '11px',
            color: '#9B7090',
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            margin: 0,
          }}>
            Ar-Rum 30:21
          </p>
        </div>

      </div>
    </div>
  )
}
