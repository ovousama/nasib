'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
function toBrotherPhotoUrl(path: string | null | undefined): string | null {
  if (!path) return null
  if (path.startsWith('http')) return path
  return `${SUPABASE_URL}/storage/v1/object/public/brother-photos/${path}`
}

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

// ── Helpers ──────────────────────────────────────────────────────────────────

function getAvatarGradient(name?: string): string {
  const gradients = [
    'linear-gradient(135deg, #F5E6F2, #F4E4BA)',
    'linear-gradient(135deg, #F4E4BA, #E5A9A9)',
    'linear-gradient(135deg, #E5A9A9, #F5E6F2)',
    'linear-gradient(135deg, #F5E6F2, #9DF7E5)',
    'linear-gradient(135deg, #F5E6F2, #D4E4F4)',
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
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', background: '#E6F9F7', color: '#00A699', fontSize: '11px', fontWeight: 500, padding: '2px 7px', borderRadius: '999px' }}>
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" style={{ width: '11px', height: '11px' }}>
        <path fillRule="evenodd" d="M8 15A7 7 0 108 1a7 7 0 000 14zm3.844-8.791a.75.75 0 00-1.188-.918l-3.7 4.79-1.649-1.833a.75.75 0 10-1.114 1.004l2.25 2.5a.75.75 0 001.15-.086l4.25-5.5-.001-.002z" clipRule="evenodd" />
      </svg>
      Verified
    </span>
  )
}

// ── Types ─────────────────────────────────────────────────────────────────────

type Props = {
  profile: Profile
  sisterProfile: SisterProfile
  waliProfile: WaliProfile | null
  matches: SisterMatch[]
  connections: ConnectionWithProfile[]
  incomingInterests: InterestWithProfile[]
  notifications: Notification[]
  profileComplete: boolean
  completionPercentage: number
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function SisterDashboard({
  profile,
  sisterProfile,
  waliProfile,
  matches: initialMatches,
  connections: initialConnections,
  incomingInterests,
  notifications,
  profileComplete,
  completionPercentage,
}: Props) {
  const router = useRouter()
  const firstName = sisterProfile?.full_name?.split(' ')[0] ?? 'there'
  const initials = sisterProfile?.full_name?.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase() ?? '?'

  const [scrolled, setScrolled] = useState(false)
  const [avatarOpen, setAvatarOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 80)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (avatarOpen && !(e.target as Element).closest('[data-avatar-menu]')) {
        setAvatarOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [avatarOpen])

  const [matches, setMatches] = useState<SisterMatch[]>(initialMatches ?? [])
  const [connections, setConnections] = useState<ConnectionWithProfile[]>(initialConnections ?? [])
  const sisterPhotoCount = (sisterProfile?.photo_urls as string[])?.length ?? 0

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

  const [closeModalConnection, setCloseModalConnection] = useState<ConnectionWithProfile | null>(null)
  const [accepting, setAccepting] = useState(false)
  const [declining, setDeclining] = useState<string | null>(null)
  const [closing, setClosing] = useState(false)
  const [actionError, setActionError] = useState<string | null>(null)
  const [nikahCloseModal, setNikahCloseModal] = useState<ConnectionWithProfile | null>(null)
  const [nikahCloseReason, setNikahCloseReason] = useState<string>('')
  const [nikahClosing, setNikahClosing] = useState(false)
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
    if (sisterPhotoCount < 3) {
      setNeedsPhotosInterest(interest)
    } else {
      setAcceptModalInterest(interest)
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

  const handleCloseConnection = async (connectionId: string, reason?: string) => {
    const conn = connections.find(c => c.id === connectionId)
    if (!conn) return
    const result = await closeConnection(connectionId, reason)
    if (result?.error) {
      setActionError(result.error)
      return
    }
    setConnections(prev => prev.filter(c => c.id !== connectionId))
    setMatches(prev => prev.filter(m => m.brother_id !== conn.brother_id))
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
  const visibleInterests = incomingInterests.filter(i => !localDeclinedIds.has(i.id))
  const visibleNotifications = notifications.filter(n => !readNotifIds.has(n.id))
  const activeConns = connections.filter(c => c.status === 'active')
  const nikahConns = connections.filter(c => c.status === 'nikah_planning')
  const isInNikahPlanning = nikahConns.length > 0
  const visibleMatches = matches.filter(match => {
    const matchConn = connections.find(c => c.brother_id === match.brother_id && c.status === 'nikah_planning')
    return !matchConn
  })

  // Hero stats
  const matchCount = visibleMatches.length
  const connectionCount = activeConns.length
  const unreadCount = visibleNotifications.length

  // Daily ayah
  const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000)
  const todayAyah = AYAHS[dayOfYear % AYAHS.length]

  // Shared styles
  const sectionLabel: React.CSSProperties = {
    fontSize: '11px',
    fontWeight: 500,
    color: '#6B6080',
    textTransform: 'uppercase',
    letterSpacing: '0.1em',
    marginBottom: '10px',
  }

  const glassCard: React.CSSProperties = {
    background: 'rgba(255,255,255,0.85)',
    border: '1px solid rgba(175,77,152,0.12)',
    borderRadius: '16px',
  }

  return (
    <div style={{ background: 'linear-gradient(135deg, #F5E6F2, #F4E4BA)', minHeight: '100vh' }}>

      {/* ── Fixed top bar ────────────────────────────────────────── */}
      <div style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        height: '56px', display: 'flex', alignItems: 'center',
        justifyContent: 'space-between', padding: '0 20px',
        transition: 'background 0.3s ease, backdrop-filter 0.3s ease, box-shadow 0.3s ease',
        background: scrolled ? 'rgba(255,255,255,0.85)' : 'transparent',
        backdropFilter: scrolled ? 'blur(12px)' : 'none',
        WebkitBackdropFilter: scrolled ? 'blur(12px)' : 'none',
        boxShadow: scrolled ? '0 1px 0 rgba(175,77,152,0.1)' : 'none',
      }}>
        <span style={{ fontFamily: 'Noto Naskh Arabic, serif', fontSize: '22px', color: '#AF4D98' }}>نصيب</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            onClick={() => router.push('/dashboard/notifications')}
            style={{
              width: '34px', height: '34px', borderRadius: '50%',
              background: scrolled ? 'rgba(175,77,152,0.08)' : 'rgba(255,255,255,0.3)',
              border: scrolled ? '1px solid rgba(175,77,152,0.2)' : '1px solid rgba(255,255,255,0.4)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', position: 'relative', transition: 'all 0.3s ease',
            }}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#AF4D98" strokeWidth="1.5" strokeLinecap="round">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>
            {unreadCount > 0 && (
              <div style={{ position: 'absolute', top: '6px', right: '6px', width: '6px', height: '6px', background: '#AF4D98', borderRadius: '50%', border: scrolled ? '1.5px solid white' : '1.5px solid #F5E6F2' }} />
            )}
          </button>
          <div style={{ position: 'relative' }} data-avatar-menu>
            <button
              onClick={() => setAvatarOpen(v => !v)}
              style={{
                width: '34px', height: '34px', borderRadius: '50%',
                background: '#AF4D98',
                border: scrolled ? '2px solid rgba(175,77,152,0.3)' : '2px solid rgba(255,255,255,0.5)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '11px', fontWeight: 500, color: 'white',
                cursor: 'pointer', transition: 'all 0.3s ease',
              }}
            >
              {initials}
            </button>
            {avatarOpen && (
              <div style={{ position: 'absolute', top: 'calc(100% + 8px)', right: 0, background: 'white', border: '1px solid #EDE8E3', borderRadius: '16px', boxShadow: '0 4px 24px rgba(0,0,0,0.08)', minWidth: '200px', padding: '8px', zIndex: 200 }}>
                <div style={{ padding: '10px 12px 12px', borderBottom: '1px solid #EDE8E3', marginBottom: '4px' }}>
                  <p style={{ fontSize: '14px', fontWeight: 500, color: '#1A1A1A', marginBottom: '2px' }}>{firstName}</p>
                  <p style={{ fontSize: '12px', color: '#9B9B9B' }}>{completionPercentage}% complete</p>
                </div>
                {[
                  { label: 'My profile', href: '/dashboard/profile' },
                  { label: 'How it works', href: '/dashboard/how-it-works' },
                  { label: 'Verify identity', href: '/dashboard/verify' },
                ].map(item => (
                  <button key={item.href} onClick={() => { router.push(item.href); setAvatarOpen(false) }} style={{ display: 'block', width: '100%', padding: '9px 12px', fontSize: '14px', color: '#1A1A1A', background: 'transparent', border: 'none', textAlign: 'left', cursor: 'pointer', borderRadius: '10px' }}
                    onMouseEnter={e => { e.currentTarget.style.background = '#FDFAF7' }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}>
                    {item.label}
                  </button>
                ))}
                <div style={{ borderTop: '1px solid #EDE8E3', marginTop: '4px', paddingTop: '4px' }}>
                  <button onClick={async () => { const supabase = createClient(); await supabase.auth.signOut(); router.push('/auth/login') }} style={{ display: 'block', width: '100%', padding: '9px 12px', fontSize: '14px', color: '#C13515', background: 'transparent', border: 'none', textAlign: 'left', cursor: 'pointer', borderRadius: '10px' }}
                    onMouseEnter={e => { e.currentTarget.style.background = '#FDECEA' }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}>
                    Sign out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Hero Header ─────────────────────────────────────────── */}
      <div style={{ background: 'linear-gradient(160deg, #FDF8F3 0%, #F5E6F2 100%)', padding: '76px 20px 28px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, opacity: 0.03, backgroundImage: 'repeating-linear-gradient(45deg, white 0, white 1px, transparent 0, transparent 50%)', backgroundSize: '12px 12px', pointerEvents: 'none' }} />

        {/* Greeting + verification pill */}
        <div style={{ position: 'relative' }}>
          <p style={{ fontSize: '13px', color: '#7B4F6E', marginBottom: '6px' }}>Assalamu Alaikum,</p>
          <h1 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '52px', fontWeight: 400, color: '#1A1A1A', letterSpacing: '-0.02em', lineHeight: 1, marginBottom: '12px' }}>{firstName}</h1>
          {profile.verification_status === 'verified' ? (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', borderRadius: '999px', padding: '5px 14px', marginBottom: waliProfile ? '14px' : '20px', fontSize: '13px', background: 'rgba(175,77,152,0.15)', border: '1px solid rgba(175,77,152,0.3)', color: '#AF4D98' }}>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" style={{ width: '13px', height: '13px', flexShrink: 0 }}>
                <path fillRule="evenodd" d="M8 15A7 7 0 108 1a7 7 0 000 14zm3.844-8.791a.75.75 0 00-1.188-.918l-3.7 4.79-1.649-1.833a.75.75 0 10-1.114 1.004l2.25 2.5a.75.75 0 001.15-.086l4.25-5.5-.001-.002z" clipRule="evenodd" />
              </svg>
              Verified member
            </span>
          ) : profile.verification_status === 'pending' ? (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', borderRadius: '999px', padding: '5px 14px', marginBottom: waliProfile ? '14px' : '20px', fontSize: '13px', background: 'rgba(255,200,0,0.15)', border: '1px solid rgba(255,200,0,0.3)', color: '#7B4F6E' }}>
              Under review
            </span>
          ) : (
            <button onClick={() => router.push('/dashboard/verify')} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', borderRadius: '999px', padding: '5px 14px', marginBottom: waliProfile ? '14px' : '20px', fontSize: '13px', background: 'rgba(175,77,152,0.12)', border: '1px solid rgba(175,77,152,0.25)', color: '#AF4D98', cursor: 'pointer' }}>
              Verify now →
            </button>
          )}
        </div>

        {/* Wali badge */}
        {waliProfile && (
          <div data-testid="wali-status" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(175,77,152,0.12)', border: '1px solid rgba(175,77,152,0.2)', borderRadius: '999px', padding: '5px 12px', marginBottom: '18px', position: 'relative' }}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="#AF4D98" width="13" height="13">
              <path d="M10 8a3 3 0 100-6 3 3 0 000 6zM3.465 14.493a1.23 1.23 0 00.41 1.412A9.957 9.957 0 0010 18c2.31 0 4.438-.784 6.131-2.1.43-.333.604-.903.408-1.41a7.002 7.002 0 00-13.074.003z" />
            </svg>
            <span style={{ fontSize: '11px', color: '#9B7090' }}>Wali: {waliProfile.full_name} · Read-only access</span>
          </div>
        )}

        {/* Verse */}
        <div style={{ background: 'rgba(255,255,255,0.5)', border: '1px solid rgba(175,77,152,0.2)', borderRadius: '14px', padding: '14px 16px', marginBottom: '20px', position: 'relative' }}>
          <p style={{ fontFamily: 'Noto Naskh Arabic, serif', fontSize: '16px', color: '#AF4D98', marginBottom: '5px', letterSpacing: '0.02em', lineHeight: 1.5 }}>{todayAyah.arabic}</p>
          <p style={{ fontSize: '12px', color: '#5C5C5C', fontStyle: 'italic', lineHeight: 1.5, marginBottom: '3px' }}>&ldquo;{todayAyah.translation}&rdquo;</p>
          <p style={{ fontSize: '10px', color: '#9B7090', letterSpacing: '0.07em', textTransform: 'uppercase' }}>{todayAyah.reference}</p>
        </div>

        {/* Stats — 4-column grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px', position: 'relative' }}>
          {[
            { num: matchCount, label: 'Assigned Matches' },
            { num: connectionCount, label: 'Active Connections' },
            { num: unreadCount, label: 'Unread Notifications' },
            { num: `${completionPercentage}%`, label: 'Profile Completion' },
          ].map(stat => (
            <div key={stat.label} style={{ background: 'rgba(255,255,255,0.5)', border: '1px solid rgba(175,77,152,0.2)', borderRadius: '12px', padding: '14px 8px', textAlign: 'center' }}>
              <p style={{ fontSize: '28px', fontWeight: 500, color: '#1A1A1A', lineHeight: 1, marginBottom: '4px' }}>{stat.num}</p>
              <p style={{ fontSize: '9px', color: '#9B7090', whiteSpace: 'normal', lineHeight: 1.3, textAlign: 'center' }}>{stat.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Body ────────────────────────────────────────────────── */}
      <div className="px-4 lg:px-8 lg:grid lg:grid-cols-3 lg:gap-8 lg:items-start" style={{ maxWidth: '1100px', margin: '0 auto', paddingTop: '24px', paddingBottom: '24px' }}>

        {/* Left column */}
        <div className="space-y-4 lg:col-span-2">

          {/* ── Identity card — top of left column, always shows unless verified ── */}
          {profile.verification_status !== 'verified' && (
            <div style={{ marginBottom: '4px' }}>
              <p style={{ fontSize: '11px', fontWeight: 600, color: '#9B7090', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '10px' }}>Identity</p>
              <div style={{ background: 'rgba(255,255,255,0.85)', border: profile.verification_status === 'rejected' ? '1px solid #F5C6C6' : '1px solid rgba(175,77,152,0.12)', borderRadius: '16px', padding: '16px', display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div style={{ width: '42px', height: '42px', borderRadius: '50%', background: profile.verification_status === 'rejected' ? '#FDECEA' : '#F5E6F2', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={profile.verification_status === 'rejected' ? '#C13515' : '#AF4D98'} strokeWidth="1.5" strokeLinecap="round">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  </svg>
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: '14px', fontWeight: 500, color: '#1A1A1A', marginBottom: '3px' }}>
                    {profile.verification_status === 'pending' ? 'Verification under review' : profile.verification_status === 'rejected' ? 'Verification needs attention' : 'Verify your identity'}
                  </p>
                  <p style={{ fontSize: '12px', color: '#9B9B9B', lineHeight: 1.4 }}>
                    {profile.verification_status === 'pending' ? 'Our team will review within 24 hours, in sha Allah.' : profile.verification_status === 'rejected' ? `Reason: ${profile.verification_rejection_reason}` : 'A quick selfie to confirm your identity.'}
                  </p>
                </div>
                {profile.verification_status !== 'pending' && (
                  <button onClick={() => router.push('/dashboard/verify')} style={{ background: '#AF4D98', color: 'white', border: 'none', borderRadius: '999px', padding: '8px 16px', fontSize: '12px', fontWeight: 500, cursor: 'pointer', flexShrink: 0 }}>
                    {profile.verification_status === 'rejected' ? 'Resubmit →' : 'Verify now →'}
                  </button>
                )}
              </div>
            </div>
          )}

          {/* ── Nikah Planning ──────────────────────────────────── */}
          {nikahConns.length > 0 && (
            <section id="nikah" data-testid="nikah-connections-section">
              <p style={sectionLabel}>Nikah Planning</p>
              {/* Arabic blessing centered */}
              <div style={{ textAlign: 'center', marginBottom: '16px' }}>
                <p style={{ fontFamily: 'Noto Naskh Arabic, serif', fontSize: '22px', color: '#AF4D98' }}>بَارَكَ اللَّهُ لَكُمَا</p>
                <p style={{ fontSize: '13px', color: '#9B9B9B', marginTop: '4px' }}>May Allah bless your union.</p>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {nikahConns.map(conn => (
                  <div data-testid="nikah-connection-card" key={conn.id} style={{ ...glassCard, padding: '20px', border: '1px solid rgba(175,77,152,0.25)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                      <span style={{ fontSize: '18px', marginRight: '2px' }}>🤍</span>
                      <span style={{ fontSize: '15px', fontWeight: 500, color: '#1A1A1A', letterSpacing: '-0.01em' }}>{conn.other_name}</span>
                      <span style={{ marginLeft: 'auto', fontSize: '11px', fontWeight: 500, color: '#AF4D98', background: '#F5E6F2', padding: '3px 10px', borderRadius: '999px' }}>Nikah Planning</span>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', marginBottom: '12px' }}>
                      <Link href={`/dashboard/chat/${conn.id}`} style={{ textAlign: 'center', fontSize: '13px', fontWeight: 500, color: '#AF4D98', padding: '9px', textDecoration: 'none', background: 'rgba(175,77,152,0.08)', borderRadius: '999px' }}>Chat</Link>
                      <Link href={`/dashboard/profile/${conn.brother_id}?context=connection&connectionId=${conn.id}`} style={{ textAlign: 'center', fontSize: '13px', fontWeight: 500, color: '#5C5C5C', padding: '9px', textDecoration: 'none', background: 'rgba(175,77,152,0.06)', borderRadius: '999px' }}>Profile</Link>
                      <Link data-testid="view-nikah-plan-btn" href={`/dashboard/nikah/${conn.id}`} style={{ textAlign: 'center', fontSize: '13px', fontWeight: 500, color: 'white', padding: '9px', textDecoration: 'none', background: '#AF4D98', borderRadius: '999px' }}>View Plan</Link>
                    </div>
                    <div style={{ textAlign: 'center', paddingTop: '10px', borderTop: '1px solid rgba(175,77,152,0.1)' }}>
                      <button
                        onClick={() => { setNikahCloseReason(''); setNikahCloseModal(conn) }}
                        style={{ background: 'transparent', border: 'none', fontSize: '12px', color: '#C0B8B0', cursor: 'pointer', textDecoration: 'underline', textUnderlineOffset: '3px', padding: '4px 8px' }}
                      >
                        Close this connection
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {!isInNikahPlanning && (<>

          {/* ── Incoming Interests — shown first for sisters ──────── */}
          {visibleInterests.length > 0 && (
            <section id="interests" data-testid="pending-interests-section">
              <p style={sectionLabel}>New Interest</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {visibleInterests.map(interest => {
                  const op = interest.other_profile
                  const brotherFirstName = op?.full_name?.split(' ')[0] ?? 'Brother'
                  return (
                    <div
                      data-testid="pending-interest-card"
                      key={interest.id}
                      onClick={() => openInterestQuickView(interest)}
                      style={{
                        background: 'rgba(255,255,255,0.85)',
                        borderLeft: '3px solid #AF4D98',
                        borderTop: '1px solid rgba(175,77,152,0.12)',
                        borderRight: '1px solid rgba(175,77,152,0.12)',
                        borderBottom: '1px solid rgba(175,77,152,0.12)',
                        borderRadius: '0 16px 16px 0',
                        padding: '16px',
                        cursor: 'pointer',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '10px' }}>
                        {(op?.photo_urls?.[0] ?? op?.photo_url) ? (
                          <div style={{ width: '48px', height: '48px', borderRadius: '50%', overflow: 'hidden', flexShrink: 0 }}>
                            <Image
                              src={toBrotherPhotoUrl(op?.photo_urls?.[0] ?? op?.photo_url) ?? (op?.photo_urls?.[0] ?? op?.photo_url)!}
                              alt={brotherFirstName}
                              width={48}
                              height={48}
                              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            />
                          </div>
                        ) : (
                          <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: getAvatarGradient(op?.full_name), display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Cormorant Garamond, serif', fontSize: '20px', color: '#AF4D98', flexShrink: 0 }}>
                            {brotherFirstName[0]}
                          </div>
                        )}
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                            <p style={{ fontSize: '15px', fontWeight: 500, color: '#1A1A1A' }}>{brotherFirstName}</p>
                            {op?.verification_badge && <VerifiedBadge />}
                          </div>
                          <p style={{ fontSize: '12px', color: '#9B9B9B' }}>{[op?.age ? `${op.age} yrs` : null, op?.location].filter(Boolean).join(' · ')}</p>
                        </div>
                        <span style={{ marginLeft: 'auto', fontSize: '11px', color: '#AF4D98', fontWeight: 500, background: '#F5E6F2', padding: '3px 10px', borderRadius: '999px' }}>Interested</span>
                      </div>

                      {interest.intro_message && (
                        <div style={{ background: '#FDFAF7', borderRadius: '10px', padding: '10px 12px', marginBottom: '10px', border: '1px solid rgba(175,77,152,0.08)' }}>
                          <p style={{ fontSize: '11px', color: '#9B9B9B', marginBottom: '3px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>His message</p>
                          <p style={{ fontSize: '13px', color: '#1A1A1A', fontStyle: 'italic' }}>&ldquo;{interest.intro_message}&rdquo;</p>
                        </div>
                      )}

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
                        <Link
                          href={`/dashboard/profile/${interest.brother_id}?context=interest&interestId=${interest.id}`}
                          onClick={e => e.stopPropagation()}
                          style={{ textAlign: 'center', fontSize: '13px', fontWeight: 500, color: '#AF4D98', padding: '10px 0', textDecoration: 'none', background: 'rgba(175,77,152,0.08)', borderRadius: '999px' }}
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
                          style={{ background: '#AF4D98', color: 'white', border: 'none', borderRadius: '999px', padding: '10px', fontSize: '13px', fontWeight: 500, cursor: 'pointer' }}
                        >
                          Accept
                        </button>
                        <button
                          data-testid="decline-btn"
                          onClick={e => { e.stopPropagation(); handleDecline(interest.id) }}
                          disabled={declining === interest.id}
                          style={{ background: 'transparent', color: '#9B9B9B', border: '1px solid rgba(175,77,152,0.15)', borderRadius: '999px', padding: '10px', fontSize: '13px', cursor: 'pointer', opacity: declining === interest.id ? 0.6 : 1 }}
                        >
                          {declining === interest.id ? '…' : 'Decline'}
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>

              {actionError && (
                <div style={{ marginTop: '10px', background: '#FDECEA', border: '1px solid rgba(193,53,21,0.2)', borderRadius: '12px', padding: '12px', fontSize: '13px', color: '#C13515' }}>{actionError}</div>
              )}
            </section>
          )}

          {/* ── Matches ─────────────────────────────────────────── */}
          <section id="matches" data-testid="matches-section">
            <p style={sectionLabel}>Your Matches</p>

            {!profileComplete ? null : visibleMatches.length === 0 ? (
              <div style={{ ...glassCard, textAlign: 'center', padding: '48px 20px' }}>
                <p style={{ fontFamily: 'Noto Naskh Arabic, serif', fontSize: '32px', color: '#AF4D98', marginBottom: '12px', opacity: 0.4 }}>نصيب</p>
                <p style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '20px', fontWeight: 400, color: '#AF4D98', marginBottom: '8px' }}>Matches coming soon</p>
                <p style={{ fontSize: '14px', color: '#9B9B9B', lineHeight: 1.6, maxWidth: '260px', margin: '0 auto' }}>We will notify you when they are ready, in sha Allah.</p>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                {visibleMatches.map(match => {
                  const b = match.brother
                  const brotherFirstName = b?.full_name?.split(' ')[0] ?? 'Brother'
                  const matchConnection = connections.find(c => c.brother_id === match.brother_id)
                  const isConnected = !!matchConnection
                  const incomingFromThis = matchConnection ? null : incomingInterests.find(i => i.brother_id === match.brother_id && !localDeclinedIds.has(i.id))
                  const hasSent = !matchConnection && (match.interest?.status === 'pending' || localSentIds.includes(match.brother_id))

                  return (
                    <div
                      data-testid="match-card"
                      key={match.id}
                      onClick={() => openMatchQuickView(match)}
                      style={{
                        ...glassCard,
                        padding: '16px',
                        cursor: 'pointer',
                        border: isConnected ? '1.5px solid #AF4D98' : '1px solid rgba(175,77,152,0.12)',
                        background: isConnected ? 'rgba(245,230,242,0.9)' : 'rgba(255,255,255,0.85)',
                      }}
                    >
                      {/* 52px Avatar */}
                      {(b?.photo_urls?.[0] ?? b?.photo_url) ? (
                        <div style={{ width: '52px', height: '52px', borderRadius: '50%', overflow: 'hidden', marginBottom: '12px' }}>
                          <Image
                            src={toBrotherPhotoUrl(b?.photo_urls?.[0] ?? b?.photo_url) ?? (b?.photo_urls?.[0] ?? b?.photo_url)!}
                            alt={brotherFirstName}
                            width={52}
                            height={52}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          />
                        </div>
                      ) : (
                        <div style={{ width: '52px', height: '52px', borderRadius: '50%', background: getAvatarGradient(b?.full_name), display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Cormorant Garamond, serif', fontSize: '22px', color: '#AF4D98', marginBottom: '12px' }}>
                          {b?.full_name?.[0] ?? 'B'}
                        </div>
                      )}

                      {/* Name + verified */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '3px', flexWrap: 'wrap' }}>
                        <p style={{ fontSize: '15px', fontWeight: 500, color: isConnected ? '#AF4D98' : '#1A1A1A' }}>{brotherFirstName}</p>
                        {b?.verification_badge && <VerifiedBadge />}
                      </div>

                      {/* Meta */}
                      <p style={{ fontSize: '11px', color: '#9B9B9B', lineHeight: 1.4, marginBottom: '12px' }}>
                        {[b?.age ? `${b.age} yrs` : null, b?.location?.split(',')[0]].filter(Boolean).join(' · ')}
                      </p>

                      {/* CTA — full width */}
                      {isConnected ? (
                        <button
                          onClick={e => { e.stopPropagation(); router.push(`/dashboard/chat/${matchConnection!.id}`) }}
                          style={{ background: '#AF4D98', color: 'white', border: 'none', borderRadius: '999px', padding: '8px 12px', fontSize: '12px', fontWeight: 500, cursor: 'pointer', width: '100%' }}
                        >
                          Open chat
                        </button>
                      ) : hasSent ? (
                        <div style={{ background: '#F5E6F2', color: '#7B2F6E', fontSize: '11px', fontWeight: 500, padding: '8px 10px', borderRadius: '999px', textAlign: 'center', width: '100%' }}>
                          Awaiting response
                        </div>
                      ) : incomingFromThis ? (
                        <div style={{ display: 'flex', gap: '5px' }}>
                          <button
                            onClick={e => {
                              e.stopPropagation()
                              if (connectionsFull) setActionError('Close an active connection before accepting.')
                              else openAcceptOrPromptPhotos(incomingFromThis)
                            }}
                            style={{ flex: 1, background: '#AF4D98', color: 'white', border: 'none', borderRadius: '999px', padding: '7px 8px', fontSize: '11px', fontWeight: 500, cursor: 'pointer' }}
                          >
                            Accept
                          </button>
                          <button
                            onClick={e => { e.stopPropagation(); handleDecline(incomingFromThis.id) }}
                            disabled={declining === incomingFromThis.id}
                            style={{ flex: 1, background: 'transparent', color: '#9B9B9B', border: '1px solid rgba(175,77,152,0.15)', borderRadius: '999px', padding: '7px 8px', fontSize: '11px', cursor: 'pointer', opacity: declining === incomingFromThis.id ? 0.6 : 1 }}
                          >
                            {declining === incomingFromThis.id ? '…' : 'Decline'}
                          </button>
                        </div>
                      ) : (
                        <button
                          data-testid="express-interest-btn"
                          onClick={e => { e.stopPropagation(); openInterestModal(match.brother_id, match.sister_id, brotherFirstName) }}
                          disabled={connectionsFull}
                          title={connectionsFull ? 'Close an active connection before expressing new interest' : undefined}
                          style={{ background: '#AF4D98', color: 'white', border: 'none', borderRadius: '999px', padding: '8px 12px', fontSize: '12px', fontWeight: 500, cursor: connectionsFull ? 'not-allowed' : 'pointer', width: '100%', opacity: connectionsFull ? 0.5 : 1 }}
                        >
                          Express Interest
                        </button>
                      )}
                    </div>
                  )
                })}
              </div>
            )}

            {actionError && visibleInterests.length === 0 && (
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
              <div style={{ ...glassCard, padding: '24px', textAlign: 'center' }}>
                <p style={{ fontSize: '13px', color: '#9B9B9B', lineHeight: 1.5 }}>No active connections yet. When a match interest is accepted, a connection will appear here.</p>
              </div>
            ) : (
              <div>
                {activeConns.map(conn => (
                  <div
                    data-testid="connection-card"
                    key={conn.id}
                    style={{ ...glassCard, padding: '16px', marginBottom: '10px' }}
                  >
                    {/* Top row: avatar + info */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px' }}>
                      {/* Avatar */}
                      <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'linear-gradient(135deg, #C2477A, #E896B8)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Cormorant Garamond, serif', fontSize: '20px', color: 'white', flexShrink: 0 }}>
                        {conn.other_name?.[0] ?? '?'}
                      </div>
                      {/* Info */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontSize: '15px', fontWeight: 500, color: '#1A1A1A', marginBottom: '2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {conn.other_name?.split(' ')[0]}
                        </p>
                        <p style={{ fontSize: '11px', color: '#9B9B9B' }}>Active connection</p>
                      </div>
                    </div>

                    {/* Action buttons — 2fr 1fr 1fr grid */}
                    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '6px', marginBottom: '10px' }}>
                      <button
                        data-testid="open-chat-btn"
                        onClick={() => router.push(`/dashboard/chat/${conn.id}`)}
                        style={{ padding: '9px', background: '#AF4D98', color: 'white', border: 'none', borderRadius: '999px', fontSize: '12px', fontWeight: 500, cursor: 'pointer' }}
                      >
                        Open chat
                      </button>
                      <button
                        onClick={() => router.push(`/dashboard/profile/${conn.brother_id}?context=connection&connectionId=${conn.id}`)}
                        style={{ padding: '9px', background: 'rgba(175,77,152,0.1)', color: '#AF4D98', border: 'none', borderRadius: '999px', fontSize: '12px', fontWeight: 500, cursor: 'pointer' }}
                      >
                        Profile
                      </button>
                      <button
                        onClick={() => router.push(`/dashboard/meetings/${conn.id}`)}
                        style={{ padding: '9px', background: 'rgba(175,77,152,0.1)', color: '#AF4D98', border: 'none', borderRadius: '999px', fontSize: '12px', fontWeight: 500, cursor: 'pointer' }}
                      >
                        Meeting
                      </button>
                    </div>

                    {/* Close link */}
                    <div style={{ textAlign: 'center', paddingTop: '8px', borderTop: '1px solid rgba(175,77,152,0.08)' }}>
                      <button
                        onClick={() => { setActionError(null); setCloseModalConnection(conn) }}
                        style={{ background: 'transparent', border: 'none', fontSize: '11px', color: '#C0B8B0', cursor: 'pointer', textDecoration: 'underline', textUnderlineOffset: '3px', padding: '2px 8px' }}
                      >
                        Close connection
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          </>)}

        </div>{/* end left column */}

        {/* Right column */}
        <div className="space-y-4 lg:col-span-1 mt-4 lg:mt-0">

          {/* Profile checklist — simplified inline card */}
          {!isInNikahPlanning && completionPercentage < 80 && (
            <div style={{ background: 'rgba(255,255,255,0.85)', border: '1px solid rgba(175,77,152,0.12)', borderRadius: '16px', padding: '20px', marginBottom: '14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <p style={{ fontSize: '15px', fontWeight: 500, color: '#1A1A1A' }}>Profile completion</p>
                <span style={{ fontSize: '24px', fontWeight: 500, color: '#AF4D98', lineHeight: 1 }}>{completionPercentage}%</span>
              </div>
              <div style={{ height: '6px', background: 'rgba(175,77,152,0.12)', borderRadius: '3px', overflow: 'hidden', marginBottom: '14px' }}>
                <div style={{ height: '100%', width: `${completionPercentage}%`, background: 'linear-gradient(90deg, #AF4D98, #D66BA0)', borderRadius: '3px', transition: 'width 0.5s ease' }} />
              </div>
              <div style={{ background: 'rgba(175,77,152,0.06)', border: '1px solid rgba(175,77,152,0.15)', borderRadius: '10px', padding: '12px 14px', marginBottom: '16px', display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#AF4D98" strokeWidth="1.5" strokeLinecap="round" style={{ flexShrink: 0, marginTop: '1px' }}>
                  <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                <p style={{ fontSize: '13px', color: '#7B4F6E', lineHeight: 1.5, margin: 0 }}>
                  Matches are only unlocked once your profile reaches <strong>80%</strong>. You are {80 - completionPercentage}% away.
                </p>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <button
                  onClick={() => router.push('/onboarding')}
                  style={{ padding: '11px', background: '#AF4D98', color: 'white', border: 'none', borderRadius: '999px', fontSize: '13px', fontWeight: 500, cursor: 'pointer' }}
                >
                  Guided completion
                </button>
                <button
                  onClick={() => router.push('/dashboard/profile')}
                  style={{ padding: '11px', background: 'transparent', color: '#AF4D98', border: '1px solid #AF4D98', borderRadius: '999px', fontSize: '13px', fontWeight: 500, cursor: 'pointer' }}
                >
                  Edit by section
                </button>
              </div>
            </div>
          )}

          {/* ── Notifications ────────────────────────────────────── */}
          <section id="notifications" data-testid="notifications-section">
            <p style={sectionLabel}>Notifications</p>

            {visibleNotifications.length === 0 ? (
              <div style={{ ...glassCard, padding: '24px', textAlign: 'center' }}>
                <p style={{ fontSize: '13px', color: '#9B9B9B' }}>You&apos;re all caught up. May Allah bless your journey.</p>
              </div>
            ) : (
              <div style={{ ...glassCard, overflow: 'hidden' }}>
                {visibleNotifications.slice(0, 8).map((notif, idx) => (
                  <button
                    key={notif.id}
                    onClick={() => handleMarkRead(notif.id)}
                    style={{
                      width: '100%',
                      textAlign: 'left',
                      background: 'transparent',
                      border: 'none',
                      borderTop: idx === 0 ? 'none' : '1px solid rgba(175,77,152,0.08)',
                      padding: '14px 16px',
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
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 100, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
          <div style={{ background: 'white', borderRadius: '20px 20px 0 0', padding: '28px 24px', width: '100%', maxWidth: '480px' }}>
            <p style={{ fontFamily: 'Noto Naskh Arabic, serif', fontSize: '24px', color: '#AF4D98', textAlign: 'center', marginBottom: '4px' }}>نصيب</p>
            <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '22px', fontWeight: 400, textAlign: 'center', color: '#1A1A1A', marginBottom: '12px' }}>Add your photos first</h2>
            <p style={{ fontSize: '14px', color: '#9B9B9B', textAlign: 'center', lineHeight: 1.6, marginBottom: '8px' }}>
              To accept this interest you need at least 3 photos on your profile. You currently have{' '}
              <strong style={{ color: '#AF4D98' }}>{sisterPhotoCount} photo{sisterPhotoCount !== 1 ? 's' : ''}</strong>.
            </p>
            <p style={{ fontSize: '13px', color: '#9B9B9B', textAlign: 'center', lineHeight: 1.6, marginBottom: '24px' }}>
              Your photos are only shared with brothers whose interest you accept — they remain completely private otherwise.
            </p>
            <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', marginBottom: '24px' }}>
              {[0, 1, 2].map(i => (
                <div key={i} style={{ width: '72px', height: '90px', borderRadius: '10px', border: `1.5px dashed ${i < sisterPhotoCount ? '#AF4D98' : '#EDE8E3'}`, overflow: 'hidden', background: '#FDFAF7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {i < sisterPhotoCount ? (
                    <span style={{ fontSize: '20px', color: '#AF4D98' }}>✓</span>
                  ) : (
                    <span style={{ fontSize: '20px', color: '#EDE8E3' }}>+</span>
                  )}
                </div>
              ))}
            </div>
            <button
              onClick={() => { setNeedsPhotosInterest(null); router.push('/dashboard/profile/edit/photos') }}
              style={{ width: '100%', background: '#AF4D98', color: 'white', border: 'none', borderRadius: '999px', padding: '14px', fontSize: '15px', fontWeight: 500, cursor: 'pointer', marginBottom: '12px' }}
            >
              Add photos now →
            </button>
            <button
              onClick={() => setNeedsPhotosInterest(null)}
              style={{ width: '100%', background: 'transparent', border: 'none', color: '#9B9B9B', fontSize: '14px', cursor: 'pointer', padding: '8px' }}
            >
              Not now
            </button>
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
            <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '22px', fontWeight: 400, color: '#1A1A1A', textAlign: 'center', marginBottom: '8px' }}>Close nikah planning?</h2>
            <p style={{ fontSize: '14px', color: '#5C5C5C', textAlign: 'center', lineHeight: 1.6, marginBottom: '20px' }}>
              We understand that not every journey reaches its destination. May Allah ease your path and guide you to what is best, in sha Allah.
            </p>
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
              <div
                key={reason}
                onClick={() => setNikahCloseReason(reason)}
                style={{ padding: '11px 14px', borderRadius: '10px', border: `1px solid ${nikahCloseReason === reason ? '#AF4D98' : '#EDE8E3'}`, background: nikahCloseReason === reason ? '#F5E6F2' : 'white', cursor: 'pointer', marginBottom: '6px', fontSize: '13px', color: nikahCloseReason === reason ? '#AF4D98' : '#5C5C5C', transition: 'all 0.15s ease' }}
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
              <Link href="/dashboard/profile" className="block w-full text-center text-sm font-medium text-[#AF4D98] py-3">
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
                onClick={async () => {
                  if (!closeModalConnection) return
                  setClosing(true)
                  setActionError(null)
                  await handleCloseConnection(closeModalConnection.id)
                  setClosing(false)
                }}
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
    </div>
  )
}
