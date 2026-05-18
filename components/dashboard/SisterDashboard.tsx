'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import ProfileQuickView from '@/components/dashboard/ProfileQuickView'
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

export default function SisterDashboard({
  profile,
  sisterProfile,
  waliProfile,
  matches: initialMatches,
  connections: initialConnections,
  incomingInterests,
  notifications,
}: Props) {
  const router = useRouter()
  const firstName = sisterProfile?.full_name?.split(' ')[0] ?? 'there'

  const [matches, setMatches] = useState<SisterMatch[]>(initialMatches ?? [])
  const [connections, setConnections] = useState<ConnectionWithProfile[]>(initialConnections ?? [])
  const [hasPhotos, setHasPhotos] = useState<boolean>(sisterProfile?.photos_uploaded ?? false)

  useEffect(() => {
    function onMatchExpired(e: Event) {
      const expired = (e as CustomEvent).detail as { brother_id: string }
      setMatches(prev => prev.filter(m => m.brother_id !== expired.brother_id))
    }
    window.addEventListener('match-expired', onMatchExpired)
    return () => window.removeEventListener('match-expired', onMatchExpired)
  }, [])

  const [interestModal, setInterestModal] = useState<{ brotherId: string; sisterId: string; firstName: string } | null>(null)
  const [introMessage, setIntroMessage] = useState('')
  const [interestLoading, setInterestLoading] = useState(false)
  const [interestError, setInterestError] = useState<string | null>(null)
  const [localSentIds, setLocalSentIds] = useState<string[]>([])

  const [acceptModalInterest, setAcceptModalInterest] = useState<InterestWithProfile | null>(null)
  const [needsPhotosInterest, setNeedsPhotosInterest] = useState<InterestWithProfile | null>(null)
  const [preAcceptUploading, setPreAcceptUploading] = useState(false)
  const [preAcceptError, setPreAcceptError] = useState<string | null>(null)
  const preAcceptFileRef = useRef<HTMLInputElement>(null)

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
      profileId: interest.other_profile?.id ?? interest.brother_id,
      showActions: true,
      introMessage: interest.intro_message,
      compatibilityNote: interest.other_profile?.compatibility_note ?? null,
      interestId: interest.id,
      pendingInterest: interest,
    })
  }

  function openMatchQuickView(match: SisterMatch) {
    setQuickView({
      profileId: match.brother_id,
      showActions: false,
      compatibilityNote: match.compatibility_note,
    })
  }

  function openAcceptOrPromptPhotos(interest: InterestWithProfile) {
    setActionError(null)
    if (!hasPhotos) {
      setPreAcceptError(null)
      setNeedsPhotosInterest(interest)
    } else {
      setAcceptModalInterest(interest)
    }
  }

  async function handlePreAcceptUpload(file: File) {
    if (!file.type.startsWith('image/')) { setPreAcceptError('Please upload an image file.'); return }
    if (file.size > 5 * 1024 * 1024) { setPreAcceptError('Photo must be under 5MB.'); return }
    setPreAcceptUploading(true)
    setPreAcceptError(null)
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')
      const ext = file.name.split('.').pop() ?? 'jpg'
      const path = `${user.id}/${Date.now()}.${ext}`
      const { error: uploadError } = await supabase.storage.from('sister-photos').upload(path, file)
      if (uploadError) throw uploadError
      const { error: updateError } = await supabase.from('sister_profiles').update({
        photo_urls: [path],
        photos_uploaded: true,
      }).eq('id', user.id)
      if (updateError) throw updateError
      setHasPhotos(true)
      const interest = needsPhotosInterest
      setNeedsPhotosInterest(null)
      setAcceptModalInterest(interest)
    } catch (err: unknown) {
      setPreAcceptError(err instanceof Error ? err.message : 'Upload failed. Please try again.')
    } finally {
      setPreAcceptUploading(false)
    }
  }

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
      setMatches(prev => prev.filter(m => m.brother_id !== closeModalConnection.brother_id))
      setConnections(prev => prev.filter(c => c.id !== closeModalConnection.id))
      setCloseModalConnection(null)
      setClosedToast(true)
      setTimeout(() => setClosedToast(false), 3000)
    }
  }

  const handleMarkRead = async (notifId: string) => {
    setReadNotifIds(prev => new Set(prev).add(notifId))
    await markNotificationRead(notifId)
    router.refresh()
  }

  const visibleInterests = incomingInterests.filter(i => !localDeclinedIds.has(i.id))
  const visibleNotifications = notifications.filter(n => !readNotifIds.has(n.id))
  const visibleMatches = matches.filter(m => !connections.some(c => c.brother_id === m.brother_id))
  const activeConns = connections.filter(c => c.status === 'active')
  const nikahConns = connections.filter(c => c.status === 'nikah_planning')

  return (
    <>
      <div className="bg-[#FDF8F3] min-h-screen">
        {/* ── Header ──────────────────────────────────────────── */}
        <div className="px-6 pt-10 pb-8">
          <p className="text-sm text-[#9B9B9B]">Assalamu Alaikum,</p>
          <h1 className="text-[26px] font-medium text-[#1A1A1A] tracking-[-0.02em] leading-snug mb-1">{firstName}</h1>
          <div className="mt-2 space-y-2">
            {profile?.verification_badge ? <VerifiedBadge /> : <PendingBadge />}

            {waliProfile && (
              <div data-testid="wali-status" className="inline-flex items-center gap-1.5 bg-[#FAF4EE] text-[#5C5C5C] text-xs font-medium px-3 py-1.5 rounded-full border border-[#EDE8E3]">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5">
                  <path d="M10 8a3 3 0 100-6 3 3 0 000 6zM3.465 14.493a1.23 1.23 0 00.41 1.412A9.957 9.957 0 0010 18c2.31 0 4.438-.784 6.131-2.1.43-.333.604-.903.408-1.41a7.002 7.002 0 00-13.074.003z" />
                </svg>
                Wali: {waliProfile.full_name} · Read-only access
              </div>
            )}
          </div>
        </div>

        <div className="px-6 pb-6 space-y-8">
          {/* ── Connections Counter ──────────────────────────────── */}
          <div data-testid="connections-counter" className="bg-white rounded-[16px] p-5 border border-[#EDE8E3] shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
            <p className="text-sm text-[#5C5C5C] mb-3 leading-relaxed">
              You have{' '}
              <span className="font-medium text-[#1A1A1A]">{connections.length}</span> of 3
              active connections
            </p>
            <div className="flex gap-2">
              {[0, 1, 2].map(i => (
                <div
                  key={i}
                  className={`h-1.5 flex-1 rounded-full transition-colors ${
                    i < connections.length ? 'bg-[#AF4D98]' : 'bg-[#EDE8E3]'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* ── Incoming Interests ───────────────────────────────── */}
          {visibleInterests.length > 0 && (
            <section id="interests">
              <p className="text-[11px] font-medium uppercase tracking-[0.06em] text-[#9B9B9B] mb-4">New Interest</p>
              <div className="space-y-3">
                {visibleInterests.map(interest => {
                  const op = interest.other_profile
                  return (
                    <div data-testid="pending-interest-card" key={interest.id} onClick={() => openInterestQuickView(interest)} className="bg-white rounded-[16px] border border-[#EDE8E3] shadow-[0_1px_3px_rgba(0,0,0,0.06)] hover:border-[#D4CBC4] hover:-translate-y-px transition-all duration-150 cursor-pointer">
                      <div className="p-5">
                        <div className="flex items-start gap-3 mb-3">
                          {op?.photo_url ? (
                            <Image src={op.photo_url} alt={op.full_name} width={56} height={56} className="w-14 h-14 rounded-[12px] object-cover flex-shrink-0" />
                          ) : (
                            <div className="w-14 h-14 rounded-[12px] bg-[#F4E4BA] flex items-center justify-center text-[#AF4D98] text-xl font-medium flex-shrink-0">
                              {(op?.full_name ?? 'B')[0]?.toUpperCase()}
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-base font-medium text-[#1A1A1A] tracking-[-0.02em]">{op?.full_name ?? 'Brother'}</span>
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
                            <p className="text-[11px] font-medium uppercase tracking-[0.06em] text-[#9B9B9B] mb-1">Their message</p>
                            <p className="text-sm text-[#1A1A1A] italic">&ldquo;{interest.intro_message}&rdquo;</p>
                          </div>
                        )}

                        <div className="grid grid-cols-3 gap-2 pt-3 border-t border-[#EDE8E3]">
                          <Link
                            href={`/dashboard/profile/${interest.brother_id}?context=interest&interestId=${interest.id}`}
                            onClick={e => e.stopPropagation()}
                            className="text-center text-sm font-medium text-[#AF4D98] py-2"
                          >
                            View
                          </Link>
                          <button
                            data-testid="accept-btn"
                            onClick={e => {
                              e.stopPropagation()
                              if (connectionsFull) setActionError('Close an active connection before accepting a new one.')
                              else openAcceptOrPromptPhotos(interest)
                            }}
                            className="text-sm font-medium rounded-full bg-[#AF4D98] text-white px-4 py-2 hover:bg-[#9B3D85] transition-colors"
                          >
                            Accept
                          </button>
                          <button
                            data-testid="decline-btn"
                            onClick={e => { e.stopPropagation(); handleDecline(interest.id) }}
                            disabled={declining === interest.id}
                            className="text-sm font-medium text-[#9B9B9B] py-2 disabled:opacity-50 transition-colors"
                          >
                            {declining === interest.id ? '…' : 'Decline'}
                          </button>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>

              {actionError && (
                <div className="mt-3 bg-[#FDECEA] border border-[#C13515]/20 rounded-[12px] p-3 text-sm text-[#C13515]">
                  {actionError}
                </div>
              )}
            </section>
          )}

          {/* ── Matches ─────────────────────────────────────────── */}
          <section id="matches" data-testid="matches-section">
            <p className="text-[11px] font-medium uppercase tracking-[0.06em] text-[#9B9B9B] mb-4">Your Matches</p>

            {visibleMatches.length === 0 ? (
              <EmptyState message="Your matches are being prepared. We will notify you when they are ready, in sha Allah." />
            ) : (
              <div className="space-y-3">
                {visibleMatches.map(match => {
                  const b = match.brother
                  const brotherFirstName = b?.full_name?.split(' ')[0] ?? 'Brother'
                  const incomingFromThis = incomingInterests.find(i => i.brother_id === match.brother_id && !localDeclinedIds.has(i.id))
                  const hasSent = match.interest?.status === 'pending' || localSentIds.includes(match.brother_id)
                  const isAccepted = match.interest?.status === 'accepted'
                  const hasConnection = connections.some(c => c.brother_id === match.brother_id)
                  const hasAnyInterest = match.interest !== null || localSentIds.includes(match.brother_id)

                  return (
                    <div data-testid="match-card" key={match.id} onClick={() => openMatchQuickView(match)} className="bg-white rounded-[16px] border border-[#EDE8E3] shadow-[0_1px_3px_rgba(0,0,0,0.06)] hover:border-[#D4CBC4] hover:-translate-y-px transition-all duration-150 overflow-hidden cursor-pointer">
                      <div className="p-5">
                        <div className="flex items-start gap-3 mb-3">
                          {b?.photo_url ? (
                            <Image src={b.photo_url} alt={brotherFirstName} width={56} height={56} className="w-14 h-14 rounded-[12px] object-cover flex-shrink-0" />
                          ) : (
                            <div className="w-14 h-14 rounded-[12px] bg-[#F4E4BA] flex items-center justify-center text-[#AF4D98] text-xl font-medium flex-shrink-0">
                              {brotherFirstName[0]?.toUpperCase()}
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-base font-medium text-[#1A1A1A] tracking-[-0.02em]">{brotherFirstName}</span>
                              {b?.verification_badge && <VerifiedBadge />}
                            </div>
                            <p className="text-sm text-[#9B9B9B] mt-0.5">
                              {[b?.age ? `${b.age} yrs` : null, b?.location].filter(Boolean).join(' · ')}
                            </p>
                          </div>
                        </div>

                        {match.compatibility_note && (
                          <p className="border-l-2 border-[#E5A9A9] pl-3 text-sm italic text-[#5C5C5C] mb-3">
                            {match.compatibility_note}
                          </p>
                        )}

                        <div className="pt-3 border-t border-[#EDE8E3]">
                          {incomingFromThis ? (
                            <div>
                              <p className="text-[11px] font-medium uppercase tracking-[0.06em] text-[#AF4D98] mb-2">{brotherFirstName} has expressed interest</p>
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
                                    if (connectionsFull) setActionError('Close an active connection before accepting.')
                                    else openAcceptOrPromptPhotos(incomingFromThis)
                                  }}
                                  className="text-sm font-medium rounded-full bg-[#AF4D98] text-white px-4 py-2 hover:bg-[#9B3D85] transition-colors"
                                >
                                  Accept
                                </button>
                              </div>
                            </div>
                          ) : isAccepted || hasConnection ? (
                            <div className="flex items-center justify-center py-1">
                              <span className="text-sm text-[#AF4D98] font-medium">Connected — open chat to continue</span>
                            </div>
                          ) : hasSent ? (
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-[#9B9B9B] italic">Awaiting response…</span>
                              <span className="text-sm font-medium text-[#AF4D98]">
                                Interest Sent
                              </span>
                            </div>
                          ) : !hasAnyInterest && !hasConnection ? (
                            <div className="flex items-center justify-end">
                              <button
                                data-testid="express-interest-btn"
                                onClick={e => { e.stopPropagation(); openInterestModal(match.brother_id, match.sister_id, brotherFirstName) }}
                                disabled={connectionsFull}
                                title={connectionsFull ? 'Close an active connection before expressing new interest' : undefined}
                                className="text-sm font-medium rounded-full bg-[#AF4D98] text-white px-4 py-2 hover:bg-[#9B3D85] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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
              <div className="mt-3 bg-[#FDECEA] border border-[#C13515]/20 rounded-[12px] p-3 text-sm text-[#C13515]">
                {interestError}
              </div>
            )}
          </section>

          {/* ── Nikah Planning Connections ───────────────────────── */}
          {nikahConns.length > 0 && (
            <section id="nikah" data-testid="nikah-connections-section">
              <p className="text-[11px] font-medium uppercase tracking-[0.06em] text-[#9B9B9B] mb-4">Nikah Planning</p>
              <div className="space-y-3">
                {nikahConns.map(conn => (
                  <div data-testid="nikah-connection-card" key={conn.id} className="bg-white rounded-[16px] p-5 border border-[#AF4D98]/30 shadow-[0_1px_3px_rgba(175,77,152,0.12)]">
                    <div className="flex items-center gap-2 mb-4">
                      <span className="text-base mr-1">🤍</span>
                      <span className="text-base font-medium text-[#1A1A1A] tracking-[-0.02em]">{conn.other_name}</span>
                      <span className="ml-auto text-xs font-medium text-[#AF4D98] bg-[#F5E6F2] px-2.5 py-1 rounded-full">Nikah Planning</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <Link
                        href={`/dashboard/chat/${conn.id}`}
                        className="text-center text-sm font-medium text-[#AF4D98] py-2"
                      >
                        Open Chat
                      </Link>
                      <Link
                        data-testid="view-nikah-plan-btn"
                        href={`/dashboard/nikah/${conn.id}`}
                        className="text-center text-sm font-medium rounded-full bg-[#AF4D98] text-white px-4 py-2 hover:bg-[#9B3D85] transition-colors"
                      >
                        View Plan
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* ── Active Connections ───────────────────────────────── */}
          <section id="connections" data-testid="connections-section">
            <p className="text-[11px] font-medium uppercase tracking-[0.06em] text-[#9B9B9B] mb-4">Active Connections</p>

            {activeConns.length === 0 ? (
              <EmptyState message="No active connections yet. When a match interest is accepted, a connection will appear here." />
            ) : (
              <div className="space-y-3">
                {activeConns.map(conn => (
                  <div data-testid="connection-card" key={conn.id} className="bg-white rounded-[16px] p-5 border border-[#EDE8E3] shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
                    <div className="flex items-center gap-2 mb-4">
                      <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#9DF7E5] mr-1.5 flex-shrink-0" />
                      <span className="text-base font-medium text-[#1A1A1A] tracking-[-0.02em]">{conn.other_name}</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <Link
                        data-testid="open-chat-btn"
                        href={`/dashboard/chat/${conn.id}`}
                        className="text-center text-sm font-medium text-[#AF4D98] py-2"
                      >
                        Open Chat
                      </Link>
                      <Link
                        href={`/dashboard/meetings/${conn.id}`}
                        className="text-center text-sm font-medium rounded-full bg-[#AF4D98] text-white px-4 py-2 hover:bg-[#9B3D85] transition-colors"
                      >
                        Meeting
                      </Link>
                      <button
                        onClick={() => { setActionError(null); setCloseModalConnection(conn) }}
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
        </div>
      </div>

      {/* ── Quick View Modal ─────────────────────────────────────── */}
      <ProfileQuickView
        profileId={quickView?.profileId ?? null}
        gender="brother"
        isOpen={!!quickView}
        onClose={() => setQuickView(null)}
        onAccept={quickView?.showActions && quickView.pendingInterest ? () => {
          const pi = quickView.pendingInterest!
          setQuickView(null)
          if (connectionsFull) setActionError('Close an active connection before accepting.')
          else openAcceptOrPromptPhotos(pi)
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

      {/* ── Needs Photos Modal ──────────────────────────────────── */}
      {needsPhotosInterest && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-4">
          <div className="bg-white rounded-[24px] p-8 w-full max-w-sm shadow-[0_4px_8px_rgba(0,0,0,0.08),0_16px_40px_rgba(0,0,0,0.12)]">
            <div className="w-12 h-12 bg-[#FAF4EE] rounded-full flex items-center justify-center mx-auto mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="#AF4D98" className="w-6 h-6">
                <path fillRule="evenodd" d="M1 8a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 018.07 3h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0016.07 6H17a2 2 0 012 2v7a2 2 0 01-2 2H3a2 2 0 01-2-2V8zm13.5 3a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM10 14a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
              </svg>
            </div>
            <h3 className="text-xl font-medium text-[#1A1A1A] tracking-[-0.02em] mb-2 text-center">Add a photo first</h3>
            <p className="text-[#5C5C5C] text-sm leading-relaxed mb-2 text-center">
              Before accepting, you need to add at least one photo. Your photo will be shared with{' '}
              <strong className="text-[#1A1A1A] font-medium">{needsPhotosInterest.other_profile?.full_name?.split(' ')[0] ?? 'this brother'}</strong>{' '}
              when you confirm.
            </p>
            <p className="text-xs text-[#9B9B9B] text-center mb-6">
              Your photo is private — only visible to brothers you accept.
            </p>

            {preAcceptError && (
              <div className="mb-4 bg-[#FDECEA] border border-[#C13515]/20 rounded-[12px] p-3 text-sm text-[#C13515]">
                {preAcceptError}
              </div>
            )}

            <input
              ref={preAcceptFileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={e => {
                const file = e.target.files?.[0]
                if (file) handlePreAcceptUpload(file)
                e.target.value = ''
              }}
            />

            <div className="space-y-3">
              <button
                onClick={() => preAcceptFileRef.current?.click()}
                disabled={preAcceptUploading}
                className="w-full rounded-full bg-[#AF4D98] text-white font-medium py-3 hover:bg-[#9B3D85] disabled:opacity-50 transition-colors text-sm flex items-center justify-center gap-2"
              >
                {preAcceptUploading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Uploading…
                  </>
                ) : (
                  'Upload a photo'
                )}
              </button>
              <button
                onClick={() => { setNeedsPhotosInterest(null); setPreAcceptError(null) }}
                className="w-full text-[#9B9B9B] text-sm py-2 hover:text-[#1A1A1A] transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Express Interest Modal ───────────────────────────────── */}
      {interestModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-4">
          <div className="bg-white rounded-[24px] p-8 w-full max-w-sm shadow-[0_4px_8px_rgba(0,0,0,0.08),0_16px_40px_rgba(0,0,0,0.12)]">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-medium text-[#1A1A1A] tracking-[-0.02em]">
                Express Interest in {interestModal.firstName}
              </h3>
              <button onClick={() => setInterestModal(null)} className="text-[#9B9B9B] hover:text-[#1A1A1A] transition-colors p-1" aria-label="Close">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                  <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
                </svg>
              </button>
            </div>
            <p className="text-sm text-[#5C5C5C] mb-4 leading-relaxed">
              Write a short message to introduce yourself. This is optional but encouraged.
            </p>
            <textarea
              value={introMessage}
              onChange={e => setIntroMessage(e.target.value)}
              placeholder="Assalamu Alaikum, I came across your profile and felt it aligned well with what I am looking for…"
              rows={4}
              maxLength={300}
              className="w-full border border-[#EDE8E3] rounded-[12px] px-4 py-3 text-sm text-[#1A1A1A] placeholder:text-[#9B9B9B] focus:outline-none focus:ring-2 focus:ring-[#AF4D98]/8 focus:border-[#AF4D98] resize-none transition-all duration-150"
            />
            <p className="text-xs text-[#9B9B9B] text-right mt-1 mb-5">{introMessage.length}/300</p>
            {interestError && (
              <div className="mb-4 bg-[#FDECEA] border border-[#C13515]/20 rounded-[12px] p-3 text-sm text-[#C13515]">{interestError}</div>
            )}
            <div className="space-y-2">
              <button
                onClick={handleSendInterest}
                disabled={interestLoading}
                className="w-full rounded-full bg-[#AF4D98] text-white font-medium py-3 hover:bg-[#9B3D85] disabled:opacity-50 transition-colors text-sm"
              >
                {interestLoading ? 'Sending…' : 'Send Interest'}
              </button>
              <button onClick={() => setInterestModal(null)} className="w-full text-[#9B9B9B] text-sm py-2 hover:text-[#1A1A1A] transition-colors">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Accept Interest Modal ────────────────────────────────── */}
      {acceptModalInterest && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-4">
          <div className="bg-white rounded-[24px] p-8 w-full max-w-sm shadow-[0_4px_8px_rgba(0,0,0,0.08),0_16px_40px_rgba(0,0,0,0.12)]">
            <h3 className="text-xl font-medium text-[#1A1A1A] tracking-[-0.02em] mb-2">Accept Interest</h3>
            <p className="text-[#5C5C5C] text-sm leading-relaxed mb-6">
              Accepting will share your photos with{' '}
              <strong className="text-[#1A1A1A] font-medium">{acceptModalInterest.other_profile?.full_name ?? 'this person'}</strong>.
              Are you ready?
            </p>
            {actionError && (
              <div className="mb-4 bg-[#FDECEA] border border-[#C13515]/20 rounded-[12px] p-3 text-sm text-[#C13515]">{actionError}</div>
            )}
            <div className="space-y-3">
              <Link
                href="/dashboard/profile"
                className="block w-full text-center text-sm font-medium text-[#AF4D98] py-3"
              >
                Review My Photos
              </Link>
              <button
                onClick={handleAccept}
                disabled={accepting}
                className="w-full rounded-full bg-[#AF4D98] text-white font-medium py-3 hover:bg-[#9B3D85] disabled:opacity-50 transition-colors text-sm"
              >
                {accepting ? 'Accepting…' : 'Confirm & Accept'}
              </button>
              <button
                onClick={() => { setAcceptModalInterest(null); setActionError(null) }}
                className="w-full text-[#9B9B9B] text-sm py-2 hover:text-[#1A1A1A] transition-colors"
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
          <div className="bg-white rounded-[24px] p-8 w-full max-w-sm shadow-[0_4px_8px_rgba(0,0,0,0.08),0_16px_40px_rgba(0,0,0,0.12)]">
            <h3 className="text-xl font-medium text-[#1A1A1A] tracking-[-0.02em] mb-2">Close Connection</h3>
            <p className="text-[#5C5C5C] text-sm leading-relaxed mb-3">
              Are you sure you want to close your connection with{' '}
              <strong className="text-[#1A1A1A] font-medium">{closeModalConnection.other_name}</strong>? This cannot be undone.
            </p>
            <div className="bg-[#F4E4BA]/40 border border-[#EDE8E3] rounded-[12px] px-4 py-3 mb-6">
              <p className="text-xs text-[#5C5C5C] leading-relaxed">
                Your photos will be revoked and {closeModalConnection.other_name} will no longer have access to them.
              </p>
            </div>
            {actionError && (
              <div className="mb-4 bg-[#FDECEA] border border-[#C13515]/20 rounded-[12px] p-3 text-sm text-[#C13515]">{actionError}</div>
            )}
            <div className="space-y-3">
              <button
                onClick={handleCloseConnection}
                disabled={closing}
                className="w-full bg-[#C13515] text-white font-medium py-3 rounded-full hover:bg-[#a02d10] disabled:opacity-50 transition-colors text-sm"
              >
                {closing ? 'Closing…' : 'Close Connection'}
              </button>
              <button
                onClick={() => { setCloseModalConnection(null); setActionError(null) }}
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
    </>
  )
}
