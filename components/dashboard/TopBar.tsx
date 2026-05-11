'use client'

import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'

export default function TopBar() {
  const router = useRouter()

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/auth/login')
  }

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-[#EBEBEB] px-6 h-14 flex items-center justify-between">
      <span className="text-lg font-semibold tracking-tight text-[#AF4D98]">
        Nasib
      </span>
      <button
        onClick={handleSignOut}
        className="text-sm text-[#6B6B6B] hover:text-[#1A1A1A] font-medium transition-colors"
      >
        Sign out
      </button>
    </header>
  )
}
