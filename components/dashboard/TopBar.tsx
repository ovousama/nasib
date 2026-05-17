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
    <header className="sticky top-0 z-40 bg-white border-b border-[#EDE8E3] px-6 h-[52px] flex items-center justify-between">
      <span className="text-[18px] font-medium tracking-[-0.02em] text-[#AF4D98]">
        Nasib
      </span>
      <button
        data-testid="signout-button"
        onClick={handleSignOut}
        className="text-sm text-[#9B9B9B] hover:text-[#5C5C5C] transition-colors"
      >
        Sign out
      </button>
    </header>
  )
}
