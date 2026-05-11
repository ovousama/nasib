import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import {
  getProfile,
  getBrotherProfile,
  getSisterProfile,
  getWaliProfile,
  getReference,
  type Profile,
  type BrotherProfile,
  type SisterProfile,
  type WaliProfile,
  type Reference,
} from '@/lib/database'

// Additional fields added via ALTER TABLE are not in the TypeScript types yet,
// so we cast to any where needed for those fields.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyProfile = any

export default async function ProfilePage() {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/auth/login')

  const profile = await getProfile(user.id)
  if (!profile) redirect('/auth/login')

  if (profile.gender === 'brother') {
    const [brotherProfile, reference] = await Promise.all([
      getBrotherProfile(user.id),
      getReference(user.id),
    ])
    if (!brotherProfile) redirect('/onboarding/brother')
    return <BrotherProfileView profile={profile} brotherProfile={brotherProfile as AnyProfile} reference={reference} />
  }

  const [sisterProfile, waliProfile, reference] = await Promise.all([
    getSisterProfile(user.id),
    getWaliProfile(user.id),
    getReference(user.id),
  ])
  if (!sisterProfile) redirect('/onboarding/sister')
  return <SisterProfileView profile={profile} sisterProfile={sisterProfile as AnyProfile} waliProfile={waliProfile} reference={reference} />
}

// ─── Shared UI ────────────────────────────────────────────────────────────────

function SectionCard({
  title,
  editHref,
  children,
}: {
  title: string
  editHref?: string
  children: React.ReactNode
}) {
  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm border border-[#EBEBEB]">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-[#1A1A1A]">{title}</h3>
        {editHref && (
          <Link href={editHref} className="text-sm text-[#AF4D98] font-medium hover:underline">
            Edit
          </Link>
        )}
      </div>
      {children}
    </div>
  )
}

function Field({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-xs text-[#9B9B9B] uppercase tracking-wide">{label}</span>
      <span className="text-sm text-[#1A1A1A]">{value ?? '—'}</span>
    </div>
  )
}

function FieldFull({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <div className="col-span-2 flex flex-col gap-0.5">
      <span className="text-xs text-[#9B9B9B] uppercase tracking-wide">{label}</span>
      <span className="text-sm text-[#1A1A1A] leading-relaxed whitespace-pre-wrap">{value ?? '—'}</span>
    </div>
  )
}

function YesNo({ value }: { value: boolean | null | undefined }) {
  if (value === null || value === undefined) return <span className="text-sm text-[#9B9B9B]">—</span>
  return <span className="text-sm text-[#1A1A1A]">{value ? 'Yes' : 'No'}</span>
}

function StatusHeader({
  name,
  age,
  location,
  photoUrl,
  verificationBadge,
}: {
  name: string
  age: number
  location: string | null
  photoUrl?: string | null
  verificationBadge: boolean
}) {
  const firstName = name.split(' ')[0]
  return (
    <div className="bg-gradient-to-br from-[#AF4D98] to-[#9B3D85] px-4 pt-8 pb-8">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h1 className="text-white text-2xl font-bold">{firstName}</h1>
          <p className="text-white/70 text-sm mt-0.5">
            {age} years{location ? ` · ${location}` : ''}
          </p>
          <div className="mt-3">
            {verificationBadge ? (
              <span className="inline-flex items-center gap-1.5 bg-white/20 text-white text-xs font-medium px-3 py-1.5 rounded-full">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
                </svg>
                Verified
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 bg-amber-400/20 text-amber-200 text-xs font-medium px-3 py-1.5 rounded-full">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm.75-13a.75.75 0 00-1.5 0v5c0 .414.336.75.75.75h4a.75.75 0 000-1.5h-3.25V5z" clipRule="evenodd" />
                </svg>
                Pending Verification
              </span>
            )}
          </div>
        </div>
        <div className="ml-4 flex-shrink-0">
          {photoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={photoUrl} alt={firstName} className="w-16 h-16 rounded-full object-cover ring-2 ring-white/30" />
          ) : (
            <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center text-white text-xl font-bold">
              {firstName[0]?.toUpperCase()}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function ReferenceCard({ reference }: { reference: Reference | null }) {
  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm border border-[#EBEBEB]">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-[#1A1A1A]">Character Reference</h3>
        <Link href="/dashboard/profile/edit/reference" className="text-sm text-[#AF4D98] font-medium hover:underline">
          {reference ? 'Edit' : 'Add'}
        </Link>
      </div>
      {reference ? (
        <div className="space-y-2">
          <Field label="Referee" value={reference.referee_name} />
          <Field label="Relationship" value={reference.referee_relationship} />
          <div className="flex items-center gap-2 mt-2">
            <span
              className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                reference.status === 'completed'
                  ? 'bg-[#F5E6F2] text-[#AF4D98] border border-[#AF4D98]/20'
                  : 'bg-amber-50 text-amber-700 border border-amber-100'
              }`}
            >
              {reference.status === 'completed' ? 'Completed' : 'Pending response'}
            </span>
          </div>
        </div>
      ) : (
        <p className="text-sm text-[#9B9B9B]">No reference submitted yet.</p>
      )}
    </div>
  )
}

// ─── Brother Profile View ─────────────────────────────────────────────────────

function BrotherProfileView({
  profile,
  brotherProfile,
  reference,
}: {
  profile: Profile
  brotherProfile: BrotherProfile & AnyProfile
  reference: Reference | null
}) {
  const religiosity: Record<string, string> = {
    practicing: 'Practicing',
    moderately_practicing: 'Moderately Practicing',
    learning: 'Still Learning',
  }

  const bp = brotherProfile as AnyProfile

  return (
    <div>
      <StatusHeader
        name={brotherProfile.full_name}
        age={brotherProfile.age}
        location={brotherProfile.location}
        photoUrl={brotherProfile.photo_url}
        verificationBadge={profile.verification_badge}
      />

      <div className="px-4 py-5 space-y-3">

        <SectionCard title="Basic Information" editHref="/dashboard/profile/edit/basic">
          <div className="grid grid-cols-2 gap-3">
            <Field label="Full Name" value={brotherProfile.full_name} />
            <Field label="Age" value={String(brotherProfile.age)} />
            <Field label="Location" value={brotherProfile.location} />
            <Field label="Ethnicity" value={brotherProfile.ethnicity} />
            <div className="col-span-2">
              <Field label="Languages" value={brotherProfile.languages?.join(', ')} />
            </div>
          </div>
        </SectionCard>

        <SectionCard title="Deen & Religiosity" editHref="/dashboard/profile/edit/deen">
          <div className="grid grid-cols-2 gap-3">
            <Field label="Religiosity" value={brotherProfile.religiosity_level ? religiosity[brotherProfile.religiosity_level] : null} />
            <Field label="Madhab" value={brotherProfile.madhab} />
            <Field label="Prayer Frequency" value={brotherProfile.prayer_frequency} />
            <Field label="Islamic Knowledge" value={brotherProfile.islamic_knowledge_level} />
            <div className="flex flex-col gap-0.5">
              <span className="text-xs text-[#9B9B9B] uppercase tracking-wide">Has Beard</span>
              <YesNo value={brotherProfile.has_beard} />
            </div>
          </div>
        </SectionCard>

        <SectionCard title="Lifestyle" editHref="/dashboard/profile/edit/lifestyle">
          <div className="grid grid-cols-2 gap-3">
            <Field label="Occupation" value={brotherProfile.occupation} />
            <Field label="Education" value={brotherProfile.education_level} />
            <Field label="Living Situation" value={brotherProfile.living_situation} />
            <div className="flex flex-col gap-0.5">
              <span className="text-xs text-[#9B9B9B] uppercase tracking-wide">Willing to Relocate</span>
              <YesNo value={brotherProfile.willing_to_relocate} />
            </div>
            <div className="col-span-2">
              <Field label="Financial Readiness" value={brotherProfile.financial_readiness} />
            </div>
          </div>
        </SectionCard>

        <SectionCard title="Marriage Goals" editHref="/dashboard/profile/edit/marriage">
          <div className="grid grid-cols-2 gap-3">
            <Field label="Timeline" value={brotherProfile.timeline_to_marry} />
            <div className="flex flex-col gap-0.5">
              <span className="text-xs text-[#9B9B9B] uppercase tracking-wide">Previously Married</span>
              <YesNo value={brotherProfile.previously_married} />
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="text-xs text-[#9B9B9B] uppercase tracking-wide">Has Children</span>
              <YesNo value={brotherProfile.has_children} />
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="text-xs text-[#9B9B9B] uppercase tracking-wide">Wants Children</span>
              <YesNo value={brotherProfile.wants_children} />
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="text-xs text-[#9B9B9B] uppercase tracking-wide">Open to Polygamy</span>
              <YesNo value={brotherProfile.polygamy_openness} />
            </div>
          </div>
        </SectionCard>

        <SectionCard title="Spouse Preferences" editHref="/dashboard/profile/edit/preferences">
          <div className="grid grid-cols-2 gap-3">
            <Field label="Religiosity Preference" value={brotherProfile.spouse_religiosity_preference} />
            <Field
              label="Age Range"
              value={
                brotherProfile.spouse_age_min && brotherProfile.spouse_age_max
                  ? `${brotherProfile.spouse_age_min}–${brotherProfile.spouse_age_max}`
                  : null
              }
            />
            {brotherProfile.dealbreakers?.length ? (
              <div className="col-span-2 flex flex-col gap-0.5">
                <span className="text-xs text-[#9B9B9B] uppercase tracking-wide">Dealbreakers</span>
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {brotherProfile.dealbreakers.map((d: string) => (
                    <span key={d} className="text-xs bg-red-50 text-red-700 border border-red-100 px-2 py-0.5 rounded-full">
                      {d}
                    </span>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        </SectionCard>

        <SectionCard title="Character & Goals" editHref="/dashboard/profile/edit/character">
          <div className="space-y-3">
            <div>
              <p className="text-xs text-[#9B9B9B] uppercase tracking-wide mb-1">About Me</p>
              <p className="text-sm text-[#1A1A1A] leading-relaxed">{brotherProfile.character_description ?? '—'}</p>
            </div>
            <div>
              <p className="text-xs text-[#9B9B9B] uppercase tracking-wide mb-1">My Goals</p>
              <p className="text-sm text-[#1A1A1A] leading-relaxed">{brotherProfile.goals ?? '—'}</p>
            </div>
          </div>
        </SectionCard>

        <SectionCard title="My Photo" editHref="/dashboard/profile/edit/photo">
          {brotherProfile.photo_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={brotherProfile.photo_url} alt="Profile photo" className="w-24 h-24 rounded-xl object-cover" />
          ) : (
            <p className="text-sm text-[#9B9B9B]">No photo uploaded yet.</p>
          )}
        </SectionCard>

        {/* Additional Questions */}
        <SectionCard title="Faith & Practice" editHref="/dashboard/profile/edit/additional">
          <div className="grid grid-cols-2 gap-3">
            <Field label="Listen to Music?" value={bp.do_you_listen_to_music} />
            <Field label="Non-Islamic Holidays" value={bp.celebrate_non_islamic_holidays} />
            <Field label="Wife Hijab" value={bp.wife_hijab_importance} />
            <Field label="Jumu'ah Attendance" value={bp.jumuah_attendance} />
            {bp.differing_islamic_opinions && (
              <FieldFull label="Differing Islamic Opinions" value={bp.differing_islamic_opinions} />
            )}
          </div>
        </SectionCard>

        <SectionCard title="Financial & Practical" editHref="/dashboard/profile/edit/additional">
          <div className="grid grid-cols-2 gap-3">
            <Field label="Annual Income" value={bp.annual_income_range} />
            <Field label="Own or Rent" value={bp.own_or_rent} />
            <Field label="Significant Debt" value={bp.has_significant_debt} />
            <Field label="Supporting Family" value={bp.supporting_family_financially} />
            {bp.mahr_approach && (
              <FieldFull label="Mahr Approach" value={bp.mahr_approach} />
            )}
          </div>
        </SectionCard>

        <SectionCard title="Family & Household" editHref="/dashboard/profile/edit/additional">
          <div className="grid grid-cols-2 gap-3">
            <Field label="Children Wanted" value={bp.number_of_children_wanted} />
            <Field label="Wife Working" value={bp.wife_working_openness} />
            <Field label="Household Management" value={bp.household_management} />
            <Field label="In-Laws" value={bp.inlaws_living_together} />
            <Field label="Islamic Schooling" value={bp.islamic_schooling_importance} />
          </div>
        </SectionCard>

        <SectionCard title="Lifestyle & Social" editHref="/dashboard/profile/edit/additional">
          <div className="grid grid-cols-2 gap-3">
            <Field label="Mixed Social Circle" value={bp.mixed_gender_social_circle} />
            <Field label="Travel" value={bp.travel_frequency} />
            <Field label="Halal Diet" value={bp.strict_halal_diet} />
            <Field label="Smoking" value={bp.smoking} />
            {bp.weekend_lifestyle && (
              <FieldFull label="Weekend Lifestyle" value={bp.weekend_lifestyle} />
            )}
          </div>
        </SectionCard>

        <SectionCard title="Personality & Communication" editHref="/dashboard/profile/edit/additional">
          <div className="grid grid-cols-2 gap-3">
            <Field label="Conflict Style" value={bp.conflict_style} />
            <Field label="Personality" value={bp.introvert_extrovert} />
            <Field label="Alone Time" value={bp.alone_time_importance} />
            {bp.love_language?.length ? (
              <div className="col-span-2 flex flex-col gap-0.5">
                <span className="text-xs text-[#9B9B9B] uppercase tracking-wide">Love Language</span>
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {bp.love_language.map((l: string) => (
                    <span key={l} className="text-xs bg-[#F5E6F2] text-[#AF4D98] border border-[#AF4D98]/20 px-2 py-0.5 rounded-full">
                      {l}
                    </span>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        </SectionCard>

        <ReferenceCard reference={reference} />
      </div>
    </div>
  )
}

// ─── Sister Profile View ──────────────────────────────────────────────────────

function SisterProfileView({
  profile,
  sisterProfile,
  waliProfile,
  reference,
}: {
  profile: Profile
  sisterProfile: SisterProfile & AnyProfile
  waliProfile: WaliProfile | null
  reference: Reference | null
}) {
  const religiosity: Record<string, string> = {
    practicing: 'Practicing',
    moderately_practicing: 'Moderately Practicing',
    learning: 'Still Learning',
  }

  const sp = sisterProfile as AnyProfile

  return (
    <div>
      <StatusHeader
        name={sisterProfile.full_name}
        age={sisterProfile.age}
        location={sisterProfile.location}
        photoUrl={sisterProfile.photo_urls?.[0]}
        verificationBadge={profile.verification_badge}
      />

      <div className="px-4 py-5 space-y-3">

        <SectionCard title="Wali Details" editHref="/dashboard/profile/edit/wali">
          {waliProfile ? (
            <div className="grid grid-cols-2 gap-3">
              <Field label="Wali Name" value={waliProfile.full_name} />
              <Field label="Relationship" value={waliProfile.relationship} />
              <Field label="Email" value={waliProfile.email} />
              <Field label="Phone" value={waliProfile.phone} />
              <Field label="Preferred Contact" value={waliProfile.preferred_contact_method} />
            </div>
          ) : (
            <p className="text-sm text-[#9B9B9B]">No wali details on file.</p>
          )}
        </SectionCard>

        <SectionCard title="Basic Information" editHref="/dashboard/profile/edit/basic">
          <div className="grid grid-cols-2 gap-3">
            <Field label="Full Name" value={sisterProfile.full_name} />
            <Field label="Age" value={String(sisterProfile.age)} />
            <Field label="Location" value={sisterProfile.location} />
            <Field label="Ethnicity" value={sisterProfile.ethnicity} />
            <div className="col-span-2">
              <Field label="Languages" value={sisterProfile.languages?.join(', ')} />
            </div>
          </div>
        </SectionCard>

        <SectionCard title="Deen & Religiosity" editHref="/dashboard/profile/edit/deen">
          <div className="grid grid-cols-2 gap-3">
            <Field label="Religiosity" value={sisterProfile.religiosity_level ? religiosity[sisterProfile.religiosity_level] : null} />
            <Field label="Madhab" value={sisterProfile.madhab} />
            <Field label="Prayer Frequency" value={sisterProfile.prayer_frequency} />
            <Field label="Islamic Knowledge" value={sisterProfile.islamic_knowledge_level} />
            <Field label="Hijab" value={sisterProfile.wears_hijab} />
          </div>
        </SectionCard>

        <SectionCard title="Lifestyle" editHref="/dashboard/profile/edit/lifestyle">
          <div className="grid grid-cols-2 gap-3">
            <Field label="Occupation" value={sisterProfile.occupation} />
            <Field label="Education" value={sisterProfile.education_level} />
            <Field label="Living Situation" value={sisterProfile.living_situation} />
            <div className="flex flex-col gap-0.5">
              <span className="text-xs text-[#9B9B9B] uppercase tracking-wide">Willing to Relocate</span>
              <YesNo value={sisterProfile.willing_to_relocate} />
            </div>
          </div>
        </SectionCard>

        <SectionCard title="Marriage Goals" editHref="/dashboard/profile/edit/marriage">
          <div className="grid grid-cols-2 gap-3">
            <Field label="Timeline" value={sisterProfile.timeline_to_marry} />
            <div className="flex flex-col gap-0.5">
              <span className="text-xs text-[#9B9B9B] uppercase tracking-wide">Previously Married</span>
              <YesNo value={sisterProfile.previously_married} />
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="text-xs text-[#9B9B9B] uppercase tracking-wide">Has Children</span>
              <YesNo value={sisterProfile.has_children} />
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="text-xs text-[#9B9B9B] uppercase tracking-wide">Wants Children</span>
              <YesNo value={sisterProfile.wants_children} />
            </div>
          </div>
        </SectionCard>

        <SectionCard title="Spouse Preferences" editHref="/dashboard/profile/edit/preferences">
          <div className="grid grid-cols-2 gap-3">
            <Field label="Religiosity Preference" value={sisterProfile.spouse_religiosity_preference} />
            <Field
              label="Age Range"
              value={
                sisterProfile.spouse_age_min && sisterProfile.spouse_age_max
                  ? `${sisterProfile.spouse_age_min}–${sisterProfile.spouse_age_max}`
                  : null
              }
            />
            {sisterProfile.dealbreakers?.length ? (
              <div className="col-span-2 flex flex-col gap-0.5">
                <span className="text-xs text-[#9B9B9B] uppercase tracking-wide">Dealbreakers</span>
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {sisterProfile.dealbreakers.map((d: string) => (
                    <span key={d} className="text-xs bg-red-50 text-red-700 border border-red-100 px-2 py-0.5 rounded-full">
                      {d}
                    </span>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        </SectionCard>

        <SectionCard title="Character & Goals" editHref="/dashboard/profile/edit/character">
          <div className="space-y-3">
            <div>
              <p className="text-xs text-[#9B9B9B] uppercase tracking-wide mb-1">About Me</p>
              <p className="text-sm text-[#1A1A1A] leading-relaxed">{sisterProfile.character_description ?? '—'}</p>
            </div>
            <div>
              <p className="text-xs text-[#9B9B9B] uppercase tracking-wide mb-1">My Goals</p>
              <p className="text-sm text-[#1A1A1A] leading-relaxed">{sisterProfile.goals ?? '—'}</p>
            </div>
          </div>
        </SectionCard>

        <SectionCard title="My Photos" editHref="/dashboard/profile/edit/photos">
          {sisterProfile.photo_urls?.length ? (
            <div className="flex gap-2 flex-wrap">
              {sisterProfile.photo_urls.map((url: string, i: number) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img key={i} src={url} alt={`Photo ${i + 1}`} className="w-20 h-20 rounded-xl object-cover" />
              ))}
            </div>
          ) : (
            <p className="text-sm text-[#9B9B9B]">No photos uploaded yet.</p>
          )}
          <p className="text-xs text-[#9B9B9B] mt-2">Photos are private and only shared when you accept a connection.</p>
        </SectionCard>

        {/* Additional Questions */}
        <SectionCard title="Faith & Practice" editHref="/dashboard/profile/edit/additional">
          <div className="grid grid-cols-2 gap-3">
            <Field label="Listen to Music?" value={sp.do_you_listen_to_music} />
            <Field label="Non-Islamic Holidays" value={sp.celebrate_non_islamic_holidays} />
            <Field label="Hijab Outside Home" value={sp.hijab_outside_home} />
            <Field label="Islamic Classes" value={sp.islamic_classes_attendance} />
            {sp.differing_islamic_opinions && (
              <FieldFull label="Differing Islamic Opinions" value={sp.differing_islamic_opinions} />
            )}
          </div>
        </SectionCard>

        <SectionCard title="Career & Independence" editHref="/dashboard/profile/edit/additional">
          <div className="grid grid-cols-2 gap-3">
            <Field label="Work After Marriage" value={sp.plan_to_work_after_marriage} />
            <Field label="Financial Independence" value={sp.financial_independence_importance} />
            <Field label="Significant Debt" value={sp.has_significant_debt} />
            <Field label="Supporting Family" value={sp.supporting_family_financially} />
            {sp.career_ambitions && (
              <FieldFull label="Career Ambitions" value={sp.career_ambitions} />
            )}
          </div>
        </SectionCard>

        <SectionCard title="Family & Household" editHref="/dashboard/profile/edit/additional">
          <div className="grid grid-cols-2 gap-3">
            <Field label="Children Wanted" value={sp.number_of_children_wanted} />
            <Field label="Primary Caregiver" value={sp.primary_caregiver_comfort} />
            <Field label="In-Laws" value={sp.inlaws_living_together} />
            <Field label="Islamic Schooling" value={sp.islamic_schooling_importance} />
            {sp.household_responsibilities_vision && (
              <FieldFull label="Household Vision" value={sp.household_responsibilities_vision} />
            )}
          </div>
        </SectionCard>

        <SectionCard title="Lifestyle & Social" editHref="/dashboard/profile/edit/additional">
          <div className="grid grid-cols-2 gap-3">
            <Field label="Mixed Social Circle" value={sp.mixed_gender_social_circle} />
            <Field label="Travel" value={sp.travel_importance} />
            <Field label="Halal Diet" value={sp.strict_halal_diet} />
            <Field label="Smoking" value={sp.smoking} />
            {sp.weekend_lifestyle && (
              <FieldFull label="Weekend Lifestyle" value={sp.weekend_lifestyle} />
            )}
          </div>
        </SectionCard>

        <SectionCard title="Personality & Communication" editHref="/dashboard/profile/edit/additional">
          <div className="grid grid-cols-2 gap-3">
            <Field label="Conflict Style" value={sp.conflict_style} />
            <Field label="Personality" value={sp.introvert_extrovert} />
            <Field label="Alone Time" value={sp.alone_time_importance} />
            {sp.love_language?.length ? (
              <div className="col-span-2 flex flex-col gap-0.5">
                <span className="text-xs text-[#9B9B9B] uppercase tracking-wide">Love Language</span>
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {sp.love_language.map((l: string) => (
                    <span key={l} className="text-xs bg-[#F5E6F2] text-[#AF4D98] border border-[#AF4D98]/20 px-2 py-0.5 rounded-full">
                      {l}
                    </span>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        </SectionCard>

        <ReferenceCard reference={reference} />
      </div>
    </div>
  )
}
