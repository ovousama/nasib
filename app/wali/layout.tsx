import { redirect } from 'next/navigation'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { getWaliForCurrentUser } from '@/lib/database'
import WaliTopBar from '@/components/wali/WaliTopBar'

export default async function WaliLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/auth/login')
  if (user.app_metadata?.role !== 'wali') redirect('/dashboard')

  const waliProfile = await getWaliForCurrentUser()
  if (!waliProfile) redirect('/auth/login')

  const sisterName = waliProfile.full_name.split(' ')[0]

  return (
    <div className="min-h-screen bg-[#FDFAF7] flex flex-col max-w-lg mx-auto">
      <WaliTopBar sisterName={sisterName} />

      {/* Read-only observer banner */}
      <div className="bg-[#F5E6F2] border-b border-[#AF4D98]/10 px-6 py-2.5">
        <p className="text-xs text-[#AF4D98] font-medium text-center">
          👁 You have read-only access. You are here as a trusted observer.
        </p>
      </div>

      <main className="flex-1 pb-8">
        {children}
      </main>
    </div>
  )
}
