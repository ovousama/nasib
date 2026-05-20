import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { getProfile, getProfileForViewing } from '@/lib/database'
import ProfileInterestActions from '@/components/dashboard/ProfileInterestActions'

type Props = {
  params: Promise<{ userId: string }>
  searchParams: Promise<{ context?: string; interestId?: string }>
}

// ─── Shared UI Atoms ──────────────────────────────────────────────────────────

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-[16px] border border-[#EDE8E3] shadow-[0_1px_3px_rgba(0,0,0,0.06)] p-5 mb-3">
      <p className="text-[11px] font-medium uppercase tracking-[0.06em] text-[#9B9B9B] mb-4">{title}</p>
      {children}
    </div>
  )
}

function Row({ label, value }: { label: string; value: string | number | boolean | string[] | null | undefined }) {
  if (value === null || value === undefined || value === '') return null
  if (Array.isArray(value) && value.length === 0) return null
  const display = Array.isArray(value)
    ? value.join(', ')
    : typeof value === 'boolean'
    ? value ? 'Yes' : 'No'
    : String(value)
  return (
    <div className="flex justify-between items-start py-2.5 border-b border-[#EDE8E3] last:border-0 gap-4">
      <span className="text-xs text-[#9B9B9B] flex-shrink-0">{label}</span>
      <span className="text-sm text-[#1A1A1A] font-medium text-right">{display}</span>
    </div>
  )
}

function Pills({ items }: { items: string[] | null | undefined }) {
  if (!items?.length) return null
  return (
    <div className="flex flex-wrap gap-1.5 mt-1">
      {items.map(d => (
        <span key={d} className="text-xs bg-[#FDF3F9] text-[#AF4D98] border border-[#AF4D98]/20 px-3 py-1 rounded-full font-medium">
          {d}
        </span>
      ))}
    </div>
  )
}

function DealbreakPills({ items }: { items: string[] | null | undefined }) {
  if (!items?.length) return null
  return (
    <div className="flex flex-wrap gap-1.5 mt-1">
      {items.map(d => (
        <span key={d} className="text-xs bg-red-50 text-red-700 border border-red-100 px-3 py-1 rounded-full">
          {d}
        </span>
      ))}
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function PublicProfilePage({ params, searchParams }: Props) {
  const { userId } = await params
  const { context, interestId } = await searchParams

  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  // Don't let users view their own profile via this route
  if (userId === user.id) redirect('/dashboard/profile')

  const [viewerProfile, targetProfile, profileData] = await Promise.all([
    getProfile(user.id),
    getProfile(userId),
    getProfileForViewing(userId),
  ])

  if (!targetProfile) notFound()

  if (!profileData) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 20px' }}>
        <p style={{ fontSize: '16px', color: '#9B9B9B' }}>
          Profile not available
        </p>
        <Link href="/dashboard">Go back</Link>
      </div>
    )
  }

  const isInterestContext = context === 'interest' && !!interestId
  const firstName = profileData.full_name?.split(' ')[0] ?? ''
  const isBrother = targetProfile.gender === 'brother'

  // A brother viewing a sister sees no photo. A sister viewing a brother sees photo (public bucket).
  let photoUrl: string | null = null
  if (isBrother && profileData.photo_url) {
    const path = profileData.photo_url
    if (path.startsWith('http')) {
      photoUrl = path
    } else {
      const supabase = await createServerSupabaseClient()
      const { data } = supabase.storage.from('brother-photos').getPublicUrl(path)
      photoUrl = data.publicUrl
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const p = profileData as any

  // suppress unused warning — kept for intent clarity
  void viewerProfile

  return (
    <div className={`min-h-screen bg-[#FDF8F3] ${isInterestContext ? 'pb-28' : 'pb-8'}`}>
      {/* Header */}
      <div className="flex items-center gap-3 px-5 py-4 border-b border-[#EDE8E3] bg-white sticky top-0 z-10">
        <Link href="/dashboard" className="text-[#9B9B9B] hover:text-[#5C5C5C] transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
            <path fillRule="evenodd" d="M17 10a.75.75 0 01-.75.75H5.612l4.158 3.96a.75.75 0 11-1.04 1.08l-5.5-5.25a.75.75 0 010-1.08l5.5-5.25a.75.75 0 111.04 1.08L5.612 9.25H16.25A.75.75 0 0117 10z" clipRule="evenodd" />
          </svg>
        </Link>
        <h1 className="text-base font-medium text-[#1A1A1A]">{firstName}&apos;s Profile</h1>
      </div>

      {/* Hero */}
      <div className="bg-white border-b border-[#EDE8E3] px-5 pt-8 pb-7 flex flex-col items-center text-center">
        {isBrother && photoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={photoUrl}
            alt={firstName}
            className="w-[96px] h-[96px] rounded-full object-cover border-2 border-white shadow-[0_2px_8px_rgba(0,0,0,0.08)]"
          />
        ) : (
          <div className="w-[96px] h-[96px] rounded-full bg-[#F4E4BA] flex items-center justify-center text-[#AF4D98] text-3xl font-medium">
            {firstName[0]?.toUpperCase()}
          </div>
        )}
        <p className="text-[11px] font-medium uppercase tracking-[0.1em] text-[#AF4D98]/50 mt-4 mb-0.5">نصيب</p>
        <h2 data-testid="profile-name" className="text-[28px] font-medium text-[#1A1A1A] tracking-[-0.02em]">{firstName}</h2>
        <p className="text-[15px] text-[#9B9B9B] mt-1">
          {[profileData.age ? `${profileData.age} yrs` : null, profileData.location].filter(Boolean).join(' · ')}
        </p>
        {targetProfile.verification_badge && (
          <span className="mt-2.5 inline-flex items-center gap-1.5 bg-[#F9F0F6] text-[#AF4D98] text-xs font-medium px-3 py-1.5 rounded-full border border-[#AF4D98]/20">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
            </svg>
            Verified
          </span>
        )}
        {[profileData.ethnicity, profileData.languages?.join(', ')].filter(Boolean).length > 0 && (
          <p className="text-[13px] text-[#9B9B9B] mt-2">
            {[profileData.ethnicity, profileData.languages?.join(', ')].filter(Boolean).join(' · ')}
          </p>
        )}
      </div>

      {/* Content */}
      <div className="px-4 pt-4">

        {/* Deen & Practice */}
        <Section title="Deen & Practice">
          <Row label="Religiosity" value={profileData.religiosity_level} />
          <Row label="Prayer Frequency" value={profileData.prayer_frequency} />
          <Row label="Madhab" value={profileData.madhab} />
          <Row label="Islamic Knowledge" value={profileData.islamic_knowledge_level} />
          {isBrother ? (
            <>
              <Row label="Has Beard" value={profileData.has_beard} />
              <Row label="Attends Jumu'ah" value={p.jumuah_attendance} />
            </>
          ) : (
            <>
              <Row label="Wears Hijab" value={profileData.wears_hijab} />
              <Row label="Attends Halaqas" value={p.islamic_classes_attendance} />
            </>
          )}
          <Row label="Listens to Music" value={p.do_you_listen_to_music} />
          <Row label="Non-Islamic Holidays" value={p.celebrate_non_islamic_holidays} />
          {p.differing_islamic_opinions && (
            <div className="pt-2.5">
              <p className="text-xs text-[#9B9B9B] mb-1">On Differing Opinions</p>
              <p className="text-sm text-[#1A1A1A] font-medium leading-relaxed">{p.differing_islamic_opinions}</p>
            </div>
          )}
        </Section>

        {/* Lifestyle */}
        <Section title="Lifestyle">
          <Row label="Occupation" value={profileData.occupation} />
          <Row label="Education" value={profileData.education_level} />
          <Row label="Living Situation" value={profileData.living_situation} />
          <Row label="Willing to Relocate" value={profileData.willing_to_relocate} />
          <Row label="Strict Halal Diet" value={p.strict_halal_diet} />
          <Row label="Smoking" value={p.smoking} />
          <Row label="Mixed Social Circle" value={p.mixed_gender_social_circle} />
          <Row label="Travel" value={isBrother ? p.travel_frequency : p.travel_importance} />
          {p.weekend_lifestyle && (
            <div className="pt-2.5">
              <p className="text-xs text-[#9B9B9B] mb-1">Weekend Lifestyle</p>
              <p className="text-sm text-[#1A1A1A] font-medium leading-relaxed">{p.weekend_lifestyle}</p>
            </div>
          )}
        </Section>

        {/* Marriage & Family */}
        <Section title="Marriage & Family">
          <Row label="Timeline" value={profileData.timeline_to_marry} />
          <Row label="Wants Children" value={profileData.wants_children} />
          <Row label="Number of Children" value={p.number_of_children_wanted} />
          <Row label="Previously Married" value={profileData.previously_married} />
          <Row label="Has Children" value={profileData.has_children} />
          <Row label="Islamic Schooling" value={p.islamic_schooling_importance} />
          <Row label="In-Laws Together" value={p.inlaws_living_together} />
          {isBrother && <Row label="Open to Polygamy" value={profileData.polygamy_openness} />}
        </Section>

        {/* Financial (brothers) or Career (sisters) */}
        {isBrother ? (
          <Section title="Financial & Practical">
            <Row label="Financial Readiness" value={profileData.financial_readiness} />
            <Row label="Annual Income" value={p.annual_income_range} />
            <Row label="Own or Rent" value={p.own_or_rent} />
            <Row label="Significant Debt" value={p.has_significant_debt} />
            <Row label="Supporting Family" value={p.supporting_family_financially} />
            <Row label="Wife Working" value={p.wife_working_openness} />
            <Row label="Household Management" value={p.household_management} />
            {p.mahr_approach && (
              <div className="pt-2.5">
                <p className="text-xs text-[#9B9B9B] mb-1">Mahr Approach</p>
                <p className="text-sm text-[#1A1A1A] font-medium leading-relaxed">{p.mahr_approach}</p>
              </div>
            )}
          </Section>
        ) : (
          <Section title="Career & Independence">
            <Row label="Work After Marriage" value={p.plan_to_work_after_marriage} />
            <Row label="Financial Independence" value={p.financial_independence_importance} />
            <Row label="Significant Debt" value={p.has_significant_debt} />
            <Row label="Supporting Family" value={p.supporting_family_financially} />
            <Row label="Primary Caregiver" value={p.primary_caregiver_comfort} />
            {p.career_ambitions && (
              <div className="pt-2.5">
                <p className="text-xs text-[#9B9B9B] mb-1">Career Ambitions</p>
                <p className="text-sm text-[#1A1A1A] font-medium leading-relaxed">{p.career_ambitions}</p>
              </div>
            )}
            {p.household_responsibilities_vision && (
              <div className="pt-2.5">
                <p className="text-xs text-[#9B9B9B] mb-1">Household Vision</p>
                <p className="text-sm text-[#1A1A1A] font-medium leading-relaxed">{p.household_responsibilities_vision}</p>
              </div>
            )}
          </Section>
        )}

        {/* Personality */}
        <Section title="Personality">
          <Row label="Conflict Style" value={p.conflict_style} />
          <Row label="Personality" value={p.introvert_extrovert} />
          <Row label="Alone Time" value={p.alone_time_importance} />
          {p.love_language?.length ? (
            <div className="pt-2.5">
              <p className="text-xs text-[#9B9B9B] mb-2">Love Language</p>
              <Pills items={p.love_language} />
            </div>
          ) : null}
        </Section>

        {/* About */}
        {(profileData.character_description || profileData.goals) && (
          <Section title="About">
            {profileData.character_description && (
              <div className="mb-4 last:mb-0">
                <p className="text-xs text-[#9B9B9B] mb-1.5">About Me</p>
                <p className="text-sm text-[#1A1A1A] font-medium leading-relaxed">{profileData.character_description}</p>
              </div>
            )}
            {profileData.goals && (
              <div>
                <p className="text-xs text-[#9B9B9B] mb-1.5">My Goals</p>
                <p className="text-sm text-[#1A1A1A] font-medium leading-relaxed">{profileData.goals}</p>
              </div>
            )}
          </Section>
        )}

        {/* Spouse Preferences */}
        <Section title="Spouse Preferences">
          <Row label="Religiosity Preference" value={profileData.spouse_religiosity_preference} />
          <Row
            label="Preferred Age Range"
            value={
              profileData.spouse_age_min && profileData.spouse_age_max
                ? `${profileData.spouse_age_min}–${profileData.spouse_age_max}`
                : null
            }
          />
          {profileData.dealbreakers?.length ? (
            <div className="pt-2.5">
              <p className="text-xs text-[#9B9B9B] mb-2">Dealbreakers</p>
              <DealbreakPills items={profileData.dealbreakers} />
            </div>
          ) : null}
        </Section>

        {/* Reference */}
        <Section title="Character Reference">
          {!profileData.reference ? (
            <p className="text-sm text-[#9B9B9B]">Reference questionnaire has been sent and is awaiting response.</p>
          ) : profileData.reference.status === 'pending' ? (
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 bg-amber-50 text-amber-700 text-xs font-medium px-3 py-1.5 rounded-full border border-amber-100">
                Reference pending verification
              </span>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-2 mb-4">
                <span className="inline-flex items-center gap-1.5 bg-[#E6F9F7] text-[#00A699] text-xs font-medium px-3 py-1.5 rounded-full">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-3 h-3">
                    <path fillRule="evenodd" d="M8 15A7 7 0 108 1a7 7 0 000 14zm3.844-8.791a.75.75 0 00-1.188-.918l-3.7 4.79-1.649-1.833a.75.75 0 10-1.114 1.004l2.25 2.5a.75.75 0 001.15-.086l4.25-5.5-.001-.002z" clipRule="evenodd" />
                  </svg>
                  This profile has a verified reference
                </span>
              </div>
              <Row label="Referee" value={profileData.reference.referee_name} />
              <Row label="Relationship" value={profileData.reference.referee_relationship} />
              <Row label="How Long Known" value={profileData.reference.how_long_known} />
              <Row label="Ready for Marriage" value={profileData.reference.ready_for_marriage} />
              <Row label="Would Recommend" value={profileData.reference.would_recommend} />
              {profileData.reference.character_description && (
                <div className="pt-2.5">
                  <p className="text-xs text-[#9B9B9B] mb-1.5">Character Description</p>
                  <p className="text-sm text-[#1A1A1A] font-medium leading-relaxed italic">
                    &ldquo;{profileData.reference.character_description}&rdquo;
                  </p>
                </div>
              )}
              {profileData.reference.islamic_practice_description && (
                <div className="pt-2.5">
                  <p className="text-xs text-[#9B9B9B] mb-1.5">Islamic Practice</p>
                  <p className="text-sm text-[#1A1A1A] font-medium leading-relaxed italic">
                    &ldquo;{profileData.reference.islamic_practice_description}&rdquo;
                  </p>
                </div>
              )}
            </>
          )}
        </Section>

      </div>

      {/* Sticky interest actions */}
      {isInterestContext && interestId && (
        <ProfileInterestActions interestId={interestId} />
      )}
    </div>
  )
}
