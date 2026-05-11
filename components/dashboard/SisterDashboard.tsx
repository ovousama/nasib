'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  expressInterest,
  acceptInterest,
  declineInterest,
  closeConnection,
  markNotificationRead,
} from '@/app/dashboard/actions'
import type {
  Profile,
  SisterProfile,
  WaliProfile,
  SisterMatch,
  ConnectionWithProfile,
  InterestWithProfile,
  Notification,
} from '@/lib/database'

type Props = {
  profile: Profile
  sisterProfile: SisterProfile
  waliProfile: WaliProfile | null
  matches: SisterMatch[]
  connections: ConnectionWithProfile[]
  incomingInterests: InterestWithProfile[]
  notifications: Notification[]
}

function VerifiedBadge({ dark = false }: { dark?: boolean }) {
  if (dark) {
    return (
      <span className="inline-flex items-center gap-1.5 bg-white/20 text-white text-xs font-medium px-3 py-1.5 rounded-full">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
        </svg>
        Verified
      </span>
    )
  }
  return (
    <span className="inline-flex items-center gap-1 bg-[#E6F9F7] text-[#00A699] text-xs font-medium px-2.5 py-1 rounded-full">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-3 h-3">
        <path fillRule="evenodd" d="M8 15A7 7 0 108 1a7 7 0 000 14zm3.844-8.791a.75.75 0 00-1.188-.918l-3.7 4.79-1.649-1.833a.75.75 0 10-1.114 1.004l2.25 2.5a.75.75 0 001.15-.086l4.25-5.5-.001-.002z" clipRule="evenodd" />
      </svg>
      Verified
    </span>
  )
}

function PendingBadge() {
  return (
    <span className="inline-flex items-center gap-1.5 bg-[#FFF4CC]/40 text-[#FFF4CC] text-xs font-medium px-3 py-1.5 rounded-full">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm.75-13a.75.75 0 00-1.5 0v5c0 .414.336.75.75.75h4a.75.75 0 000-1.5h-3.25V5z" clipRule="evenodd" />
      </svg>
      Pending Verification
    </span>
  )
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="rounded-2xl p-6 text-center border-2 border-dashed border-[#EBEBEB] bg-[#FDFAF7]">
      <p className="text-[#6B6B6B] text-sm leading-relaxed">{message}</p>
    </div>
  )
}

function formatRelativeDate(dateStr: string) {
  const diffMs = Date.now() - new Date(dateStr).getTime()
  const diffMins = Math.floor(diffMs / 60000)
  if (diffMins < 60) return `${diffMins}m ago`
  const diffHours = Math.floor(diffMins / 60)
  if (diffHours < 24) return `${diffHours}h ago`
  return `${Math.floor(diffHours / 24)}d ago`
}

export default function SisterDashboard({
  profile,
  sisterProfile,
  waliProfile,
  matches,
  connections,
  incomingInterests,
  notifications,
}: Props) {
  const router = useRouter()
  const firstName = sisterProfile.full_name.split(' ')[0]

  const [interestModal, setInterestModal] = useState<{ brotherId: string; sisterId: string; firstName: string } | null>(null)
  const [introMessage, setIntroMessage] = useState('')
  const [interestLoading, setInterestLoading] = useState(false)
  const [interestError, setInterestError] = useState<string | null>(null)
  const [localSentIds, setLocalSentIds] = useState<string[]>([])

  const [acceptModalInterest, setAcceptModalInterest] = useState<InterestWithProfile | null>(null)
  const [closeModalConnection, setCloseModalConnection] = useState<ConnectionWithProfile | null>(null)
  const [accepting, setAccepting] = useState(false)
  const [declining, setDeclining] = useState<string | null>(null)
  const [closing, setClosing] = useState(false)
  const [actionError, setActionError] = useState<string | null>(null)
  const [closedToast, setClosedToast] = useState(false)
  const [mutualToast, setMutualToast] = useState(false)
  const [readNotifIds, setReadNotifIds] = useState<Set<string>>(new Set())
  const [localDeclinedIds, setLocalDeclinedIds] = useState<Set<string>>(new Set())

  const connectionsFull = connections.length >= 3

  const openInterestModal = (brotherId: string, sisterId: string, brotherFirstName: string) => {
    setIntroMessage('')
    setInterestError(null)
    setInterestModal({ brotherId, sisterId, firstName: brotherFirstName })
  }

  const handleSendInterest = async () => {
    if (!interestModal) return
    setInterestLoading(true)
    setInterestError(null)
    const result = await expressInterest(interestModal.brotherId, interestModal.sisterId, introMessage.trim() || undefined)
    setInterestLoading(false)
    if (result?.error) {
      setInterestError(result.error)
    } else if (result?.mutual && result.connectionId) {
      setInterestModal(null)
      setMutualToast(true)
      setTimeout(() => setMutualToast(false), 3000)
      router.push(`/dashboard/chat/${result.connectionId}`)
    } else {
      setLocalSentIds(prev => [...prev, interestModal.brotherId])
      setInterestModal(null)
      router.refresh()
    }
  }

  const handleAccept = async () => {
    if (!acceptModalInterest) return
    setAccepting(true)
    setActionError(null)
    const result = await acceptInterest(acceptModalInterest.id)
    setAccepting(false)
    if (result?.error) {
      setActionError(result.error)
    } else {
      setAcceptModalInterest(null)
      if (result.connectionId) {
        router.push(`/dashboard/chat/${result.connectionId}`)
      } else {
        router.refresh()
      }
    }
  }

  const handleDecline = async (interestId: string) => {
    setDeclining(interestId)
    const result = await declineInterest(interestId)
    setDeclining(null)
    if (!result?.error) {
      setLocalDeclinedIds(prev => new Set(prev).add(interestId))
      router.refresh()
    }
  }

  const handleCloseConnection = async () => {
    if (!closeModalConnection) return
    setClosing(true)
    setActionError(null)
    const result = await closeConnection(closeModalConnection.id)
    setClosing(false)
    if (result?.error) {
      setActionError(result.error)
    } else {
      setCloseModalConnection(null)
      setClosedToast(true)
      setTimeout(() => setClosedToast(false), 3000)
      router.refresh()
    }
  }

  const handleMarkRead = async (notifId: string) => {
    setReadNotifIds(prev => new Set(prev).add(notifId))
    await markNotificationRead(notifId)
    router.refresh()
  }

  const visibleInterests = incomingInterests.filter(i => !localDeclinedIds.has(i.id))
  const visibleNotifications = notifications.filter(n => !readNotifIds.has(n.id))

  return (
    <>
      <div>
        {/* ── Header ──────────────────────────────────────────── */}
        <div className="bg-gradient-to-br from-[#AF4D98] to-[#D66BA0] px-6 pt-8 pb-8">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-white/70 text-sm font-medium mb-0.5">Assalamu Alaikum</p>
              <h1 className="text-white text-2xl font-semibold tracking-tight leading-snug">{firstName}</h1>
              <div className="mt-3 space-y-2">
                {profile.verification_badge ? <VerifiedBadge dark /> : <PendingBadge />}

                {waliProfile && (
                  <div className="inline-flex items-center gap-1.5 bg-white/10 text-white/80 text-xs font-medium px-3 py-1.5 rounded-full">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5">
                      <path d="M10 8a3 3 0 100-6 3 3 0 000 6zM3.465 14.493a1.23 1.23 0 00.41 1.412A9.957 9.957 0 0010 18c2.31 0 4.438-.784 6.131-2.1.43-.333.604-.903.408-1.41a7.002 7.002 0 00-13.074.003z" />
                    </svg>
                    Wali: {waliProfile.full_name} · Read-only access
                  </div>
                )}
              </div>
            </div>

            <div className="ml-4 flex-shrink-0">
              {sisterProfile.photo_urls?.[0] ? (
                <img
                  src={sisterProfile.photo_urls[0]}
                  alt={firstName}
                  className="w-16 h-16 rounded-full object-cover ring-2 ring-white/30"
                />
              ) : (
                <div className="w-16 h-16 rounded-full bg-[#F4E4BA] flex items-center justify-center text-[#AF4D98] text-xl font-semibold">
                  {firstName[0]?.toUpperCase()}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="px-6 py-6 space-y-8">
          {/* ── Connections Counter ──────────────────────────────── */}
          <div className="bg-white rounded-2xl p-5 border border-[#EBEBEB] shadow-[0_1px_2px_rgba(0,0,0,0.08),0_4px_12px_rgba(0,0,0,0.05)]">
            <p className="text-sm text-[#6B6B6B] mb-3 leading-relaxed">
              You have{' '}
              <span className="font-semibold text-[#1A1A1A]">{connections.length}</span> of 3
              active connections
            </p>
            <div className="flex gap-2">
              {[0, 1, 2].map(i => (
                <div
                  key={i}
                  className={`h-1.5 flex-1 rounded-full transition-colors ${
                    i < connections.length ? 'bg-[#AF4D98]' : 'bg-[#EBEBEB]'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* ── Incoming Interests ───────────────────────────────── */}
          {visibleInterests.length > 0 && (
            <section id="interests">
              <h2 className="text-lg font-semibold text-[#1A1A1A] tracking-tight mb-4">New Interest</h2>
              <div className="space-y-3">
                {visibleInterests.map(interest => {
                  const op = interest.other_profile
                  return (
                    <div key={interest.id} className="bg-white rounded-2xl p-5 border border-[#EBEBEB] shadow-[0_1px_2px_rgba(0,0,0,0.08),0_4px_12px_rgba(0,0,0,0.05)] hover:-translate-y-0.5 hover:shadow-[0_2px_4px_rgba(0,0,0,0.08),0_8px_24px_rgba(0,0,0,0.08)] transition-all duration-200">
                      <div className="flex items-start gap-3 mb-3">
                        {op?.photo_url ? (
                          <img src={op.photo_url} alt={op.full_name} className="w-14 h-14 rounded-2xl object-cover flex-shrink-0" />
                        ) : (
                          <div className="w-14 h-14 rounded-2xl bg-[#F4E4BA] flex items-center justify-center text-[#AF4D98] text-xl font-semibold flex-shrink-0">
                            {(op?.full_name ?? 'B')[0]?.toUpperCase()}
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-semibold text-[#1A1A1A]">{op?.full_name ?? 'Brother'}</span>
                            {op?.verification_badge && <VerifiedBadge />}
                          </div>
                          <p className="text-sm text-[#6B6B6B] mt-0.5 leading-relaxed">
                            {[op?.age ? `${op.age} yrs` : null, op?.location].filter(Boolean).join(' · ')}
                          </p>
                        </div>
                      </div>

                      {op?.compatibility_note && (
                        <p className="text-sm text-[#AF4D98] bg-[#F5E6F2] rounded-xl px-3 py-2 mb-3 italic border-l-2 border-[#AF4D98]">
                          {op.compatibility_note}
                        </p>
                      )}

                      {interest.intro_message && (
                        <div className="bg-[#FDFAF7] rounded-xl px-3 py-2.5 mb-3 border border-[#EBEBEB]">
                          <p className="text-xs text-[#9B9B9B] font-medium mb-1">Their message</p>
                          <p className="text-sm text-[#1A1A1A] italic">&ldquo;{interest.intro_message}&rdquo;</p>
                        </div>
                      )}

                      <div className="grid grid-cols-3 gap-2 pt-3 border-t border-[#EBEBEB]">
                        <Link
                          href={`/dashboard/profile/${interest.brother_id}`}
                          className="text-center text-sm font-medium text-[#6B6B6B] border border-[#EBEBEB] py-2.5 rounded-full hover:bg-[#FDFAF7] transition-colors"
                        >
                          View
                        </Link>
                        <button
                          onClick={() => {
                            if (connectionsFull) setActionError('Close an active connection before accepting a new one.')
                            else { setActionError(null); setAcceptModalInterest(interest) }
                          }}
                          className="text-sm font-medium bg-[#AF4D98] text-white py-2.5 rounded-full hover:bg-[#9B3D85] active:scale-95 transition-all duration-200 shadow-sm"
                        >
                          Accept
                        </button>
                        <button
                          onClick={() => handleDecline(interest.id)}
                          disabled={declining === interest.id}
                          className="text-sm font-medium text-[#C13515] border border-[#C13515]/30 py-2.5 rounded-full hover:bg-[#FDECEA] disabled:opacity-50 active:scale-95 transition-all duration-200"
                        >
                          {declining === interest.id ? '…' : 'Decline'}
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>

              {actionError && (
                <div className="mt-3 bg-[#FDECEA] border border-[#C13515]/20 rounded-xl p-3 text-sm text-[#C13515]">
                  {actionError}
                </div>
              )}
            </section>
          )}

          {/* ── Matches ─────────────────────────────────────────── */}
          <section id="matches">
            <h2 className="text-lg font-semibold text-[#1A1A1A] tracking-tight mb-0.5">Your Matches</h2>
            <p className="text-sm text-[#6B6B6B] mb-4 leading-relaxed">Curated for you based on your profile</p>

            {matches.length === 0 ? (
              <EmptyState message="Your matches are being prepared. We will notify you when they are ready, in sha Allah." />
            ) : (
              <div className="space-y-3">
                {matches.map(match => {
                  const b = match.brother
                  const brotherFirstName = b?.full_name?.split(' ')[0] ?? 'Brother'
                  const incomingFromThis = incomingInterests.find(i => i.brother_id === match.brother_id && !localDeclinedIds.has(i.id))
                  const hasSent = match.interest?.status === 'pending' || localSentIds.includes(match.brother_id)
                  const isAccepted = match.interest?.status === 'accepted'
                  const hasConnection = connections.some(c => c.brother_id === match.brother_id)
                  const hasAnyInterest = match.interest !== null || localSentIds.includes(match.brother_id)

                  return (
                    <div key={match.id} className="bg-white rounded-2xl border border-[#EBEBEB] shadow-[0_1px_2px_rgba(0,0,0,0.08),0_4px_12px_rgba(0,0,0,0.05)] hover:-translate-y-0.5 hover:shadow-[0_2px_4px_rgba(0,0,0,0.08),0_8px_24px_rgba(0,0,0,0.08)] transition-all duration-200 overflow-hidden">
                      <div className="p-5">
                        <div className="flex items-start gap-3 mb-3">
                          {b?.photo_url ? (
                            <img src={b.photo_url} alt={brotherFirstName} className="w-14 h-14 rounded-2xl object-cover flex-shrink-0" />
                          ) : (
                            <div className="w-14 h-14 rounded-2xl bg-[#F4E4BA] flex items-center justify-center text-[#AF4D98] text-xl font-semibold flex-shrink-0">
                              {brotherFirstName[0]?.toUpperCase()}
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-semibold text-[#1A1A1A]">{brotherFirstName}</span>
                              {b?.verification_badge && <VerifiedBadge />}
                            </div>
                            <p className="text-sm text-[#6B6B6B] mt-0.5 leading-relaxed">
                              {[b?.age ? `${b.age} yrs` : null, b?.location].filter(Boolean).join(' · ')}
                            </p>
                          </div>
                        </div>

                        {match.compatibility_note && (
                          <p className="text-sm text-[#AF4D98] bg-[#F5E6F2] rounded-xl px-3 py-2 mb-3 italic border-l-2 border-[#AF4D98]">
                            {match.compatibility_note}
                          </p>
                        )}

                        <div className="pt-3 border-t border-[#EBEBEB]">
                          {incomingFromThis ? (
                            <div>
                              <p className="text-xs text-[#AF4D98] font-medium mb-2">{brotherFirstName} has expressed interest</p>
                              {incomingFromThis.intro_message && (
                                <div className="bg-[#FDFAF7] rounded-xl px-3 py-2.5 mb-3 border border-[#EBEBEB]">
                                  <p className="text-xs text-[#9B9B9B] font-medium mb-1">Their message</p>
                                  <p className="text-sm text-[#1A1A1A] italic">&ldquo;{incomingFromThis.intro_message}&rdquo;</p>
                                </div>
                              )}
                              <div className="grid grid-cols-2 gap-2">
                                <button
                                  onClick={() => handleDecline(incomingFromThis.id)}
                                  disabled={declining === incomingFromThis.id}
                                  className="text-sm font-medium text-[#C13515] border border-[#C13515]/30 py-2.5 rounded-full hover:bg-[#FDECEA] disabled:opacity-50 active:scale-95 transition-all duration-200"
                                >
                                  {declining === incomingFromThis.id ? '…' : 'Decline'}
                                </button>
                                <button
                                  onClick={() => {
                                    if (connectionsFull) setActionError('Close an active connection before accepting.')
                                    else { setActionError(null); setAcceptModalInterest(incomingFromThis) }
                                  }}
                                  className="text-sm font-medium bg-[#AF4D98] text-white py-2.5 rounded-full hover:bg-[#9B3D85] active:scale-95 transition-all duration-200 shadow-sm"
                                >
                                  Accept
                                </button>
                              </div>
                            </div>
                          ) : isAccepted || hasConnection ? (
                            <div className="flex items-center justify-center bg-[#E6F9F7] border border-[#00A699]/20 rounded-full px-3 py-2">
                              <span className="text-xs font-medium text-[#00A699]">Connected — open chat to continue</span>
                            </div>
                          ) : hasSent ? (
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-[#9B9B9B] italic">Awaiting response…</span>
                              <span className="text-xs font-medium text-[#AF4D98] bg-[#F5E6F2] px-3 py-1.5 rounded-full">
                                Interest Sent
                              </span>
                            </div>
                          ) : !hasAnyInterest && !hasConnection ? (
                            <div className="flex items-center justify-end">
                              <button
                                onClick={() => openInterestModal(match.brother_id, match.sister_id, brotherFirstName)}
                                disabled={connectionsFull}
                                title={connectionsFull ? 'Close an active connection before expressing new interest' : undefined}
                                className="text-sm font-medium bg-[#AF4D98] text-white px-5 py-2.5 rounded-full hover:bg-[#9B3D85] disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 transition-all duration-200 shadow-sm"
                              >
                                Express Interest
                              </button>
                            </div>
                          ) : null}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}

            {interestError && (
              <div className="mt-3 bg-[#FDECEA] border border-[#C13515]/20 rounded-xl p-3 text-sm text-[#C13515]">
                {interestError}
              </div>
            )}
          </section>

          {/* ── Active Connections ───────────────────────────────── */}
          <section id="connections">
            <h2 className="text-lg font-semibold text-[#1A1A1A] tracking-tight mb-4">Active Connections</h2>

            {connections.length === 0 ? (
              <EmptyState message="No active connections yet. When a match interest is accepted, a connection will appear here." />
            ) : (
              <div className="space-y-3">
                {connections.map(conn => (
                  <div key={conn.id} className="bg-white rounded-2xl p-5 border border-[#EBEBEB] shadow-[0_1px_2px_rgba(0,0,0,0.08),0_4px_12px_rgba(0,0,0,0.05)]">
                    <div className="flex items-center gap-2 mb-4">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#9DF7E5] border-2 border-[#5ECFBA] flex-shrink-0" />
                      <span className="font-semibold text-[#1A1A1A]">{conn.other_name}</span>
                      <span className="text-xs text-[#00A699] bg-[#E6F9F7] px-2 py-0.5 rounded-full ml-auto font-medium">Active</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <Link
                        href={`/dashboard/chat/${conn.id}`}
                        className="text-center text-sm font-medium text-[#AF4D98] border border-[#AF4D98] py-2.5 rounded-full hover:bg-[#F5E6F2] transition-colors"
                      >
                        Open Chat
                      </Link>
                      <Link
                        href={`/dashboard/meetings/${conn.id}`}
                        className="text-center text-sm font-medium bg-[#AF4D98] text-white py-2.5 rounded-full hover:bg-[#9B3D85] transition-colors shadow-sm"
                      >
                        Meeting
                      </Link>
                      <button
                        onClick={() => { setActionError(null); setCloseModalConnection(conn) }}
                        className="text-sm font-medium text-[#C13515] border border-[#C13515]/30 py-2.5 rounded-full hover:bg-[#FDECEA] transition-colors"
                      >
                        Close
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* ── Notifications ────────────────────────────────────── */}
          <section id="notifications">
            <h2 className="text-lg font-semibold text-[#1A1A1A] tracking-tight mb-4">Notifications</h2>

            {visibleNotifications.length === 0 ? (
              <EmptyState message="You're all caught up. May Allah bless your journey." />
            ) : (
              <div className="space-y-2">
                {visibleNotifications.map(notif => (
                  <button
                    key={notif.id}
                    onClick={() => handleMarkRead(notif.id)}
                    className="w-full text-left bg-white rounded-2xl p-4 border border-[#EBEBEB] shadow-[0_1px_2px_rgba(0,0,0,0.08),0_4px_12px_rgba(0,0,0,0.05)] hover:border-[#AF4D98]/30 transition-colors group"
                  >
                    <div className="flex items-start gap-3">
                      <span className="w-2 h-2 rounded-full bg-[#AF4D98] flex-shrink-0 mt-1.5" />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-[#1A1A1A] text-sm">{notif.title}</p>
                        <p className="text-[#6B6B6B] text-xs mt-0.5 line-clamp-2 leading-relaxed">{notif.body}</p>
                        <p className="text-[#9B9B9B] text-xs mt-1">{formatRelativeDate(notif.created_at)}</p>
                      </div>
                      <span className="text-[10px] text-[#9B9B9B] group-hover:text-[#AF4D98] flex-shrink-0 mt-1 transition-colors">
                        Mark read
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>

      {/* ── Express Interest Modal ───────────────────────────────── */}
      {interestModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-8 w-full max-w-sm shadow-[0_4px_8px_rgba(0,0,0,0.08),0_16px_40px_rgba(0,0,0,0.12)]">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-[#1A1A1A] tracking-tight">
                Express Interest in {interestModal.firstName}
              </h3>
              <button onClick={() => setInterestModal(null)} className="text-[#9B9B9B] hover:text-[#1A1A1A] transition-colors p-1" aria-label="Close">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                  <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
                </svg>
              </button>
            </div>
            <p className="text-sm text-[#6B6B6B] mb-4 leading-relaxed">
              Write a short message to introduce yourself. This is optional but encouraged.
            </p>
            <textarea
              value={introMessage}
              onChange={e => setIntroMessage(e.target.value)}
              placeholder="Assalamu Alaikum, I came across your profile and felt it aligned well with what I am looking for…"
              rows={4}
              maxLength={300}
              className="w-full border border-[#D4D4D4] rounded-xl px-4 py-3 text-sm text-[#1A1A1A] placeholder:text-[#9B9B9B] focus:outline-none focus:ring-2 focus:ring-[#AF4D98]/20 focus:border-[#AF4D98] resize-none transition-all duration-150"
            />
            <p className="text-xs text-[#9B9B9B] text-right mt-1 mb-5">{introMessage.length}/300</p>
            {interestError && (
              <div className="mb-4 bg-[#FDECEA] border border-[#C13515]/20 rounded-xl p-3 text-sm text-[#C13515]">{interestError}</div>
            )}
            <div className="space-y-2">
              <button
                onClick={handleSendInterest}
                disabled={interestLoading}
                className="w-full bg-[#AF4D98] text-white font-medium py-3 rounded-full hover:bg-[#9B3D85] disabled:opacity-50 active:scale-95 transition-all duration-200 text-sm shadow-sm"
              >
                {interestLoading ? 'Sending…' : 'Send Interest'}
              </button>
              <button onClick={() => setInterestModal(null)} className="w-full text-[#6B6B6B] text-sm py-2 hover:text-[#1A1A1A] transition-colors">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Accept Interest Modal ────────────────────────────────── */}
      {acceptModalInterest && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-8 w-full max-w-sm shadow-[0_4px_8px_rgba(0,0,0,0.08),0_16px_40px_rgba(0,0,0,0.12)]">
            <h3 className="text-xl font-semibold text-[#1A1A1A] tracking-tight mb-2">Accept Interest</h3>
            <p className="text-[#6B6B6B] text-sm leading-relaxed mb-6">
              Accepting will share your photos with{' '}
              <strong className="text-[#1A1A1A]">{acceptModalInterest.other_profile?.full_name ?? 'this person'}</strong>.
              Are you ready?
            </p>
            {actionError && (
              <div className="mb-4 bg-[#FDECEA] border border-[#C13515]/20 rounded-xl p-3 text-sm text-[#C13515]">{actionError}</div>
            )}
            <div className="space-y-3">
              <Link
                href="/dashboard/profile"
                className="block w-full text-center border border-[#AF4D98] text-[#AF4D98] font-medium py-3 rounded-full hover:bg-[#F5E6F2] transition-colors text-sm"
              >
                Review My Photos
              </Link>
              <button
                onClick={handleAccept}
                disabled={accepting}
                className="w-full bg-[#AF4D98] text-white font-medium py-3 rounded-full hover:bg-[#9B3D85] disabled:opacity-50 active:scale-95 transition-all duration-200 text-sm shadow-sm"
              >
                {accepting ? 'Accepting…' : 'Confirm & Accept'}
              </button>
              <button
                onClick={() => { setAcceptModalInterest(null); setActionError(null) }}
                className="w-full text-[#6B6B6B] text-sm py-2 hover:text-[#1A1A1A] transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Close Connection Modal ───────────────────────────────── */}
      {closeModalConnection && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-8 w-full max-w-sm shadow-[0_4px_8px_rgba(0,0,0,0.08),0_16px_40px_rgba(0,0,0,0.12)]">
            <h3 className="text-xl font-semibold text-[#1A1A1A] tracking-tight mb-2">Close Connection</h3>
            <p className="text-[#6B6B6B] text-sm leading-relaxed mb-3">
              Are you sure you want to close your connection with{' '}
              <strong className="text-[#1A1A1A]">{closeModalConnection.other_name}</strong>? This cannot be undone.
            </p>
            <div className="bg-[#FFF4CC] border border-[#FFB400]/20 rounded-xl px-4 py-3 mb-6">
              <p className="text-xs text-[#6B4F00] leading-relaxed">
                Your photos will be revoked and {closeModalConnection.other_name} will no longer have access to them.
              </p>
            </div>
            {actionError && (
              <div className="mb-4 bg-[#FDECEA] border border-[#C13515]/20 rounded-xl p-3 text-sm text-[#C13515]">{actionError}</div>
            )}
            <div className="space-y-3">
              <button
                onClick={handleCloseConnection}
                disabled={closing}
                className="w-full bg-[#C13515] text-white font-medium py-3 rounded-full hover:bg-[#a02d10] disabled:opacity-50 active:scale-95 transition-all duration-200 text-sm"
              >
                {closing ? 'Closing…' : 'Close Connection'}
              </button>
              <button
                onClick={() => { setCloseModalConnection(null); setActionError(null) }}
                className="w-full text-[#6B6B6B] text-sm py-2 hover:text-[#1A1A1A] transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Toasts ───────────────────────────────────────────────── */}
      {closedToast && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 bg-[#1A1A1A] text-white text-sm font-medium px-5 py-2.5 rounded-full shadow-lg whitespace-nowrap">
          Connection closed. Jazakallah khair.
        </div>
      )}
      {mutualToast && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 bg-[#AF4D98] text-white text-sm font-medium px-5 py-2.5 rounded-full shadow-lg whitespace-nowrap">
          It&apos;s a match! Chat is now open.
        </div>
      )}
    </>
  )
}
