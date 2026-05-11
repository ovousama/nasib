import { redirect } from 'next/navigation'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { getAllNotifications } from '@/lib/database'
import NotificationsCenter from '@/components/dashboard/NotificationsCenter'

export default async function NotificationsPage() {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const notifications = await getAllNotifications(user.id)

  return <NotificationsCenter notifications={notifications} />
}
