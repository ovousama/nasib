'use client'
import { createClient } from '@/lib/supabase'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function saveProfileSection(
  table: 'brother_profiles' | 'sister_profiles',
  userId: string,
  data: Record<string, unknown>
): Promise<void> {
  const supabase = createClient()

  const { data: existing } = await supabase
    .from(table)
    .select('id')
    .eq('id', userId)
    .single()

  if (existing) {
    const { error } = await supabase
      .from(table)
      .update(data)
      .eq('id', userId)
    if (error) throw new Error(error.message)
  } else {
    const { error } = await supabase
      .from(table)
      .insert({ id: userId, ...data })
    if (error) throw new Error(error.message)
  }
}

export async function recalculateProfileCompletion(
  userId: string,
  gender: 'brother' | 'sister'
): Promise<void> {
  const supabase = createClient()
  const table = gender === 'brother' ? 'brother_profiles' : 'sister_profiles'

  const { data: profile } = await supabase
    .from(table)
    .select('*')
    .eq('id', userId)
    .single()
  if (!profile) return

  const { calculateCompletion } = await import('@/lib/profile-completion')
  const { percentage, isComplete } = calculateCompletion(profile, gender)

  const { data: current } = await supabase
    .from('profiles')
    .select('status, profile_complete')
    .eq('id', userId)
    .single()

  await supabase
    .from('profiles')
    .update({
      profile_completion_percentage: percentage,
      profile_complete: current?.profile_complete || isComplete,
      status: current?.status === 'active'
        ? 'active'
        : (isComplete ? 'active' : 'pending_verification'),
    })
    .eq('id', userId)
}
