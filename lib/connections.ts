import { createServerSupabaseClient } from './supabase-server'

export async function getConnectionBetween(
  userId: string,
  otherUserId: string
): Promise<string | null> {
  const supabase = await createServerSupabaseClient()
  const { data } = await supabase
    .from('connections')
    .select('id')
    .in('status', ['active', 'nikah_planning'])
    .or(
      `and(brother_id.eq.${userId},sister_id.eq.${otherUserId}),and(brother_id.eq.${otherUserId},sister_id.eq.${userId})`
    )
    .maybeSingle()
  return data?.id ?? null
}
