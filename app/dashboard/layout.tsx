import { redirect } from 'next/navigation'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { getUnreadNotificationCount } from '@/lib/database'
import TopBar from '@/components/dashboard/TopBar'
import DashboardShell from '@/components/dashboard/DashboardShell'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/auth/login')

  const [unreadCount, { data: nikahConn }] = await Promise.all([
    getUnreadNotificationCount(user.id),
    supabase
      .from('connections')
      .select('id')
      .eq('status', 'nikah_planning')
      .or(`brother_id.eq.${user.id},sister_id.eq.${user.id}`)
      .limit(1)
      .maybeSingle(),
  ])

  return (
    <div className="min-h-screen bg-[#FDF8F3] flex flex-col max-w-lg mx-auto">
      <TopBar />
      <DashboardShell userId={user.id} initialUnreadCount={unreadCount} nikahConnectionId={nikahConn?.id ?? null}>
        {children}
      </DashboardShell>
    </div>
  )
}
