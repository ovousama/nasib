'use server'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { calculateCompletion } from '@/lib/profile-completion'

export async function recalculateProfileCompletion(): Promise<void> {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  const { data: profile } = await supabase
    .from('profiles')
    .select('gender, status, profile_complete')
    .eq('id', user.id)
    .single()
  if (!profile) return

  const gender = profile.gender as 'brother' | 'sister'
  const table = gender === 'brother' ? 'brother_profiles' : 'sister_profiles'
  const { data: extProfile } = await supabase.from(table).select('*').eq('id', user.id).single()
  if (!extProfile) return

  const { percentage, isComplete } = calculateCompletion(extProfile as Record<string, unknown>, gender)

  // Never downgrade: status stays 'active' if already active; profile_complete stays true once set
  const newStatus = profile.status === 'active' ? 'active' : (isComplete ? 'active' : 'pending_verification')
  const newComplete = profile.profile_complete || isComplete

  await supabase.from('profiles').update({
    profile_complete: newComplete,
    profile_completion_percentage: percentage,
    status: newStatus,
  }).eq('id', user.id)
}
