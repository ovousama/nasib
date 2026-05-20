import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { getProfile, getProfileForViewing } from '@/lib/database'
import { getConnectionBetween } from '@/lib/connections'
import ProfileInterestActions from '@/components/dashboard/ProfileInterestActions'
import { getFieldLabel } from '@/lib/field-labels'

type Props = {
  params: Promise<{ userId: string }>
  searchParams: Promise<{ context?: string; interestId?: string; connectionId?: string }>
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
  const { context, interestId, connectionId: connectionIdParam } = await searchParams

  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  // Don't let users view their own profile via this route
  if (userId === user.id) redirect('/dashboard/profile')

  const isInterestContext = context === 'interest' && !!interestId

  // Check if a live connection exists between viewer and target
  const activeConnectionId = await getConnectionBetween(user.id, userId)

  // If no interest context and no active connection, redirect to dashboard
  if (!isInterestContext && !activeConnectionId) {
    redirect('/dashboard')
  }

  const [targetProfile, profileData] = await Promise.all([
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

  const firstName = profileData.full_name?.split(' ')[0] ?? ''
  const isBrother = targetProfile.gender === 'brother'
  const gender: 'brother' | 'sister' = isBrother ? 'brother' : 'sister'

  // Resolve back URL: prefer the explicit connectionId param, fall back to activeConnectionId
  const backConnectionId = connectionIdParam ?? activeConnectionId
  const backHref = backConnectionId ? `/dashboard/chat/${backConnectionId}` : '/dashboard'
  const backLabel = backConnectionId ? 'Back to Chat' : 'Dashboard'

  // Photo resolution:
  // - Brother → public bucket, use getPublicUrl
  // - Sister + connected → fetch all signed URLs from private bucket
  // - Sister + interest only → no photos shown
  const photoUrls: string[] = []
  if (isBrother && profileData.photo_url) {
    const path = profileData.photo_url
    const url = path.startsWith('http')
      ? path
      : supabase.storage.from('brother-photos').getPublicUrl(path).data.publicUrl
    photoUrls.push(url)
  } else if (!isBrother && activeConnectionId) {
    const { data: sp } = await supabase
      .from('sister_profiles')
      .select('photo_urls')
      .eq('id', userId)
      .maybeSingle()
    const paths: string[] = sp?.photo_urls ?? []
    for (const path of paths) {
      const { data: signed } = await supabase.storage
        .from('sister-photos')
        .createSignedUrl(path, 3600)
      if (signed?.signedUrl) photoUrls.push(signed.signedUrl)
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const p = profileData as any

  return (
    <div className={`min-h-screen bg-[#FDF8F3] ${isInterestContext ? 'pb-28' : 'pb-8'}`}>
      {/* Header */}
      <div className="flex items-center gap-3 px-5 py-4 border-b border-[#EDE8E3] bg-white sticky top-0 z-10">
        <Link href={backHref} className="text-[#9B9B9B] hover:text-[#5C5C5C] transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
            <path fillRule="evenodd" d="M17 10a.75.75 0 01-.75.75H5.612l4.158 3.96a.75.75 0 11-1.04 1.08l-5.5-5.25a.75.75 0 010-1.08l5.5-5.25a.75.75 0 111.04 1.08L5.612 9.25H16.25A.75.75 0 0117 10z" clipRule="evenodd" />
          </svg>
        </Link>
        <h1 className="text-base font-medium text-[#1A1A1A] flex-1">{firstName}&apos;s Profile</h1>
        {backConnectionId && (
          <Link href={backHref} className="text-xs text-[#AF4D98] font-medium">
            {backLabel}
          </Link>
        )}
      </div>

      {/* Hero */}
      <div className="bg-white border-b border-[#EDE8E3] px-5 pt-8 pb-7 flex flex-col items-center text-center">
        {photoUrls.length > 0 ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={photoUrls[0]}
            alt={firstName}
            className="w-[96px] h-[96px] rounded-full object-cover border-2 border-white shadow-[0_2px_8px_rgba(0,0,0,0.08)]"
          />
        ) : (
          <div className="w-[96px] h-[96px] rounded-full bg-[#F4E4BA] flex items-center justify-center text-[#AF4D98] text-3xl font-medium">
            {firstName[0]?.toUpperCase()}
          </div>
        )}
        {photoUrls.length > 1 && (
          <div className="flex gap-2 justify-center mt-3 flex-wrap">
            {photoUrls.slice(1).map((url, i) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={i}
                src={url}
                alt={`Photo ${i + 2}`}
                className="w-[60px] h-[60px] rounded-[8px] object-cover border border-[#EDE8E3]"
              />
            ))}
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
          <Row label={getFieldLabel('religiosity_level', gender)} value={profileData.religiosity_level} />
          <Row label={getFieldLabel('prayer_frequency', gender)} value={profileData.prayer_frequency} />
          <Row label={getFieldLabel('madhab', gender)} value={profileData.madhab} />
          <Row label={getFieldLabel('islamic_knowledge_level', gender)} value={profileData.islamic_knowledge_level} />
          {isBrother ? (
            <>
              <Row label={getFieldLabel('has_beard', gender)} value={profileData.has_beard} />
              <Row label={getFieldLabel('jumuah_attendance', gender)} value={p.jumuah_attendance} />
            </>
          ) : (
            <>
              <Row label={getFieldLabel('wears_hijab', gender)} value={profileData.wears_hijab} />
              <Row label={getFieldLabel('islamic_classes_attendance', gender)} value={p.islamic_classes_attendance} />
            </>
          )}
          <Row label={getFieldLabel('do_you_listen_to_music', gender)} value={p.do_you_listen_to_music} />
          <Row label={getFieldLabel('celebrate_non_islamic_holidays', gender)} value={p.celebrate_non_islamic_holidays} />
          {p.differing_islamic_opinions && (
            <div className="pt-2.5">
              <p className="text-xs text-[#9B9B9B] mb-1">On Differing Opinions</p>
              <p className="text-sm text-[#1A1A1A] font-medium leading-relaxed">{p.differing_islamic_opinions}</p>
            </div>
          )}
        </Section>

        {/* Lifestyle */}
        <Section title="Lifestyle">
          <Row label={getFieldLabel('occupation', gender)} value={profileData.occupation} />
          <Row label={getFieldLabel('education_level', gender)} value={profileData.education_level} />
          <Row label={getFieldLabel('living_situation', gender)} value={profileData.living_situation} />
          <Row label={getFieldLabel('willing_to_relocate', gender)} value={profileData.willing_to_relocate} />
          <Row label={getFieldLabel('strict_halal_diet', gender)} value={p.strict_halal_diet} />
          <Row label={getFieldLabel('smoking', gender)} value={p.smoking} />
          <Row label={getFieldLabel('mixed_gender_social_circle', gender)} value={p.mixed_gender_social_circle} />
          <Row label={getFieldLabel(isBrother ? 'travel_frequency' : 'travel_importance', gender)} value={isBrother ? p.travel_frequency : p.travel_importance} />
          {p.weekend_lifestyle && (
            <div className="pt-2.5">
              <p className="text-xs text-[#9B9B9B] mb-1">Weekend Lifestyle</p>
              <p className="text-sm text-[#1A1A1A] font-medium leading-relaxed">{p.weekend_lifestyle}</p>
            </div>
          )}
        </Section>

        {/* Marriage & Family */}
        <Section title="Marriage & Family">
          <Row label={getFieldLabel('timeline_to_marry', gender)} value={profileData.timeline_to_marry} />
          <Row label={getFieldLabel('wants_children', gender)} value={profileData.wants_children} />
          <Row label={getFieldLabel('number_of_children_wanted', gender)} value={p.number_of_children_wanted} />
          <Row label={getFieldLabel('previously_married', gender)} value={profileData.previously_married} />
          <Row label={getFieldLabel('has_children', gender)} value={profileData.has_children} />
          <Row label={getFieldLabel('islamic_schooling_importance', gender)} value={p.islamic_schooling_importance} />
          <Row label={getFieldLabel('inlaws_living_together', gender)} value={p.inlaws_living_together} />
          {isBrother && <Row label={getFieldLabel('polygamy_openness', gender)} value={profileData.polygamy_openness} />}
        </Section>

        {/* Financial (brothers) or Career (sisters) */}
        {isBrother ? (
          <Section title="Financial & Practical">
            <Row label={getFieldLabel('financial_readiness', gender)} value={profileData.financial_readiness} />
            <Row label={getFieldLabel('annual_income_range', gender)} value={p.annual_income_range} />
            <Row label={getFieldLabel('own_or_rent', gender)} value={p.own_or_rent} />
            <Row label={getFieldLabel('has_significant_debt', gender)} value={p.has_significant_debt} />
            <Row label={getFieldLabel('supporting_family_financially', gender)} value={p.supporting_family_financially} />
            <Row label={getFieldLabel('wife_working_openness', gender)} value={p.wife_working_openness} />
            <Row label={getFieldLabel('household_management', gender)} value={p.household_management} />
            {p.mahr_approach && (
              <div className="pt-2.5">
                <p className="text-xs text-[#9B9B9B] mb-1">Mahr Approach</p>
                <p className="text-sm text-[#1A1A1A] font-medium leading-relaxed">{p.mahr_approach}</p>
              </div>
            )}
          </Section>
        ) : (
          <Section title="Career & Independence">
            <Row label={getFieldLabel('plan_to_work_after_marriage', gender)} value={p.plan_to_work_after_marriage} />
            <Row label={getFieldLabel('financial_independence_importance', gender)} value={p.financial_independence_importance} />
            <Row label={getFieldLabel('has_significant_debt', gender)} value={p.has_significant_debt} />
            <Row label={getFieldLabel('supporting_family_financially', gender)} value={p.supporting_family_financially} />
            <Row label={getFieldLabel('primary_caregiver_comfort', gender)} value={p.primary_caregiver_comfort} />
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
          <Row label={getFieldLabel('conflict_style', gender)} value={p.conflict_style} />
          <Row label={getFieldLabel('introvert_extrovert', gender)} value={p.introvert_extrovert} />
          <Row label={getFieldLabel('alone_time_importance', gender)} value={p.alone_time_importance} />
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
          <Row label={getFieldLabel('spouse_religiosity_preference', gender)} value={profileData.spouse_religiosity_preference} />
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

        {/* Family Dynamics */}
        <Section title="Family Dynamics">
          <Row label={getFieldLabel('parent_relationship', gender)} value={p.parent_relationship} />
          <Row label={getFieldLabel('family_conflict_style', gender)} value={p.family_conflict_style} />
          <Row label={getFieldLabel('family_spouse_disagreement', gender)} value={p.family_spouse_disagreement} />
          {isBrother ? (
            <>
              <Row label={getFieldLabel('wife_family_interaction', gender)} value={p.wife_family_interaction} />
              <Row label={getFieldLabel('living_near_parents', gender)} value={p.living_near_parents} />
              <Row label={getFieldLabel('wife_family_relationship', gender)} value={p.wife_family_relationship} />
              <Row label={getFieldLabel('eldest_responsibilities', gender)} value={p.eldest_responsibilities} />
              <Row label={getFieldLabel('child_caregiving', gender)} value={p.child_caregiving} />
            </>
          ) : (
            <>
              <Row label={getFieldLabel('family_balance_after_marriage', gender)} value={p.family_balance_after_marriage} />
              <Row label={getFieldLabel('inlaws_comfort', gender)} value={p.inlaws_comfort} />
              <Row label={getFieldLabel('husband_family_relationship', gender)} value={p.husband_family_relationship} />
              <Row label={getFieldLabel('family_traditional_vs_modern', gender)} value={p.family_traditional_vs_modern} />
            </>
          )}
        </Section>

        {/* Emotional & Mental Health */}
        <Section title="Emotional & Mental Health">
          <Row label={getFieldLabel('stress_management', gender)} value={p.stress_management} />
          <Row label={getFieldLabel('therapy_experience', gender)} value={p.therapy_experience} />
          <Row label={getFieldLabel('couples_therapy_view', gender)} value={p.couples_therapy_view} />
          <Row label={getFieldLabel('mental_health_challenges', gender)} value={p.mental_health_challenges} />
          <Row label={getFieldLabel('emotional_support_style', gender)} value={p.emotional_support_style} />
          <Row label={getFieldLabel('emotional_availability', gender)} value={p.emotional_availability} />
          <Row label={getFieldLabel('significant_hardship', gender)} value={p.significant_hardship} />
          <Row label={getFieldLabel('emotional_expression_view', gender)} value={p.emotional_expression_view} />
        </Section>

        {/* Conflict & Communication */}
        <Section title="Conflict & Communication">
          <Row label={getFieldLabel('healthy_argument_view', gender)} value={p.healthy_argument_view} />
          <Row label={getFieldLabel('apology_speed', gender)} value={p.apology_speed} />
          <Row label={getFieldLabel('communication_when_upset', gender)} value={p.communication_when_upset} />
          <Row label={getFieldLabel('love_language', gender)} value={p.love_language} />
          {isBrother ? (
            <>
              <Row label={getFieldLabel('husband_final_say', gender)} value={p.husband_final_say} />
              <Row label={getFieldLabel('wife_opinion_importance', gender)} value={p.wife_opinion_importance} />
            </>
          ) : (
            <>
              <Row label={getFieldLabel('qawwam_view', gender)} value={p.qawwam_view} />
              <Row label={getFieldLabel('receiving_love_language', gender)} value={p.receiving_love_language} />
            </>
          )}
        </Section>

        {/* Financial / Career Deep Dive */}
        {isBrother ? (
          <Section title="Financial (Deep Dive)">
            <Row label={getFieldLabel('savings_plan', gender)} value={p.savings_plan} />
            <Row label={getFieldLabel('financial_planning_approach', gender)} value={p.financial_planning_approach} />
            <Row label={getFieldLabel('hajj_status', gender)} value={p.hajj_status} />
            <Row label={getFieldLabel('financial_stress_approach', gender)} value={p.financial_stress_approach} />
          </Section>
        ) : (
          <Section title="Career & Financial (Deep Dive)">
            <Row label={getFieldLabel('career_five_years', gender)} value={p.career_five_years} />
            <Row label={getFieldLabel('career_identity_importance', gender)} value={p.career_identity_importance} />
            <Row label={getFieldLabel('career_pause_for_children', gender)} value={p.career_pause_for_children} />
            <Row label={getFieldLabel('savings_plan', gender)} value={p.savings_plan} />
            <Row label={getFieldLabel('financial_stress_approach', gender)} value={p.financial_stress_approach} />
          </Section>
        )}

        {/* Marriage Vision */}
        <Section title="Marriage Vision">
          <Row label={getFieldLabel('marriage_vision_10_years', gender)} value={p.marriage_vision_10_years} />
          <Row label={getFieldLabel('first_year_vision', gender)} value={p.first_year_vision} />
          <Row label={getFieldLabel('romance_view', gender)} value={p.romance_view} />
          <Row label={getFieldLabel('marriage_fear', gender)} value={p.marriage_fear} />
          <Row label={getFieldLabel('unique_contribution', gender)} value={p.unique_contribution} />
          <Row label={getFieldLabel('physical_intimacy_importance', gender)} value={p.physical_intimacy_importance} />
          <Row label={getFieldLabel('spouse_friendships_view', gender)} value={p.spouse_friendships_view} />
          {!isBrother && <Row label={getFieldLabel('ideal_husband_description', gender)} value={p.ideal_husband_description} />}
        </Section>

        {/* Faith Deep Dive */}
        <Section title="Faith & Deen (Deep Dive)">
          <Row label={getFieldLabel('deen_growth', gender)} value={p.deen_growth} />
          <Row label={getFieldLabel('quran_listening', gender)} value={p.quran_listening} />
          <Row label={getFieldLabel('quran_memorisation', gender)} value={p.quran_memorisation} />
          <Row label={getFieldLabel('traditional_vs_reformist', gender)} value={p.traditional_vs_reformist} />
          <Row label={getFieldLabel('zakah_sadaqah', gender)} value={p.zakah_sadaqah} />
          <Row label={getFieldLabel('mawlid_view', gender)} value={p.mawlid_view} />
          <Row label={getFieldLabel('madhab_consistency', gender)} value={p.madhab_consistency} />
          <Row label={getFieldLabel('spouse_islamic_knowledge', gender)} value={p.spouse_islamic_knowledge} />
          {isBrother ? (
            <>
              <Row label={getFieldLabel('wife_niqab_preference', gender)} value={p.wife_niqab_preference} />
              <Row label={getFieldLabel('missed_prayer_approach', gender)} value={p.missed_prayer_approach} />
            </>
          ) : (
            <>
              <Row label={getFieldLabel('deen_when_busy', gender)} value={p.deen_when_busy} />
              <Row label={getFieldLabel('islamic_home_importance', gender)} value={p.islamic_home_importance} />
            </>
          )}
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
              <Row label="Relationship to Referee" value={profileData.reference.referee_relationship} />
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
