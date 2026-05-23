'use server'

import { createAdminClient } from '@/lib/supabase-admin'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { revalidatePath } from 'next/cache'

async function requireAdmin() {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || user.app_metadata?.role !== 'admin') throw new Error('Unauthorized')
  return user
}

export async function getVerificationSelfieUrl(selfiePath: string): Promise<string | null> {
  await requireAdmin()
  const admin = createAdminClient()
  const { data, error } = await admin.storage
    .from('verification-selfies')
    .createSignedUrl(selfiePath, 3600)
  if (error) return null
  return data.signedUrl
}

export async function getProfilePhotoUrls(gender: string, photoUrls: string[]): Promise<string[]> {
  if (!photoUrls?.length) return []
  const admin = createAdminClient()
  const bucket = gender === 'sister' ? 'sister-photos' : 'brother-photos'

  if (gender === 'brother') {
    return photoUrls.map(path => {
      const { data } = admin.storage.from(bucket).getPublicUrl(path)
      return data.publicUrl
    })
  }

  const signed = await Promise.all(
    photoUrls.map(async path => {
      const { data } = await admin.storage.from(bucket).createSignedUrl(path, 3600)
      return data?.signedUrl ?? null
    })
  )
  return signed.filter(Boolean) as string[]
}

export async function approveVerification(userId: string) {
  const adminUser = await requireAdmin()
  const admin = createAdminClient()

  const { error } = await admin
    .from('profiles')
    .update({
      verification_status: 'verified',
      verification_badge: true,
      verification_reviewed_at: new Date().toISOString(),
      verification_reviewed_by: adminUser.id,
    })
    .eq('id', userId)

  if (error) return { error: error.message }

  await admin.from('notifications').insert({
    profile_id: userId,
    type: 'verification_approved',
    title: 'Identity verified ✓',
    body: 'Mabrook! Your identity has been verified. Your profile now shows a verified badge.',
  })

  revalidatePath('/admin/verification')
  return { success: true }
}

export async function rejectVerification(userId: string, reason: string) {
  const adminUser = await requireAdmin()
  const admin = createAdminClient()

  const { error } = await admin
    .from('profiles')
    .update({
      verification_status: 'rejected',
      verification_badge: false,
      verification_rejection_reason: reason,
      verification_reviewed_at: new Date().toISOString(),
      verification_reviewed_by: adminUser.id,
    })
    .eq('id', userId)

  if (error) return { error: error.message }

  await admin.from('notifications').insert({
    profile_id: userId,
    type: 'verification_rejected',
    title: 'Verification needs attention',
    body: `Your verification was not approved. Reason: ${reason}. Please resubmit from your dashboard.`,
  })

  revalidatePath('/admin/verification')
  return { success: true }
}
