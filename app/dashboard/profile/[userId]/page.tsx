import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { getProfile, getPublicBrotherProfile, getPublicSisterProfile } from '@/lib/database'

type Props = { params: Promise<{ userId: string }> }

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-[16px] border border-[#EDE8E3] shadow-[0_1px_3px_rgba(0,0,0,0.06)] p-5 mb-3">
      <p className="text-[11px] font-medium uppercase tracking-[0.06em] text-[#9B9B9B] mb-4">{title}</p>
      {children}
    </div>
  )
}

function Row({ label, value }: { label: string; value: string | number | boolean | null | undefined }) {
  if (value === null || value === undefined || value === '') return null
  const display =
    typeof value === 'boolean'
      ? value ? 'Yes' : 'No'
      : String(value)
  return (
    <div className="flex justify-between items-start py-2 border-b border-[#EDE8E3] last:border-0">
      <span className="text-xs text-[#9B9B9B] flex-shrink-0 mr-4">{label}</span>
      <span className="text-sm text-[#1A1A1A] font-medium text-right">{display}</span>
    </div>
  )
}

function InlineVerifiedBadge() {
  return (
    <span className="inline-flex items-center gap-1 bg-[#F9F0F6] text-[#AF4D98] text-xs font-medium px-3 py-1 rounded-full border border-[#AF4D98]/20">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-3 h-3">
        <path fillRule="evenodd" d="M8 15A7 7 0 108 1a7 7 0 000 14zm3.844-8.791a.75.75 0 00-1.188-.918l-3.7 4.79-1.649-1.833a.75.75 0 10-1.114 1.004l2.25 2.5a.75.75 0 001.15-.086l4.25-5.5-.001-.002z" clipRule="evenodd" />
      </svg>
      Verified
    </span>
  )
}

export default async function PublicProfilePage({ params }: Props) {
  const { userId } = await params
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const targetProfile = await getProfile(userId)
  if (!targetProfile) notFound()

  const isBrother = targetProfile.gender === 'brother'

  let brotherProfile = null
  let sisterProfile = null

  if (isBrother) {
    brotherProfile = await getPublicBrotherProfile(userId)
    if (!brotherProfile) notFound()
  } else {
    sisterProfile = await getPublicSisterProfile(userId)
    if (!sisterProfile) notFound()
  }

  const name = (brotherProfile?.full_name ?? sisterProfile?.full_name ?? 'Profile').split(' ')[0]
  const photoUrl = brotherProfile?.photo_url ?? null

  return (
    <div className="min-h-screen bg-[#FDF8F3] pb-24">
      {/* Header */}
      <div className="flex items-center gap-3 px-5 py-4 border-b border-[#EDE8E3] bg-white">
        <Link href="/dashboard" className="text-[#9B9B9B] hover:text-[#5C5C5C] transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
            <path fillRule="evenodd" d="M17 10a.75.75 0 01-.75.75H5.612l4.158 3.96a.75.75 0 11-1.04 1.08l-5.5-5.25a.75.75 0 010-1.08l5.5-5.25a.75.75 0 111.04 1.08L5.612 9.25H16.25A.75.75 0 0117 10z" clipRule="evenodd" />
          </svg>
        </Link>
        <h1 className="text-base font-medium text-[#1A1A1A]">{name}</h1>
      </div>

      {/* Avatar area */}
      <div className="bg-white border-b border-[#EDE8E3] px-5 py-6 flex flex-col items-center text-center">
        {photoUrl ? (
          <Image
            src={photoUrl}
            alt={name}
            width={72}
            height={72}
            className="w-[72px] h-[72px] rounded-full object-cover ring-2 ring-[#EDE8E3] flex-shrink-0"
          />
        ) : (
          <div className="w-[72px] h-[72px] rounded-full bg-[#F9F0F6] flex items-center justify-center text-[#AF4D98] text-2xl font-medium flex-shrink-0">
            {name[0]?.toUpperCase()}
          </div>
        )}
        <h2 className="text-[22px] font-medium tracking-[-0.02em] text-[#1A1A1A] mt-3">{name}</h2>
        <p className="text-sm text-[#9B9B9B] mt-0.5 capitalize">{targetProfile.gender}</p>
        {targetProfile.verification_badge && (
          <div className="mt-2">
            <InlineVerifiedBadge />
          </div>
        )}
      </div>

      <div className="px-4 py-4">
        {brotherProfile && (
          <>
            <Section title="About">
              <Row label="Age" value={brotherProfile.age} />
              <Row label="Location" value={brotherProfile.location} />
              <Row label="Ethnicity" value={brotherProfile.ethnicity} />
              <Row label="Languages" value={brotherProfile.languages?.join(', ')} />
            </Section>

            <Section title="Deen">
              <Row label="Religiosity" value={brotherProfile.religiosity_level} />
              <Row label="Madhab" value={brotherProfile.madhab} />
              <Row label="Prayer" value={brotherProfile.prayer_frequency} />
              <Row label="Islamic Knowledge" value={brotherProfile.islamic_knowledge_level} />
              <Row label="Has Beard" value={brotherProfile.has_beard} />
            </Section>

            <Section title="Life & Career">
              <Row label="Occupation" value={brotherProfile.occupation} />
              <Row label="Education" value={brotherProfile.education_level} />
              <Row label="Living Situation" value={brotherProfile.living_situation} />
              <Row label="Willing to Relocate" value={brotherProfile.willing_to_relocate} />
              <Row label="Financial Readiness" value={brotherProfile.financial_readiness} />
            </Section>

            <Section title="Marriage">
              <Row label="Timeline" value={brotherProfile.timeline_to_marry} />
              <Row label="Previously Married" value={brotherProfile.previously_married} />
              <Row label="Has Children" value={brotherProfile.has_children} />
              <Row label="Wants Children" value={brotherProfile.wants_children} />
              <Row label="Open to Polygamy" value={brotherProfile.polygamy_openness} />
              <Row label="Spouse Religiosity" value={brotherProfile.spouse_religiosity_preference} />
              <Row
                label="Spouse Age Range"
                value={
                  brotherProfile.spouse_age_min && brotherProfile.spouse_age_max
                    ? `${brotherProfile.spouse_age_min}–${brotherProfile.spouse_age_max}`
                    : null
                }
              />
            </Section>

            {brotherProfile.character_description && (
              <Section title="About Me">
                <p className="text-sm text-[#1A1A1A] font-medium leading-relaxed">
                  {brotherProfile.character_description}
                </p>
              </Section>
            )}

            {brotherProfile.goals && (
              <Section title="Goals">
                <p className="text-sm text-[#1A1A1A] font-medium leading-relaxed">{brotherProfile.goals}</p>
              </Section>
            )}
          </>
        )}

        {sisterProfile && (
          <>
            <Section title="About">
              <Row label="Age" value={sisterProfile.age} />
              <Row label="Location" value={sisterProfile.location} />
              <Row label="Ethnicity" value={sisterProfile.ethnicity} />
              <Row label="Languages" value={sisterProfile.languages?.join(', ')} />
            </Section>

            <Section title="Deen">
              <Row label="Religiosity" value={sisterProfile.religiosity_level} />
              <Row label="Madhab" value={sisterProfile.madhab} />
              <Row label="Prayer" value={sisterProfile.prayer_frequency} />
              <Row label="Islamic Knowledge" value={sisterProfile.islamic_knowledge_level} />
              <Row label="Hijab" value={sisterProfile.wears_hijab} />
            </Section>

            <Section title="Life & Career">
              <Row label="Occupation" value={sisterProfile.occupation} />
              <Row label="Education" value={sisterProfile.education_level} />
              <Row label="Living Situation" value={sisterProfile.living_situation} />
              <Row label="Willing to Relocate" value={sisterProfile.willing_to_relocate} />
            </Section>

            <Section title="Marriage">
              <Row label="Timeline" value={sisterProfile.timeline_to_marry} />
              <Row label="Previously Married" value={sisterProfile.previously_married} />
              <Row label="Has Children" value={sisterProfile.has_children} />
              <Row label="Wants Children" value={sisterProfile.wants_children} />
              <Row label="Spouse Religiosity" value={sisterProfile.spouse_religiosity_preference} />
              <Row
                label="Spouse Age Range"
                value={
                  sisterProfile.spouse_age_min && sisterProfile.spouse_age_max
                    ? `${sisterProfile.spouse_age_min}–${sisterProfile.spouse_age_max}`
                    : null
                }
              />
            </Section>

            {sisterProfile.character_description && (
              <Section title="About Me">
                <p className="text-sm text-[#1A1A1A] font-medium leading-relaxed">
                  {sisterProfile.character_description}
                </p>
              </Section>
            )}

            {sisterProfile.goals && (
              <Section title="Goals">
                <p className="text-sm text-[#1A1A1A] font-medium leading-relaxed">{sisterProfile.goals}</p>
              </Section>
            )}
          </>
        )}
      </div>
    </div>
  )
}
