'use server'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { calculateCompletion } from '@/lib/profile-completion'

export async function recalculateProfileCompletion(): Promise<void> {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  const { data: profile } = await supabase.from('profiles').select('gender').eq('id', user.id).single()
  if (!profile) return

  const gender = profile.gender as 'brother' | 'sister'
  const table = gender === 'brother' ? 'brother_profiles' : 'sister_profiles'
  const { data: extProfile } = await supabase.from(table).select('*').eq('id', user.id).single()
  if (!extProfile) return

  const { percentage, isComplete } = calculateCompletion(extProfile as Record<string, unknown>, gender)
  await supabase.from('profiles').update({
    profile_complete: isComplete,
    profile_completion_percentage: percentage,
    status: isComplete ? 'active' : 'pending_verification',
  }).eq('id', user.id)
}
