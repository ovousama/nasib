import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { createServerSupabaseClient } from '@/lib/supabase-server'

export const metadata: Metadata = {
  title: 'Naseeb · Seek with sincerity',
}
import { getUnreadNotificationCount } from '@/lib/database'
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
    <div className="min-h-screen bg-[#F5F0FB]">
      <DashboardShell
        userId={user.id}
        initialUnreadCount={unreadCount}
        nikahConnectionId={nikahConn?.id ?? null}
      >
        {children}
      </DashboardShell>
    </div>
  )
}
