import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getUserDetail } from '@/lib/admin'
import UserDetailActions from '@/components/admin/UserDetailActions'
import { SectionCard, FieldRow, buildProfileSections } from '@/components/profile/shared'

type Props = { params: Promise<{ userId: string }> }

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
  const b = bp as Record<string, unknown> | null
  const s = sp as Record<string, unknown> | null
  const p = (b ?? s ?? {}) as Record<string, unknown>
  const isBrother = !!b
  const gender: 'brother' | 'sister' = isBrother ? 'brother' : 'sister'
  const name = (b?.full_name ?? s?.full_name ?? 'Unknown') as string

  const sections = buildProfileSections(p, gender)

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
        <div className="lg:col-span-2 space-y-3">

          <SectionCard title="Basic Info">
            <FieldRow label="Full Name" value={p?.full_name} />
            <FieldRow label="Age" value={p?.age} />
            <FieldRow label="Location" value={p?.location} />
            <FieldRow label="Joined" value={formatDate(detail.created_at)} />
          </SectionCard>

          {p?.character_description ? (
            <SectionCard title="About">
              <div style={{ padding: '14px 18px' }}>
                <p style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '16px', color: '#5C5C5C', lineHeight: 1.7, fontStyle: 'italic', margin: 0 }}>
                  &ldquo;{String(p.character_description)}&rdquo;
                </p>
              </div>
            </SectionCard>
          ) : null}

          {sections.map(section => (
            <SectionCard key={section.key} title={section.title} fields={section.fields} />
          ))}

          {detail.reference && (
            <SectionCard title="Character Reference">
              {Object.entries(detail.reference)
                .filter(([k]) => !['id', 'profile_id', 'created_at', 'updated_at'].includes(k))
                .map(([k, v]) => (
                  <FieldRow key={k} label={k.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())} value={v} />
                ))}
            </SectionCard>
          )}

          <SectionCard title={`Matches (${detail.matches.length})`}>
            {detail.matches.length === 0 ? (
              <p style={{ padding: '14px 18px', fontSize: '13px', color: '#9B7090', margin: 0 }}>No matches assigned</p>
            ) : (
              detail.matches.map(m => (
                <div key={m.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', padding: '12px 18px', borderBottom: '1px solid rgba(175,77,152,0.06)', gap: '12px' }}>
                  <div>
                    <p style={{ fontSize: '14px', fontWeight: 500, color: '#1A1A1A', margin: 0 }}>{m.other_name}</p>
                    {m.compatibility_note && (
                      <p style={{ fontSize: '12px', color: '#5C5C5C', marginTop: '4px', fontStyle: 'italic', margin: '4px 0 0' }}>
                        {m.compatibility_note}
                      </p>
                    )}
                  </div>
                  <span className={`text-[11px] px-2.5 py-1 rounded-full font-medium ${m.status === 'active' ? 'bg-[#F9F0F6] text-[#AF4D98]' : 'bg-[#FAF4EE] text-[#9B9B9B]'}`}>
                    {m.status}
                  </span>
                </div>
              ))
            )}
          </SectionCard>

          <SectionCard title={`Connections (${detail.connections.length})`}>
            {detail.connections.length === 0 ? (
              <p style={{ padding: '14px 18px', fontSize: '13px', color: '#9B7090', margin: 0 }}>No connections</p>
            ) : (
              detail.connections.map(c => (
                <div key={c.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 18px', borderBottom: '1px solid rgba(175,77,152,0.06)', gap: '12px' }}>
                  <p style={{ fontSize: '14px', fontWeight: 500, color: '#1A1A1A', margin: 0 }}>{c.other_name}</p>
                  <span className={`text-[11px] px-2.5 py-1 rounded-full font-medium ${c.status === 'active' ? 'bg-[#F9F0F6] text-[#AF4D98]' : 'bg-[#FAF4EE] text-[#9B9B9B]'}`}>
                    {c.status}
                  </span>
                </div>
              ))
            )}
          </SectionCard>
        </div>

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
