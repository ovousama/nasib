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

  if (profile?.gender === 'brother') {
    const [{ data: bp }, { data: ref }] = await Promise.all([
      supabase.from('brother_profiles').select('full_name,religiosity_level,occupation,timeline_to_marry,spouse_religiosity_preference,character_description,do_you_listen_to_music,deen_growth,photo_url,photo_urls').eq('id', user.id).single(),
      supabase.from('references').select('profile_id').eq('profile_id', user.id).single(),
    ])
    if (!bp?.full_name)                          redirect('/onboarding/brother')
    else if (!bp?.religiosity_level)             redirect('/onboarding/brother/religiosity')
    else if (!bp?.occupation)                    redirect('/onboarding/brother/lifestyle')
    else if (!bp?.timeline_to_marry)             redirect('/onboarding/brother/marriage')
    else if (!bp?.spouse_religiosity_preference) redirect('/onboarding/brother/preferences')
    else if (!bp?.character_description)         redirect('/onboarding/brother/character')
    else if (!bp?.do_you_listen_to_music)        redirect('/onboarding/brother/additional')
    else if (!bp?.deen_growth)                   redirect('/onboarding/brother/deepdive')
    else if ((bp?.photo_urls?.length ?? 0) < 3)   redirect('/onboarding/brother/photo')
    else if (!ref)                               redirect('/onboarding/brother/reference')
    else                                         redirect('/dashboard')
  }

  if (profile?.gender === 'sister') {
    const [{ data: sp }, { data: ref }] = await Promise.all([
      supabase.from('sister_profiles').select('full_name,religiosity_level,occupation,previously_married,spouse_religiosity_preference,character_description,do_you_listen_to_music,deen_growth,photo_urls').eq('id', user.id).single(),
      supabase.from('references').select('profile_id').eq('profile_id', user.id).single(),
    ])
    if (!sp?.full_name)                                                              redirect('/onboarding/sister/info')
    else if (!sp?.religiosity_level)                                                 redirect('/onboarding/sister/religiosity')
    else if (!sp?.occupation)                                                        redirect('/onboarding/sister/lifestyle')
    else if (sp?.previously_married === undefined || sp?.previously_married === null) redirect('/onboarding/sister/marriage')
    else if (!sp?.spouse_religiosity_preference)                                     redirect('/onboarding/sister/preferences')
    else if (!sp?.character_description)                                             redirect('/onboarding/sister/character')
    else if (!sp?.do_you_listen_to_music)                                            redirect('/onboarding/sister/additional')
    else if (!sp?.deen_growth)                                                       redirect('/onboarding/sister/deepdive')
    else if (!sp?.photo_urls || (sp.photo_urls as string[]).length === 0)            redirect('/onboarding/sister/photos')
    else if (!ref)                                                                   redirect('/onboarding/sister/reference')
    else                                                                             redirect('/dashboard')
  }

  // No profile row or no gender set — show gender selection screen
  return <GenderSelectionPage />
}
