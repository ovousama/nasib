import { createAdminClient } from '@/lib/supabase-admin'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import VerificationQueueClient from '@/components/admin/VerificationQueueClient'

export default async function VerificationQueuePage() {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || user.app_metadata?.role !== 'admin') redirect('/dashboard')

  const admin = createAdminClient()

  const { data: pending } = await admin
    .from('profiles')
    .select('id, gender, verification_status, verification_selfie_path, verification_submitted_at, verification_rejection_reason')
    .eq('verification_status', 'pending')
    .order('verification_submitted_at', { ascending: true })

  const pendingWithProfiles = await Promise.all(
    (pending ?? []).map(async (p) => {
      const table = p.gender === 'brother' ? 'brother_profiles' : 'sister_profiles'
      const { data: profile } = await admin
        .from(table)
        .select('full_name, age, location, photo_urls, photo_url')
        .eq('id', p.id)
        .single()
      return { ...p, profile: profile ?? null }
    })
  )

  return (
    <div style={{ maxWidth: '720px' }}>
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: '22px', fontWeight: 500, color: '#1A1A1A', marginBottom: '4px' }}>
          Identity Verification
        </h1>
        <p style={{ fontSize: '14px', color: '#9B9B9B' }}>
          Compare each selfie to the member&apos;s profile photos to confirm identity.
        </p>
      </div>
      <VerificationQueueClient requests={pendingWithProfiles} />
    </div>
  )
}
