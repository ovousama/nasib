import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getUserDetail } from '@/lib/admin'
import UserDetailActions from '@/components/admin/UserDetailActions'
import { getFieldLabel } from '@/lib/field-labels'

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
            <Row label={getFieldLabel('religiosity_level', isBrother ? 'brother' : 'sister')} value={p?.religiosity_level} />
            <Row label={getFieldLabel('madhab', isBrother ? 'brother' : 'sister')} value={p?.madhab} />
            <Row label={getFieldLabel('prayer_frequency', isBrother ? 'brother' : 'sister')} value={p?.prayer_frequency} />
            <Row label={getFieldLabel('islamic_knowledge_level', isBrother ? 'brother' : 'sister')} value={p?.islamic_knowledge_level} />
            {isBrother ? <Row label={getFieldLabel('has_beard', 'brother')} value={p?.has_beard} /> : <Row label={getFieldLabel('wears_hijab', 'sister')} value={p?.wears_hijab} />}
            {!isBrother && <Row label={getFieldLabel('hijab_outside_home', 'sister')} value={s?.hijab_outside_home} />}
            {!isBrother && <Row label={getFieldLabel('islamic_classes_attendance', 'sister')} value={s?.islamic_classes_attendance} />}
            {isBrother && <Row label={getFieldLabel('jumuah_attendance', 'brother')} value={b?.jumuah_attendance} />}
            {isBrother && <Row label={getFieldLabel('wife_hijab_importance', 'brother')} value={b?.wife_hijab_importance} />}
            <LongRow label={getFieldLabel('differing_islamic_opinions', isBrother ? 'brother' : 'sister')} value={p?.differing_islamic_opinions} />
          </Section>

          <Section title="Deen Deepdive">
            <Row label={getFieldLabel('quran_listening', isBrother ? 'brother' : 'sister')} value={p?.quran_listening} />
            <Row label={getFieldLabel('quran_memorisation', isBrother ? 'brother' : 'sister')} value={p?.quran_memorisation} />
            <SliderRow label={getFieldLabel('traditional_vs_reformist', isBrother ? 'brother' : 'sister')} value={p?.traditional_vs_reformist} />
            <Row label={getFieldLabel('mawlid_view', isBrother ? 'brother' : 'sister')} value={p?.mawlid_view} />
            <Row label={getFieldLabel('zakah_sadaqah', isBrother ? 'brother' : 'sister')} value={p?.zakah_sadaqah} />
            <Row label={getFieldLabel('madhab_consistency', isBrother ? 'brother' : 'sister')} value={p?.madhab_consistency} />
            <Row label={getFieldLabel('spouse_islamic_knowledge', isBrother ? 'brother' : 'sister')} value={p?.spouse_islamic_knowledge} />
            {isBrother && <Row label={getFieldLabel('missed_prayer_approach', 'brother')} value={b?.missed_prayer_approach} />}
            {isBrother && <Row label={getFieldLabel('wife_niqab_preference', 'brother')} value={b?.wife_niqab_preference} />}
            {!isBrother && <Row label={getFieldLabel('islamic_home_importance', 'sister')} value={s?.islamic_home_importance} />}
            <LongRow label={getFieldLabel('deen_growth', isBrother ? 'brother' : 'sister')} value={p?.deen_growth} />
            {!isBrother && <LongRow label={getFieldLabel('deen_when_busy', 'sister')} value={s?.deen_when_busy} />}
          </Section>

          <Section title="Life & Career">
            <Row label="Occupation" value={p?.occupation} />
            <Row label="Education" value={p?.education_level} />
            <Row label="Living Situation" value={p?.living_situation} />
            <Row label="Willing to Relocate" value={p?.willing_to_relocate} />
            {isBrother && <Row label="Financial Readiness" value={b?.financial_readiness} />}
          </Section>

          <Section title="Marriage">
            <Row label={getFieldLabel('timeline_to_marry', isBrother ? 'brother' : 'sister')} value={p?.timeline_to_marry} />
            <Row label={getFieldLabel('previously_married', isBrother ? 'brother' : 'sister')} value={p?.previously_married} />
            <Row label={getFieldLabel('has_children', isBrother ? 'brother' : 'sister')} value={p?.has_children} />
            <Row label={getFieldLabel('wants_children', isBrother ? 'brother' : 'sister')} value={p?.wants_children} />
            <Row label={getFieldLabel('number_of_children_wanted', isBrother ? 'brother' : 'sister')} value={p?.number_of_children_wanted} />
            {isBrother && <Row label={getFieldLabel('polygamy_openness', 'brother')} value={b?.polygamy_openness} />}
            {isBrother && <Row label={getFieldLabel('polygamy_own_marriage', 'brother')} value={b?.polygamy_own_marriage} />}
            <Row label={getFieldLabel('spouse_religiosity_preference', isBrother ? 'brother' : 'sister')} value={p?.spouse_religiosity_preference} />
            <Row label="Spouse age range" value={(p?.spouse_age_min && p?.spouse_age_max) ? `${p.spouse_age_min}–${p.spouse_age_max}` : null} />
            <Row label={getFieldLabel('dealbreakers', isBrother ? 'brother' : 'sister')} value={p?.dealbreakers} />
          </Section>

          <Section title="Financial">
            {isBrother && <>
              <Row label={getFieldLabel('annual_income_range', 'brother')} value={b?.annual_income_range} />
              <Row label={getFieldLabel('own_or_rent', 'brother')} value={b?.own_or_rent} />
              <Row label={getFieldLabel('financial_readiness', 'brother')} value={b?.financial_readiness} />
              <Row label={getFieldLabel('financial_planning_approach', 'brother')} value={b?.financial_planning_approach} />
              <Row label={getFieldLabel('wife_financial_independence', 'brother')} value={b?.wife_financial_independence} />
              <Row label={getFieldLabel('wife_earning_more', 'brother')} value={b?.wife_earning_more} />
              <Row label={getFieldLabel('hajj_status', 'brother')} value={b?.hajj_status} />
              <LongRow label={getFieldLabel('mahr_approach', 'brother')} value={b?.mahr_approach} />
            </>}
            {!isBrother && <>
              <Row label={getFieldLabel('plan_to_work_after_marriage', 'sister')} value={s?.plan_to_work_after_marriage} />
              <Row label={getFieldLabel('financial_independence_importance', 'sister')} value={s?.financial_independence_importance} />
              <Row label={getFieldLabel('financial_dependence_view', 'sister')} value={s?.financial_dependence_view} />
            </>}
            <Row label={getFieldLabel('has_significant_debt', isBrother ? 'brother' : 'sister')} value={p?.has_significant_debt} />
            <Row label={getFieldLabel('supporting_family_financially', isBrother ? 'brother' : 'sister')} value={p?.supporting_family_financially} />
            <Row label={getFieldLabel('savings_plan', isBrother ? 'brother' : 'sister')} value={p?.savings_plan} />
            <LongRow label={getFieldLabel('financial_stress_approach', isBrother ? 'brother' : 'sister')} value={p?.financial_stress_approach} />
          </Section>

          <Section title="Family Dynamics">
            {isBrother ? <>
              <Row label={getFieldLabel('wife_family_interaction', 'brother')} value={b?.wife_family_interaction} />
              <Row label={getFieldLabel('eldest_responsibilities', 'brother')} value={b?.eldest_responsibilities} />
              <Row label={getFieldLabel('child_caregiving', 'brother')} value={b?.child_caregiving} />
              <Row label={getFieldLabel('wife_family_relationship', 'brother')} value={b?.wife_family_relationship} />
              <Row label={getFieldLabel('living_near_parents', 'brother')} value={b?.living_near_parents} />
            </> : <>
              <Row label={getFieldLabel('family_balance_after_marriage', 'sister')} value={s?.family_balance_after_marriage} />
              <Row label={getFieldLabel('family_financial_responsibility', 'sister')} value={s?.family_financial_responsibility} />
              <Row label={getFieldLabel('inlaws_comfort', 'sister')} value={s?.inlaws_comfort} />
              <Row label={getFieldLabel('husband_family_relationship', 'sister')} value={s?.husband_family_relationship} />
              <SliderRow label={getFieldLabel('family_traditional_vs_modern', 'sister')} value={s?.family_traditional_vs_modern} />
            </>}
            <Row label={getFieldLabel('family_conflict_style', isBrother ? 'brother' : 'sister')} value={p?.family_conflict_style} />
            <LongRow label={getFieldLabel('parent_relationship', isBrother ? 'brother' : 'sister')} value={p?.parent_relationship} />
            <LongRow label={getFieldLabel('family_spouse_disagreement', isBrother ? 'brother' : 'sister')} value={p?.family_spouse_disagreement} />
          </Section>

          <Section title="Household">
            {isBrother ? <>
              <Row label={getFieldLabel('wife_working_openness', 'brother')} value={b?.wife_working_openness} />
              <Row label={getFieldLabel('household_management', 'brother')} value={b?.household_management} />
            </> : <>
              <Row label={getFieldLabel('primary_caregiver_comfort', 'sister')} value={s?.primary_caregiver_comfort} />
              <LongRow label={getFieldLabel('household_responsibilities_vision', 'sister')} value={s?.household_responsibilities_vision} />
            </>}
            <Row label={getFieldLabel('inlaws_living_together', isBrother ? 'brother' : 'sister')} value={p?.inlaws_living_together} />
            <Row label={getFieldLabel('islamic_schooling_importance', isBrother ? 'brother' : 'sister')} value={p?.islamic_schooling_importance} />
            <Row label={getFieldLabel('number_of_children_wanted', isBrother ? 'brother' : 'sister')} value={p?.number_of_children_wanted} />
          </Section>

          <Section title="Lifestyle">
            <Row label={getFieldLabel('do_you_listen_to_music', isBrother ? 'brother' : 'sister')} value={p?.do_you_listen_to_music} />
            <Row label={getFieldLabel('celebrate_non_islamic_holidays', isBrother ? 'brother' : 'sister')} value={p?.celebrate_non_islamic_holidays} />
            <Row label={getFieldLabel('mixed_gender_social_circle', isBrother ? 'brother' : 'sister')} value={p?.mixed_gender_social_circle} />
            {isBrother
              ? <Row label={getFieldLabel('travel_frequency', 'brother')} value={b?.travel_frequency} />
              : <Row label={getFieldLabel('travel_importance', 'sister')} value={s?.travel_importance} />}
            <Row label={getFieldLabel('strict_halal_diet', isBrother ? 'brother' : 'sister')} value={p?.strict_halal_diet} />
            <Row label={getFieldLabel('smoking', isBrother ? 'brother' : 'sister')} value={p?.smoking} />
            <Row label={getFieldLabel('exercise_frequency', isBrother ? 'brother' : 'sister')} value={p?.exercise_frequency} />
            <Row label={getFieldLabel('healthy_eating_importance', isBrother ? 'brother' : 'sister')} value={p?.healthy_eating_importance} />
            <Row label={getFieldLabel('pets_view', isBrother ? 'brother' : 'sister')} value={p?.pets_view} />
            <Row label={getFieldLabel('social_media_view', isBrother ? 'brother' : 'sister')} value={p?.social_media_view} />
            <SliderRow label={getFieldLabel('home_organisation', isBrother ? 'brother' : 'sister')} value={p?.home_organisation} />
            <Row label={getFieldLabel('political_views', isBrother ? 'brother' : 'sister')} value={p?.political_views} />
            <SliderRow label={getFieldLabel('cultural_background_importance', isBrother ? 'brother' : 'sister')} value={p?.cultural_background_importance} />
            <LongRow label={getFieldLabel('weekend_lifestyle', isBrother ? 'brother' : 'sister')} value={p?.weekend_lifestyle} />
            <LongRow label={getFieldLabel('ramadan_routine', isBrother ? 'brother' : 'sister')} value={p?.ramadan_routine} />
          </Section>

          <Section title="Mental & Emotional Health">
            <Row label={getFieldLabel('therapy_experience', isBrother ? 'brother' : 'sister')} value={p?.therapy_experience} />
            <Row label={getFieldLabel('couples_therapy_view', isBrother ? 'brother' : 'sister')} value={p?.couples_therapy_view} />
            <Row label={getFieldLabel('mental_health_challenges', isBrother ? 'brother' : 'sister')} value={p?.mental_health_challenges} />
            <Row label={getFieldLabel('emotional_expression_view', isBrother ? 'brother' : 'sister')} value={p?.emotional_expression_view} />
            <SliderRow label={getFieldLabel('emotional_availability', isBrother ? 'brother' : 'sister')} value={p?.emotional_availability} />
            <LongRow label={getFieldLabel('stress_management', isBrother ? 'brother' : 'sister')} value={p?.stress_management} />
            <LongRow label={getFieldLabel('emotional_support_style', isBrother ? 'brother' : 'sister')} value={p?.emotional_support_style} />
            <LongRow label={getFieldLabel('significant_hardship', isBrother ? 'brother' : 'sister')} value={p?.significant_hardship} />
            <LongRow label={getFieldLabel('health_background_disclosure', isBrother ? 'brother' : 'sister')} value={p?.health_background_disclosure} />
          </Section>

          <Section title="Conflict & Communication">
            <Row label={getFieldLabel('conflict_style', isBrother ? 'brother' : 'sister')} value={p?.conflict_style} />
            <Row label={getFieldLabel('introvert_extrovert', isBrother ? 'brother' : 'sister')} value={p?.introvert_extrovert} />
            <Row label={getFieldLabel('alone_time_importance', isBrother ? 'brother' : 'sister')} value={p?.alone_time_importance} />
            <Row label={getFieldLabel('apology_speed', isBrother ? 'brother' : 'sister')} value={p?.apology_speed} />
            <Row label={getFieldLabel('communication_when_upset', isBrother ? 'brother' : 'sister')} value={p?.communication_when_upset} />
            <Row label={getFieldLabel('love_language', isBrother ? 'brother' : 'sister')} value={p?.love_language} />
            {isBrother ? <>
              <Row label={getFieldLabel('husband_final_say', 'brother')} value={b?.husband_final_say} />
              <Row label={getFieldLabel('wife_opinion_importance', 'brother')} value={b?.wife_opinion_importance} />
              <Row label={getFieldLabel('friendship_ended', 'brother')} value={b?.friendship_ended} />
            </> : <>
              <Row label={getFieldLabel('qawwam_view', 'sister')} value={s?.qawwam_view} />
              <Row label={getFieldLabel('husband_opinion_importance', 'sister')} value={s?.husband_opinion_importance} />
              <Row label={getFieldLabel('receiving_love_language', 'sister')} value={s?.receiving_love_language} />
            </>}
            <LongRow label={getFieldLabel('healthy_argument_view', isBrother ? 'brother' : 'sister')} value={p?.healthy_argument_view} />
          </Section>

          {!isBrother && (
            <Section title="Career">
              <Row label={getFieldLabel('plan_to_work_after_marriage', 'sister')} value={s?.plan_to_work_after_marriage} />
              <Row label={getFieldLabel('career_pause_for_children', 'sister')} value={s?.career_pause_for_children} />
              <Row label={getFieldLabel('financial_dependence_view', 'sister')} value={s?.financial_dependence_view} />
              <Row label={getFieldLabel('financial_independence_importance', 'sister')} value={s?.financial_independence_importance} />
              <SliderRow label={getFieldLabel('career_identity_importance', 'sister')} value={s?.career_identity_importance} />
              <LongRow label={getFieldLabel('career_five_years', 'sister')} value={s?.career_five_years} />
              <LongRow label={getFieldLabel('career_ambitions', 'sister')} value={s?.career_ambitions} />
            </Section>
          )}

          {p?.character_description ? (
            <Section title="About">
              <p className="text-sm text-[#1A1A1A] leading-relaxed">{String(p.character_description)}</p>
              {p?.goals ? <p className="text-sm text-[#5C5C5C] leading-relaxed mt-3">{String(p.goals)}</p> : null}
            </Section>
          ) : null}

          <Section title="Marriage Vision">
            <Row label={getFieldLabel('physical_intimacy_importance', isBrother ? 'brother' : 'sister')} value={p?.physical_intimacy_importance} />
            <Row label={getFieldLabel('spouse_friendships_view', isBrother ? 'brother' : 'sister')} value={p?.spouse_friendships_view} />
            <LongRow label={getFieldLabel('marriage_vision_10_years', isBrother ? 'brother' : 'sister')} value={p?.marriage_vision_10_years} />
            <LongRow label={getFieldLabel('first_year_vision', isBrother ? 'brother' : 'sister')} value={p?.first_year_vision} />
            <LongRow label={getFieldLabel('romance_view', isBrother ? 'brother' : 'sister')} value={p?.romance_view} />
            <LongRow label={getFieldLabel('marriage_fear', isBrother ? 'brother' : 'sister')} value={p?.marriage_fear} />
            <LongRow label={getFieldLabel('unique_contribution', isBrother ? 'brother' : 'sister')} value={p?.unique_contribution} />
            {!isBrother && <LongRow label={getFieldLabel('ideal_husband_description', 'sister')} value={s?.ideal_husband_description} />}
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
