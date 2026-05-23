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

// ── Helpers ──────────────────────────────────────────────────────────────────

function getAvatarGradient(name?: string): string {
  const gradients = [
    'linear-gradient(135deg, #F5E6F2, #F4E4BA)',
    'linear-gradient(135deg, #F4E4BA, #E5A9A9)',
    'linear-gradient(135deg, #E5A9A9, #F5E6F2)',
    'linear-gradient(135deg, #F5E6F2, #9DF7E5)',
    'linear-gradient(135deg, #F4E4BA, #F5E6F2)',
  ]
  const index = (name?.charCodeAt(0) ?? 0) % gradients.length
  return gradients[index]
}

function getRelativeTime(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  const hours = Math.floor(mins / 60)
  const days = Math.floor(hours / 24)
  if (mins < 1) return 'Just now'
  if (mins < 60) return `${mins}m ago`
  if (hours < 24) return `${hours}h ago`
  if (days === 1) return 'Yesterday'
  return `${days} days ago`
}

const AYAHS = [
  {
    arabic: 'وَجَعَلَ بَيْنَكُم مَّوَدَّةً وَرَحْمَةً',
    translation: 'And He placed between you affection and mercy',
    reference: 'Ar-Rum 30:21',
  },
  {
    arabic: 'وَمِنْ آيَاتِهِ أَنْ خَلَقَ لَكُم مِّنْ أَنفُسِكُمْ أَزْوَاجًا',
    translation: 'And of His signs is that He created for you mates from yourselves',
    reference: 'Ar-Rum 30:21',
  },
  {
    arabic: 'هُنَّ لِبَاسٌ لَّكُمْ وَأَنتُمْ لِبَاسٌ لَّهُنَّ',
    translation: 'They are a garment for you and you are a garment for them',
    reference: 'Al-Baqarah 2:187',
  },
  {
    arabic: 'رَبَّنَا هَبْ لَنَا مِنْ أَزْوَاجِنَا وَذُرِّيَّاتِنَا قُرَّةَ أَعْيُنٍ',
    translation: 'Our Lord, grant us from our spouses and offspring comfort to our eyes',
    reference: 'Al-Furqan 25:74',
  },
]

function VerifiedBadge() {
  return (
    <span className="inline-flex items-center gap-1 bg-[#E6F9F7] text-[#00A699] text-xs font-medium px-2 py-0.5 rounded-full">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-3 h-3">
        <path fillRule="evenodd" d="M8 15A7 7 0 108 1a7 7 0 000 14zm3.844-8.791a.75.75 0 00-1.188-.918l-3.7 4.79-1.649-1.833a.75.75 0 10-1.114 1.004l2.25 2.5a.75.75 0 001.15-.086l4.25-5.5-.001-.002z" clipRule="evenodd" />
      </svg>
      Verified
    </span>
  )
}

// ── Types ─────────────────────────────────────────────────────────────────────

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

// ── Component ─────────────────────────────────────────────────────────────────

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
  const initials = (brotherProfile?.full_name ?? '').split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2) || 'N'

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
  const [closedToast, setClosedToast] = useState(false)
  const [mutualToast, setMutualToast] = useState(false)
  const [readNotifIds, setReadNotifIds] = useState<Set<string>>(new Set())
  const [nikahCloseModal, setNikahCloseModal] = useState<ConnectionWithProfile | null>(null)
  const [nikahCloseReason, setNikahCloseReason] = useState<string>('')
  const [nikahClosing, setNikahClosing] = useState(false)
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

  // Derived state
  const visibleNotifications = notifications.filter(n => !readNotifIds.has(n.id))
  const visibleIncoming = incomingInterests.filter(i => !localDeclinedIds.has(i.id))
  const activeConns = connections.filter(c => c.status === 'active')
  const nikahConns = connections.filter(c => c.status === 'nikah_planning')
  const isInNikahPlanning = nikahConns.length > 0
  const visibleMatches = matches.filter(match => {
    const matchConn = connections.find(c => c.sister_id === match.sister_id && c.status === 'nikah_planning')
    return !matchConn
  })

  // Hero stats
  const matchCount = visibleMatches.length
  const connectionCount = activeConns.length
  const unreadCount = visibleNotifications.length

  // Daily ayah (rotates by day)
  const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000)
  const todayAyah = AYAHS[dayOfYear % AYAHS.length]

  // Section label style
  const sectionLabel: React.CSSProperties = {
    fontSize: '11px',
    fontWeight: 500,
    color: '#6B6080',
    textTransform: 'uppercase',
    letterSpacing: '0.1em',
    marginBottom: '10px',
  }

  return (
    <div style={{ background: '#F5F0FB', minHeight: '100vh' }}>

      {/* ── Dark Hero Header ────────────────────────────────────── */}
      <div style={{ background: '#1C1A1F', padding: '20px 20px 28px', position: 'relative', overflow: 'hidden' }}>
        {/* Geometric pattern overlay */}
        <div style={{
          position: 'absolute', inset: 0, opacity: 0.04,
          backgroundImage: 'repeating-linear-gradient(45deg, #AF4D98 0, #AF4D98 1px, transparent 0, transparent 50%)',
          backgroundSize: '12px 12px', pointerEvents: 'none',
        }} />

        {/* Top row */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', position: 'relative' }}>
          <span style={{ fontFamily: 'Noto Naskh Arabic, serif', fontSize: '22px', color: '#AF4D98', opacity: 0.7 }}>نصيب</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ position: 'relative', cursor: 'pointer' }} onClick={() => router.push('/dashboard/notifications')}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="1.5" strokeLinecap="round">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                <path d="M13.73 21a2 2 0 0 1-3.46 0" />
              </svg>
              {unreadCount > 0 && (
                <div style={{ position: 'absolute', top: '-2px', right: '-2px', width: '7px', height: '7px', background: '#AF4D98', borderRadius: '50%', border: '1.5px solid #1C1A1F' }} />
              )}
            </div>
            <div
              onClick={() => router.push('/dashboard/profile')}
              style={{ width: '34px', height: '34px', borderRadius: '50%', background: '#AF4D98', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 500, color: 'white', cursor: 'pointer', flexShrink: 0 }}
            >
              {initials}
            </div>
          </div>
        </div>

        {/* Greeting */}
        <div style={{ position: 'relative', marginBottom: '20px' }}>
          <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.45)', marginBottom: '3px' }}>Assalamu Alaikum,</p>
          <h1 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '28px', fontWeight: 400, color: 'white', letterSpacing: '-0.02em', lineHeight: 1 }}>{firstName}</h1>
        </div>

        {/* Stats row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', position: 'relative' }}>
          {[
            { num: matchCount, label: 'Matches', active: false },
            { num: connectionCount, label: 'Connected', active: connectionCount > 0 },
            { num: unreadCount, label: 'Unread', active: false },
          ].map(stat => (
            <div key={stat.label} style={{
              background: stat.active ? 'rgba(175,77,152,0.2)' : 'rgba(255,255,255,0.07)',
              border: `0.5px solid ${stat.active ? 'rgba(175,77,152,0.4)' : 'rgba(255,255,255,0.1)'}`,
              borderRadius: '10px', padding: '12px 10px', textAlign: 'center',
            }}>
              <div style={{ fontSize: '22px', fontWeight: 500, color: stat.active ? '#D66BA0' : 'white', lineHeight: 1, marginBottom: '3px' }}>{stat.num}</div>
              <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.07em' }}>{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Body ────────────────────────────────────────────────── */}
      <div className="px-4 pb-20 lg:px-8 lg:pb-10 lg:grid lg:grid-cols-3 lg:gap-8 lg:items-start" style={{ maxWidth: '1100px', margin: '0 auto' }}>

        {/* Left column */}
        <div className="space-y-4 lg:col-span-2">

          {/* Ayah card */}
          <div style={{ background: '#1C1A1F', borderRadius: '14px', padding: '18px 20px', marginTop: '16px', textAlign: 'center' }}>
            <p style={{ fontFamily: 'Noto Naskh Arabic, serif', fontSize: '17px', color: '#AF4D98', marginBottom: '8px', lineHeight: 1.6, letterSpacing: '0.02em' }}>{todayAyah.arabic}</p>
            <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)', fontStyle: 'italic', lineHeight: 1.5, marginBottom: '6px' }}>&ldquo;{todayAyah.translation}&rdquo;</p>
            <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.25)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{todayAyah.reference}</p>
          </div>

          {/* Profile checklist */}
          {!isInNikahPlanning && (
            <ProfileChecklist
              gender="brother"
              profile={brotherProfile as unknown as Record<string, unknown>}
              completionPercentage={completionPercentage}
              referenceComplete={hasReference}
            />
          )}

          {/* Verification prompt */}
          {profile.verification_status !== 'verified' && completionPercentage >= 80 && (
            <div style={{ background: 'white', border: '0.5px solid #EDE8E3', borderRadius: '16px', padding: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ marginBottom: '4px' }}>
                  {profile.verification_status === 'pending' ? (
                    <span style={{ background: '#FFF7E6', color: '#B45309', fontSize: '11px', fontWeight: 500, padding: '2px 8px', borderRadius: '999px' }}>Under review</span>
                  ) : (
                    <span style={{ background: '#FDECEA', color: '#C13515', fontSize: '11px', fontWeight: 500, padding: '2px 8px', borderRadius: '999px' }}>Not verified</span>
                  )}
                </div>
                <p style={{ fontSize: '14px', fontWeight: 500, color: '#1A1A1A', marginBottom: '2px' }}>
                  {profile.verification_status === 'pending' ? 'Verification under review' : profile.verification_status === 'rejected' ? 'Verification needs attention' : 'Verify your identity'}
                </p>
                <p style={{ fontSize: '13px', color: '#9B9B9B', lineHeight: 1.5 }}>
                  {profile.verification_status === 'pending' ? 'We will notify you within 24 hours, in sha Allah.' : profile.verification_status === 'rejected' ? `Rejected: ${profile.verification_rejection_reason}` : 'A quick selfie to confirm your identity.'}
                </p>
              </div>
              {profile.verification_status !== 'pending' && (
                <button onClick={() => router.push('/dashboard/verify')} style={{ background: '#AF4D98', color: 'white', border: 'none', borderRadius: '999px', padding: '10px 18px', fontSize: '13px', fontWeight: 500, cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0 }}>
                  {profile.verification_status === 'rejected' ? 'Resubmit →' : 'Verify now →'}
                </button>
              )}
            </div>
          )}

          {/* ── Nikah Planning ──────────────────────────────────── */}
          {nikahConns.length > 0 && (
            <section id="nikah" data-testid="nikah-connections-section">
              <p style={sectionLabel}>Nikah Planning</p>
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
                        <button onClick={() => { setNikahCloseReason(''); setNikahCloseModal(conn) }} style={{ background: 'transparent', border: 'none', fontSize: '12px', color: '#C0B8B0', cursor: 'pointer', textDecoration: 'underline', textUnderlineOffset: '3px', padding: '4px 8px' }}>
                          Close this connection
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Dua card during nikah planning */}
          {isInNikahPlanning && (
            <div style={{ textAlign: 'center', padding: '32px 20px', background: '#1C1A1F', borderRadius: '16px' }}>
              <p style={{ fontFamily: 'Noto Naskh Arabic, serif', fontSize: '20px', color: '#AF4D98', marginBottom: '8px' }}>بَارَكَ اللَّهُ لَكُمَا</p>
              <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.5)', lineHeight: 1.6, maxWidth: '280px', margin: '0 auto' }}>May Allah bless your union and make it a source of peace and taqwa.</p>
            </div>
          )}

          {!isInNikahPlanning && (<>

          {/* ── Matches ─────────────────────────────────────────── */}
          <section id="matches" data-testid="matches-section">
            <p style={sectionLabel}>Your Matches</p>

            {!profileComplete ? null : visibleMatches.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '48px 20px', background: '#1C1A1F', borderRadius: '14px' }}>
                <p style={{ fontFamily: 'Noto Naskh Arabic, serif', fontSize: '32px', color: '#AF4D98', marginBottom: '12px', opacity: 0.4 }}>نصيب</p>
                <p style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '20px', fontWeight: 400, color: 'rgba(255,255,255,0.7)', marginBottom: '8px' }}>Your matches are being prepared</p>
                <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.4)', lineHeight: 1.6, maxWidth: '260px', margin: '0 auto' }}>We will notify you when they are ready, in sha Allah.</p>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                {visibleMatches.map(match => {
                  const sisterFirstName = match.sister?.full_name?.split(' ')[0] ?? 'Sister'
                  const matchConn = connections.find(c => c.sister_id === match.sister_id)
                  const isConnected = !!matchConn
                  const hasSent = localSentIds.includes(match.sister_id)
                  const incomingFromThis = matchConn ? null : incomingInterests.find(i => i.sister_id === match.sister_id && !localDeclinedIds.has(i.id))

                  return (
                    <div
                      data-testid="match-card"
                      key={match.id}
                      onClick={() => openMatchQuickView(match)}
                      style={{
                        background: isConnected ? '#F5E6F2' : 'white',
                        border: isConnected ? '1.5px solid #AF4D98' : '0.5px solid #EDE8E3',
                        borderRadius: '14px',
                        padding: '14px',
                        transition: 'all 0.15s ease',
                        cursor: 'pointer',
                      }}
                    >
                      {/* Avatar */}
                      <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: getAvatarGradient(match.sister?.full_name), display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Cormorant Garamond, serif', fontSize: '20px', color: '#AF4D98', marginBottom: '10px' }}>
                        {match.sister?.full_name?.[0] ?? 'S'}
                      </div>

                      {/* Name + verified */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px', flexWrap: 'wrap' }}>
                        <p style={{ fontSize: '14px', fontWeight: 500, color: isConnected ? '#AF4D98' : '#1A1A1A' }}>{sisterFirstName}</p>
                        {match.sister?.verification_badge && <VerifiedBadge />}
                      </div>

                      {/* Meta */}
                      <p style={{ fontSize: '11px', color: '#9B9B9B', lineHeight: 1.4, marginBottom: '10px' }}>
                        {[match.sister?.age ? `${match.sister.age} yrs` : null, match.sister?.location?.split(',')[0]].filter(Boolean).join(' · ')}
                      </p>

                      {/* CTA */}
                      {isConnected ? (
                        <button
                          onClick={e => { e.stopPropagation(); router.push(`/dashboard/chat/${matchConn!.id}`) }}
                          style={{ background: '#AF4D98', color: 'white', border: 'none', borderRadius: '999px', padding: '6px 12px', fontSize: '11px', fontWeight: 500, cursor: 'pointer', width: '100%' }}
                        >
                          Open chat
                        </button>
                      ) : hasSent ? (
                        <span style={{ display: 'inline-block', background: '#F5E6F2', color: '#7B2F6E', fontSize: '10px', fontWeight: 500, padding: '4px 10px', borderRadius: '999px' }}>
                          Awaiting response
                        </span>
                      ) : incomingFromThis ? (
                        <div style={{ display: 'flex', gap: '5px' }}>
                          <button
                            onClick={e => {
                              e.stopPropagation()
                              if (connectionsFull) setActionError('Close an active connection before accepting.')
                              else handleAccept(incomingFromThis.id)
                            }}
                            disabled={accepting === incomingFromThis.id}
                            style={{ flex: 1, background: '#AF4D98', color: 'white', border: 'none', borderRadius: '999px', padding: '6px 8px', fontSize: '11px', fontWeight: 500, cursor: 'pointer', opacity: accepting === incomingFromThis.id ? 0.6 : 1 }}
                          >
                            {accepting === incomingFromThis.id ? '…' : 'Accept'}
                          </button>
                          <button
                            onClick={e => { e.stopPropagation(); handleDecline(incomingFromThis.id) }}
                            disabled={declining === incomingFromThis.id}
                            style={{ flex: 1, background: 'transparent', color: '#9B9B9B', border: '0.5px solid #EDE8E3', borderRadius: '999px', padding: '6px 8px', fontSize: '11px', cursor: 'pointer', opacity: declining === incomingFromThis.id ? 0.6 : 1 }}
                          >
                            {declining === incomingFromThis.id ? '…' : 'Decline'}
                          </button>
                        </div>
                      ) : (
                        <button
                          data-testid="express-interest-btn"
                          onClick={e => { e.stopPropagation(); openInterestModal(profile.id, match.sister_id, sisterFirstName) }}
                          disabled={connectionsFull}
                          title={connectionsFull ? 'Close an active connection before expressing new interest' : undefined}
                          style={{ background: '#AF4D98', color: 'white', border: 'none', borderRadius: '999px', padding: '6px 12px', fontSize: '11px', fontWeight: 500, cursor: connectionsFull ? 'not-allowed' : 'pointer', width: '100%', opacity: connectionsFull ? 0.5 : 1 }}
                        >
                          Express interest
                        </button>
                      )}
                    </div>
                  )
                })}
              </div>
            )}

            {actionError && (
              <div style={{ marginTop: '10px', background: '#FDECEA', border: '1px solid rgba(193,53,21,0.2)', borderRadius: '12px', padding: '12px', fontSize: '13px', color: '#C13515' }}>{actionError}</div>
            )}
            {connectionsFull && (
              <p style={{ marginTop: '10px', fontSize: '12px', color: '#5C5C5C', background: 'rgba(244,228,186,0.4)', border: '0.5px solid #EDE8E3', borderRadius: '12px', padding: '10px 12px' }}>
                You have 3 active connections. Close one before expressing new interest.
              </p>
            )}
          </section>

          {/* ── Active Connections ───────────────────────────────── */}
          <section id="connections" data-testid="connections-section">
            <p style={sectionLabel}>Active Connections</p>

            {activeConns.length === 0 ? (
              <div style={{ background: 'white', border: '0.5px solid #EDE8E3', borderRadius: '14px', padding: '24px', textAlign: 'center' }}>
                <p style={{ fontSize: '13px', color: '#9B9B9B', lineHeight: 1.5 }}>No active connections yet. Express interest in a match to begin.</p>
              </div>
            ) : (
              <div>
                {activeConns.map(conn => (
                  <div
                    data-testid="connection-card"
                    key={conn.id}
                    style={{ background: '#1C1A1F', borderRadius: '14px', padding: '14px 16px', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '12px' }}
                  >
                    {/* Avatar */}
                    <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: 'linear-gradient(135deg, #AF4D98, #D66BA0)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Cormorant Garamond, serif', fontSize: '18px', color: 'white', flexShrink: 0, overflow: 'hidden' }}>
                      {connPhotoUrls[conn.id] ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={connPhotoUrls[conn.id]} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="" />
                      ) : (
                        conn.other_name?.[0] ?? '?'
                      )}
                    </div>

                    {/* Info */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: '14px', fontWeight: 500, color: 'white', marginBottom: '2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {conn.other_name?.split(' ')[0]}
                      </p>
                      <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)' }}>Active connection</p>
                    </div>

                    {/* Actions */}
                    <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
                      <Link
                        data-testid="open-chat-btn"
                        href={`/dashboard/chat/${conn.id}`}
                        style={{ background: '#AF4D98', color: 'white', textDecoration: 'none', borderRadius: '999px', padding: '7px 14px', fontSize: '12px', fontWeight: 500 }}
                      >
                        Chat
                      </Link>
                      <Link
                        href={`/dashboard/profile/${conn.sister_id}?context=connection&connectionId=${conn.id}`}
                        style={{ background: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.8)', textDecoration: 'none', borderRadius: '999px', padding: '7px 14px', fontSize: '12px' }}
                      >
                        Profile
                      </Link>
                      <button
                        onClick={() => { setCloseError(null); setCloseModalConnection(conn) }}
                        style={{ background: 'transparent', color: 'rgba(255,255,255,0.3)', border: 'none', fontSize: '12px', cursor: 'pointer', padding: '7px 8px' }}
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* ── Pending Interests ────────────────────────────────── */}
          {visibleIncoming.length > 0 && (
            <section id="interests" data-testid="pending-interests-section">
              <p style={sectionLabel}>Pending Interests</p>
              <div className="space-y-3">
                {visibleIncoming.map(interest => {
                  const op = interest.other_profile
                  const sisterFirstName = op?.full_name?.split(' ')[0] ?? 'Sister'
                  return (
                    <div
                      data-testid="pending-interest-card"
                      key={interest.id}
                      onClick={() => openInterestQuickView(interest)}
                      style={{ background: 'white', border: '0.5px solid #EDE8E3', borderRadius: '14px', padding: '16px', cursor: 'pointer' }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '10px' }}>
                        <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: getAvatarGradient(op?.full_name), display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Cormorant Garamond, serif', fontSize: '18px', color: '#AF4D98', flexShrink: 0 }}>
                          {sisterFirstName[0]}
                        </div>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                            <p style={{ fontSize: '14px', fontWeight: 500, color: '#1A1A1A' }}>{sisterFirstName}</p>
                            {op?.verification_badge && <VerifiedBadge />}
                          </div>
                          <p style={{ fontSize: '12px', color: '#9B9B9B' }}>{[op?.age ? `${op.age} yrs` : null, op?.location].filter(Boolean).join(' · ')}</p>
                        </div>
                        <span style={{ marginLeft: 'auto', fontSize: '11px', color: '#AF4D98', fontWeight: 500, background: '#F5E6F2', padding: '3px 10px', borderRadius: '999px' }}>Interested</span>
                      </div>

                      {interest.intro_message && (
                        <div style={{ background: '#FDFAF7', borderRadius: '10px', padding: '10px 12px', marginBottom: '10px', border: '0.5px solid #EDE8E3' }}>
                          <p style={{ fontSize: '11px', color: '#9B9B9B', marginBottom: '3px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Her message</p>
                          <p style={{ fontSize: '13px', color: '#1A1A1A', fontStyle: 'italic' }}>&ldquo;{interest.intro_message}&rdquo;</p>
                        </div>
                      )}

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                        <button
                          data-testid="decline-btn"
                          onClick={e => { e.stopPropagation(); handleDecline(interest.id) }}
                          disabled={declining === interest.id}
                          style={{ background: 'transparent', color: '#9B9B9B', border: '0.5px solid #EDE8E3', borderRadius: '999px', padding: '10px', fontSize: '13px', cursor: 'pointer', opacity: declining === interest.id ? 0.6 : 1 }}
                        >
                          {declining === interest.id ? '…' : 'Decline'}
                        </button>
                        <button
                          data-testid="accept-btn"
                          onClick={e => {
                            e.stopPropagation()
                            if (connectionsFull) setActionError('Close an active connection before accepting a new one.')
                            else { setActionError(null); handleAccept(interest.id) }
                          }}
                          disabled={accepting === interest.id}
                          style={{ background: '#AF4D98', color: 'white', border: 'none', borderRadius: '999px', padding: '10px', fontSize: '13px', fontWeight: 500, cursor: 'pointer', opacity: accepting === interest.id ? 0.6 : 1 }}
                        >
                          {accepting === interest.id ? '…' : 'Accept'}
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            </section>
          )}

          </>)}

        </div>{/* end left column */}

        {/* Right column */}
        <div className="space-y-4 lg:col-span-1 mt-4 lg:mt-4">

          {/* ── Notifications ────────────────────────────────────── */}
          <section id="notifications" data-testid="notifications-section">
            <p style={sectionLabel}>Notifications</p>

            {visibleNotifications.length === 0 ? (
              <div style={{ background: 'white', border: '0.5px solid #EDE8E3', borderRadius: '14px', padding: '24px', textAlign: 'center' }}>
                <p style={{ fontSize: '13px', color: '#9B9B9B' }}>You&apos;re all caught up. May Allah bless your journey.</p>
              </div>
            ) : (
              <div>
                {visibleNotifications.slice(0, 8).map(notif => (
                  <button
                    key={notif.id}
                    onClick={() => handleMarkRead(notif.id)}
                    style={{
                      width: '100%',
                      textAlign: 'left',
                      background: 'white',
                      borderLeft: `3px solid ${notif.read ? '#EDE8E3' : '#AF4D98'}`,
                      borderTop: '0.5px solid #F0EDE8',
                      borderRight: '0.5px solid #F0EDE8',
                      borderBottom: '0.5px solid #F0EDE8',
                      borderRadius: '0 14px 14px 0',
                      padding: '14px 16px',
                      marginBottom: '8px',
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '10px',
                      cursor: 'pointer',
                    }}
                  >
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: notif.read ? '#EDE8E3' : '#AF4D98', flexShrink: 0, marginTop: '4px' }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: '13px', fontWeight: notif.read ? 400 : 500, color: notif.read ? '#9B9B9B' : '#1A1A1A', marginBottom: '2px' }}>{notif.title}</p>
                      <p style={{ fontSize: '12px', color: '#9B9B9B', lineHeight: 1.4, marginBottom: '3px' }}>{notif.body}</p>
                      <p style={{ fontSize: '11px', color: '#C0B8B0' }}>{getRelativeTime(notif.created_at)}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </section>

        </div>{/* end right column */}

      </div>{/* end grid */}

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
              <div className="mb-4 bg-[#FDECEA] border border-[#C13515]/20 rounded-[12px] p-3 text-sm text-[#C13515]">{closeError}</div>
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
              <button onClick={() => { setCloseModalConnection(null); setCloseError(null) }} className="w-full text-[#9B9B9B] text-sm py-2 hover:text-[#1A1A1A] transition-colors">
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
            <p style={{ fontFamily: 'Noto Naskh Arabic, serif', fontSize: '20px', color: '#AF4D98', textAlign: 'center', marginBottom: '16px' }}>إِنَّا لِلَّهِ وَإِنَّا إِلَيْهِ رَاجِعُونَ</p>
            <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '22px', fontWeight: 400, color: '#1A1A1A', textAlign: 'center', marginBottom: '8px' }}>Close nikah planning?</h2>
            <p style={{ fontSize: '14px', color: '#5C5C5C', textAlign: 'center', lineHeight: 1.6, marginBottom: '20px' }}>We understand that not every journey reaches its destination. May Allah ease your path and guide you to what is best, in sha Allah.</p>
            <div style={{ background: '#FDFAF7', border: '1px solid #EDE8E3', borderRadius: '12px', padding: '14px 16px', marginBottom: '20px' }}>
              <p style={{ fontSize: '12px', fontWeight: 500, color: '#9B9B9B', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px' }}>What happens when you close:</p>
              {['The connection is permanently closed', 'Both parties are notified respectfully', 'Chat history is no longer accessible', 'Your profile returns to active status', 'You may receive new matches in time'].map((item, i) => (
                <p key={i} style={{ fontSize: '13px', color: '#5C5C5C', margin: '0 0 4px', display: 'flex', alignItems: 'flex-start', gap: '6px', lineHeight: 1.5 }}>
                  <span style={{ color: '#9B9B9B' }}>·</span>{item}
                </p>
              ))}
            </div>
            <p style={{ fontSize: '13px', fontWeight: 500, color: '#1A1A1A', marginBottom: '10px' }}>Please select a reason:</p>
            {['We are not compatible', 'Family concerns', 'Personal circumstances have changed', 'We have mutually agreed to part ways', 'I prefer not to say'].map(reason => (
              <div key={reason} onClick={() => setNikahCloseReason(reason)} style={{ padding: '11px 14px', borderRadius: '10px', border: `1px solid ${nikahCloseReason === reason ? '#AF4D98' : '#EDE8E3'}`, background: nikahCloseReason === reason ? '#F5E6F2' : 'white', cursor: 'pointer', marginBottom: '6px', fontSize: '13px', color: nikahCloseReason === reason ? '#AF4D98' : '#5C5C5C', transition: 'all 0.15s ease' }}>
                {reason}
              </div>
            ))}
            <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
              <button onClick={() => { setNikahCloseModal(null); setNikahCloseReason('') }} style={{ flex: 1, background: 'white', border: '1px solid #EDE8E3', borderRadius: '999px', padding: '12px', fontSize: '14px', color: '#5C5C5C', cursor: 'pointer' }}>Keep going</button>
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
                style={{ flex: 1, background: nikahCloseReason ? '#C13515' : '#EDE8E3', color: nikahCloseReason ? 'white' : '#9B9B9B', border: 'none', borderRadius: '999px', padding: '12px', fontSize: '14px', fontWeight: 500, cursor: nikahCloseReason && !nikahClosing ? 'pointer' : 'not-allowed', opacity: nikahClosing ? 0.7 : 1 }}
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
              <h3 className="text-xl font-medium text-[#1A1A1A] tracking-[-0.02em]">Express Interest in {interestModal.firstName}</h3>
              <button onClick={() => setInterestModal(null)} className="text-[#9B9B9B] hover:text-[#1A1A1A] transition-colors p-1" aria-label="Close">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                  <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
                </svg>
              </button>
            </div>
            <p className="text-sm text-[#5C5C5C] mb-4 leading-relaxed">Write a short message to introduce yourself. This is optional but encouraged.</p>
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
              <div className="mb-4 bg-[#FDECEA] border border-[#C13515]/20 rounded-[12px] p-3 text-sm text-[#C13515]">{interestError}</div>
            )}
            <div className="space-y-2">
              <button data-testid="send-interest-btn" onClick={handleSendInterest} disabled={interestLoading} className="w-full rounded-full bg-[#AF4D98] text-white font-medium py-3 hover:bg-[#9B3D85] disabled:opacity-50 transition-colors text-sm">
                {interestLoading ? 'Sending…' : 'Send Interest'}
              </button>
              <button onClick={() => setInterestModal(null)} className="w-full text-[#9B9B9B] text-sm py-2 hover:text-[#1A1A1A] transition-colors">Cancel</button>
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
