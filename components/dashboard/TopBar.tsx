'use client'

import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import NasibLogo from '@/components/ui/NasibLogo'

export default function TopBar() {
  const router = useRouter()

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/auth/login')
  }

  return (
    <header
      className="sticky top-0 z-40 bg-white border-b border-[#EDE8E3]"
      style={{ height: '52px', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'sticky', top: 0 }}
    >
      <NasibLogo size="sm" theme="light" />
      <button
        data-testid="signout-button"
        onClick={handleSignOut}
        className="text-sm text-[#9B9B9B] hover:text-[#5C5C5C] transition-colors"
        style={{ position: 'absolute', right: '16px' }}
      >
        Sign out
      </button>
    </header>
  )
}
