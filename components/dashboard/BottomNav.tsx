'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

function HomeIcon({ color }: { color: string }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  )
}

function UserIcon({ color }: { color: string }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  )
}

function BookIcon({ color }: { color: string }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round">
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
    </svg>
  )
}

function MailIcon({ color }: { color: string }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round">
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
      <polyline points="22,6 12,13 2,6" />
    </svg>
  )
}

type NavItem = {
  href: string
  label: string
  testId: string
  Icon: (props: { color: string }) => React.JSX.Element
}

const ITEMS: NavItem[] = [
  { href: '/dashboard', label: 'Dashboard', testId: 'nav-dashboard', Icon: HomeIcon },
  { href: '/dashboard/profile', label: 'Profile', testId: 'nav-profile', Icon: UserIcon },
  { href: '/dashboard/resources', label: 'Resources', testId: 'nav-resources', Icon: BookIcon },
  { href: '/dashboard/contact', label: 'Contact', testId: 'nav-contact', Icon: MailIcon },
]

export default function BottomNav() {
  const pathname = usePathname() ?? ''

  const isActive = (href: string) =>
    href === '/dashboard' ? pathname === '/dashboard' : pathname.startsWith(href)

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
        {ITEMS.map(item => {
          const active = isActive(item.href)
          const color = active ? '#AF4D98' : '#9B9B9B'
          return (
            <Link
              key={item.href}
              href={item.href}
              data-testid={item.testId}
              style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '2px',
                color,
                textDecoration: 'none',
              }}
            >
              <item.Icon color={color} />
              <span style={{ fontSize: '10px', fontWeight: active ? 500 : 400 }}>{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
