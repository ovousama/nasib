import { createServerSupabaseClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import GenderSelectionPage from '@/components/onboarding/GenderSelectionPage'

export default async function OnboardingPage() {
  const supabase = await createServerSupabaseClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('id, gender, status')
    .eq('id', user.id)
    .single()

  if (profile?.gender === 'brother') redirect('/onboarding/brother')
  if (profile?.gender === 'sister') redirect('/onboarding/sister')

  // No profile row or no gender set — show gender selection screen
  return <GenderSelectionPage />
}
