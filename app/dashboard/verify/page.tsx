import { redirect } from 'next/navigation'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import VerifyClient from '@/components/verify/VerifyClient'

export default async function VerifyPage() {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('id, gender, verification_status, verification_submitted_at, verification_rejection_reason')
    .eq('id', user.id)
    .single()

  if (!profile) redirect('/dashboard')

  if (profile.verification_status === 'verified') redirect('/dashboard')

  return (
    <VerifyClient
      userId={user.id}
      gender={profile.gender ?? 'brother'}
      status={profile.verification_status ?? 'unverified'}
      submittedAt={profile.verification_submitted_at ?? null}
      rejectionReason={profile.verification_rejection_reason ?? null}
    />
  )
}
