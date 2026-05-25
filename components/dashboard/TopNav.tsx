'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase'

type Props = {
  unreadCount: number
  firstName: string
  initials: string
  completionPercentage: number
}

const NAV_ITEMS = [
  { label: 'Dashboard', href: '/dashboard' },
  { label: 'Profile', href: '/dashboard/profile' },
  { label: 'Resources', href: '/dashboard/resources' },
  { label: 'Contact Us', href: '/dashboard/contact' },
]

const MENU_ITEMS = [
  { label: 'Verify identity', href: '/dashboard/verify' },
  { label: 'How it works', href: '/dashboard/how-it-works' },
  { label: 'Privacy & data', href: '/dashboard/privacy' },
  { label: 'Settings', href: '/dashboard/settings' },
]

export default function TopNav({ unreadCount, firstName, initials, completionPercentage }: Props) {
  const router = useRouter()
  const pathname = usePathname()
  const [scrolled, setScrolled] = useState(false)
  const [avatarOpen, setAvatarOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const mobileMenuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (!avatarOpen) return
      const target = e.target as Node
      const desktopHit = menuRef.current?.contains(target)
      const mobileHit = mobileMenuRef.current?.contains(target)
      if (!desktopHit && !mobileHit) setAvatarOpen(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [avatarOpen])

  const isActive = (href: string) => {
    if (href === '/dashboard') return pathname === '/dashboard'
    return pathname?.startsWith(href) ?? false
  }

  async function handleSignOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/auth/login')
  }

  const navBgWhenScrolled = 'rgba(255,255,255,0.85)'
  const bellPillBg = scrolled ? 'rgba(175,77,152,0.08)' : 'rgba(255,255,255,0.25)'

  return (
    <>
      {/* ── DESKTOP ──────────────────────────────────────────────────────── */}
      <nav
        className="hidden lg:flex"
        style={{
          position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
          height: '60px',
          alignItems: 'center', justifyContent: 'space-between',
          padding: '0 32px',
          transition: 'background 0.3s ease, backdrop-filter 0.3s ease, box-shadow 0.3s ease',
          background: scrolled ? navBgWhenScrolled : 'transparent',
          backdropFilter: scrolled ? 'blur(12px)' : 'none',
          WebkitBackdropFilter: scrolled ? 'blur(12px)' : 'none',
          boxShadow: scrolled ? '0 1px 0 rgba(175,77,152,0.1)' : 'none',
        }}
      >
        <button
          onClick={() => router.push('/dashboard')}
          style={{
            background: 'transparent', border: 'none', cursor: 'pointer',
            fontFamily: 'Noto Naskh Arabic, serif',
            fontSize: '24px', color: '#AF4D98', padding: 0,
          }}
        >
          نصيب
        </button>

        <div style={{ display: 'flex', gap: '4px' }}>
          {NAV_ITEMS.map(item => {
            const active = isActive(item.href)
            return (
              <button
                key={item.href}
                onClick={() => router.push(item.href)}
                onMouseEnter={e => {
                  if (!active) {
                    e.currentTarget.style.background = 'rgba(175,77,152,0.08)'
                    e.currentTarget.style.color = '#AF4D98'
                  }
                }}
                onMouseLeave={e => {
                  if (!active) {
                    e.currentTarget.style.background = 'transparent'
                    e.currentTarget.style.color = '#5C5C5C'
                  }
                }}
                style={{
                  background: active ? 'rgba(175,77,152,0.12)' : 'transparent',
                  color: active ? '#AF4D98' : '#5C5C5C',
                  border: 'none', borderRadius: '999px',
                  padding: '8px 18px',
                  fontSize: '14px', fontWeight: active ? 500 : 400,
                  cursor: 'pointer', transition: 'all 0.15s ease',
                }}
              >
                {item.label}
              </button>
            )
          })}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            onClick={() => router.push('/dashboard/notifications')}
            style={{
              width: '36px', height: '36px', borderRadius: '50%',
              background: bellPillBg,
              border: '0.5px solid rgba(175,77,152,0.2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', position: 'relative', transition: 'all 0.3s ease',
            }}
            aria-label="Notifications"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#AF4D98" strokeWidth="1.5" strokeLinecap="round">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>
            {unreadCount > 0 && (
              <div style={{
                position: 'absolute', top: '7px', right: '7px',
                width: '7px', height: '7px',
                background: '#AF4D98', borderRadius: '50%',
                border: '1.5px solid white',
              }} />
            )}
          </button>

          <div ref={menuRef} style={{ position: 'relative' }}>
            <button
              onClick={() => setAvatarOpen(v => !v)}
              style={{
                width: '36px', height: '36px', borderRadius: '50%',
                background: 'linear-gradient(135deg, #AF4D98, #D66BA0)',
                border: '1.5px solid rgba(255,255,255,0.6)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '12px', fontWeight: 500, color: 'white', cursor: 'pointer',
              }}
              aria-label="Account menu"
            >
              {initials}
            </button>

            {avatarOpen && (
              <div style={{
                position: 'absolute', top: 'calc(100% + 10px)', right: 0,
                background: 'white', border: '1px solid #EDE8E3',
                borderRadius: '16px', boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
                minWidth: '220px', padding: '8px', zIndex: 200,
              }}>
                <div style={{ padding: '10px 14px 14px', borderBottom: '1px solid #EDE8E3', marginBottom: '4px' }}>
                  <p style={{ fontSize: '14px', fontWeight: 500, color: '#1A1A1A', margin: '0 0 2px' }}>{firstName}</p>
                  <p style={{ fontSize: '12px', color: '#9B9B9B', margin: 0 }}>Profile {completionPercentage}% complete</p>
                </div>
                {MENU_ITEMS.map(item => (
                  <button
                    key={item.href}
                    onClick={() => { router.push(item.href); setAvatarOpen(false) }}
                    onMouseEnter={e => { e.currentTarget.style.background = '#FDFAF7' }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}
                    style={{
                      display: 'block', width: '100%', padding: '10px 14px',
                      fontSize: '14px', color: '#1A1A1A', background: 'transparent',
                      border: 'none', textAlign: 'left', cursor: 'pointer',
                      borderRadius: '10px', transition: 'background 0.15s ease',
                    }}
                  >
                    {item.label}
                  </button>
                ))}
                <div style={{ borderTop: '1px solid #EDE8E3', marginTop: '4px', paddingTop: '4px' }}>
                  <button
                    onClick={handleSignOut}
                    onMouseEnter={e => { e.currentTarget.style.background = '#FDECEA' }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}
                    style={{
                      display: 'block', width: '100%', padding: '10px 14px',
                      fontSize: '14px', color: '#C13515', background: 'transparent',
                      border: 'none', textAlign: 'left', cursor: 'pointer',
                      borderRadius: '10px', transition: 'background 0.15s ease',
                    }}
                  >
                    Sign out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* ── MOBILE ───────────────────────────────────────────────────────── */}
      <nav
        className="flex lg:hidden"
        style={{
          position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
          height: '56px',
          alignItems: 'center', justifyContent: 'space-between',
          padding: '0 20px',
          transition: 'background 0.3s ease, backdrop-filter 0.3s ease, box-shadow 0.3s ease',
          background: scrolled ? navBgWhenScrolled : 'transparent',
          backdropFilter: scrolled ? 'blur(12px)' : 'none',
          WebkitBackdropFilter: scrolled ? 'blur(12px)' : 'none',
          boxShadow: scrolled ? '0 1px 0 rgba(175,77,152,0.1)' : 'none',
        }}
      >
        <button
          onClick={() => router.push('/dashboard')}
          style={{
            background: 'transparent', border: 'none', cursor: 'pointer',
            fontFamily: 'Noto Naskh Arabic, serif',
            fontSize: '22px', color: '#AF4D98', padding: 0,
          }}
        >
          نصيب
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            onClick={() => router.push('/dashboard/notifications')}
            style={{
              width: '34px', height: '34px', borderRadius: '50%',
              background: bellPillBg,
              border: '0.5px solid rgba(175,77,152,0.2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', position: 'relative',
            }}
            aria-label="Notifications"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#AF4D98" strokeWidth="1.5" strokeLinecap="round">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>
            {unreadCount > 0 && (
              <div style={{
                position: 'absolute', top: '6px', right: '6px',
                width: '6px', height: '6px',
                background: '#AF4D98', borderRadius: '50%',
                border: '1.5px solid white',
              }} />
            )}
          </button>

          <div ref={mobileMenuRef} style={{ position: 'relative' }}>
            <button
              onClick={() => setAvatarOpen(v => !v)}
              style={{
                width: '34px', height: '34px', borderRadius: '50%',
                background: 'linear-gradient(135deg, #AF4D98, #D66BA0)',
                border: '1.5px solid rgba(255,255,255,0.6)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '11px', fontWeight: 500, color: 'white', cursor: 'pointer',
              }}
              aria-label="Account menu"
            >
              {initials}
            </button>

            {avatarOpen && (
              <div style={{
                position: 'absolute', top: 'calc(100% + 8px)', right: 0,
                background: 'white', border: '1px solid #EDE8E3',
                borderRadius: '16px', boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
                minWidth: '200px', padding: '8px', zIndex: 200,
              }}>
                <div style={{ padding: '10px 14px 12px', borderBottom: '1px solid #EDE8E3', marginBottom: '4px' }}>
                  <p style={{ fontSize: '14px', fontWeight: 500, color: '#1A1A1A', margin: '0 0 2px' }}>{firstName}</p>
                  <p style={{ fontSize: '12px', color: '#9B9B9B', margin: 0 }}>{completionPercentage}% complete</p>
                </div>
                {MENU_ITEMS.map(item => (
                  <button
                    key={item.href}
                    onClick={() => { router.push(item.href); setAvatarOpen(false) }}
                    style={{
                      display: 'block', width: '100%', padding: '10px 14px',
                      fontSize: '14px', color: '#1A1A1A', background: 'transparent',
                      border: 'none', textAlign: 'left', cursor: 'pointer',
                      borderRadius: '10px',
                    }}
                  >
                    {item.label}
                  </button>
                ))}
                <div style={{ borderTop: '1px solid #EDE8E3', marginTop: '4px', paddingTop: '4px' }}>
                  <button
                    onClick={handleSignOut}
                    style={{
                      display: 'block', width: '100%', padding: '10px 14px',
                      fontSize: '14px', color: '#C13515', background: 'transparent',
                      border: 'none', textAlign: 'left', cursor: 'pointer',
                      borderRadius: '10px',
                    }}
                  >
                    Sign out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </nav>
    </>
  )
}
