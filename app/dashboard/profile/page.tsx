import { redirect } from 'next/navigation'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import {
  getProfile,
  getBrotherProfile,
  getSisterProfile,
  getWaliProfile,
  getReference,
} from '@/lib/database'
import { calculateCompletion } from '@/lib/profile-completion'
import ProfilePageClient from '@/components/profile/ProfilePageClient'

export default async function ProfilePage() {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/auth/login')

  const profile = await getProfile(user.id)
  if (!profile) redirect('/auth/login')

  const gender = profile.gender as 'brother' | 'sister'

  if (gender === 'brother') {
    const [genderProfile, reference] = await Promise.all([
      getBrotherProfile(user.id),
      getReference(user.id),
    ])
    if (!genderProfile) redirect('/onboarding/brother')

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { percentage, isComplete } = calculateCompletion(genderProfile as any, 'brother')

    return (
      <ProfilePageClient
        gender="brother"
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        genderProfile={genderProfile as any}
        waliProfile={null}
        reference={reference}
        completionPercentage={percentage}
        isComplete={isComplete}
        verificationBadge={profile.verification_badge}
      />
    )
  }

  const [genderProfile, waliProfile, reference] = await Promise.all([
    getSisterProfile(user.id),
    getWaliProfile(user.id),
    getReference(user.id),
  ])
  if (!genderProfile) redirect('/onboarding/sister')

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { percentage, isComplete } = calculateCompletion(genderProfile as any, 'sister')

  return (
    <ProfilePageClient
      gender="sister"
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      genderProfile={genderProfile as any}
      waliProfile={waliProfile}
      reference={reference}
      completionPercentage={percentage}
      isComplete={isComplete}
      verificationBadge={profile.verification_badge}
    />
  )
}
