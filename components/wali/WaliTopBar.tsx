'use client'

import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import NasibLogo from '@/components/ui/NasibLogo'

type Props = { sisterName: string }

export default function WaliTopBar({ sisterName }: Props) {
  const router = useRouter()

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/auth/login')
  }

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-[#EDE8E3] px-6 h-14 flex items-center justify-between">
      <div className="flex items-center gap-2.5">
        <NasibLogo size="sm" theme="light" />
        <span className="w-px h-4 bg-[#EDE8E3]" />
        <span className="text-sm text-[#5C5C5C]">
          Viewing <span className="font-medium text-[#1A1A1A]">{sisterName}&apos;s</span> journey
        </span>
      </div>
      <button
        onClick={handleSignOut}
        className="text-sm text-[#9B9B9B] hover:text-[#1A1A1A] font-medium transition-colors"
      >
        Sign out
      </button>
    </header>
  )
}
