import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { getUnreadNotificationCount } from '@/lib/database'
import DashboardShell from '@/components/dashboard/DashboardShell'

export const metadata: Metadata = {
  title: 'Naseeb · Seek with sincerity',
}

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/auth/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('gender, profile_completion_percentage')
    .eq('id', user.id)
    .single()

  const namePromise = profile?.gender === 'brother'
    ? supabase.from('brother_profiles').select('full_name').eq('id', user.id).maybeSingle()
    : profile?.gender === 'sister'
      ? supabase.from('sister_profiles').select('full_name').eq('id', user.id).maybeSingle()
      : Promise.resolve({ data: null })

  const [unreadCount, { data: nameRow }] = await Promise.all([
    getUnreadNotificationCount(user.id),
    namePromise,
  ])

  const fullName = (nameRow?.full_name as string | undefined) ?? ''
  const firstName = fullName.split(' ')[0] || 'there'
  const initials = fullName
    .split(' ')
    .filter(Boolean)
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || 'N'

  return (
    <div className="min-h-screen bg-[#F5F0FB]">
      <DashboardShell
        userId={user.id}
        initialUnreadCount={unreadCount}
        firstName={firstName}
        initials={initials}
        completionPercentage={profile?.profile_completion_percentage ?? 0}
      >
        {children}
      </DashboardShell>
    </div>
  )
}
