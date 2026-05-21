import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { createStorageClient } from '@/lib/supabase'
import { getProfile, getProfileForViewing } from '@/lib/database'
import { getConnectionBetween } from '@/lib/connections'
import ProfileInterestActions from '@/components/dashboard/ProfileInterestActions'
import ViewProfileClient from '@/components/profile/ViewProfileClient'

type Props = {
  params: Promise<{ userId: string }>
  searchParams: Promise<{ context?: string; interestId?: string; connectionId?: string }>
}

export default async function PublicProfilePage({ params, searchParams }: Props) {
  const { userId } = await params
  const { context, interestId, connectionId: connectionIdParam } = await searchParams

  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  if (userId === user.id) redirect('/dashboard/profile')

  const isInterestContext = context === 'interest' && !!interestId

  const activeConnectionId = await getConnectionBetween(user.id, userId)

  if (!isInterestContext && !activeConnectionId) {
    redirect('/dashboard')
  }

  const [targetProfile, profileData] = await Promise.all([
    getProfile(userId),
    getProfileForViewing(userId),
  ])

  if (!targetProfile) notFound()

  if (!profileData) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 20px' }}>
        <p style={{ fontSize: '16px', color: '#9B9B9B' }}>Profile not available</p>
        <Link href="/dashboard">Go back</Link>
      </div>
    )
  }

  const isBrother = targetProfile.gender === 'brother'
  const gender: 'brother' | 'sister' = isBrother ? 'brother' : 'sister'
  const backConnectionId = connectionIdParam ?? activeConnectionId

  // Photo resolution:
  // - Brother → public bucket (no auth needed)
  // - Sister + active connection → signed URLs via service role client
  // - Sister + interest only → no photos shown
  const photoUrls: string[] = []
  if (isBrother && profileData.photo_url) {
    const path = profileData.photo_url
    const url = path.startsWith('http')
      ? path
      : supabase.storage.from('brother-photos').getPublicUrl(path).data.publicUrl
    photoUrls.push(url)
  } else if (!isBrother && activeConnectionId) {
    const { data: sp } = await supabase
      .from('sister_profiles')
      .select('photo_urls')
      .eq('id', userId)
      .maybeSingle()
    const paths: string[] = (sp?.photo_urls as string[]) ?? []
    const storageClient = createStorageClient()
    for (const path of paths) {
      const { data: signed, error } = await storageClient.storage
        .from('sister-photos')
        .createSignedUrl(path, 3600)
      console.log('Signed URL:', signed?.signedUrl, 'Error:', error)
      if (signed?.signedUrl) photoUrls.push(signed.signedUrl)
    }
  }

  return (
    <>
      <ViewProfileClient
        profileData={profileData as Record<string, unknown>}
        gender={gender}
        photoUrls={photoUrls}
        connectionId={backConnectionId ?? null}
        verificationBadge={targetProfile.verification_badge}
        isInterestContext={isInterestContext}
      />
      {isInterestContext && interestId && (
        <ProfileInterestActions interestId={interestId} />
      )}
    </>
  )
}
