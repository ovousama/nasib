import { redirect } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import {
  getWaliForCurrentUser,
  getWaliSisterData,
  getWaliSisterMatches,
  getWaliSisterConnections,
  getWaliSisterIncomingInterests,
  getWaliSisterNotifications,
} from '@/lib/database'

function ReadOnlyBadge() {
  return (
    <span className="inline-flex items-center gap-1 text-[10px] font-medium text-[#9B9B9B] bg-[#FDF8F3] border border-[#EDE8E3] px-2 py-0.5 rounded-full uppercase tracking-wide">
      Read only
    </span>
  )
}

function formatRelative(dateStr: string): string {
  const diffMs = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diffMs / 60000)
  if (mins < 1) return 'Just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}

const NOTIF_ICONS: Record<string, string> = {
  interest_received: '💌', new_interest: '💌',
  interest_accepted: '✅', mutual_interest: '✅',
  interest_declined: '🤝', connection_closed: '🔒',
  meeting_confirmed: '📅', meeting_requested: '🗓',
  match_refresh: '🔄', match_ready: '⭐',
}

export default async function WaliDashboardPage() {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const waliProfile = await getWaliForCurrentUser()
  if (!waliProfile) redirect('/auth/login')

  const [sisterData, matches, connections, interests, notifications] = await Promise.all([
    getWaliSisterData(waliProfile.sister_id),
    getWaliSisterMatches(waliProfile.sister_id),
    getWaliSisterConnections(waliProfile.sister_id),
    getWaliSisterIncomingInterests(waliProfile.sister_id),
    getWaliSisterNotifications(waliProfile.sister_id),
  ])

  if (!sisterData) {
    return (
      <div className="px-6 py-8 text-center text-[#5C5C5C] text-sm">
        Sister profile not found. Please contact support.
      </div>
    )
  }

  const { profile, sisterProfile } = sisterData
  const sisterFirstName = sisterProfile.full_name.split(' ')[0]

  return (
    <div className="px-6 py-6 space-y-7">

      {/* ── Sister Profile Summary ─────────────────────────────── */}
      <section>
        <div className="bg-white rounded-2xl p-5 border border-[#EDE8E3] shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
          <div className="flex items-start gap-4">
            {sisterProfile.photo_urls?.[0] ? (
              <Image
                src={sisterProfile.photo_urls[0]}
                alt={sisterFirstName}
                width={56}
                height={56}
                className="w-14 h-14 rounded-full object-cover ring-2 ring-white shadow-sm flex-shrink-0"
              />
            ) : (
              <div className="w-14 h-14 rounded-full bg-[#F4E4BA] flex items-center justify-center text-[#AF4D98] text-xl font-medium flex-shrink-0">
                {sisterFirstName[0]?.toUpperCase()}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="font-medium text-[#1A1A1A]">{sisterProfile.full_name}</h2>
                {profile.verification_badge && (
                  <span className="inline-flex items-center gap-1 bg-[#E6F9F7] text-[#00A699] text-xs font-medium px-2.5 py-1 rounded-full">
                    ✓ Verified
                  </span>
                )}
              </div>
              <p className="text-sm text-[#5C5C5C] mt-0.5 leading-relaxed">
                {[sisterProfile.age ? `${sisterProfile.age} yrs` : null, sisterProfile.location].filter(Boolean).join(' · ')}
              </p>
              <div className="flex items-center gap-2 mt-2 flex-wrap">
                <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                  profile.status === 'active' ? 'bg-[#F5E6F2] text-[#AF4D98]' : 'bg-[#FFF4CC] text-[#6B4F00]'
                }`}>
                  {profile.status.replace(/_/g, ' ')}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-[#EDE8E3] grid grid-cols-2 gap-3 text-xs">
            <div>
              <p className="text-[#9B9B9B] mb-0.5">Religiosity</p>
              <p className="text-[#1A1A1A] font-medium capitalize">{sisterProfile.religiosity_level?.replace(/_/g, ' ') ?? '—'}</p>
            </div>
            <div>
              <p className="text-[#9B9B9B] mb-0.5">Timeline</p>
              <p className="text-[#1A1A1A] font-medium">{sisterProfile.timeline_to_marry ?? '—'}</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Matches ─────────────────────────────────────────────── */}
      <section>
        <div className="flex items-center gap-2 mb-3">
          <h2 className="text-base font-medium text-[#1A1A1A]">Matches</h2>
          <ReadOnlyBadge />
        </div>

        {matches.length === 0 ? (
          <div className="rounded-2xl p-5 text-center border-2 border-dashed border-[#EDE8E3] bg-[#FDF8F3]">
            <p className="text-[#5C5C5C] text-sm">No active matches at this time.</p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {matches.map(match => {
              const b = match.brother
              const brotherFirst = b?.full_name?.split(' ')[0] ?? 'Brother'
              return (
                <div key={match.id} className="bg-white rounded-2xl p-4 border border-[#EDE8E3] shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
                  <div className="flex items-start gap-3">
                    {b?.photo_url ? (
                      <Image src={b.photo_url} alt={brotherFirst} width={40} height={40} className="w-10 h-10 rounded-xl object-cover flex-shrink-0" />
                    ) : (
                      <div className="w-10 h-10 rounded-xl bg-[#F4E4BA] flex items-center justify-center text-[#AF4D98] font-medium text-sm flex-shrink-0">
                        {brotherFirst[0]?.toUpperCase()}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium text-[#1A1A1A] text-sm">{brotherFirst}</span>
                        {b?.verification_badge && (
                          <span className="text-[10px] text-[#00A699] bg-[#E6F9F7] px-1.5 py-0.5 rounded-full">✓ Verified</span>
                        )}
                      </div>
                      <p className="text-xs text-[#5C5C5C] mt-0.5">
                        {[b?.age ? `${b.age} yrs` : null, b?.location].filter(Boolean).join(' · ')}
                      </p>
                    </div>
                    <ReadOnlyBadge />
                  </div>
                  {match.compatibility_note && (
                    <p className="text-xs text-[#AF4D98] bg-[#F5E6F2] rounded-xl px-3 py-2 mt-3 italic border-l-2 border-[#AF4D98]">
                      {match.compatibility_note}
                    </p>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </section>

      {/* ── Pending Interests ───────────────────────────────────── */}
      {interests.length > 0 && (
        <section>
          <div className="flex items-center gap-2 mb-3">
            <h2 className="text-base font-medium text-[#1A1A1A]">Pending Interests</h2>
            <ReadOnlyBadge />
          </div>

          <div className="space-y-2.5">
            {interests.map(interest => {
              const op = interest.other_profile
              return (
                <div key={interest.id} className="bg-white rounded-2xl p-4 border border-[#EDE8E3] shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
                  <div className="flex items-start gap-3 mb-3">
                    {op?.photo_url ? (
                      <Image src={op.photo_url} alt={op.full_name} width={40} height={40} className="w-10 h-10 rounded-xl object-cover flex-shrink-0" />
                    ) : (
                      <div className="w-10 h-10 rounded-xl bg-[#F4E4BA] flex items-center justify-center text-[#AF4D98] font-medium text-sm flex-shrink-0">
                        {(op?.full_name ?? 'B')[0]?.toUpperCase()}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <span className="font-medium text-[#1A1A1A] text-sm">{op?.full_name ?? 'Brother'}</span>
                      <p className="text-xs text-[#5C5C5C] mt-0.5">
                        {[op?.age ? `${op.age} yrs` : null, op?.location].filter(Boolean).join(' · ')}
                      </p>
                    </div>
                  </div>

                  {interest.intro_message && (
                    <div className="bg-[#FDF8F3] rounded-xl px-3 py-2 mb-3 border border-[#EDE8E3]">
                      <p className="text-xs text-[#9B9B9B] font-medium mb-0.5">Their message</p>
                      <p className="text-xs text-[#5C5C5C] italic">&ldquo;{interest.intro_message}&rdquo;</p>
                    </div>
                  )}

                  <div className="flex items-center gap-1.5 text-xs text-[#9B9B9B]">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-3.5 h-3.5">
                      <path d="M8 7a1 1 0 0 1 1 1v1H7V8a1 1 0 0 1 1-1Z" />
                      <path fillRule="evenodd" d="M11 2.75V2h-1v.75h-4V2H5v.75H4A2.75 2.75 0 0 0 1.25 5.5v6A2.75 2.75 0 0 0 4 14.25h8A2.75 2.75 0 0 0 14.75 11.5v-6A2.75 2.75 0 0 0 12 2.75h-1Zm2.25 4v4.75c0 .69-.56 1.25-1.25 1.25H4c-.69 0-1.25-.56-1.25-1.25V6.75h10.5Z" clipRule="evenodd" />
                    </svg>
                    Sister will respond to this interest
                  </div>
                </div>
              )
            })}
          </div>
        </section>
      )}

      {/* ── Active Connections ───────────────────────────────────── */}
      <section>
        <div className="flex items-center gap-2 mb-3">
          <h2 className="text-base font-medium text-[#1A1A1A]">Active Connections</h2>
        </div>

        {connections.length === 0 ? (
          <div className="rounded-2xl p-5 text-center border-2 border-dashed border-[#EDE8E3] bg-[#FDF8F3]">
            <p className="text-[#5C5C5C] text-sm">No active connections yet.</p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {connections.map(conn => (
              <div key={conn.id} className="bg-white rounded-2xl p-4 border border-[#EDE8E3] shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
                <div className="flex items-center gap-2 mb-3">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#9DF7E5] border-2 border-[#5ECFBA] flex-shrink-0" />
                  <span className="font-medium text-[#1A1A1A] text-sm">{conn.other_name}</span>
                  <span className="text-xs text-[#00A699] bg-[#E6F9F7] px-2 py-0.5 rounded-full ml-auto font-medium">Active</span>
                </div>
                <Link
                  href={`/wali/chat/${conn.id}`}
                  className="block text-center text-sm font-medium text-[#AF4D98] border border-[#AF4D98] py-2.5 rounded-full hover:bg-[#F5E6F2] transition-colors"
                >
                  View Chat
                </Link>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ── Notifications ────────────────────────────────────────── */}
      {notifications.length > 0 && (
        <section>
          <div className="flex items-center gap-2 mb-3">
            <h2 className="text-base font-medium text-[#1A1A1A]">Recent Activity</h2>
            <ReadOnlyBadge />
          </div>

          <div className="space-y-2">
            {notifications.map(notif => (
              <div key={notif.id} className="bg-white rounded-2xl p-3.5 border border-[#EDE8E3] shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-[#F5E6F2] flex items-center justify-center text-base flex-shrink-0">
                    {NOTIF_ICONS[notif.type] ?? '🔔'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-medium text-[#1A1A1A] leading-snug">{notif.title}</p>
                      <span className="text-[10px] text-[#9B9B9B] flex-shrink-0">{formatRelative(notif.created_at)}</span>
                    </div>
                    <p className="text-xs text-[#5C5C5C] mt-0.5 leading-relaxed">{notif.body}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
