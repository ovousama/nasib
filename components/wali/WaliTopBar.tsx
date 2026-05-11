'use client'

import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'

type Props = { sisterName: string }

export default function WaliTopBar({ sisterName }: Props) {
  const router = useRouter()

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/auth/login')
  }

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-[#EBEBEB] px-6 h-14 flex items-center justify-between">
      <div className="flex items-center gap-2.5">
        <span className="text-xs font-semibold text-[#9B9B9B] tracking-widest uppercase">WALI VIEW</span>
        <span className="w-px h-4 bg-[#EBEBEB]" />
        <span className="text-sm text-[#6B6B6B]">
          Viewing <span className="font-semibold text-[#1A1A1A]">{sisterName}&apos;s</span> journey
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
