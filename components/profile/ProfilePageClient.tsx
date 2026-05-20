'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { getFieldLabel } from '@/lib/field-labels'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
function toBrotherPhotoUrl(path: string | null | undefined): string | null {
  if (!path) return null
  if (path.startsWith('http')) return path
  return `${SUPABASE_URL}/storage/v1/object/public/brother-photos/${path}`
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyData = any

// ─── Display helpers ───────────────────────────────────────────────────────────

function PillValue({ v }: { v: string | null | undefined }) {
  if (!v) return <span className="text-[14px] text-[#9B9B9B]">—</span>
  return (
    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[12px] font-medium bg-[#F5E6F2] text-[#AF4D98]">
      {v}
    </span>
  )
}

function TextValue({ v }: { v: string | null | undefined }) {
  if (!v) return <span className="text-[14px] text-[#9B9B9B]">—</span>
  return <span className="text-[14px] text-[#1A1A1A] leading-relaxed">{v}</span>
}

function BoolValue({ v }: { v: boolean | null | undefined }) {
  if (v === null || v === undefined) return <span className="text-[14px] text-[#9B9B9B]">—</span>
  return v
    ? <span className="inline-flex px-2.5 py-0.5 rounded-full text-[12px] font-medium bg-[#E6F9F7] text-[#00A699]">Yes</span>
    : <span className="inline-flex px-2.5 py-0.5 rounded-full text-[12px] font-medium bg-[#F0F0F0] text-[#9B9B9B]">No</span>
}

function ArrayValue({ v }: { v: string[] | null | undefined }) {
  if (!v || v.length === 0) return <span className="text-[14px] text-[#9B9B9B]">—</span>
  return (
    <div className="flex flex-wrap gap-1.5">
      {v.map(item => (
        <span key={item} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[12px] font-medium bg-[#F5E6F2] text-[#AF4D98]">
          {item}
        </span>
      ))}
    </div>
  )
}

function SliderValue({ v, left = 'Traditional', right = 'Reformist' }: {
  v: number | null | undefined
  left?: string
  right?: string
}) {
  if (v === null || v === undefined) return <span className="text-[14px] text-[#9B9B9B]">—</span>
  return (
    <div className="w-full">
      <div className="flex justify-between text-[10px] text-[#9B9B9B] mb-1">
        <span>{left}</span>
        <span className="text-[#AF4D98] font-medium">{v}%</span>
        <span>{right}</span>
      </div>
      <div className="h-1.5 bg-[#EDE8E3] rounded-full overflow-hidden">
        <div className="h-1.5 bg-[#AF4D98] rounded-full" style={{ width: `${v}%` }} />
      </div>
    </div>
  )
}

// Check if a section has any non-null/non-empty values
function hasAny(obj: AnyData, ...fields: string[]): boolean {
  return fields.some(f => {
    const v = obj?.[f]
    if (v === null || v === undefined || v === '') return false
    if (Array.isArray(v) && v.length === 0) return false
    return true
  })
}

// Two-column field
function F({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-[11px] text-[#9B9B9B] font-medium uppercase tracking-[0.04em]">{label}</span>
      <div>{children}</div>
    </div>
  )
}

// Full-width field
function FW({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="col-span-2 flex flex-col gap-1">
      <span className="text-[11px] text-[#9B9B9B] font-medium uppercase tracking-[0.04em]">{label}</span>
      <div>{children}</div>
    </div>
  )
}

function Section({
  title,
  editHref,
  defaultOpen = true,
  children,
  testId,
  id,
}: {
  title: string
  editHref?: string
  defaultOpen?: boolean
  children: React.ReactNode
  testId?: string
  id?: string
}) {
  const [open, setOpen] = useState(defaultOpen)
  const sectionId = id ?? testId
  return (
    <div
      id={sectionId}
      data-testid={testId}
      className="bg-white border border-[#EDE8E3] rounded-[16px] mb-3 overflow-hidden"
    >
      <div
        className="flex items-center justify-between px-5 py-4 cursor-pointer"
        onClick={() => setOpen(o => !o)}
      >
        <div className="flex items-center gap-2">
          <svg
            xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"
            className={`w-4 h-4 text-[#9B9B9B] flex-shrink-0 transition-transform duration-200 ${open ? 'rotate-90' : ''}`}
          >
            <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" />
          </svg>
          <span className="text-[11px] font-medium uppercase tracking-[0.06em] text-[#9B9B9B]">{title}</span>
        </div>
        {editHref && (
          <Link
            href={editHref}
            onClick={e => e.stopPropagation()}
            className="text-[12px] text-[#AF4D98] font-medium hover:text-[#9B3D85] transition-colors px-1"
          >
            Edit
          </Link>
        )}
      </div>
      {open && (
        <div className="px-5 pb-5">
          <div className="grid grid-cols-2 gap-3 pt-1 border-t border-[#EDE8E3]">
            {children}
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Completion banner ─────────────────────────────────────────────────────────

function CompletionBanner({ percentage }: { percentage: number }) {
  if (percentage >= 80) return null
  return (
    <div className="bg-white border border-[#EDE8E3] rounded-[16px] p-4 mb-4">
      <div className="flex items-center justify-between mb-2">
        <p className="text-[13px] font-medium text-[#1A1A1A]">Your profile is {percentage}% complete</p>
        <span className="text-[12px] font-medium text-[#AF4D98]">{percentage}%</span>
      </div>
      <div className="h-1.5 bg-[#EDE8E3] rounded-full overflow-hidden mb-3">
        <div className="h-1.5 bg-[#AF4D98] rounded-full transition-all" style={{ width: `${percentage}%` }} />
      </div>
      <p className="text-[12px] text-[#9B9B9B]">
        Reach 80% to unlock your matches. Each section below has an Edit button.
      </p>
    </div>
  )
}

// ─── Props ─────────────────────────────────────────────────────────────────────

type Props = {
  gender: 'brother' | 'sister'
  genderProfile: AnyData
  waliProfile: AnyData | null
  reference: AnyData | null
  completionPercentage: number
  isComplete: boolean
  verificationBadge: boolean
  userEmail: string
  memberSince: string
}

// ─── Main component ────────────────────────────────────────────────────────────

const SECTION_LINKS = [
  { id: 'section-account', label: 'Account' },
  { id: 'section-basic', label: 'Basic Info' },
  { id: 'section-deen', label: 'Deen' },
  { id: 'section-family', label: 'Family' },
  { id: 'section-lifestyle', label: 'Lifestyle' },
  { id: 'section-marriage', label: 'Marriage' },
  { id: 'section-preferences', label: 'Preferences' },
  { id: 'section-financial', label: 'Financial' },
  { id: 'section-emotional', label: 'Emotional' },
  { id: 'section-communication', label: 'Communication' },
  { id: 'section-household', label: 'Household / Career' },
  { id: 'section-character', label: 'Character' },
  { id: 'section-vision', label: 'Vision' },
  { id: 'section-photo', label: 'Photos' },
  { id: 'section-reference', label: 'Reference' },
]

export default function ProfilePageClient({
  gender,
  genderProfile: p,
  waliProfile,
  reference,
  completionPercentage,
  isComplete,
  verificationBadge,
  userEmail,
  memberSince,
}: Props) {
  const router = useRouter()
  const isBrother = gender === 'brother'
  const [activeSection, setActiveSection] = useState<string>('')
  const [sisterSignedUrls, setSisterSignedUrls] = useState<string[]>([])
  const mainRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id)
            break
          }
        }
      },
      { rootMargin: '-20% 0px -60% 0px', threshold: 0 }
    )
    const sections = document.querySelectorAll('[id^="section-"]')
    sections.forEach(el => observer.observe(el))
    return () => observer.disconnect()
  }, [])

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

  async function handleSignOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/')
  }

  const pillPct =
    completionPercentage >= 100
      ? 'bg-[#E6F9F7] text-[#00A699]'
      : completionPercentage >= 75
      ? 'bg-amber-50 text-amber-700'
      : 'bg-red-50 text-red-600'

  const photoUrl = isBrother
    ? toBrotherPhotoUrl(p?.photo_url)
    : (sisterSignedUrls[0] ?? null)
  const firstName = p?.full_name?.split(' ')[0] ?? 'N'

  return (
    <div className="min-h-screen bg-[#FDF8F3]" data-testid="profile-page">
      <div className="lg:max-w-[1100px] lg:mx-auto lg:flex lg:gap-8 lg:px-8 lg:pt-8">

      {/* Desktop sidebar */}
      <aside className="hidden lg:block w-60 flex-shrink-0">
        <div className="sticky top-24 space-y-4">
          {/* Profile card */}
          <div className="bg-white border border-[#EDE8E3] rounded-[16px] p-4 text-center">
            <div className="w-16 h-16 rounded-full border-2 border-white shadow overflow-hidden bg-[#F5E6F2] flex items-center justify-center mx-auto mb-3">
              {photoUrl
                ? <img src={photoUrl} alt="Profile" className="w-full h-full object-cover" />
                : <span style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '28px', fontWeight: 400, color: '#AF4D98' }}>{firstName[0]?.toUpperCase() ?? 'N'}</span>}
            </div>
            <p className="text-[14px] font-medium text-[#1A1A1A] truncate">{p?.full_name ?? '—'}</p>
            <p className="text-[12px] text-[#9B9B9B] mt-0.5">{p?.age ? `${p.age} years` : ''}</p>
            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium mt-2 ${pillPct}`}>
              {isComplete ? 'Complete' : `${completionPercentage}%`}
            </span>
          </div>
          {/* Section links */}
          <nav className="bg-white border border-[#EDE8E3] rounded-[16px] p-2">
            {SECTION_LINKS.map(link => (
              <a
                key={link.id}
                href={`#${link.id}`}
                className={`flex items-center gap-2 px-3 py-2 rounded-[10px] text-[13px] transition-colors ${
                  activeSection === link.id
                    ? 'bg-[#F9F0F6] text-[#AF4D98] font-medium'
                    : 'text-[#5C5C5C] hover:bg-[#FAF4EE]'
                }`}
              >
                {link.label}
              </a>
            ))}
          </nav>
          <button
            onClick={handleSignOut}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-[10px] text-[13px] text-red-500 hover:bg-red-50 transition-colors"
          >
            Sign out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div ref={mainRef} className="flex-1 min-w-0">
      <div className="max-w-[640px] mx-auto px-5 pb-28 lg:max-w-none lg:px-0">

        {/* Header - hidden on desktop (sidebar shows this) */}
        <div data-testid="profile-header" className="flex flex-col items-center pt-8 pb-6 lg:hidden">
          <div style={{ width: '96px', height: '96px', borderRadius: '50%', background: 'linear-gradient(135deg, #F5E6F2, #F4E4BA)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid white', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', margin: '0 auto 12px' }}>
            {photoUrl
              ? <img src={photoUrl} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
              : <span style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '36px', fontWeight: 400, color: '#AF4D98' }}>{firstName[0]?.toUpperCase() ?? 'N'}</span>}
          </div>
          <h1 className="text-[22px] font-medium text-[#1A1A1A] text-center">{p?.full_name ?? '—'}</h1>
          <p className="text-[14px] text-[#9B9B9B] text-center mt-0.5">
            {[p?.age, p?.location].filter(Boolean).join(' · ')}
          </p>
          <div className="flex items-center gap-2 mt-3">
            {verificationBadge && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium bg-[#E6F9F7] text-[#00A699]">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-3 h-3">
                  <path fillRule="evenodd" d="M12.416 3.376a.75.75 0 0 1 .208 1.04l-5 7.5a.75.75 0 0 1-1.154.114l-3-3a.75.75 0 0 1 1.06-1.06l2.353 2.353 4.493-6.74a.75.75 0 0 1 1.04-.207Z" clipRule="evenodd" />
                </svg>
                Verified
              </span>
            )}
            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-medium ${pillPct}`}>
              {isComplete ? 'Profile complete' : `${completionPercentage}% complete`}
            </span>
          </div>
        </div>

        <CompletionBanner percentage={completionPercentage} />

        {/* ── ACCOUNT (read-only) ─────────────────────────────────────────── */}
        <Section title="Account" testId="section-account" defaultOpen={false}>
          <F label={getFieldLabel('full_name', gender)}><TextValue v={p?.full_name} /></F>
          <F label={getFieldLabel('age', gender)}><TextValue v={p?.age ? String(p.age) : null} /></F>
          <F label={getFieldLabel('location', gender)}><TextValue v={p?.location} /></F>
          <F label="Gender"><TextValue v={gender === 'brother' ? 'Brother' : 'Sister'} /></F>
          <F label="Email"><TextValue v={userEmail} /></F>
          <F label="Member Since">
            <TextValue v={memberSince ? new Date(memberSince).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' }) : null} />
          </F>
          <FW label="Password">
            <Link href="/auth/reset-password" className="text-[14px] text-[#AF4D98] font-medium hover:text-[#9B3D85]">Change password →</Link>
          </FW>
        </Section>

        {/* ── WALI (sisters only) ─────────────────────────────────────────── */}
        {!isBrother && (
          waliProfile ? (
            <Section title="Wali" editHref="/dashboard/profile/edit/wali" testId="section-wali">
              <F label="Name"><PillValue v={waliProfile.full_name} /></F>
              <F label="Relationship"><PillValue v={waliProfile.relationship} /></F>
              <F label="Email"><TextValue v={waliProfile.email} /></F>
              <F label="Phone"><TextValue v={waliProfile.phone} /></F>
              <F label="Preferred Contact"><PillValue v={waliProfile.preferred_contact_method} /></F>
            </Section>
          ) : (
            <div className="border-2 border-dashed border-[#EDE8E3] rounded-[16px] p-5 mb-3 flex items-center justify-between">
              <div>
                <p className="text-[13px] font-medium text-[#1A1A1A]">Add a wali</p>
                <p className="text-[12px] text-[#9B9B9B] mt-0.5">Optional — they receive read-only visibility</p>
              </div>
              <Link href="/dashboard/profile/edit/wali"
                className="text-[13px] text-[#AF4D98] font-medium hover:text-[#9B3D85] transition-colors">
                Add →
              </Link>
            </div>
          )
        )}

        {/* ── BASIC INFO ──────────────────────────────────────────────────── */}
        <Section title="Basic Info" editHref="/dashboard/profile/edit/basic" testId="section-basic">
          <F label={getFieldLabel('full_name', gender)}><TextValue v={p?.full_name} /></F>
          <F label={getFieldLabel('age', gender)}><TextValue v={p?.age ? String(p.age) : null} /></F>
          <F label={getFieldLabel('location', gender)}><TextValue v={p?.location} /></F>
          <F label={getFieldLabel('ethnicity', gender)}><TextValue v={p?.ethnicity} /></F>
          <FW label={getFieldLabel('languages', gender)}><TextValue v={Array.isArray(p?.languages) ? p.languages.join(', ') : p?.languages} /></FW>
          <F label={getFieldLabel('willing_to_relocate', gender)}><BoolValue v={p?.willing_to_relocate} /></F>
        </Section>

        {/* ── DEEN & PRACTICE ─────────────────────────────────────────────── */}
        {hasAny(p, 'religiosity_level', 'prayer_frequency', 'madhab', 'quran_listening', 'islamic_knowledge_level') && (
          <Section title="Deen & Practice" editHref="/dashboard/profile/edit/deen" testId="section-deen">
            <F label={getFieldLabel('religiosity_level', gender)}><PillValue v={p?.religiosity_level} /></F>
            <F label={getFieldLabel('prayer_frequency', gender)}><PillValue v={p?.prayer_frequency} /></F>
            <F label={getFieldLabel('madhab', gender)}><PillValue v={p?.madhab} /></F>
            <F label={getFieldLabel('islamic_knowledge_level', gender)}><PillValue v={p?.islamic_knowledge_level} /></F>
            {isBrother
              ? <F label={getFieldLabel('has_beard', 'brother')}><BoolValue v={p?.has_beard} /></F>
              : <F label={getFieldLabel('wears_hijab', 'sister')}><PillValue v={p?.wears_hijab} /></F>}
            <F label={getFieldLabel('quran_listening', gender)}><PillValue v={p?.quran_listening} /></F>
            <F label={getFieldLabel('quran_memorisation', gender)}><PillValue v={p?.quran_memorisation} /></F>
            <F label={getFieldLabel('zakah_sadaqah', gender)}><PillValue v={p?.zakah_sadaqah} /></F>
            <F label={getFieldLabel('madhab_consistency', gender)}><PillValue v={p?.madhab_consistency} /></F>
            <F label={getFieldLabel('mawlid_view', gender)}><PillValue v={p?.mawlid_view} /></F>
            <F label={getFieldLabel('spouse_islamic_knowledge', gender)}><PillValue v={p?.spouse_islamic_knowledge} /></F>
            {isBrother && <F label={getFieldLabel('missed_prayer_approach', 'brother')}><PillValue v={p?.missed_prayer_approach} /></F>}
            {isBrother && <F label={getFieldLabel('wife_niqab_preference', 'brother')}><PillValue v={p?.wife_niqab_preference} /></F>}
            {!isBrother && <F label={getFieldLabel('islamic_home_importance', 'sister')}><PillValue v={p?.islamic_home_importance} /></F>}
            {!isBrother && <F label={getFieldLabel('hijab_outside_home', 'sister')}><PillValue v={p?.hijab_outside_home} /></F>}
            {!isBrother && <F label={getFieldLabel('islamic_classes_attendance', 'sister')}><PillValue v={p?.islamic_classes_attendance} /></F>}
            <FW label={getFieldLabel('traditional_vs_reformist', gender)}>
              <SliderValue v={p?.traditional_vs_reformist} left="Traditional" right="Reformist" />
            </FW>
            {p?.deen_growth && <FW label={getFieldLabel('deen_growth', gender)}><TextValue v={p.deen_growth} /></FW>}
            {!isBrother && p?.deen_when_busy && <FW label={getFieldLabel('deen_when_busy', 'sister')}><TextValue v={p.deen_when_busy} /></FW>}
            {p?.differing_islamic_opinions && <FW label={getFieldLabel('differing_islamic_opinions', gender)}><TextValue v={p.differing_islamic_opinions} /></FW>}
          </Section>
        )}

        {/* ── FAMILY DYNAMICS ─────────────────────────────────────────────── */}
        {hasAny(p, 'family_conflict_style', 'parent_relationship', 'wife_family_interaction', 'family_balance_after_marriage', 'eldest_responsibilities') && (
          <Section title="Family Dynamics" editHref="/dashboard/profile/edit/family" testId="section-family">
            {isBrother
              ? <>
                  <F label={getFieldLabel('wife_family_interaction', 'brother')}><PillValue v={p?.wife_family_interaction} /></F>
                  <F label={getFieldLabel('eldest_responsibilities', 'brother')}><PillValue v={p?.eldest_responsibilities} /></F>
                  <F label={getFieldLabel('child_caregiving', 'brother')}><PillValue v={p?.child_caregiving} /></F>
                  <F label={getFieldLabel('wife_family_relationship', 'brother')}><PillValue v={p?.wife_family_relationship} /></F>
                  <F label={getFieldLabel('living_near_parents', 'brother')}><PillValue v={p?.living_near_parents} /></F>
                </>
              : <>
                  <F label={getFieldLabel('family_balance_after_marriage', 'sister')}><PillValue v={p?.family_balance_after_marriage} /></F>
                  <F label={getFieldLabel('family_financial_responsibility', 'sister')}><PillValue v={p?.family_financial_responsibility} /></F>
                  <F label={getFieldLabel('inlaws_comfort', 'sister')}><PillValue v={p?.inlaws_comfort} /></F>
                  <F label={getFieldLabel('husband_family_relationship', 'sister')}><PillValue v={p?.husband_family_relationship} /></F>
                  <FW label={getFieldLabel('family_traditional_vs_modern', 'sister')}>
                    <SliderValue v={p?.family_traditional_vs_modern} left="Modern" right="Traditional" />
                  </FW>
                </>}
            <F label={getFieldLabel('family_conflict_style', gender)}><PillValue v={p?.family_conflict_style} /></F>
            {p?.parent_relationship && <FW label={getFieldLabel('parent_relationship', gender)}><TextValue v={p.parent_relationship} /></FW>}
            {p?.family_spouse_disagreement && <FW label={getFieldLabel('family_spouse_disagreement', gender)}><TextValue v={p.family_spouse_disagreement} /></FW>}
          </Section>
        )}

        {/* ── LIFESTYLE ───────────────────────────────────────────────────── */}
        {hasAny(p, 'occupation', 'education_level', 'living_situation', 'exercise_frequency', 'strict_halal_diet') && (
          <Section title="Lifestyle" editHref="/dashboard/profile/edit/lifestyle" testId="section-lifestyle">
            <F label={getFieldLabel('occupation', gender)}><TextValue v={p?.occupation} /></F>
            <F label={getFieldLabel('education_level', gender)}><PillValue v={p?.education_level} /></F>
            <F label={getFieldLabel('living_situation', gender)}><PillValue v={p?.living_situation} /></F>
            <F label={getFieldLabel('exercise_frequency', gender)}><PillValue v={p?.exercise_frequency} /></F>
            <F label={getFieldLabel('strict_halal_diet', gender)}><PillValue v={p?.strict_halal_diet} /></F>
            <F label={getFieldLabel('smoking', gender)}><PillValue v={p?.smoking} /></F>
            <F label={getFieldLabel('pets_view', gender)}><PillValue v={p?.pets_view} /></F>
            <F label={getFieldLabel('healthy_eating_importance', gender)}><PillValue v={p?.healthy_eating_importance} /></F>
            <F label={getFieldLabel('social_media_view', gender)}><PillValue v={p?.social_media_view} /></F>
            <F label={getFieldLabel('mixed_gender_social_circle', gender)}><PillValue v={p?.mixed_gender_social_circle} /></F>
            <F label={getFieldLabel('do_you_listen_to_music', gender)}><PillValue v={p?.do_you_listen_to_music} /></F>
            <F label={getFieldLabel('celebrate_non_islamic_holidays', gender)}><PillValue v={p?.celebrate_non_islamic_holidays} /></F>
            {isBrother
              ? <F label={getFieldLabel('travel_frequency', 'brother')}><PillValue v={p?.travel_frequency} /></F>
              : <F label={getFieldLabel('travel_importance', 'sister')}><PillValue v={p?.travel_importance} /></F>}
            <F label={getFieldLabel('political_views', gender)}><PillValue v={p?.political_views} /></F>
            <FW label={getFieldLabel('cultural_background_importance', gender)}>
              <SliderValue v={p?.cultural_background_importance} left="Not important" right="Very important" />
            </FW>
            <FW label={getFieldLabel('home_organisation', gender)}>
              <SliderValue v={p?.home_organisation} left="Not a priority" right="Very important" />
            </FW>
            {p?.weekend_lifestyle && <FW label={getFieldLabel('weekend_lifestyle', gender)}><TextValue v={p.weekend_lifestyle} /></FW>}
            {p?.ramadan_routine && <FW label={getFieldLabel('ramadan_routine', gender)}><TextValue v={p.ramadan_routine} /></FW>}
          </Section>
        )}

        {/* ── MARRIAGE GOALS ───────────────────────────────────────────────── */}
        {hasAny(p, 'timeline_to_marry', 'wants_children', 'previously_married') && (
          <Section title="Marriage Goals" editHref="/dashboard/profile/edit/marriage" testId="section-marriage">
            <F label={getFieldLabel('timeline_to_marry', gender)}><PillValue v={p?.timeline_to_marry} /></F>
            <F label={getFieldLabel('previously_married', gender)}><BoolValue v={p?.previously_married} /></F>
            <F label={getFieldLabel('has_children', gender)}><BoolValue v={p?.has_children} /></F>
            <F label={getFieldLabel('wants_children', gender)}><BoolValue v={p?.wants_children} /></F>
            <F label={getFieldLabel('number_of_children_wanted', gender)}><PillValue v={p?.number_of_children_wanted} /></F>
            {isBrother && <F label={getFieldLabel('polygamy_openness', 'brother')}><BoolValue v={p?.polygamy_openness} /></F>}
            {isBrother && <F label={getFieldLabel('polygamy_own_marriage', 'brother')}><PillValue v={p?.polygamy_own_marriage} /></F>}
          </Section>
        )}

        {/* ── SPOUSE PREFERENCES ───────────────────────────────────────────── */}
        {hasAny(p, 'spouse_religiosity_preference', 'spouse_age_min', 'dealbreakers') && (
          <Section title="Spouse Preferences" editHref="/dashboard/profile/edit/preferences" testId="section-preferences">
            <F label={getFieldLabel('spouse_religiosity_preference', gender)}><PillValue v={p?.spouse_religiosity_preference} /></F>
            <F label="Age range">
              <TextValue v={p?.spouse_age_min && p?.spouse_age_max ? `${p.spouse_age_min}–${p.spouse_age_max}` : null} />
            </F>
            {p?.dealbreakers?.length
              ? <FW label={getFieldLabel('dealbreakers', gender)}><ArrayValue v={p.dealbreakers} /></FW>
              : <FW label={getFieldLabel('dealbreakers', gender)}><span className="text-[14px] text-[#9B9B9B]">—</span></FW>}
          </Section>
        )}

        {/* ── FINANCIAL ────────────────────────────────────────────────────── */}
        {hasAny(p, 'annual_income_range', 'savings_plan', 'has_significant_debt', 'plan_to_work_after_marriage', 'financial_readiness') && (
          <Section title="Financial" editHref="/dashboard/profile/edit/financial" testId="section-financial">
            {isBrother && <>
              <F label={getFieldLabel('annual_income_range', 'brother')}><PillValue v={p?.annual_income_range} /></F>
              <F label={getFieldLabel('own_or_rent', 'brother')}><PillValue v={p?.own_or_rent} /></F>
              <F label={getFieldLabel('financial_readiness', 'brother')}><PillValue v={p?.financial_readiness} /></F>
              <F label={getFieldLabel('hajj_status', 'brother')}><PillValue v={p?.hajj_status} /></F>
              <F label={getFieldLabel('wife_financial_independence', 'brother')}><PillValue v={p?.wife_financial_independence} /></F>
              <F label={getFieldLabel('wife_earning_more', 'brother')}><PillValue v={p?.wife_earning_more} /></F>
              <F label={getFieldLabel('financial_planning_approach', 'brother')}><PillValue v={p?.financial_planning_approach} /></F>
            </>}
            <F label={getFieldLabel('savings_plan', gender)}><PillValue v={p?.savings_plan} /></F>
            <F label={getFieldLabel('has_significant_debt', gender)}><PillValue v={p?.has_significant_debt} /></F>
            <F label={getFieldLabel('supporting_family_financially', gender)}><PillValue v={p?.supporting_family_financially} /></F>
            {isBrother && p?.mahr_approach && <FW label={getFieldLabel('mahr_approach', 'brother')}><TextValue v={p.mahr_approach} /></FW>}
            {p?.financial_stress_approach && <FW label={getFieldLabel('financial_stress_approach', gender)}><TextValue v={p.financial_stress_approach} /></FW>}
          </Section>
        )}

        {/* ── EMOTIONAL & MENTAL HEALTH ────────────────────────────────────── */}
        {hasAny(p, 'therapy_experience', 'mental_health_challenges', 'emotional_support_style', 'stress_management') && (
          <Section title="Emotional & Mental Health" editHref="/dashboard/profile/edit/emotional" defaultOpen={false} testId="section-emotional">
            <F label={getFieldLabel('therapy_experience', gender)}><PillValue v={p?.therapy_experience} /></F>
            <F label={getFieldLabel('couples_therapy_view', gender)}><PillValue v={p?.couples_therapy_view} /></F>
            <F label={getFieldLabel('mental_health_challenges', gender)}><PillValue v={p?.mental_health_challenges} /></F>
            <F label={getFieldLabel('emotional_expression_view', gender)}><PillValue v={p?.emotional_expression_view} /></F>
            <FW label={getFieldLabel('emotional_availability', gender)}>
              <SliderValue v={p?.emotional_availability} left="Needs space" right="Very available" />
            </FW>
            {p?.stress_management && <FW label={getFieldLabel('stress_management', gender)}><TextValue v={p.stress_management} /></FW>}
            {p?.emotional_support_style && <FW label={getFieldLabel('emotional_support_style', gender)}><TextValue v={p.emotional_support_style} /></FW>}
            {p?.significant_hardship && <FW label={getFieldLabel('significant_hardship', gender)}><TextValue v={p.significant_hardship} /></FW>}
            {p?.health_background_disclosure && <FW label={getFieldLabel('health_background_disclosure', gender)}><TextValue v={p.health_background_disclosure} /></FW>}
          </Section>
        )}

        {/* ── CONFLICT & COMMUNICATION ─────────────────────────────────────── */}
        {hasAny(p, 'conflict_style', 'introvert_extrovert', 'love_language', 'apology_speed') && (
          <Section title="Conflict & Communication" editHref="/dashboard/profile/edit/communication" defaultOpen={false} testId="section-communication">
            <F label={getFieldLabel('conflict_style', gender)}><PillValue v={p?.conflict_style} /></F>
            <F label={getFieldLabel('introvert_extrovert', gender)}><PillValue v={p?.introvert_extrovert} /></F>
            <F label={getFieldLabel('alone_time_importance', gender)}><PillValue v={p?.alone_time_importance} /></F>
            <F label={getFieldLabel('apology_speed', gender)}><PillValue v={p?.apology_speed} /></F>
            <F label={getFieldLabel('communication_when_upset', gender)}><PillValue v={p?.communication_when_upset} /></F>
            {isBrother
              ? <>
                  <F label={getFieldLabel('husband_final_say', 'brother')}><PillValue v={p?.husband_final_say} /></F>
                  <F label={getFieldLabel('wife_opinion_importance', 'brother')}><PillValue v={p?.wife_opinion_importance} /></F>
                  <F label={getFieldLabel('friendship_ended', 'brother')}><PillValue v={p?.friendship_ended} /></F>
                </>
              : <>
                  <F label={getFieldLabel('qawwam_view', 'sister')}><PillValue v={p?.qawwam_view} /></F>
                  <F label={getFieldLabel('husband_opinion_importance', 'sister')}><PillValue v={p?.husband_opinion_importance} /></F>
                  <F label={getFieldLabel('receiving_love_language', 'sister')}><PillValue v={p?.receiving_love_language} /></F>
                </>}
            <FW label={getFieldLabel('love_language', gender)}><ArrayValue v={p?.love_language} /></FW>
            {p?.healthy_argument_view && <FW label={getFieldLabel('healthy_argument_view', gender)}><TextValue v={p.healthy_argument_view} /></FW>}
          </Section>
        )}

        {/* ── HOUSEHOLD (brothers) / CAREER (sisters) ──────────────────────── */}
        {isBrother ? (
          hasAny(p, 'wife_working_openness', 'household_management', 'inlaws_living_together', 'jumuah_attendance') && (
            <Section title="Household" editHref="/dashboard/profile/edit/household" defaultOpen={false} testId="section-household">
              <F label={getFieldLabel('wife_working_openness', 'brother')}><PillValue v={p?.wife_working_openness} /></F>
              <F label={getFieldLabel('household_management', 'brother')}><PillValue v={p?.household_management} /></F>
              <F label={getFieldLabel('inlaws_living_together', 'brother')}><PillValue v={p?.inlaws_living_together} /></F>
              <F label={getFieldLabel('islamic_schooling_importance', 'brother')}><PillValue v={p?.islamic_schooling_importance} /></F>
              <F label={getFieldLabel('child_caregiving', 'brother')}><PillValue v={p?.child_caregiving} /></F>
              <F label={getFieldLabel('jumuah_attendance', 'brother')}><PillValue v={p?.jumuah_attendance} /></F>
              <F label={getFieldLabel('wife_hijab_importance', 'brother')}><PillValue v={p?.wife_hijab_importance} /></F>
            </Section>
          )
        ) : (
          hasAny(p, 'plan_to_work_after_marriage', 'career_pause_for_children', 'career_five_years') && (
            <Section title="Career" editHref="/dashboard/profile/edit/career" defaultOpen={false} testId="section-career">
              <F label={getFieldLabel('plan_to_work_after_marriage', 'sister')}><PillValue v={p?.plan_to_work_after_marriage} /></F>
              <F label={getFieldLabel('career_pause_for_children', 'sister')}><PillValue v={p?.career_pause_for_children} /></F>
              <F label={getFieldLabel('financial_dependence_view', 'sister')}><PillValue v={p?.financial_dependence_view} /></F>
              <F label={getFieldLabel('financial_independence_importance', 'sister')}><PillValue v={p?.financial_independence_importance} /></F>
              <FW label={getFieldLabel('career_identity_importance', 'sister')}>
                <SliderValue v={p?.career_identity_importance} left="Not central" right="Core identity" />
              </FW>
              {p?.career_five_years && <FW label={getFieldLabel('career_five_years', 'sister')}><TextValue v={p.career_five_years} /></FW>}
              {p?.career_ambitions && <FW label={getFieldLabel('career_ambitions', 'sister')}><TextValue v={p.career_ambitions} /></FW>}
            </Section>
          )
        )}

        {/* ── HOUSEHOLD (sisters only) ─────────────────────────────────────── */}
        {!isBrother && hasAny(p, 'primary_caregiver_comfort', 'inlaws_living_together', 'islamic_schooling_importance') && (
          <Section title="Household" editHref="/dashboard/profile/edit/additional" defaultOpen={false} testId="section-household-sister">
            <F label={getFieldLabel('primary_caregiver_comfort', 'sister')}><PillValue v={p?.primary_caregiver_comfort} /></F>
            <F label={getFieldLabel('inlaws_living_together', 'sister')}><PillValue v={p?.inlaws_living_together} /></F>
            <F label={getFieldLabel('islamic_schooling_importance', 'sister')}><PillValue v={p?.islamic_schooling_importance} /></F>
            {p?.household_responsibilities_vision && <FW label={getFieldLabel('household_responsibilities_vision', 'sister')}><TextValue v={p.household_responsibilities_vision} /></FW>}
          </Section>
        )}

        {/* ── CHARACTER & GOALS ────────────────────────────────────────────── */}
        {hasAny(p, 'character_description', 'goals') && (
          <Section title="Character & Goals" editHref="/dashboard/profile/edit/character" testId="section-character">
            {p?.character_description
              ? <FW label={getFieldLabel('character_description', gender)}><TextValue v={p.character_description} /></FW>
              : <FW label={getFieldLabel('character_description', gender)}><span className="text-[14px] text-[#9B9B9B]">—</span></FW>}
            {p?.goals
              ? <FW label={getFieldLabel('goals', gender)}><TextValue v={p.goals} /></FW>
              : <FW label={getFieldLabel('goals', gender)}><span className="text-[14px] text-[#9B9B9B]">—</span></FW>}
          </Section>
        )}

        {/* ── MARRIAGE VISION ──────────────────────────────────────────────── */}
        {hasAny(p, 'marriage_vision_10_years', 'first_year_vision', 'physical_intimacy_importance') && (
          <Section title="Marriage Vision" editHref="/dashboard/profile/edit/vision" defaultOpen={false} testId="section-vision">
            <F label={getFieldLabel('physical_intimacy_importance', gender)}><PillValue v={p?.physical_intimacy_importance} /></F>
            <F label={getFieldLabel('spouse_friendships_view', gender)}><PillValue v={p?.spouse_friendships_view} /></F>
            {p?.marriage_vision_10_years && <FW label={getFieldLabel('marriage_vision_10_years', gender)}><TextValue v={p.marriage_vision_10_years} /></FW>}
            {p?.first_year_vision && <FW label={getFieldLabel('first_year_vision', gender)}><TextValue v={p.first_year_vision} /></FW>}
            {p?.romance_view && <FW label={getFieldLabel('romance_view', gender)}><TextValue v={p.romance_view} /></FW>}
            {p?.marriage_fear && <FW label={getFieldLabel('marriage_fear', gender)}><TextValue v={p.marriage_fear} /></FW>}
            {p?.unique_contribution && <FW label={getFieldLabel('unique_contribution', gender)}><TextValue v={p.unique_contribution} /></FW>}
            {!isBrother && p?.ideal_husband_description && <FW label={getFieldLabel('ideal_husband_description', 'sister')}><TextValue v={p.ideal_husband_description} /></FW>}
          </Section>
        )}

        {/* ── PHOTO(S) ─────────────────────────────────────────────────────── */}
        {isBrother ? (
          <Section title="Photo" editHref="/dashboard/profile/edit/photo" testId="section-photo">
            <FW label="">
              {toBrotherPhotoUrl(p?.photo_url)
                // eslint-disable-next-line @next/next/no-img-element
                ? <img src={toBrotherPhotoUrl(p?.photo_url)!} alt="Profile" className="w-20 h-20 rounded-[12px] object-cover border border-[#EDE8E3]" />
                : <span className="text-[14px] text-[#9B9B9B]">No photo uploaded yet</span>}
            </FW>
          </Section>
        ) : (
          <Section title="Photos" editHref="/dashboard/profile/edit/photos" testId="section-photos">
            <FW label="">
              {sisterSignedUrls.length > 0
                ? <div className="flex flex-wrap gap-2">
                    {sisterSignedUrls.map((url: string, i: number) => (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img key={i} src={url} alt={`Photo ${i + 1}`} className="w-16 h-16 rounded-[12px] object-cover border border-[#EDE8E3]" />
                    ))}
                  </div>
                : <span className="text-[14px] text-[#9B9B9B]">No photos uploaded yet</span>}
            </FW>
            {p?.photos_uploaded && (
              <FW label="">
                <span className="text-[12px] text-[#00A699]">Photos are private — only shared when you accept an interest</span>
              </FW>
            )}
          </Section>
        )}

        {/* ── REFERENCE ────────────────────────────────────────────────────── */}
        <Section title="Reference" editHref="/dashboard/profile/edit/reference" testId="section-reference">
          {reference ? (
            <>
              <F label="Name"><TextValue v={reference.referee_name} /></F>
              <F label="Relationship"><TextValue v={reference.referee_relationship} /></F>
              <F label="Email"><TextValue v={reference.referee_email} /></F>
              <F label="Status">
                {reference.status === 'completed'
                  ? <span className="inline-flex px-2.5 py-0.5 rounded-full text-[12px] font-medium bg-[#E6F9F7] text-[#00A699]">Verified</span>
                  : <span className="inline-flex px-2.5 py-0.5 rounded-full text-[12px] font-medium bg-amber-50 text-amber-700">Pending</span>}
              </F>
            </>
          ) : (
            <FW label=""><span className="text-[14px] text-[#9B9B9B]">No reference submitted yet</span></FW>
          )}
        </Section>

        {/* ── Footer links ──────────────────────────────────────────────────── */}
        <div className="mt-4 space-y-2 pb-4">
          <Link href="/dashboard/how-it-works" className="flex items-center justify-between px-5 py-3.5 bg-white border border-[#EDE8E3] rounded-[14px] text-[14px] text-[#5C5C5C] hover:border-[#AF4D98] transition-colors">
            How does Naseeb work? →
          </Link>
          <Link href="/privacy" className="flex items-center justify-between px-5 py-3.5 bg-white border border-[#EDE8E3] rounded-[14px] text-[14px] text-[#5C5C5C] hover:border-[#AF4D98] transition-colors">
            Privacy &amp; data →
          </Link>
          <button
            onClick={handleSignOut}
            className="w-full flex items-center justify-between px-5 py-3.5 bg-white border border-[#EDE8E3] rounded-[14px] text-[14px] text-red-500 hover:border-red-200 transition-colors"
          >
            Sign out
          </button>
        </div>

      </div>{/* end inner max-width */}
      </div>{/* end main content */}
      </div>{/* end lg:flex */}
    </div>
  )
}
