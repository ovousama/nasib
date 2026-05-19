'use server'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { calculateCompletion } from '@/lib/profile-completion'

export async function setUserGender(gender: 'brother' | 'sister') {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')
  const { error } = await supabase
    .from('profiles')
    .update({ gender })
    .eq('id', user.id)
  if (error) throw error
}

export async function recalculateCompletion(userId: string, gender: 'brother' | 'sister') {
  const supabase = await createServerSupabaseClient()
  const table = gender === 'brother' ? 'brother_profiles' : 'sister_profiles'
  const { data: profile } = await supabase.from(table).select('*').eq('id', userId).single()
  if (!profile) return { percentage: 0, isComplete: false }
  const { percentage, isComplete } = calculateCompletion(profile as Record<string, unknown>, gender)
  await supabase.from('profiles').update({
    profile_completion_percentage: percentage,
    profile_complete: isComplete,
    status: isComplete ? 'active' : 'pending_verification',
  }).eq('id', userId)
  return { percentage, isComplete }
}
