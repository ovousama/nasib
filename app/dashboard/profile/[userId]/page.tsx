import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { createStorageClient } from '@/lib/supabase'
import { getProfile, getProfileForViewing } from '@/lib/database'
import { getConnectionBetween } from '@/lib/connections'
import ProfileInterestActions from '@/components/dashboard/ProfileInterestActions'
import ProfileMatchActions from '@/components/dashboard/ProfileMatchActions'
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
  const isMatchContext = context === 'match'

  const activeConnectionId = await getConnectionBetween(user.id, userId)

  // Lookup viewer to figure out match column
  const viewerProfile = await getProfile(user.id)
  if (!viewerProfile) redirect('/auth/login')

  const [targetProfile, profileData] = await Promise.all([
    getProfile(userId),
    getProfileForViewing(userId),
  ])

  if (!targetProfile) notFound()

  const isTargetBrother = targetProfile.gender === 'brother'
  const gender: 'brother' | 'sister' = isTargetBrother ? 'brother' : 'sister'

  // Allow viewing if: active connection, interest context, OR active match
  let matchReason: string | null | undefined = undefined
  let hasMatch = false
  let hasSentInterest = false

  if (isMatchContext || (!activeConnectionId && !isInterestContext)) {
    const brotherId = viewerProfile.gender === 'brother' ? user.id : userId
    const sisterId = viewerProfile.gender === 'sister' ? user.id : userId
    const { data: match } = await supabase
      .from('matches')
      .select('compatibility_note, status')
      .eq('brother_id', brotherId)
      .eq('sister_id', sisterId)
      .eq('status', 'active')
      .maybeSingle()

    if (match) {
      hasMatch = true
      matchReason = match.compatibility_note ?? ''
      // Check if viewer already expressed interest
      const { data: existing } = await supabase
        .from('interests')
        .select('id, initiated_by, status')
        .eq('brother_id', brotherId)
        .eq('sister_id', sisterId)
        .eq('status', 'pending')
        .maybeSingle()
      hasSentInterest = !!(existing && existing.initiated_by === user.id)
    }
  }

  if (!isInterestContext && !activeConnectionId && !hasMatch) {
    redirect('/dashboard')
  }

  if (!profileData) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 20px' }}>
        <p style={{ fontSize: '16px', color: '#9B9B9B' }}>Profile not available</p>
        <Link href="/dashboard">Go back</Link>
      </div>
    )
  }

  const backConnectionId = connectionIdParam ?? activeConnectionId

  // Photo resolution:
  // - Brother → public bucket (no auth needed)
  // - Sister + active connection → signed URLs via service role client
  // - Sister + interest/match only → no photos shown
  const photoUrls: string[] = []
  if (isTargetBrother) {
    const paths: string[] =
      (profileData.photo_urls as string[] | null)?.length
        ? (profileData.photo_urls as string[])
        : profileData.photo_url
        ? [profileData.photo_url as string]
        : []
    for (const path of paths) {
      const url = path.startsWith('http')
        ? path
        : supabase.storage.from('brother-photos').getPublicUrl(path).data.publicUrl
      photoUrls.push(url)
    }
  } else if (!isTargetBrother && activeConnectionId) {
    const { data: sp } = await supabase
      .from('sister_profiles')
      .select('photo_urls')
      .eq('id', userId)
      .maybeSingle()
    const paths: string[] = (sp?.photo_urls as string[]) ?? []
    const storageClient = createStorageClient()
    for (const path of paths) {
      const { data: signed } = await storageClient.storage
        .from('sister-photos')
        .createSignedUrl(path, 3600)
      if (signed?.signedUrl) photoUrls.push(signed.signedUrl)
    }
  }

  // photosVisible: brother photos are public so always visible;
  // sister photos only visible when there's an active connection.
  const photosVisible = isTargetBrother || !!activeConnectionId

  // Determine brother/sister IDs for match-context actions
  const brotherId = viewerProfile.gender === 'brother' ? user.id : userId
  const sisterId = viewerProfile.gender === 'sister' ? user.id : userId
  const targetFirstName = String(profileData.full_name ?? '').split(' ')[0] || 'them'

  const showMatchActions = hasMatch && !activeConnectionId && !isInterestContext

  return (
    <>
      <ViewProfileClient
        profileData={profileData as Record<string, unknown>}
        gender={gender}
        photoUrls={photoUrls}
        connectionId={backConnectionId ?? null}
        verificationBadge={targetProfile.verification_badge}
        isInterestContext={isInterestContext || showMatchActions}
        photosVisible={photosVisible}
        matchReason={matchReason}
      />
      {isInterestContext && interestId && (
        <ProfileInterestActions interestId={interestId} />
      )}
      {showMatchActions && (
        <ProfileMatchActions
          brotherId={brotherId}
          sisterId={sisterId}
          targetFirstName={targetFirstName}
          hasSentInterest={hasSentInterest}
        />
      )}
    </>
  )
}
