'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

type Props = {
  unreadCount: number
  nikahConnectionId: string | null
}

function HomeIcon({ active }: { active: boolean }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill={active ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={1.5} style={{ width: '22px', height: '22px' }}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
    </svg>
  )
}

function PersonIcon({ active }: { active: boolean }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill={active ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={1.5} style={{ width: '22px', height: '22px' }}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
    </svg>
  )
}

function ChatIcon({ active }: { active: boolean }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill={active ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={1.5} style={{ width: '22px', height: '22px' }}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
    </svg>
  )
}

function BellIcon({ active }: { active: boolean }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill={active ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={1.5} style={{ width: '22px', height: '22px' }}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
    </svg>
  )
}

function MoreIcon({ active }: { active: boolean }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill={active ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={1.5} style={{ width: '22px', height: '22px' }}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
    </svg>
  )
}

export default function BottomNav({ unreadCount, nikahConnectionId }: Props) {
  const pathname = usePathname()

  const chatHref = nikahConnectionId
    ? `/dashboard/nikah/${nikahConnectionId}`
    : '/dashboard#connections'

  const chatActive = pathname.startsWith('/dashboard/chat/') || pathname.startsWith('/dashboard/nikah/')
  const homeActive = pathname === '/dashboard'
  const profileActive = pathname.startsWith('/dashboard/profile')
  const alertsActive = pathname.startsWith('/dashboard/notifications')
  const moreActive = pathname.startsWith('/dashboard/how-it-works')

  return (
    <nav
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        background: 'white',
        borderTop: '1px solid #EDE8E3',
        paddingBottom: 'env(safe-area-inset-bottom)',
        zIndex: 40,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'stretch', height: '56px', maxWidth: '600px', margin: '0 auto' }}>

        {/* Home */}
        <Link
          href="/dashboard"
          data-testid="nav-home"
          style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '2px', color: homeActive ? '#AF4D98' : '#9B9B9B', textDecoration: 'none' }}
        >
          <HomeIcon active={homeActive} />
          <span style={{ fontSize: '10px', fontWeight: homeActive ? 500 : 400 }}>Home</span>
        </Link>

        {/* Profile */}
        <Link
          href="/dashboard/profile"
          data-testid="nav-profile"
          style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '2px', color: profileActive ? '#AF4D98' : '#9B9B9B', textDecoration: 'none' }}
        >
          <PersonIcon active={profileActive} />
          <span style={{ fontSize: '10px', fontWeight: profileActive ? 500 : 400 }}>Profile</span>
        </Link>

        {/* Chat */}
        <Link
          href={chatHref}
          data-testid="nav-chat"
          style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '2px', color: chatActive ? '#AF4D98' : '#9B9B9B', textDecoration: 'none' }}
        >
          <ChatIcon active={chatActive} />
          <span style={{ fontSize: '10px', fontWeight: chatActive ? 500 : 400 }}>Chat</span>
        </Link>

        {/* Alerts */}
        <Link
          href="/dashboard/notifications"
          data-testid="nav-notifications"
          style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '2px', color: alertsActive ? '#AF4D98' : '#9B9B9B', textDecoration: 'none', position: 'relative' }}
        >
          <div style={{ position: 'relative' }}>
            <BellIcon active={alertsActive} />
            {unreadCount > 0 && (
              <span
                style={{
                  position: 'absolute',
                  top: '-2px',
                  right: '-2px',
                  width: '7px',
                  height: '7px',
                  background: '#AF4D98',
                  borderRadius: '50%',
                  border: '1.5px solid white',
                }}
              />
            )}
          </div>
          <span style={{ fontSize: '10px', fontWeight: alertsActive ? 500 : 400 }}>Alerts</span>
        </Link>

        {/* More */}
        <Link
          href="/dashboard/how-it-works"
          data-testid="nav-more"
          style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '2px', color: moreActive ? '#AF4D98' : '#9B9B9B', textDecoration: 'none' }}
        >
          <MoreIcon active={moreActive} />
          <span style={{ fontSize: '10px', fontWeight: moreActive ? 500 : 400 }}>More</span>
        </Link>

      </div>
    </nav>
  )
}
