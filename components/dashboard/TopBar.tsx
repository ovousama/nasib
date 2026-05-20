'use client'

import Link from 'next/link'
import NasibLogo from '@/components/ui/NasibLogo'

type Props = {
  initials: string
}

export default function TopBar({ initials }: Props) {
  return (
    <header
      className="sticky top-0 z-40 bg-white"
      style={{ height: '56px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 1px 0 #EDE8E3' }}
    >
      <NasibLogo size="sm" theme="light" />
      <Link
        href="/dashboard/profile"
        className="absolute right-4 w-8 h-8 rounded-full bg-[#F5E6F2] flex items-center justify-center text-[#AF4D98] text-xs font-semibold hover:bg-[#EDD5E8] transition-colors"
        aria-label="My profile"
      >
        {initials}
      </Link>
    </header>
  )
}
