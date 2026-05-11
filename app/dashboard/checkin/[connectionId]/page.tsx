import { notFound, redirect } from 'next/navigation'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { getConnection, getCheckinStatus } from '@/lib/database'
import CheckinUI from '@/components/dashboard/CheckinUI'

type Props = { params: Promise<{ connectionId: string }> }

export default async function CheckinPage({ params }: Props) {
  const { connectionId } = await params
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const [connection, checkinDone] = await Promise.all([
    getConnection(connectionId, user.id),
    getCheckinStatus(connectionId, user.id),
  ])

  if (!connection) notFound()
  if (connection.status !== 'active') redirect(`/dashboard/chat/${connectionId}`)
  if (checkinDone) redirect(`/dashboard/chat/${connectionId}`)

  return <CheckinUI connection={connection} connectionId={connectionId} />
}
