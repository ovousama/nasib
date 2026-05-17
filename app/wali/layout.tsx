import { redirect } from 'next/navigation'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { createAdminClient } from '@/lib/supabase-admin'
import WaliTopBar from '@/components/wali/WaliTopBar'

export default async function WaliLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/auth/login')
  if (user.app_metadata?.role !== 'wali') redirect('/dashboard')

  // Fetch wali profile using admin client (bypasses RLS)
  const admin = createAdminClient()
  const { data: waliProfile } = await admin
    .from('wali_profiles')
    .select('sister_id, full_name')
    .eq('email', user.email!)
    .single()

  if (!waliProfile) redirect('/auth/login')

  // Fetch sister's name — we show "Viewing [Sister]'s journey" not the wali's name
  const { data: sisterProfile } = await admin
    .from('sister_profiles')
    .select('full_name')
    .eq('id', waliProfile.sister_id)
    .single()

  const sisterFirstName = sisterProfile?.full_name?.split(' ')[0] ?? 'Sister'

  return (
    <div className="min-h-screen bg-[#FDF8F3] flex flex-col max-w-lg mx-auto">
      <WaliTopBar sisterName={sisterFirstName} />

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
