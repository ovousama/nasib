'use server'

import { createServerSupabaseClient } from '@/lib/supabase-server'

export async function setUserGender(gender: 'brother' | 'sister') {
  const supabase = await createServerSupabaseClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { error } = await supabase
    .from('profiles')
    .upsert(
      { id: user.id, gender, status: 'pending_verification' },
      { onConflict: 'id' }
    )

  if (error) throw error
}
