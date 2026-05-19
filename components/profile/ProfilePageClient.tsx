'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import BrotherIllustration from '@/components/illustrations/BrotherIllustration'
import SisterIllustration from '@/components/illustrations/SisterIllustration'

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
  editHref: string
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
        <Link
          href={editHref}
          onClick={e => e.stopPropagation()}
          className="text-[12px] text-[#AF4D98] font-medium hover:text-[#9B3D85] transition-colors px-1"
        >
          Edit
        </Link>
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
  if (percentage >= 100) return null
  return (
    <div className="bg-white border border-[#EDE8E3] rounded-[16px] p-4 mb-4">
      <div className="flex items-center justify-between mb-2">
        <p className="text-[13px] font-medium text-[#1A1A1A]">Complete your profile to receive matches</p>
        <span className="text-[12px] font-medium text-[#AF4D98]">{percentage}%</span>
      </div>
      <div className="h-1.5 bg-[#EDE8E3] rounded-full overflow-hidden mb-3">
        <div className="h-1.5 bg-[#AF4D98] rounded-full transition-all" style={{ width: `${percentage}%` }} />
      </div>
      <p className="text-[12px] text-[#9B9B9B]">
        Answer all questions to unlock your matches. Each section has an Edit button.
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
}

// ─── Main component ────────────────────────────────────────────────────────────

const SECTION_LINKS = [
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
}: Props) {
  const router = useRouter()
  const isBrother = gender === 'brother'
  const [activeSection, setActiveSection] = useState<string>('')
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

  const photoUrl = isBrother ? p?.photo_url : p?.photo_urls?.[0]

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
                : (isBrother ? <BrotherIllustration size={64} /> : <SisterIllustration size={64} />)}
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
          <div className="w-24 h-24 rounded-full border-2 border-white shadow-[0_2px_8px_rgba(0,0,0,0.1)] overflow-hidden bg-[#F5E6F2] flex items-center justify-center mb-3">
            {photoUrl
              ? <img src={photoUrl} alt="Profile" className="w-full h-full object-cover" />
              : (isBrother ? <BrotherIllustration size={96} /> : <SisterIllustration size={96} />)}
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

        {/* ── WALI (sisters only) ─────────────────────────────────────────── */}
        {!isBrother && (
          <Section title="Wali" editHref="/dashboard/profile/edit/wali" testId="section-wali">
            <F label="Name"><PillValue v={waliProfile?.full_name} /></F>
            <F label="Relationship"><PillValue v={waliProfile?.relationship} /></F>
            <F label="Email"><TextValue v={waliProfile?.email} /></F>
            <F label="Phone"><TextValue v={waliProfile?.phone} /></F>
            <F label="Preferred Contact"><PillValue v={waliProfile?.preferred_contact_method} /></F>
          </Section>
        )}

        {/* ── BASIC INFO ──────────────────────────────────────────────────── */}
        <Section title="Basic Info" editHref="/dashboard/profile/edit/basic" testId="section-basic">
          <F label="Full Name"><TextValue v={p?.full_name} /></F>
          <F label="Age"><TextValue v={p?.age ? String(p.age) : null} /></F>
          <F label="Location"><TextValue v={p?.location} /></F>
          <F label="Ethnicity"><TextValue v={p?.ethnicity} /></F>
          <FW label="Languages"><TextValue v={Array.isArray(p?.languages) ? p.languages.join(', ') : p?.languages} /></FW>
          <F label="Willing to Relocate"><BoolValue v={p?.willing_to_relocate} /></F>
        </Section>

        {/* ── DEEN & PRACTICE ─────────────────────────────────────────────── */}
        <Section title="Deen & Practice" editHref="/dashboard/profile/edit/deen" testId="section-deen">
          <F label="Religiosity"><PillValue v={p?.religiosity_level} /></F>
          <F label="Prayer Frequency"><PillValue v={p?.prayer_frequency} /></F>
          <F label="Madhab"><PillValue v={p?.madhab} /></F>
          <F label="Islamic Knowledge"><PillValue v={p?.islamic_knowledge_level} /></F>
          {isBrother
            ? <F label="Has Beard"><BoolValue v={p?.has_beard} /></F>
            : <F label="Wears Hijab"><PillValue v={p?.wears_hijab} /></F>}
          <F label="Quran Listening"><PillValue v={p?.quran_listening} /></F>
          <F label="Quran Memorisation"><PillValue v={p?.quran_memorisation} /></F>
          <F label="Zakah & Sadaqah"><PillValue v={p?.zakah_sadaqah} /></F>
          <F label="Madhab Consistency"><PillValue v={p?.madhab_consistency} /></F>
          <F label="Mawlid View"><PillValue v={p?.mawlid_view} /></F>
          <F label="Spouse Islamic Knowledge"><PillValue v={p?.spouse_islamic_knowledge} /></F>
          {isBrother && <F label="Missed Prayer"><PillValue v={p?.missed_prayer_approach} /></F>}
          {isBrother && <F label="Wife Niqab Pref"><PillValue v={p?.wife_niqab_preference} /></F>}
          {!isBrother && <F label="Islamic Home Importance"><PillValue v={p?.islamic_home_importance} /></F>}
          <FW label="Traditional ↔ Reformist">
            <SliderValue v={p?.traditional_vs_reformist} />
          </FW>
          {p?.deen_growth && <FW label="Deen Growth"><TextValue v={p.deen_growth} /></FW>}
          {!isBrother && p?.deen_when_busy && <FW label="Deen When Busy"><TextValue v={p.deen_when_busy} /></FW>}
        </Section>

        {/* ── FAMILY DYNAMICS ─────────────────────────────────────────────── */}
        <Section title="Family Dynamics" editHref="/dashboard/profile/edit/family" testId="section-family">
          {isBrother
            ? <>
                <F label="Wife–Family Interaction"><PillValue v={p?.wife_family_interaction} /></F>
                <F label="Eldest Responsibilities"><PillValue v={p?.eldest_responsibilities} /></F>
                <F label="Child Caregiving"><PillValue v={p?.child_caregiving} /></F>
                <F label="Wife–Family Relationship"><PillValue v={p?.wife_family_relationship} /></F>
                <F label="Living Near Parents"><PillValue v={p?.living_near_parents} /></F>
              </>
            : <>
                <F label="Family Balance After Marriage"><PillValue v={p?.family_balance_after_marriage} /></F>
                <F label="Family Financial Responsibility"><PillValue v={p?.family_financial_responsibility} /></F>
                <F label="In-Laws Comfort"><PillValue v={p?.inlaws_comfort} /></F>
                <F label="Husband–Family Relationship"><PillValue v={p?.husband_family_relationship} /></F>
                <F label="Family: Trad vs Modern"><PillValue v={p?.family_traditional_vs_modern} /></F>
              </>}
          <F label="Family Conflict Style"><PillValue v={p?.family_conflict_style} /></F>
          {p?.parent_relationship && <FW label="Relationship with Parents"><TextValue v={p.parent_relationship} /></FW>}
          {p?.family_spouse_disagreement && <FW label="Family vs Spouse Disagreements"><TextValue v={p.family_spouse_disagreement} /></FW>}
        </Section>

        {/* ── LIFESTYLE ───────────────────────────────────────────────────── */}
        <Section title="Lifestyle" editHref="/dashboard/profile/edit/lifestyle" testId="section-lifestyle">
          <F label="Occupation"><TextValue v={p?.occupation} /></F>
          <F label="Education"><PillValue v={p?.education_level} /></F>
          <F label="Living Situation"><PillValue v={p?.living_situation} /></F>
          <F label="Exercise Frequency"><PillValue v={p?.exercise_frequency} /></F>
          <F label="Halal Diet"><PillValue v={p?.strict_halal_diet} /></F>
          <F label="Smoking"><PillValue v={p?.smoking} /></F>
          <F label="Pets"><PillValue v={p?.pets_view} /></F>
          <F label="Healthy Eating"><PillValue v={p?.healthy_eating_importance} /></F>
          <F label="Social Media"><PillValue v={p?.social_media_view} /></F>
          <F label="Home Organisation"><PillValue v={p?.home_organisation} /></F>
          <F label="Mixed Social Circle"><PillValue v={p?.mixed_gender_social_circle} /></F>
          <F label="Music"><PillValue v={p?.do_you_listen_to_music} /></F>
          <F label="Non-Islamic Holidays"><PillValue v={p?.celebrate_non_islamic_holidays} /></F>
          {isBrother
            ? <F label="Travel"><PillValue v={p?.travel_frequency} /></F>
            : <F label="Travel"><PillValue v={p?.travel_importance} /></F>}
          <F label="Political Views"><PillValue v={p?.political_views} /></F>
          <FW label="Cultural Background Importance">
            <SliderValue v={p?.cultural_background_importance} left="Not important" right="Very important" />
          </FW>
          {p?.weekend_lifestyle && <FW label="Weekend Lifestyle"><TextValue v={p.weekend_lifestyle} /></FW>}
          {p?.ramadan_routine && <FW label="Ramadan Routine"><TextValue v={p.ramadan_routine} /></FW>}
        </Section>

        {/* ── MARRIAGE GOALS ───────────────────────────────────────────────── */}
        <Section title="Marriage Goals" editHref="/dashboard/profile/edit/marriage" testId="section-marriage">
          <F label="Timeline"><PillValue v={p?.timeline_to_marry} /></F>
          <F label="Previously Married"><BoolValue v={p?.previously_married} /></F>
          <F label="Has Children"><BoolValue v={p?.has_children} /></F>
          <F label="Wants Children"><BoolValue v={p?.wants_children} /></F>
          <F label="Number of Children"><PillValue v={p?.number_of_children_wanted} /></F>
          {isBrother && <F label="Polygamy Openness"><BoolValue v={p?.polygamy_openness} /></F>}
          {isBrother && <F label="Polygamy in Own Marriage"><PillValue v={p?.polygamy_own_marriage} /></F>}
        </Section>

        {/* ── SPOUSE PREFERENCES ───────────────────────────────────────────── */}
        <Section title="Spouse Preferences" editHref="/dashboard/profile/edit/preferences" testId="section-preferences">
          <F label="Religiosity Preference"><PillValue v={p?.spouse_religiosity_preference} /></F>
          <F label="Age Range">
            <TextValue v={p?.spouse_age_min && p?.spouse_age_max ? `${p.spouse_age_min}–${p.spouse_age_max}` : null} />
          </F>
          {p?.dealbreakers?.length
            ? <FW label="Dealbreakers"><ArrayValue v={p.dealbreakers} /></FW>
            : <FW label="Dealbreakers"><span className="text-[14px] text-[#9B9B9B]">—</span></FW>}
        </Section>

        {/* ── FINANCIAL ────────────────────────────────────────────────────── */}
        <Section title="Financial" editHref="/dashboard/profile/edit/financial" testId="section-financial">
          {isBrother && <>
            <F label="Annual Income"><PillValue v={p?.annual_income_range} /></F>
            <F label="Own or Rent"><PillValue v={p?.own_or_rent} /></F>
            <F label="Financial Readiness"><PillValue v={p?.financial_readiness} /></F>
            <F label="Hajj Status"><PillValue v={p?.hajj_status} /></F>
            <F label="Wife Financial Independence"><PillValue v={p?.wife_financial_independence} /></F>
            <F label="Wife Earning More"><PillValue v={p?.wife_earning_more} /></F>
            <F label="Financial Planning"><PillValue v={p?.financial_planning_approach} /></F>
          </>}
          <F label="Savings Plan"><PillValue v={p?.savings_plan} /></F>
          <F label="Significant Debt"><PillValue v={p?.has_significant_debt} /></F>
          <F label="Supporting Family"><PillValue v={p?.supporting_family_financially} /></F>
          {isBrother && p?.mahr_approach && <FW label="Mahr Approach"><TextValue v={p.mahr_approach} /></FW>}
          {p?.financial_stress_approach && <FW label="Financial Stress Approach"><TextValue v={p.financial_stress_approach} /></FW>}
        </Section>

        {/* ── EMOTIONAL & MENTAL HEALTH ────────────────────────────────────── */}
        <Section title="Emotional & Mental Health" editHref="/dashboard/profile/edit/emotional" defaultOpen={false} testId="section-emotional">
          <F label="Therapy Experience"><PillValue v={p?.therapy_experience} /></F>
          <F label="Couples Therapy View"><PillValue v={p?.couples_therapy_view} /></F>
          <F label="Mental Health Challenges"><PillValue v={p?.mental_health_challenges} /></F>
          <F label="Emotional Expression"><PillValue v={p?.emotional_expression_view} /></F>
          <FW label="Emotional Availability">
            <SliderValue v={p?.emotional_availability} left="Needs space" right="Very available" />
          </FW>
          {p?.stress_management && <FW label="Stress Management"><TextValue v={p.stress_management} /></FW>}
          {p?.emotional_support_style && <FW label="Emotional Support Style"><TextValue v={p.emotional_support_style} /></FW>}
          {p?.significant_hardship && <FW label="Significant Hardship"><TextValue v={p.significant_hardship} /></FW>}
        </Section>

        {/* ── CONFLICT & COMMUNICATION ─────────────────────────────────────── */}
        <Section title="Conflict & Communication" editHref="/dashboard/profile/edit/communication" defaultOpen={false} testId="section-communication">
          <F label="Conflict Style"><PillValue v={p?.conflict_style} /></F>
          <F label="Personality"><PillValue v={p?.introvert_extrovert} /></F>
          <F label="Alone Time"><PillValue v={p?.alone_time_importance} /></F>
          <F label="Apology Speed"><PillValue v={p?.apology_speed} /></F>
          <F label="Communication When Upset"><PillValue v={p?.communication_when_upset} /></F>
          {isBrother
            ? <>
                <F label="Husband Final Say"><PillValue v={p?.husband_final_say} /></F>
                <F label="Wife Opinion Importance"><PillValue v={p?.wife_opinion_importance} /></F>
                <F label="Friendship Ended"><PillValue v={p?.friendship_ended} /></F>
              </>
            : <>
                <F label="Qawwam View"><PillValue v={p?.qawwam_view} /></F>
                <F label="Husband Opinion Importance"><PillValue v={p?.husband_opinion_importance} /></F>
                <F label="Receiving Love Language"><PillValue v={p?.receiving_love_language} /></F>
              </>}
          <FW label="Love Language"><ArrayValue v={p?.love_language} /></FW>
          {p?.healthy_argument_view && <FW label="Healthy Argument View"><TextValue v={p.healthy_argument_view} /></FW>}
        </Section>

        {/* ── HOUSEHOLD (brothers) / CAREER (sisters) ──────────────────────── */}
        {isBrother ? (
          <Section title="Household" editHref="/dashboard/profile/edit/household" defaultOpen={false} testId="section-household">
            <F label="Wife Working Openness"><PillValue v={p?.wife_working_openness} /></F>
            <F label="Household Management"><PillValue v={p?.household_management} /></F>
            <F label="In-Laws Living Together"><PillValue v={p?.inlaws_living_together} /></F>
            <F label="Islamic Schooling"><PillValue v={p?.islamic_schooling_importance} /></F>
            <F label="Child Caregiving"><PillValue v={p?.child_caregiving} /></F>
            <F label="Non-Islamic Holidays"><PillValue v={p?.celebrate_non_islamic_holidays} /></F>
            <F label="Jumu&apos;ah Attendance"><PillValue v={p?.jumuah_attendance} /></F>
            <F label="Wife Hijab Importance"><PillValue v={p?.wife_hijab_importance} /></F>
          </Section>
        ) : (
          <Section title="Career" editHref="/dashboard/profile/edit/career" defaultOpen={false} testId="section-career">
            <F label="Work After Marriage"><PillValue v={p?.plan_to_work_after_marriage} /></F>
            <F label="Career Pause for Children"><PillValue v={p?.career_pause_for_children} /></F>
            <F label="Financial Dependence View"><PillValue v={p?.financial_dependence_view} /></F>
            <F label="Financial Independence"><PillValue v={p?.financial_independence_importance} /></F>
            <FW label="Career Identity Importance">
              <SliderValue v={p?.career_identity_importance} left="Not central" right="Core identity" />
            </FW>
            {p?.career_five_years && <FW label="Career in 5 Years"><TextValue v={p.career_five_years} /></FW>}
            {p?.career_ambitions && <FW label="Career Ambitions"><TextValue v={p.career_ambitions} /></FW>}
          </Section>
        )}

        {/* ── CHARACTER & GOALS ────────────────────────────────────────────── */}
        <Section title="Character & Goals" editHref="/dashboard/profile/edit/character" testId="section-character">
          {p?.character_description
            ? <FW label="About Me"><TextValue v={p.character_description} /></FW>
            : <FW label="About Me"><span className="text-[14px] text-[#9B9B9B]">—</span></FW>}
          {p?.goals
            ? <FW label="My Goals"><TextValue v={p.goals} /></FW>
            : <FW label="My Goals"><span className="text-[14px] text-[#9B9B9B]">—</span></FW>}
        </Section>

        {/* ── MARRIAGE VISION ──────────────────────────────────────────────── */}
        <Section title="Marriage Vision" editHref="/dashboard/profile/edit/vision" defaultOpen={false} testId="section-vision">
          <F label="Physical Intimacy"><PillValue v={p?.physical_intimacy_importance} /></F>
          <F label="Spouse Friendships"><PillValue v={p?.spouse_friendships_view} /></F>
          {p?.marriage_vision_10_years && <FW label="10-Year Vision"><TextValue v={p.marriage_vision_10_years} /></FW>}
          {p?.first_year_vision && <FW label="First Year"><TextValue v={p.first_year_vision} /></FW>}
          {p?.romance_view && <FW label="Romance"><TextValue v={p.romance_view} /></FW>}
          {p?.marriage_fear && <FW label="Marriage Fear"><TextValue v={p.marriage_fear} /></FW>}
          {p?.unique_contribution && <FW label="Unique Contribution"><TextValue v={p.unique_contribution} /></FW>}
          {!isBrother && p?.ideal_husband_description && <FW label="Ideal Husband"><TextValue v={p.ideal_husband_description} /></FW>}
        </Section>

        {/* ── PHOTO(S) ─────────────────────────────────────────────────────── */}
        {isBrother ? (
          <Section title="Photo" editHref="/dashboard/profile/edit/photo" testId="section-photo">
            <FW label="">
              {p?.photo_url
                ? <img src={p.photo_url} alt="Profile" className="w-20 h-20 rounded-[12px] object-cover border border-[#EDE8E3]" />
                : <span className="text-[14px] text-[#9B9B9B]">No photo uploaded yet</span>}
            </FW>
          </Section>
        ) : (
          <Section title="Photos" editHref="/dashboard/profile/edit/photos" testId="section-photos">
            <FW label="">
              {p?.photo_urls?.length
                ? <div className="flex flex-wrap gap-2">
                    {p.photo_urls.map((url: string, i: number) => (
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
              <F label="Relationship"><TextValue v={reference.relationship} /></F>
              <F label="Email"><TextValue v={reference.referee_email} /></F>
              <F label="Status">
                {reference.verified
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
