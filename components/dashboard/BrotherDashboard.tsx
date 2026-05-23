'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import ProfileQuickView from '@/components/dashboard/ProfileQuickView'
import ProfileChecklist from '@/components/dashboard/ProfileChecklist'
import {
  expressInterest,
  acceptInterest,
  declineInterest,
  closeConnection,
  markNotificationRead,
} from '@/app/dashboard/actions'
import { getSisterPhotoUrls } from '@/app/actions/photos'
import type {
  Profile,
  BrotherProfile,
  BrotherMatch,
  ConnectionWithProfile,
  InterestWithProfile,
  Notification,
} from '@/lib/database'

type Props = {
  profile: Profile
  brotherProfile: BrotherProfile
  matches: BrotherMatch[]
  connections: ConnectionWithProfile[]
  sentInterestOtherIds: string[]
  incomingInterests: InterestWithProfile[]
  notifications: Notification[]
  profileComplete: boolean
  completionPercentage: number
  hasReference: boolean
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
    <div className="rounded-[16px] p-6 text-center border border-[#EDE8E3] bg-[#FAF4EE]">
      <p className="text-[#9B9B9B] text-sm leading-relaxed">{message}</p>
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

export default function BrotherDashboard({
  profile,
  brotherProfile,
  matches: initialMatches,
  connections: initialConnections,
  sentInterestOtherIds,
  incomingInterests,
  notifications,
  profileComplete,
  completionPercentage,
  hasReference,
}: Props) {
  const router = useRouter()
  const firstName = brotherProfile?.full_name?.split(' ')[0] ?? 'there'

  const [matches, setMatches] = useState<BrotherMatch[]>(initialMatches ?? [])
  const [connections, setConnections] = useState<ConnectionWithProfile[]>(initialConnections ?? [])
  const connectionsFull = connections.length >= 3
  const [connPhotoUrls, setConnPhotoUrls] = useState<Record<string, string>>({})

  useEffect(() => {
    function onMatchExpired(e: Event) {
      const expired = (e as CustomEvent).detail as { sister_id: string }
      setMatches(prev => prev.filter(m => m.sister_id !== expired.sister_id))
    }
    window.addEventListener('match-expired', onMatchExpired)
    return () => window.removeEventListener('match-expired', onMatchExpired)
  }, [])

  useEffect(() => {
    const connsWithPhotos = connections.filter(c => c.other_photo_urls?.length)
    if (!connsWithPhotos.length) return
    connsWithPhotos.forEach(async (conn) => {
      const paths = conn.other_photo_urls!
      const signed = await getSisterPhotoUrls(paths)
      if (signed[0]) {
        setConnPhotoUrls(prev => ({ ...prev, [conn.id]: signed[0] }))
      }
    })
  }, [connections])

  const [interestModal, setInterestModal] = useState<{ brotherId: string; sisterId: string; firstName: string } | null>(null)
  const [introMessage, setIntroMessage] = useState('')
  const [interestLoading, setInterestLoading] = useState(false)
  const [interestError, setInterestError] = useState<string | null>(null)
  const [localSentIds, setLocalSentIds] = useState<string[]>(sentInterestOtherIds)
  const [localDeclinedIds, setLocalDeclinedIds] = useState<Set<string>>(new Set())
  const [accepting, setAccepting] = useState<string | null>(null)
  const [declining, setDeclining] = useState<string | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)
  const [closeModalConnection, setCloseModalConnection] = useState<ConnectionWithProfile | null>(null)
  const [closing, setClosing] = useState(false)
  const [closeError, setCloseError] = useState<string | null>(null)
  const [nikahCloseModal, setNikahCloseModal] = useState<ConnectionWithProfile | null>(null)
  const [nikahCloseReason, setNikahCloseReason] = useState<string>('')
  const [nikahClosing, setNikahClosing] = useState(false)
  const [closedToast, setClosedToast] = useState(false)
  const [mutualToast, setMutualToast] = useState(false)
  const [readNotifIds, setReadNotifIds] = useState<Set<string>>(new Set())
  const [quickView, setQuickView] = useState<{
    profileId: string
    showActions: boolean
    introMessage?: string | null
    compatibilityNote?: string | null
    interestId?: string
    pendingInterest?: InterestWithProfile
  } | null>(null)

  function openInterestQuickView(interest: InterestWithProfile) {
    setQuickView({
      profileId: interest.other_profile?.id ?? interest.sister_id,
      showActions: true,
      introMessage: interest.intro_message,
      compatibilityNote: interest.other_profile?.compatibility_note ?? null,
      interestId: interest.id,
      pendingInterest: interest,
    })
  }

  function openMatchQuickView(match: BrotherMatch) {
    setQuickView({
      profileId: match.sister_id,
      showActions: false,
      compatibilityNote: match.compatibility_note,
    })
  }

  const openInterestModal = (brotherId: string, sisterId: string, sisterFirstName: string) => {
    setIntroMessage('')
    setInterestError(null)
    setInterestModal({ brotherId, sisterId, firstName: sisterFirstName })
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
      setLocalSentIds(prev => [...prev, interestModal.sisterId])
      setInterestModal(null)
      router.refresh()
    }
  }

  const handleAccept = async (interestId: string) => {
    setAccepting(interestId)
    setActionError(null)
    const result = await acceptInterest(interestId)
    setAccepting(null)
    if (result?.error) {
      setActionError(result.error)
    } else if (result.connectionId) {
      router.push(`/dashboard/chat/${result.connectionId}`)
    } else {
      router.refresh()
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

  const handleCloseConnection = async (connectionId: string, reason?: string) => {
    const conn = connections.find(c => c.id === connectionId)
    if (!conn) return
    const result = await closeConnection(connectionId, reason)
    if (result?.error) {
      setCloseError(result.error)
      return
    }
    setConnections(prev => prev.filter(c => c.id !== connectionId))
    setMatches(prev => prev.filter(m => m.sister_id !== conn.sister_id))
    if (closeModalConnection?.id === connectionId) setCloseModalConnection(null)
    setClosedToast(true)
    setTimeout(() => setClosedToast(false), 3000)
  }

  const handleMarkRead = async (notifId: string) => {
    setReadNotifIds(prev => new Set(prev).add(notifId))
    await markNotificationRead(notifId)
    router.refresh()
  }

  const visibleNotifications = notifications.filter(n => !readNotifIds.has(n.id))
  const visibleIncoming = incomingInterests.filter(i => !localDeclinedIds.has(i.id))
  const activeConns = connections.filter(c => c.status === 'active')
  const nikahConns = connections.filter(c => c.status === 'nikah_planning')
  const isInNikahPlanning = nikahConns.length > 0
  const visibleMatches = matches.filter(match => {
    const matchConn = connections.find(c => c.sister_id === match.sister_id && c.status === 'nikah_planning')
    return !matchConn
  })

  return (
    <div className="bg-[#FDF8F3] min-h-screen">
      <div className="lg:max-w-6xl lg:mx-auto">
      {/* ── Header ──────────────────────────────────────────── */}
      <div className="px-6 pt-10 pb-4 lg:px-8">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <p className="text-sm text-[#9B9B9B]">Assalamu Alaikum,</p>
            <h1 className="text-[26px] lg:text-[32px] font-medium text-[#1A1A1A] tracking-[-0.02em] leading-snug mb-1">{firstName}</h1>
            <div className="mt-2">
              {profile?.verification_badge ? <VerifiedBadge /> : <PendingBadge />}
            </div>
          </div>
        </div>
      </div>
      <div className="px-6 pt-4 pb-4 lg:px-8">
        {!isInNikahPlanning && (
          <ProfileChecklist
            gender="brother"
            profile={brotherProfile as unknown as Record<string, unknown>}
            completionPercentage={completionPercentage}
            referenceComplete={hasReference}
          />
        )}

        {profile.verification_status !== 'verified' && completionPercentage >= 80 && (
          <div style={{
            background: 'white', border: '1px solid #EDE8E3', borderRadius: '16px',
            padding: '20px', marginTop: '16px', display: 'flex', alignItems: 'center',
            justifyContent: 'space-between', gap: '16px',
          }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ marginBottom: '4px' }}>
                {profile.verification_status === 'pending' ? (
                  <span style={{ background: '#FFF7E6', color: '#B45309', fontSize: '11px', fontWeight: 500, padding: '2px 8px', borderRadius: '999px' }}>
                    Under review
                  </span>
                ) : (
                  <span style={{ background: '#FDECEA', color: '#C13515', fontSize: '11px', fontWeight: 500, padding: '2px 8px', borderRadius: '999px' }}>
                    Not verified
                  </span>
                )}
              </div>
              <p style={{ fontSize: '14px', fontWeight: 500, color: '#1A1A1A', marginBottom: '2px' }}>
                {profile.verification_status === 'pending'
                  ? 'Verification under review'
                  : profile.verification_status === 'rejected'
                  ? 'Verification needs attention'
                  : 'Verify your identity'}
              </p>
              <p style={{ fontSize: '13px', color: '#9B9B9B', lineHeight: 1.5 }}>
                {profile.verification_status === 'pending'
                  ? 'We will notify you within 24 hours, in sha Allah.'
                  : profile.verification_status === 'rejected'
                  ? `Rejected: ${profile.verification_rejection_reason}`
                  : 'A quick selfie to confirm your identity.'}
              </p>
            </div>
            {profile.verification_status !== 'pending' && (
              <button
                onClick={() => router.push('/dashboard/verify')}
                style={{
                  background: '#AF4D98', color: 'white', border: 'none', borderRadius: '999px',
                  padding: '10px 18px', fontSize: '13px', fontWeight: 500, cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0,
                }}
              >
                {profile.verification_status === 'rejected' ? 'Resubmit →' : 'Verify now →'}
              </button>
            )}
          </div>
        )}
      </div>

      <div className="px-6 pb-6 lg:px-8 lg:pb-10 lg:grid lg:grid-cols-3 lg:gap-8 lg:items-start">
        <div className="space-y-8 lg:col-span-2">

        {/* ── Nikah Planning Connections ───────────────────────── */}
        {nikahConns.length > 0 && (
          <section id="nikah" data-testid="nikah-connections-section">
            <p className="text-[11px] font-medium uppercase tracking-[0.06em] text-[#9B9B9B] mb-4">Nikah Planning</p>
            <div className="space-y-3">
              {nikahConns.map(conn => (
                <div data-testid="nikah-connection-card" key={conn.id} className="bg-white rounded-[16px] p-5 border border-[#AF4D98]/30 shadow-[0_1px_3px_rgba(175,77,152,0.12)]">
                  <div className="flex items-center gap-2 mb-4">
                    {connPhotoUrls[conn.id] ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={connPhotoUrls[conn.id]} alt="" className="w-8 h-8 rounded-full object-cover flex-shrink-0" />
                    ) : (
                      <span className="text-base mr-1">🤍</span>
                    )}
                    <span className="text-base font-medium text-[#1A1A1A] tracking-[-0.02em]">{conn.other_name}</span>
                    <span className="ml-auto text-xs font-medium text-[#AF4D98] bg-[#F5E6F2] px-2.5 py-1 rounded-full">Nikah Planning</span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <div className="grid grid-cols-3 gap-2">
                      <Link href={`/dashboard/chat/${conn.id}`} className="text-center text-sm font-medium text-[#AF4D98] py-2">Chat</Link>
                      <Link href={`/dashboard/profile/${conn.sister_id}?context=connection&connectionId=${conn.id}`} className="text-center text-sm font-medium text-[#5C5C5C] py-2">Profile</Link>
                      <Link data-testid="view-nikah-plan-btn" href={`/dashboard/nikah/${conn.id}`} className="text-center text-sm font-medium rounded-full bg-[#AF4D98] text-white px-4 py-2 hover:bg-[#9B3D85] transition-colors">View Plan</Link>
                    </div>
                    <div style={{ textAlign: 'center', paddingTop: '8px', borderTop: '1px solid #EDE8E3' }}>
                      <button
                        onClick={() => { setNikahCloseReason(''); setNikahCloseModal(conn) }}
                        style={{ background: 'transparent', border: 'none', fontSize: '12px', color: '#C0B8B0', cursor: 'pointer', textDecoration: 'underline', textUnderlineOffset: '3px', padding: '4px 8px' }}
                      >
                        Close this connection
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {isInNikahPlanning && (
          <div style={{ textAlign: 'center', padding: '32px 20px', background: 'white', border: '1px solid #EDE8E3', borderRadius: '16px' }}>
            <p style={{ fontFamily: 'Noto Naskh Arabic, serif', fontSize: '20px', color: '#AF4D98', marginBottom: '8px' }}>
              بَارَكَ اللَّهُ لَكُمَا
            </p>
            <p style={{ fontSize: '14px', color: '#9B9B9B', lineHeight: 1.6, maxWidth: '280px', margin: '0 auto' }}>
              May Allah bless your union and make it a source of peace and taqwa.
            </p>
          </div>
        )}

        {!isInNikahPlanning && (<>

        {/* ── Matches ─────────────────────────────────────────── */}
        <section id="matches" data-testid="matches-section">
          <p className="text-[11px] font-medium uppercase tracking-[0.06em] text-[#9B9B9B] mb-4">Your Matches</p>

          {!profileComplete ? null : visibleMatches.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '48px 20px' }}>
              <p style={{ fontFamily: 'Noto Naskh Arabic, serif', fontSize: '32px', color: '#AF4D98', marginBottom: '12px', opacity: 0.4 }}>نصيب</p>
              <p style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '20px', fontWeight: 400, color: '#AF4D98', marginBottom: '8px' }}>
                Your matches are being prepared
              </p>
              <p style={{ fontSize: '14px', color: '#9B9B9B', lineHeight: 1.6, maxWidth: '260px', margin: '0 auto' }}>
                We will notify you when they are ready, in sha Allah.
              </p>
            </div>
          ) : (
            <div className="space-y-3 lg:space-y-0 lg:grid lg:grid-cols-2 lg:gap-4">
              {visibleMatches.map(match => {
                const sisterFirstName = match.sister?.full_name?.split(' ')[0] ?? 'Sister'
                const hasSent = localSentIds.includes(match.sister_id)
                const matchConnection = connections.find(c => c.sister_id === match.sister_id)
                const incomingFromThis = matchConnection ? null : incomingInterests.find(i => i.sister_id === match.sister_id && !localDeclinedIds.has(i.id))

                return (
                  <div data-testid="match-card" key={match.id} onClick={() => openMatchQuickView(match)} className="bg-white rounded-[16px] border border-[#EDE8E3] shadow-[0_1px_3px_rgba(0,0,0,0.06)] hover:border-[#D4CBC4] hover:-translate-y-px transition-all duration-150 overflow-hidden cursor-pointer">
                    <div className="p-5">
                      <div className="flex items-start gap-3 mb-3">
                        <div className="w-14 h-14 rounded-[12px] bg-[#F4E4BA] flex items-center justify-center text-[#AF4D98] text-xl font-medium flex-shrink-0">
                          {sisterFirstName[0]?.toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-base font-medium text-[#1A1A1A] tracking-[-0.02em]">{sisterFirstName}</span>
                            {match.sister?.verification_badge && <VerifiedBadge />}
                          </div>
                          <p className="text-sm text-[#9B9B9B] mt-0.5">
                            {[match.sister?.age ? `${match.sister.age} yrs` : null, match.sister?.location].filter(Boolean).join(' · ')}
                          </p>
                        </div>
                      </div>

                      {match.compatibility_note && (
                        <p className="border-l-2 border-[#E5A9A9] pl-3 text-sm italic text-[#5C5C5C] mb-3">
                          {match.compatibility_note}
                        </p>
                      )}

                      <div className="pt-3 border-t border-[#EDE8E3]">
                        {matchConnection ? (
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-xs font-medium text-[#00A699] bg-[#E6F9F7] px-2.5 py-1 rounded-full">Active Connection</span>
                            <div className="flex gap-2">
                              <Link
                                href={`/dashboard/profile/${match.sister_id}?context=connection&connectionId=${matchConnection.id}`}
                                onClick={e => e.stopPropagation()}
                                className="text-sm font-medium text-[#5C5C5C] py-1 px-2"
                              >
                                Profile
                              </Link>
                              <Link
                                href={`/dashboard/chat/${matchConnection.id}`}
                                onClick={e => e.stopPropagation()}
                                className="text-sm font-medium rounded-full bg-[#AF4D98] text-white px-4 py-2 hover:bg-[#9B3D85] transition-colors"
                              >
                                Open Chat
                              </Link>
                            </div>
                          </div>
                        ) : incomingFromThis ? (
                          <div>
                            <p className="text-[11px] font-medium uppercase tracking-[0.06em] text-[#AF4D98] mb-2">{sisterFirstName} has expressed interest</p>
                            {incomingFromThis.intro_message && (
                              <div className="bg-[#FAF4EE] rounded-[12px] px-3 py-2.5 mb-3 border border-[#EDE8E3]">
                                <p className="text-[11px] font-medium uppercase tracking-[0.06em] text-[#9B9B9B] mb-1">Their message</p>
                                <p className="text-sm text-[#1A1A1A] italic">&ldquo;{incomingFromThis.intro_message}&rdquo;</p>
                              </div>
                            )}
                            <div className="grid grid-cols-2 gap-2">
                              <button
                                onClick={e => { e.stopPropagation(); handleDecline(incomingFromThis.id) }}
                                disabled={declining === incomingFromThis.id}
                                className="text-sm font-medium text-[#9B9B9B] py-2 disabled:opacity-50 transition-colors"
                              >
                                {declining === incomingFromThis.id ? '…' : 'Decline'}
                              </button>
                              <button
                                onClick={e => {
                                  e.stopPropagation()
                                  if (connectionsFull) setInterestError('Close an active connection before accepting.')
                                  else { setInterestError(null); handleAccept(incomingFromThis.id) }
                                }}
                                disabled={accepting === incomingFromThis.id}
                                className="text-sm font-medium rounded-full bg-[#AF4D98] text-white px-4 py-2 hover:bg-[#9B3D85] disabled:opacity-50 transition-colors"
                              >
                                {accepting === incomingFromThis.id ? '…' : 'Accept'}
                              </button>
                            </div>
                          </div>
                        ) : hasSent ? (
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-[#9B9B9B] italic">Awaiting response…</span>
                            <span className="text-sm font-medium text-[#AF4D98]">Interest Sent</span>
                          </div>
                        ) : (
                          <div className="flex items-center justify-end">
                            <button
                              data-testid="express-interest-btn"
                              onClick={e => { e.stopPropagation(); openInterestModal(profile.id, match.sister_id, sisterFirstName) }}
                              disabled={connectionsFull}
                              title={connectionsFull ? 'Close an active connection before expressing new interest' : undefined}
                              className="text-sm font-medium rounded-full bg-[#AF4D98] text-white px-4 py-2 hover:bg-[#9B3D85] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                              Express Interest
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {interestError && (
            <div className="mt-3 bg-[#FDECEA] border border-[#C13515]/20 rounded-[12px] p-3 text-sm text-[#C13515]">
              {interestError}
            </div>
          )}

          {connectionsFull && (
            <p className="mt-3 text-xs text-[#5C5C5C] bg-[#F4E4BA]/40 border border-[#EDE8E3] rounded-[12px] px-3 py-2">
              You have 3 active connections. Close one before expressing new interest.
            </p>
          )}
        </section>

        {/* ── Active Connections ───────────────────────────────── */}
        <section id="connections" data-testid="connections-section">
          <p className="text-[11px] font-medium uppercase tracking-[0.06em] text-[#9B9B9B] mb-4">Active Connections</p>

          {activeConns.length === 0 ? (
            <EmptyState message="No active connections yet. Express interest in a match to begin." />
          ) : (
            <div className="space-y-3">
              {activeConns.map(conn => (
                <div data-testid="connection-card" key={conn.id} className="bg-white rounded-[16px] p-5 border border-[#EDE8E3] shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
                  <div className="flex items-center gap-2 mb-4">
                    {connPhotoUrls[conn.id] ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={connPhotoUrls[conn.id]} alt="" className="w-8 h-8 rounded-full object-cover flex-shrink-0" />
                    ) : (
                      <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#9DF7E5] mr-1.5 flex-shrink-0" />
                    )}
                    <span className="text-base font-medium text-[#1A1A1A] tracking-[-0.02em]">{conn.other_name}</span>
                  </div>
                  <div className="grid grid-cols-4 gap-2">
                    <Link
                      data-testid="open-chat-btn"
                      href={`/dashboard/chat/${conn.id}`}
                      className="text-center text-sm font-medium text-[#AF4D98] py-2"
                    >
                      Chat
                    </Link>
                    <Link
                      href={`/dashboard/profile/${conn.sister_id}?context=connection&connectionId=${conn.id}`}
                      className="text-center text-sm font-medium text-[#5C5C5C] py-2"
                    >
                      Profile
                    </Link>
                    <Link
                      href={`/dashboard/meetings/${conn.id}`}
                      className="text-center text-sm font-medium rounded-full bg-[#AF4D98] text-white px-2 py-2 hover:bg-[#9B3D85] transition-colors"
                    >
                      Meeting
                    </Link>
                    <button
                      onClick={() => { setCloseError(null); setCloseModalConnection(conn) }}
                      className="text-sm font-medium text-[#9B9B9B]"
                    >
                      Close
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* ── Pending Interests (sister expressed interest in brother) ─── */}
        {visibleIncoming.length > 0 && (
          <section id="interests" data-testid="pending-interests-section">
            <p className="text-[11px] font-medium uppercase tracking-[0.06em] text-[#9B9B9B] mb-4">Pending Interests</p>
            <div className="space-y-3">
              {visibleIncoming.map(interest => {
                const op = interest.other_profile
                const sisterFirstName = op?.full_name?.split(' ')[0] ?? 'Sister'
                return (
                  <div data-testid="pending-interest-card" key={interest.id} onClick={() => openInterestQuickView(interest)} className="bg-white rounded-[16px] border border-[#EDE8E3] shadow-[0_1px_3px_rgba(0,0,0,0.06)] hover:border-[#D4CBC4] hover:-translate-y-px transition-all duration-150 cursor-pointer">
                    <div className="p-5">
                      <div className="flex items-start gap-3 mb-3">
                        <div className="w-14 h-14 rounded-[12px] bg-[#F4E4BA] flex items-center justify-center text-[#AF4D98] text-xl font-medium flex-shrink-0">
                          {sisterFirstName[0]?.toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-base font-medium text-[#1A1A1A] tracking-[-0.02em]">{sisterFirstName}</span>
                            {op?.verification_badge && <VerifiedBadge />}
                          </div>
                          <p className="text-sm text-[#9B9B9B] mt-0.5">
                            {[op?.age ? `${op.age} yrs` : null, op?.location].filter(Boolean).join(' · ')}
                          </p>
                        </div>
                      </div>

                      {op?.compatibility_note && (
                        <p className="border-l-2 border-[#E5A9A9] pl-3 text-sm italic text-[#5C5C5C] mb-3">
                          {op.compatibility_note}
                        </p>
                      )}

                      {interest.intro_message && (
                        <div className="bg-[#FAF4EE] rounded-[12px] px-3 py-2.5 mb-3 border border-[#EDE8E3]">
                          <p className="text-[11px] font-medium uppercase tracking-[0.06em] text-[#9B9B9B] mb-1">Her message</p>
                          <p className="text-sm text-[#1A1A1A] italic">&ldquo;{interest.intro_message}&rdquo;</p>
                        </div>
                      )}

                      {actionError && (
                        <div className="mb-3 bg-[#FDECEA] border border-[#C13515]/20 rounded-[12px] p-3 text-sm text-[#C13515]">{actionError}</div>
                      )}

                      <div className="grid grid-cols-2 gap-2 pt-3 border-t border-[#EDE8E3]">
                        <button
                          data-testid="decline-btn"
                          onClick={e => { e.stopPropagation(); handleDecline(interest.id) }}
                          disabled={declining === interest.id}
                          className="text-sm font-medium text-[#9B9B9B] py-2 disabled:opacity-50 transition-colors"
                        >
                          {declining === interest.id ? '…' : 'Decline'}
                        </button>
                        <button
                          data-testid="accept-btn"
                          onClick={e => {
                            e.stopPropagation()
                            if (connectionsFull) {
                              setActionError('Close an active connection before accepting a new one.')
                            } else {
                              setActionError(null)
                              handleAccept(interest.id)
                            }
                          }}
                          disabled={accepting === interest.id}
                          className="text-sm font-medium rounded-full bg-[#AF4D98] text-white px-4 py-2 hover:bg-[#9B3D85] disabled:opacity-50 transition-colors"
                        >
                          {accepting === interest.id ? '…' : 'Accept'}
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </section>
        )}

        </>)}

        </div>{/* end left column */}
        <div className="space-y-6 lg:col-span-1 mt-8 lg:mt-0">

        {/* ── Notifications ────────────────────────────────────── */}
        <section id="notifications" data-testid="notifications-section">
          <p className="text-[11px] font-medium uppercase tracking-[0.06em] text-[#9B9B9B] mb-4">Notifications</p>

          {visibleNotifications.length === 0 ? (
            <EmptyState message="You're all caught up. May Allah bless your journey." />
          ) : (
            <div className="space-y-2">
              {visibleNotifications.map(notif => (
                <button
                  key={notif.id}
                  onClick={() => handleMarkRead(notif.id)}
                  className="w-full text-left bg-[#F9F0F6] rounded-[16px] p-4 border border-[#EDE8E3] hover:border-[#D4CBC4] transition-colors group"
                >
                  <div className="flex items-start gap-3">
                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#AF4D98] flex-shrink-0 mt-1.5" />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-[#1A1A1A] text-sm">{notif.title}</p>
                      <p className="text-[#9B9B9B] text-xs mt-0.5 line-clamp-2 leading-relaxed">{notif.body}</p>
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
        </div>{/* end right column */}
      </div>{/* end grid */}
      </div>{/* end max-width */}

      {/* ── Quick View Modal ─────────────────────────────────────── */}
      <ProfileQuickView
        profileId={quickView?.profileId ?? null}
        gender="sister"
        isOpen={!!quickView}
        onClose={() => setQuickView(null)}
        onAccept={quickView?.showActions && quickView.pendingInterest ? () => {
          const pi = quickView.pendingInterest!
          setQuickView(null)
          if (connectionsFull) setActionError('Close an active connection before accepting.')
          else handleAccept(pi.id)
        } : undefined}
        onDecline={quickView?.showActions && quickView.pendingInterest ? () => {
          const pi = quickView.pendingInterest!
          setQuickView(null)
          handleDecline(pi.id)
        } : undefined}
        showActions={quickView?.showActions ?? false}
        introMessage={quickView?.introMessage}
        compatibilityNote={quickView?.compatibilityNote}
        interestId={quickView?.interestId}
      />

      {/* ── Close Connection Modal ───────────────────────────────── */}
      {closeModalConnection && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-4">
          <div className="bg-white rounded-[24px] p-8 w-full max-w-sm shadow-[0_4px_8px_rgba(0,0,0,0.08),0_16px_40px_rgba(0,0,0,0.12)]">
            <h3 className="text-xl font-medium text-[#1A1A1A] tracking-[-0.02em] mb-2">Close Connection</h3>
            <p className="text-[#5C5C5C] text-sm leading-relaxed mb-3">
              Are you sure you want to close your connection with{' '}
              <strong className="text-[#1A1A1A] font-medium">{closeModalConnection.other_name}</strong>? This cannot be undone.
            </p>
            <div className="bg-[#F4E4BA]/40 border border-[#EDE8E3] rounded-[12px] px-4 py-3 mb-6">
              <p className="text-xs text-[#5C5C5C] leading-relaxed">
                Access to {closeModalConnection.other_name}&apos;s photos will be revoked immediately.
              </p>
            </div>

            {closeError && (
              <div className="mb-4 bg-[#FDECEA] border border-[#C13515]/20 rounded-[12px] p-3 text-sm text-[#C13515]">
                {closeError}
              </div>
            )}

            <div className="space-y-3">
              <button
                onClick={async () => {
                  if (!closeModalConnection) return
                  setClosing(true)
                  setCloseError(null)
                  await handleCloseConnection(closeModalConnection.id)
                  setClosing(false)
                }}
                disabled={closing}
                className="w-full bg-[#C13515] text-white font-medium py-3 rounded-full hover:bg-[#a02d10] disabled:opacity-50 transition-colors text-sm"
              >
                {closing ? 'Closing…' : 'Close Connection'}
              </button>
              <button
                onClick={() => { setCloseModalConnection(null); setCloseError(null) }}
                className="w-full text-[#9B9B9B] text-sm py-2 hover:text-[#1A1A1A] transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Nikah Planning Close Modal ───────────────────────────── */}
      {nikahCloseModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ background: 'white', borderRadius: '20px', padding: '28px 24px', width: '100%', maxWidth: '400px' }}>
            <p style={{ fontFamily: 'Noto Naskh Arabic, serif', fontSize: '20px', color: '#AF4D98', textAlign: 'center', marginBottom: '16px' }}>
              إِنَّا لِلَّهِ وَإِنَّا إِلَيْهِ رَاجِعُونَ
            </p>
            <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '22px', fontWeight: 400, color: '#1A1A1A', textAlign: 'center', marginBottom: '8px' }}>
              Close nikah planning?
            </h2>
            <p style={{ fontSize: '14px', color: '#5C5C5C', textAlign: 'center', lineHeight: 1.6, marginBottom: '20px' }}>
              We understand that not every journey reaches its destination. May Allah ease your path and guide you to what is best, in sha Allah.
            </p>
            <div style={{ background: '#FDFAF7', border: '1px solid #EDE8E3', borderRadius: '12px', padding: '14px 16px', marginBottom: '20px' }}>
              <p style={{ fontSize: '12px', fontWeight: 500, color: '#9B9B9B', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px' }}>
                What happens when you close:
              </p>
              {[
                'The connection is permanently closed',
                'Both parties are notified respectfully',
                'Chat history is no longer accessible',
                'Your profile returns to active status',
                'You may receive new matches in time',
              ].map((item, i) => (
                <p key={i} style={{ fontSize: '13px', color: '#5C5C5C', margin: '0 0 4px', display: 'flex', alignItems: 'flex-start', gap: '6px', lineHeight: 1.5 }}>
                  <span style={{ color: '#9B9B9B' }}>·</span>{item}
                </p>
              ))}
            </div>
            <p style={{ fontSize: '13px', fontWeight: 500, color: '#1A1A1A', marginBottom: '10px' }}>Please select a reason:</p>
            {[
              'We are not compatible',
              'Family concerns',
              'Personal circumstances have changed',
              'We have mutually agreed to part ways',
              'I prefer not to say',
            ].map(reason => (
              <div
                key={reason}
                onClick={() => setNikahCloseReason(reason)}
                style={{
                  padding: '11px 14px', borderRadius: '10px',
                  border: `1px solid ${nikahCloseReason === reason ? '#AF4D98' : '#EDE8E3'}`,
                  background: nikahCloseReason === reason ? '#F5E6F2' : 'white',
                  cursor: 'pointer', marginBottom: '6px', fontSize: '13px',
                  color: nikahCloseReason === reason ? '#AF4D98' : '#5C5C5C',
                  transition: 'all 0.15s ease',
                }}
              >
                {reason}
              </div>
            ))}
            <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
              <button
                onClick={() => { setNikahCloseModal(null); setNikahCloseReason('') }}
                style={{ flex: 1, background: 'white', border: '1px solid #EDE8E3', borderRadius: '999px', padding: '12px', fontSize: '14px', color: '#5C5C5C', cursor: 'pointer' }}
              >
                Keep going
              </button>
              <button
                onClick={async () => {
                  if (!nikahCloseReason || !nikahCloseModal) return
                  setNikahClosing(true)
                  await handleCloseConnection(nikahCloseModal.id, nikahCloseReason)
                  setNikahCloseModal(null)
                  setNikahCloseReason('')
                  setNikahClosing(false)
                }}
                disabled={!nikahCloseReason || nikahClosing}
                style={{
                  flex: 1, background: nikahCloseReason ? '#C13515' : '#EDE8E3',
                  color: nikahCloseReason ? 'white' : '#9B9B9B', border: 'none', borderRadius: '999px',
                  padding: '12px', fontSize: '14px', fontWeight: 500,
                  cursor: nikahCloseReason && !nikahClosing ? 'pointer' : 'not-allowed',
                  opacity: nikahClosing ? 0.7 : 1,
                }}
              >
                {nikahClosing ? 'Closing...' : 'Close connection'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Express Interest Modal ───────────────────────────────── */}
      {interestModal && (
        <div data-testid="interest-modal" className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-4">
          <div className="bg-white rounded-[24px] p-8 w-full max-w-sm shadow-[0_4px_8px_rgba(0,0,0,0.08),0_16px_40px_rgba(0,0,0,0.12)]">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-medium text-[#1A1A1A] tracking-[-0.02em]">
                Express Interest in {interestModal.firstName}
              </h3>
              <button
                onClick={() => setInterestModal(null)}
                className="text-[#9B9B9B] hover:text-[#1A1A1A] transition-colors p-1"
                aria-label="Close"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                  <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
                </svg>
              </button>
            </div>

            <p className="text-sm text-[#5C5C5C] mb-4 leading-relaxed">
              Write a short message to introduce yourself. This is optional but encouraged.
            </p>

            <textarea
              data-testid="intro-message-input"
              value={introMessage}
              onChange={e => setIntroMessage(e.target.value)}
              placeholder="Assalamu Alaikum, I came across your profile and felt it aligned well with what I am looking for…"
              rows={4}
              maxLength={300}
              className="w-full border border-[#EDE8E3] rounded-[12px] px-4 py-3 text-sm text-[#1A1A1A] placeholder:text-[#9B9B9B] focus:outline-none focus:ring-2 focus:ring-[#AF4D98]/8 focus:border-[#AF4D98] resize-none transition-all duration-150"
            />
            <p className="text-xs text-[#9B9B9B] text-right mt-1 mb-5">{introMessage.length}/300</p>

            {interestError && (
              <div className="mb-4 bg-[#FDECEA] border border-[#C13515]/20 rounded-[12px] p-3 text-sm text-[#C13515]">
                {interestError}
              </div>
            )}

            <div className="space-y-2">
              <button
                data-testid="send-interest-btn"
                onClick={handleSendInterest}
                disabled={interestLoading}
                className="w-full rounded-full bg-[#AF4D98] text-white font-medium py-3 hover:bg-[#9B3D85] disabled:opacity-50 transition-colors text-sm"
              >
                {interestLoading ? 'Sending…' : 'Send Interest'}
              </button>
              <button
                onClick={() => setInterestModal(null)}
                className="w-full text-[#9B9B9B] text-sm py-2 hover:text-[#1A1A1A] transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Toasts ───────────────────────────────────────────────── */}
      {closedToast && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 bg-[#1A1A1A] text-white text-sm font-medium px-5 py-2.5 rounded-full shadow-[0_2px_8px_rgba(0,0,0,0.12)] whitespace-nowrap">
          Connection closed. Jazakallah khair.
        </div>
      )}
      {mutualToast && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 bg-[#AF4D98] text-white text-sm font-medium px-5 py-2.5 rounded-full shadow-[0_2px_8px_rgba(0,0,0,0.12)] whitespace-nowrap">
          It&apos;s a match! Chat is now open.
        </div>
      )}
    </div>
  )
}
