import { redirect } from 'next/navigation'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import NikahPlanningClient from '@/components/nikah/NikahPlanningClient'

type Props = { params: Promise<{ connectionId: string }> }

export default async function NikahPage({ params }: Props) {
  const { connectionId } = await params
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: conn } = await supabase
    .from('connections')
    .select('id, brother_id, sister_id, status')
    .eq('id', connectionId)
    .single()

  if (!conn) redirect('/dashboard')
  if (conn.brother_id !== user.id && conn.sister_id !== user.id) redirect('/dashboard')
  if (conn.status !== 'nikah_planning') redirect(`/dashboard/chat/${connectionId}`)

  const [{ data: brotherProfile }, { data: sisterProfile }, { data: checklist }, { data: imamRequest }] =
    await Promise.all([
      supabase.from('brother_profiles').select('full_name').eq('id', conn.brother_id).single(),
      supabase.from('sister_profiles').select('full_name').eq('id', conn.sister_id).single(),
      supabase
        .from('nikah_checklist')
        .select('item_key, completed, completed_at, completed_by')
        .eq('connection_id', connectionId),
      supabase
        .from('imam_contact_requests')
        .select('id, created_at')
        .eq('connection_id', connectionId)
        .eq('profile_id', user.id)
        .maybeSingle(),
    ])

  const brotherName = brotherProfile?.full_name ?? 'Brother'
  const sisterName = sisterProfile?.full_name ?? 'Sister'
  const isBrother = conn.brother_id === user.id
  const currentUserName = isBrother ? brotherName : sisterName
  const otherUserName = isBrother ? sisterName : brotherName

  return (
    <NikahPlanningClient
      connectionId={connectionId}
      brotherName={brotherName}
      sisterName={sisterName}
      brotherId={conn.brother_id}
      sisterId={conn.sister_id}
      currentUserId={user.id}
      currentUserFirstName={currentUserName.split(' ')[0]}
      otherUserFirstName={otherUserName.split(' ')[0]}
      initialChecklist={checklist ?? []}
      imamRequestSubmitted={!!imamRequest}
      imamRequestDate={imamRequest?.created_at ?? null}
    />
  )
}
