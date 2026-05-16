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
  const display = typeof value === 'boolean' ? (value ? 'Yes' : 'No') : Array.isArray(value) ? value.join(', ') : String(value)
  return (
    <div className="flex justify-between items-start py-2 border-b border-[#EDE8E3] last:border-0">
      <span className="text-sm text-[#5C5C5C] flex-shrink-0 mr-4 w-40">{label}</span>
      <span className="text-sm text-[#1A1A1A] text-right">{display}</span>
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
  const name = bp?.full_name ?? sp?.full_name ?? 'Unknown'

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
        {/* Left col: profile info */}
        <div className="lg:col-span-2 space-y-4">
          {/* Profile fields */}
          {bp && (
            <>
              <Section title="Basic Info">
                <Row label="Full Name" value={bp.full_name} />
                <Row label="Age" value={bp.age} />
                <Row label="Location" value={bp.location} />
                <Row label="Ethnicity" value={bp.ethnicity} />
                <Row label="Languages" value={bp.languages} />
                <Row label="Joined" value={formatDate(detail.created_at)} />
              </Section>
              <Section title="Deen">
                <Row label="Religiosity" value={bp.religiosity_level} />
                <Row label="Madhab" value={bp.madhab} />
                <Row label="Prayer" value={bp.prayer_frequency} />
                <Row label="Islamic Knowledge" value={bp.islamic_knowledge_level} />
                <Row label="Has Beard" value={bp.has_beard} />
              </Section>
              <Section title="Life & Career">
                <Row label="Occupation" value={bp.occupation} />
                <Row label="Education" value={bp.education_level} />
                <Row label="Living Situation" value={bp.living_situation} />
                <Row label="Willing to Relocate" value={bp.willing_to_relocate} />
                <Row label="Financial Readiness" value={bp.financial_readiness} />
              </Section>
              <Section title="Marriage">
                <Row label="Timeline" value={bp.timeline_to_marry} />
                <Row label="Previously Married" value={bp.previously_married} />
                <Row label="Has Children" value={bp.has_children} />
                <Row label="Wants Children" value={bp.wants_children} />
                <Row label="Open to Polygamy" value={bp.polygamy_openness} />
                <Row label="Spouse Religiosity" value={bp.spouse_religiosity_preference} />
                <Row label="Spouse Age Range" value={bp.spouse_age_min && bp.spouse_age_max ? `${bp.spouse_age_min}–${bp.spouse_age_max}` : null} />
              </Section>
              {bp.character_description && (
                <Section title="About">
                  <p className="text-sm text-[#1A1A1A] leading-relaxed">{bp.character_description}</p>
                </Section>
              )}
              {bp.dealbreakers?.length ? (
                <Section title="Dealbreakers">
                  <ul className="list-disc list-inside space-y-1">
                    {bp.dealbreakers.map(d => <li key={d} className="text-sm text-[#1A1A1A]">{d}</li>)}
                  </ul>
                </Section>
              ) : null}
            </>
          )}

          {sp && (
            <>
              <Section title="Basic Info">
                <Row label="Full Name" value={sp.full_name} />
                <Row label="Age" value={sp.age} />
                <Row label="Location" value={sp.location} />
                <Row label="Ethnicity" value={sp.ethnicity} />
                <Row label="Languages" value={sp.languages} />
                <Row label="Joined" value={formatDate(detail.created_at)} />
              </Section>
              <Section title="Deen">
                <Row label="Religiosity" value={sp.religiosity_level} />
                <Row label="Madhab" value={sp.madhab} />
                <Row label="Prayer" value={sp.prayer_frequency} />
                <Row label="Islamic Knowledge" value={sp.islamic_knowledge_level} />
                <Row label="Hijab" value={sp.wears_hijab} />
              </Section>
              <Section title="Life & Career">
                <Row label="Occupation" value={sp.occupation} />
                <Row label="Education" value={sp.education_level} />
                <Row label="Living Situation" value={sp.living_situation} />
                <Row label="Willing to Relocate" value={sp.willing_to_relocate} />
              </Section>
              <Section title="Marriage">
                <Row label="Timeline" value={sp.timeline_to_marry} />
                <Row label="Previously Married" value={sp.previously_married} />
                <Row label="Has Children" value={sp.has_children} />
                <Row label="Wants Children" value={sp.wants_children} />
                <Row label="Spouse Religiosity" value={sp.spouse_religiosity_preference} />
                <Row label="Spouse Age Range" value={sp.spouse_age_min && sp.spouse_age_max ? `${sp.spouse_age_min}–${sp.spouse_age_max}` : null} />
              </Section>
              {sp.character_description && (
                <Section title="About">
                  <p className="text-sm text-[#1A1A1A] leading-relaxed">{sp.character_description}</p>
                </Section>
              )}
            </>
          )}

          {/* Reference */}
          {detail.reference && (
            <Section title="Character Reference">
              {Object.entries(detail.reference)
                .filter(([k]) => !['id', 'profile_id'].includes(k))
                .map(([k, v]) => (
                  <Row key={k} label={k.replace(/_/g, ' ')} value={v} />
                ))}
            </Section>
          )}

          {/* Matches */}
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

          {/* Connections */}
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
