import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getUserDetail } from '@/lib/admin'
import UserDetailActions from '@/components/admin/UserDetailActions'

type Props = { params: Promise<{ userId: string }> }

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-[16px] p-5 shadow-[0_1px_3px_rgba(0,0,0,0.06)] border border-[#EDE8E3]">
      <h3 className="text-[11px] font-medium uppercase tracking-[0.06em] text-[#9B9B9B] mb-4">{title}</h3>
      {children}
    </div>
  )
}

function Row({ label, value }: { label: string; value: unknown }) {
  if (value === null || value === undefined || value === '') return null
  if (Array.isArray(value) && value.length === 0) return null
  const display =
    typeof value === 'boolean'
      ? value ? 'Yes' : 'No'
      : Array.isArray(value)
      ? value.join(', ')
      : typeof value === 'number'
      ? String(value)
      : String(value)
  return (
    <div className="flex justify-between items-start py-2 border-b border-[#EDE8E3] last:border-0">
      <span className="text-sm text-[#5C5C5C] flex-shrink-0 mr-4 w-44">{label}</span>
      <span className="text-sm text-[#1A1A1A] text-right">{display}</span>
    </div>
  )
}

function LongRow({ label, value }: { label: string; value: unknown }) {
  if (!value || value === '') return null
  return (
    <div className="py-2 border-b border-[#EDE8E3] last:border-0">
      <p className="text-xs font-medium text-[#9B9B9B] mb-1">{label}</p>
      <p className="text-sm text-[#1A1A1A] leading-relaxed whitespace-pre-line">{String(value)}</p>
    </div>
  )
}

function SliderRow({ label, value }: { label: string; value: unknown }) {
  if (value === null || value === undefined) return null
  const n = Number(value)
  if (isNaN(n)) return null
  const pct = Math.round(n)
  return (
    <div className="py-2 border-b border-[#EDE8E3] last:border-0">
      <div className="flex justify-between items-center mb-1">
        <span className="text-sm text-[#5C5C5C]">{label}</span>
        <span className="text-sm text-[#1A1A1A]">{pct}/100</span>
      </div>
      <div className="w-full bg-[#EDE8E3] rounded-full h-1.5">
        <div className="bg-[#AF4D98] h-1.5 rounded-full" style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    pending_verification: 'bg-[#FEF9EC] text-[#8A6A00]',
    active: 'bg-[#F9F0F6] text-[#AF4D98]',
    verified: 'bg-[#E6F9F7] text-[#00857A]',
    inactive: 'bg-[#FAF4EE] text-[#9B9B9B]',
  }
  return (
    <span className={`inline-block text-[11px] font-medium px-2.5 py-1 rounded-full ${map[status] ?? 'bg-[#FAF4EE] text-[#9B9B9B]'}`}>
      {status.replace(/_/g, ' ')}
    </span>
  )
}

export default async function UserDetailPage({ params }: Props) {
  const { userId } = await params
  const detail = await getUserDetail(userId)
  if (!detail) notFound()

  const { brotherProfile: bp, sisterProfile: sp } = detail
  // Cast to access additional/deepdive fields not in base TS types
  const b = bp as Record<string, unknown> | null
  const s = sp as Record<string, unknown> | null
  const p = b ?? s  // whichever is present
  const isBrother = !!b
  const name = (b?.full_name ?? s?.full_name ?? 'Unknown') as string

  return (
    <div className="max-w-5xl">
      <div className="flex items-center gap-3 mb-5">
        <Link href="/admin/users" className="text-[#9B9B9B] hover:text-[#5C5C5C]">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
            <path fillRule="evenodd" d="M17 10a.75.75 0 01-.75.75H5.612l4.158 3.96a.75.75 0 11-1.04 1.08l-5.5-5.25a.75.75 0 010-1.08l5.5-5.25a.75.75 0 111.04 1.08L5.612 9.25H16.25A.75.75 0 0117 10z" clipRule="evenodd" />
          </svg>
        </Link>
        <div>
          <h2 className="text-xl font-medium tracking-[-0.02em] text-[#1A1A1A]">{name}</h2>
          <div className="flex items-center gap-2 mt-0.5">
            <span className={`text-[11px] font-medium px-2.5 py-1 rounded-full ${detail.gender === 'brother' ? 'bg-blue-50 text-blue-700' : 'bg-pink-50 text-pink-700'}`}>
              {detail.gender}
            </span>
            <StatusBadge status={detail.status} />
            {detail.verification_badge && (
              <span className="text-[11px] font-medium px-2.5 py-1 rounded-full bg-[#E6F9F7] text-[#00857A]">Verified</span>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 space-y-4">

          <Section title="Basic Info">
            <Row label="Full Name" value={p?.full_name} />
            <Row label="Age" value={p?.age} />
            <Row label="Location" value={p?.location} />
            <Row label="Ethnicity" value={p?.ethnicity} />
            <Row label="Languages" value={p?.languages} />
            <Row label="Joined" value={formatDate(detail.created_at)} />
          </Section>

          <Section title="Deen">
            <Row label="Religiosity" value={p?.religiosity_level} />
            <Row label="Madhab" value={p?.madhab} />
            <Row label="Prayer Frequency" value={p?.prayer_frequency} />
            <Row label="Islamic Knowledge" value={p?.islamic_knowledge_level} />
            {isBrother ? <Row label="Has Beard" value={p?.has_beard} /> : <Row label="Wears Hijab" value={p?.wears_hijab} />}
            {!isBrother && <Row label="Hijab Outside Home" value={s?.hijab_outside_home} />}
            {!isBrother && <Row label="Islamic Classes" value={s?.islamic_classes_attendance} />}
            {isBrother && <Row label="Jumuah Attendance" value={b?.jumuah_attendance} />}
            {isBrother && <Row label="Wife Hijab Importance" value={b?.wife_hijab_importance} />}
            <LongRow label="Differing Islamic Opinions" value={p?.differing_islamic_opinions} />
          </Section>

          <Section title="Deen Deepdive">
            <Row label="Quran Listening" value={p?.quran_listening} />
            <Row label="Quran Memorisation" value={p?.quran_memorisation} />
            <SliderRow label="Traditional ↔ Reformist" value={p?.traditional_vs_reformist} />
            <Row label="Mawlid View" value={p?.mawlid_view} />
            <Row label="Zakah & Sadaqah" value={p?.zakah_sadaqah} />
            <Row label="Madhab Consistency" value={p?.madhab_consistency} />
            <Row label="Spouse Islamic Knowledge" value={p?.spouse_islamic_knowledge} />
            {isBrother && <Row label="Missed Prayer Approach" value={b?.missed_prayer_approach} />}
            {isBrother && <Row label="Wife Niqab Preference" value={b?.wife_niqab_preference} />}
            {!isBrother && <Row label="Islamic Home Importance" value={s?.islamic_home_importance} />}
            <LongRow label="Deen Growth" value={p?.deen_growth} />
            {!isBrother && <LongRow label="Deen When Busy" value={s?.deen_when_busy} />}
          </Section>

          <Section title="Life & Career">
            <Row label="Occupation" value={p?.occupation} />
            <Row label="Education" value={p?.education_level} />
            <Row label="Living Situation" value={p?.living_situation} />
            <Row label="Willing to Relocate" value={p?.willing_to_relocate} />
            {isBrother && <Row label="Financial Readiness" value={b?.financial_readiness} />}
          </Section>

          <Section title="Marriage">
            <Row label="Timeline" value={p?.timeline_to_marry} />
            <Row label="Previously Married" value={p?.previously_married} />
            <Row label="Has Children" value={p?.has_children} />
            <Row label="Wants Children" value={p?.wants_children} />
            <Row label="Number of Children Wanted" value={p?.number_of_children_wanted} />
            {isBrother && <Row label="Open to Polygamy" value={b?.polygamy_openness} />}
            {isBrother && <Row label="Polygamy in Own Marriage" value={b?.polygamy_own_marriage} />}
            <Row label="Spouse Religiosity Pref" value={p?.spouse_religiosity_preference} />
            <Row label="Spouse Age Range" value={(p?.spouse_age_min && p?.spouse_age_max) ? `${p.spouse_age_min}–${p.spouse_age_max}` : null} />
            <Row label="Dealbreakers" value={p?.dealbreakers} />
          </Section>

          <Section title="Financial">
            {isBrother && <>
              <Row label="Annual Income" value={b?.annual_income_range} />
              <Row label="Own or Rent" value={b?.own_or_rent} />
              <Row label="Financial Planning" value={b?.financial_planning_approach} />
              <Row label="Wife Financial Independence" value={b?.wife_financial_independence} />
              <Row label="Wife Earning More" value={b?.wife_earning_more} />
              <Row label="Hajj Status" value={b?.hajj_status} />
              <LongRow label="Mahr Approach" value={b?.mahr_approach} />
            </>}
            {!isBrother && <>
              <Row label="Plan to Work After Marriage" value={s?.plan_to_work_after_marriage} />
              <Row label="Financial Independence Importance" value={s?.financial_independence_importance} />
              <Row label="Financial Dependence View" value={s?.financial_dependence_view} />
            </>}
            <Row label="Has Significant Debt" value={p?.has_significant_debt} />
            <Row label="Supporting Family Financially" value={p?.supporting_family_financially} />
            <Row label="Savings Plan" value={p?.savings_plan} />
            <LongRow label="Financial Stress Approach" value={p?.financial_stress_approach} />
          </Section>

          <Section title="Family Dynamics">
            {isBrother ? <>
              <Row label="Wife–Family Interaction" value={b?.wife_family_interaction} />
              <Row label="Eldest Responsibilities" value={b?.eldest_responsibilities} />
              <Row label="Child Caregiving" value={b?.child_caregiving} />
              <Row label="Wife–Family Relationship" value={b?.wife_family_relationship} />
              <Row label="Living Near Parents" value={b?.living_near_parents} />
            </> : <>
              <Row label="Family Balance After Marriage" value={s?.family_balance_after_marriage} />
              <Row label="Family Financial Responsibility" value={s?.family_financial_responsibility} />
              <Row label="In-Laws Comfort" value={s?.inlaws_comfort} />
              <Row label="Husband–Family Relationship" value={s?.husband_family_relationship} />
              <SliderRow label="Family: Traditional ↔ Modern" value={s?.family_traditional_vs_modern} />
            </>}
            <Row label="Family Conflict Style" value={p?.family_conflict_style} />
            <LongRow label="Relationship with Parents" value={p?.parent_relationship} />
            <LongRow label="Family vs Spouse Disagreements" value={p?.family_spouse_disagreement} />
          </Section>

          <Section title="Household">
            {isBrother ? <>
              <Row label="Wife Working Openness" value={b?.wife_working_openness} />
              <Row label="Household Management" value={b?.household_management} />
            </> : <>
              <Row label="Primary Caregiver Comfort" value={s?.primary_caregiver_comfort} />
              <LongRow label="Household Responsibilities Vision" value={s?.household_responsibilities_vision} />
            </>}
            <Row label="In-Laws Living Together" value={p?.inlaws_living_together} />
            <Row label="Islamic Schooling" value={p?.islamic_schooling_importance} />
            <Row label="Number of Children Wanted" value={p?.number_of_children_wanted} />
          </Section>

          <Section title="Lifestyle">
            <Row label="Music" value={p?.do_you_listen_to_music} />
            <Row label="Non-Islamic Holidays" value={p?.celebrate_non_islamic_holidays} />
            <Row label="Mixed-Gender Social Circle" value={p?.mixed_gender_social_circle} />
            {isBrother
              ? <Row label="Travel Frequency" value={b?.travel_frequency} />
              : <Row label="Travel Importance" value={s?.travel_importance} />}
            <Row label="Strict Halal Diet" value={p?.strict_halal_diet} />
            <Row label="Smoking" value={p?.smoking} />
            <Row label="Exercise Frequency" value={p?.exercise_frequency} />
            <Row label="Healthy Eating" value={p?.healthy_eating_importance} />
            <Row label="Pets" value={p?.pets_view} />
            <Row label="Social Media" value={p?.social_media_view} />
            <SliderRow label="Home Organisation" value={p?.home_organisation} />
            <Row label="Political Views" value={p?.political_views} />
            <SliderRow label="Cultural Background Importance" value={p?.cultural_background_importance} />
            <LongRow label="Weekend Lifestyle" value={p?.weekend_lifestyle} />
            <LongRow label="Ramadan Routine" value={p?.ramadan_routine} />
          </Section>

          <Section title="Mental & Emotional Health">
            <Row label="Therapy Experience" value={p?.therapy_experience} />
            <Row label="Couples Therapy View" value={p?.couples_therapy_view} />
            <Row label="Mental Health Challenges" value={p?.mental_health_challenges} />
            <Row label="Emotional Expression" value={p?.emotional_expression_view} />
            <SliderRow label="Emotional Availability" value={p?.emotional_availability} />
            <LongRow label="Stress Management" value={p?.stress_management} />
            <LongRow label="Emotional Support Style" value={p?.emotional_support_style} />
            <LongRow label="Significant Hardship" value={p?.significant_hardship} />
            <LongRow label="Health Background Disclosure" value={p?.health_background_disclosure} />
          </Section>

          <Section title="Conflict & Communication">
            <Row label="Conflict Style" value={p?.conflict_style} />
            <Row label="Personality" value={p?.introvert_extrovert} />
            <Row label="Alone Time" value={p?.alone_time_importance} />
            <Row label="Apology Speed" value={p?.apology_speed} />
            <Row label="Communication When Upset" value={p?.communication_when_upset} />
            <Row label="Love Language" value={p?.love_language} />
            {isBrother ? <>
              <Row label="Husband Final Say" value={b?.husband_final_say} />
              <Row label="Wife Opinion Importance" value={b?.wife_opinion_importance} />
              <Row label="Friendship Ended" value={b?.friendship_ended} />
            </> : <>
              <Row label="Qawwam View" value={s?.qawwam_view} />
              <Row label="Husband Opinion Importance" value={s?.husband_opinion_importance} />
              <Row label="Receiving Love Language" value={s?.receiving_love_language} />
            </>}
            <LongRow label="Healthy Argument View" value={p?.healthy_argument_view} />
          </Section>

          {!isBrother && (
            <Section title="Career">
              <Row label="Career Pause for Children" value={s?.career_pause_for_children} />
              <SliderRow label="Career Identity Importance" value={s?.career_identity_importance} />
              <LongRow label="Career in 5 Years" value={s?.career_five_years} />
              <LongRow label="Career Ambitions" value={s?.career_ambitions} />
            </Section>
          )}

          {p?.character_description ? (
            <Section title="About">
              <p className="text-sm text-[#1A1A1A] leading-relaxed">{String(p.character_description)}</p>
              {p?.goals ? <p className="text-sm text-[#5C5C5C] leading-relaxed mt-3">{String(p.goals)}</p> : null}
            </Section>
          ) : null}

          <Section title="Marriage Vision">
            <Row label="Physical Intimacy" value={p?.physical_intimacy_importance} />
            <Row label="Spouse Friendships" value={p?.spouse_friendships_view} />
            <LongRow label="10-Year Marriage Vision" value={p?.marriage_vision_10_years} />
            <LongRow label="First Year Vision" value={p?.first_year_vision} />
            <LongRow label="Romance View" value={p?.romance_view} />
            <LongRow label="Marriage Fear" value={p?.marriage_fear} />
            <LongRow label="Unique Contribution" value={p?.unique_contribution} />
            {!isBrother && <LongRow label="Ideal Husband Description" value={s?.ideal_husband_description} />}
          </Section>

          {detail.reference && (
            <Section title="Character Reference">
              {Object.entries(detail.reference)
                .filter(([k]) => !['id', 'profile_id'].includes(k))
                .map(([k, v]) => (
                  <Row key={k} label={k.replace(/_/g, ' ')} value={v} />
                ))}
            </Section>
          )}

          <Section title={`Matches (${detail.matches.length})`}>
            {detail.matches.length === 0 ? (
              <p className="text-sm text-[#9B9B9B]">No matches assigned</p>
            ) : (
              <div className="space-y-2">
                {detail.matches.map(m => (
                  <div key={m.id} className="flex items-center justify-between py-2 border-b border-[#EDE8E3] last:border-0">
                    <div>
                      <p className="text-sm font-medium text-[#1A1A1A]">{m.other_name}</p>
                      {m.compatibility_note && <p className="text-xs text-[#5C5C5C] mt-0.5 italic">{m.compatibility_note}</p>}
                    </div>
                    <span className={`text-[11px] px-2.5 py-1 rounded-full font-medium ${m.status === 'active' ? 'bg-[#F9F0F6] text-[#AF4D98]' : 'bg-[#FAF4EE] text-[#9B9B9B]'}`}>
                      {m.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </Section>

          <Section title={`Connections (${detail.connections.length})`}>
            {detail.connections.length === 0 ? (
              <p className="text-sm text-[#9B9B9B]">No connections</p>
            ) : (
              <div className="space-y-2">
                {detail.connections.map(c => (
                  <div key={c.id} className="flex items-center justify-between py-2 border-b border-[#EDE8E3] last:border-0">
                    <p className="text-sm font-medium text-[#1A1A1A]">{c.other_name}</p>
                    <span className={`text-[11px] px-2.5 py-1 rounded-full font-medium ${c.status === 'active' ? 'bg-[#F9F0F6] text-[#AF4D98]' : 'bg-[#FAF4EE] text-[#9B9B9B]'}`}>
                      {c.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </Section>
        </div>

        {/* Right col: actions */}
        <div className="space-y-4">
          <UserDetailActions
            userId={detail.id}
            currentStatus={detail.status}
            verificationBadge={detail.verification_badge}
            gender={detail.gender}
          />
        </div>
      </div>
    </div>
  )
}
