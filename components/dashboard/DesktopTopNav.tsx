'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import NasibLogo from '@/components/ui/NasibLogo'

type Props = {
  unreadCount: number
  nikahConnectionId: string | null
  initials: string
}

export default function DesktopTopNav({ unreadCount, nikahConnectionId, initials }: Props) {
  const pathname = usePathname()
  const router = useRouter()
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false)
      }
    }
    if (dropdownOpen) document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [dropdownOpen])

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/')
  }

  function isActive(href: string) {
    if (href === '/dashboard') return pathname === '/dashboard'
    return pathname.startsWith(href)
  }

  const navLinks = [
    { label: 'Home', href: '/dashboard' },
    { label: 'Matches', href: '/dashboard#matches' },
    { label: 'Connections', href: '/dashboard#connections' },
    { label: 'Notifications', href: '/dashboard/notifications' },
    { label: 'How it works', href: '/dashboard/how-it-works' },
  ]

  return (
    <nav className="hidden lg:flex fixed top-0 left-0 right-0 z-50 bg-white border-b border-[#EDE8E3] h-16 items-center px-8 gap-8">
      {/* Logo */}
      <Link href="/dashboard" className="flex-shrink-0">
        <NasibLogo size="sm" theme="light" />
      </Link>

      {/* Center nav links */}
      <div className="flex items-center gap-6 flex-1 justify-center">
        {navLinks.map(link => {
          const href = link.href.split('#')[0]
          const active = isActive(href)
          return (
            <Link
              key={link.href}
              href={link.href}
              style={{ textDecoration: 'none', transition: 'color 0.15s ease' }}
              className={`text-[14px] whitespace-nowrap ${active ? 'text-[#AF4D98] font-medium' : 'text-[#5C5C5C] font-normal hover:text-[#AF4D98]'}`}
            >
              {link.label}
            </Link>
          )
        })}
        {nikahConnectionId && (
          <Link
            href={`/dashboard/nikah/${nikahConnectionId}`}
            style={{ textDecoration: 'none', transition: 'color 0.15s ease' }}
            className={`text-[14px] whitespace-nowrap font-medium ${pathname.startsWith('/dashboard/nikah') ? 'text-[#AF4D98]' : 'text-[#AF4D98] hover:text-[#9B3D85]'}`}
          >
            🤍 Nikah Planning
          </Link>
        )}
      </div>

      {/* Right side */}
      <div className="flex items-center gap-4 flex-shrink-0">
        {/* Notification bell */}
        <Link href="/dashboard/notifications" className="relative text-[#5C5C5C] hover:text-[#AF4D98] transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
          </svg>
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-[#AF4D98] rounded-full" />
          )}
        </Link>

        {/* Avatar + dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen(v => !v)}
            className="w-8 h-8 rounded-full bg-[#F5E6F2] flex items-center justify-center text-[#AF4D98] text-xs font-semibold hover:bg-[#EDD5E8] transition-colors"
            aria-label="Profile menu"
          >
            {initials}
          </button>
          {dropdownOpen && (
            <div className="absolute right-0 top-10 bg-white border border-[#EDE8E3] rounded-xl shadow-lg min-w-[180px] py-1 z-50">
              <Link
                href="/dashboard/profile"
                onClick={() => setDropdownOpen(false)}
                className="block px-4 py-2.5 text-sm text-[#1A1A1A] hover:bg-[#FAF4EE] transition-colors"
              >
                My profile
              </Link>
              <Link
                href="/dashboard/how-it-works"
                onClick={() => setDropdownOpen(false)}
                className="block px-4 py-2.5 text-sm text-[#1A1A1A] hover:bg-[#FAF4EE] transition-colors"
              >
                How it works
              </Link>
              <div className="border-t border-[#EDE8E3] my-1" />
              <button
                onClick={handleSignOut}
                className="block w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-[#FAF4EE] transition-colors"
              >
                Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  )
}
