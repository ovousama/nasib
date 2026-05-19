import { redirect } from 'next/navigation'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { getUnreadNotificationCount } from '@/lib/database'
import TopBar from '@/components/dashboard/TopBar'
import DashboardShell from '@/components/dashboard/DashboardShell'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/auth/login')

  const [unreadCount, { data: nikahConn }, { data: profile }] = await Promise.all([
    getUnreadNotificationCount(user.id),
    supabase
      .from('connections')
      .select('id')
      .eq('status', 'nikah_planning')
      .or(`brother_id.eq.${user.id},sister_id.eq.${user.id}`)
      .limit(1)
      .maybeSingle(),
    supabase.from('profiles').select('gender').eq('id', user.id).single(),
  ])

  let initials = '?'
  if (profile?.gender) {
    const table = profile.gender === 'brother' ? 'brother_profiles' : 'sister_profiles'
    const { data: gp } = await supabase.from(table).select('full_name').eq('id', user.id).single()
    if (gp?.full_name) {
      initials = gp.full_name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()
    }
  }

  return (
    <div className="min-h-screen bg-[#FDF8F3]">
      {/* Mobile top bar — hidden on desktop */}
      <div className="lg:hidden">
        <TopBar />
      </div>
      {/* Desktop spacer for fixed nav (64px) */}
      <div className="hidden lg:block h-16" />
      <DashboardShell
        userId={user.id}
        initialUnreadCount={unreadCount}
        nikahConnectionId={nikahConn?.id ?? null}
        initials={initials}
      >
        {children}
      </DashboardShell>
    </div>
  )
}
