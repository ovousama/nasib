import { redirect } from 'next/navigation'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { getUnreadNotificationCount } from '@/lib/database'
import TopBar from '@/components/dashboard/TopBar'
import DashboardShell from '@/components/dashboard/DashboardShell'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/auth/login')

  const unreadCount = await getUnreadNotificationCount(user.id)

  return (
    <div className="min-h-screen bg-[#FDFAF7] flex flex-col max-w-lg mx-auto">
      <TopBar />
      <DashboardShell userId={user.id} initialUnreadCount={unreadCount}>
        {children}
      </DashboardShell>
    </div>
  )
}
