'use server'

import { revalidatePath } from 'next/cache'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { createAdminClient } from '@/lib/supabase-admin'
import { checkAndRefreshMatches, submitCheckin, markAllNotificationsRead as dbMarkAllRead } from '@/lib/database'
import type { CheckinOutcome, GenderType } from '@/lib/database'

export async function markNotificationRead(notificationId: string) {
  const supabase = await createServerSupabaseClient()
  await supabase
    .from('notifications')
    .update({ read: true })
    .eq('id', notificationId)
  revalidatePath('/dashboard')
  revalidatePath('/dashboard/notifications')
}

export async function markAllNotificationsRead() {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }
  await dbMarkAllRead(user.id)
  revalidatePath('/dashboard')
  revalidatePath('/dashboard/notifications')
  return { success: true }
}

export async function expressInterest(brotherId: string, sisterId: string, introMessage?: string) {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const isBrother = user.id === brotherId
  const connCol = isBrother ? 'brother_id' : 'sister_id'

  // Check if active connection already exists between this pair
  const { count: activeConnection } = await supabase
    .from('connections')
    .select('*', { count: 'exact', head: true })
    .eq('brother_id', brotherId)
    .eq('sister_id', sisterId)
    .eq('status', 'active')

  if (activeConnection && activeConnection > 0) {
    return { error: 'You already have an active connection with this person' }
  }

  // Check if interest was already accepted
  const { count: acceptedInterest } = await supabase
    .from('interests')
    .select('*', { count: 'exact', head: true })
    .eq('brother_id', brotherId)
    .eq('sister_id', sisterId)
    .eq('status', 'accepted')

  if (acceptedInterest && acceptedInterest > 0) {
    return { error: 'This connection already exists' }
  }

  // Max 3 active connections check
  const { count: connCount } = await supabase
    .from('connections')
    .select('id', { count: 'exact', head: true })
    .eq(connCol, user.id)
    .eq('status', 'active')

  if ((connCount ?? 0) >= 3) {
    return { error: 'You have 3 active connections. Close one before expressing new interest.' }
  }

  // Check if the other party already expressed interest (mutual match)
  const { data: existingInterest } = await supabase
    .from('interests')
    .select('id, initiated_by')
    .eq('brother_id', brotherId)
    .eq('sister_id', sisterId)
    .eq('status', 'pending')
    .maybeSingle()

  if (existingInterest && existingInterest.initiated_by !== user.id) {
    // Other party already expressed interest → auto accept
    const { data: connectionId, error } = await supabase
      .rpc('accept_interest', { p_interest_id: existingInterest.id })

    if (error) return { error: error.message }

    const otherId = isBrother ? sisterId : brotherId
    const admin = createAdminClient()
    await admin.from('notifications').insert([
      {
        profile_id: otherId,
        type: 'mutual_interest',
        title: 'Mutual interest — connection opened',
        body: 'Both of you expressed interest. A conversation has been opened.',
        read: false,
        metadata: { connectionId: connectionId as string },
      },
      {
        profile_id: user.id,
        type: 'mutual_interest',
        title: 'Mutual interest — connection opened',
        body: 'Both of you expressed interest. A conversation has been opened.',
        read: false,
        metadata: { connectionId: connectionId as string },
      },
    ])

    revalidatePath('/dashboard')
    return { success: true, mutual: true, connectionId: connectionId as string }
  }

  // Check if a pending interest already exists (mutual case returned above, so any pending here is user-initiated)
  const { count: pendingInterest } = await supabase
    .from('interests')
    .select('*', { count: 'exact', head: true })
    .eq('brother_id', brotherId)
    .eq('sister_id', sisterId)
    .eq('status', 'pending')

  if (pendingInterest && pendingInterest > 0) {
    return { error: 'You have already expressed interest in this person' }
  }

  // Check pending interests limit for this user
  const pendingFilter = isBrother
    ? supabase.from('interests').select('id', { count: 'exact', head: true }).eq('brother_id', user.id).eq('status', 'pending').or(`initiated_by.eq.${user.id},initiated_by.is.null`)
    : supabase.from('interests').select('id', { count: 'exact', head: true }).eq('sister_id', user.id).eq('status', 'pending').eq('initiated_by', user.id)

  const { count: pendingCount } = await pendingFilter

  if ((pendingCount ?? 0) >= 3) {
    return { error: 'You have 3 pending interests. Wait for responses before sending more.' }
  }

  const { data: inserted, error } = await supabase
    .from('interests')
    .insert({
      brother_id: brotherId,
      sister_id: sisterId,
      intro_message: introMessage ?? null,
      initiated_by: user.id,
      status: 'pending',
    })
    .select('id')
    .single()

  if (error) return { error: error.message }

  const otherId = isBrother ? sisterId : brotherId
  const admin = createAdminClient()
  await admin.from('notifications').insert({
    profile_id: otherId,
    type: 'new_interest',
    title: 'Someone has expressed interest',
    body: 'Someone has expressed interest in your profile. Review it in your dashboard.',
    read: false,
  })

  revalidatePath('/dashboard')
  return { success: true, mutual: false, connectionId: null, interestId: inserted?.id }
}

export async function acceptInterest(interestId: string) {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { data: interest } = await supabase
    .from('interests')
    .select('brother_id, sister_id, initiated_by')
    .eq('id', interestId)
    .single()

  if (!interest) return { error: 'Interest not found' }

  const isParty = user.id === interest.brother_id || user.id === interest.sister_id
  const isInitiator = interest.initiated_by === user.id
  if (!isParty || isInitiator) return { error: 'Not authorized to accept this interest' }

  // Use admin client so RPC works regardless of which party (brother or sister) accepts
  const admin = createAdminClient()
  const { data, error } = await admin.rpc('accept_interest', { p_interest_id: interestId })
  if (error) return { error: error.message }

  const initiatorId = interest.initiated_by ?? interest.brother_id
  await admin.from('notifications').insert({
    profile_id: initiatorId,
    type: 'interest_accepted',
    title: 'Your interest was accepted',
    body: 'Your interest was accepted. A conversation has been opened.',
    read: false,
    metadata: { connectionId: data as string },
  })

  revalidatePath('/dashboard')
  return { success: true, connectionId: data as string }
}

export async function declineInterest(interestId: string) {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { data: interest } = await supabase
    .from('interests')
    .select('brother_id, sister_id, initiated_by')
    .eq('id', interestId)
    .single()

  if (!interest) return { error: 'Interest not found' }

  const isParty = user.id === interest.brother_id || user.id === interest.sister_id
  const isInitiator = interest.initiated_by === user.id
  if (!isParty || isInitiator) return { error: 'Not authorized to decline this interest' }

  // Use admin client so the update works regardless of which party (brother or sister) declines
  const admin = createAdminClient()
  const { error } = await admin
    .from('interests')
    .update({ status: 'declined', responded_at: new Date().toISOString() })
    .eq('id', interestId)

  if (error) return { error: error.message }

  const initiatorId = interest.initiated_by ?? interest.brother_id
  const initiatorGender: GenderType = initiatorId === interest.brother_id ? 'brother' : 'sister'

  await admin.from('notifications').insert({
    profile_id: initiatorId,
    type: 'interest_declined',
    title: 'Your interest was not accepted',
    body: 'Your interest was respectfully declined. May Allah ease your search.',
    read: false,
  })

  await checkAndRefreshMatches(initiatorId, initiatorGender)

  revalidatePath('/dashboard')
  return { success: true }
}

export async function closeConnection(connectionId: string, reason?: string) {
  const supabase = await createServerSupabaseClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { data: conn } = await supabase
    .from('connections')
    .select('brother_id, sister_id')
    .eq('id', connectionId)
    .single()

  const { error } = await supabase.rpc('close_connection', {
    p_connection_id: connectionId,
    ...(reason ? { p_close_reason: reason } : {}),
  })
  if (error) return { error: error.message }

  if (conn) {
    const admin = createAdminClient()
    await admin
      .from('matches')
      .update({ status: 'expired' })
      .eq('brother_id', conn.brother_id)
      .eq('sister_id', conn.sister_id)
      .eq('status', 'active')

    const otherUserId = conn.brother_id === user.id ? conn.sister_id : conn.brother_id
    await admin.from('notifications').insert({
      profile_id: otherUserId,
      type: 'connection_closed',
      title: 'A connection has been closed',
      body: reason === 'We have mutually agreed to part ways'
        ? 'Your connection has been closed by mutual agreement. May Allah guide you both.'
        : 'Your connection has been closed. May Allah guide you both to what is best.',
      read: false,
    })

    const gender: GenderType = conn.brother_id === user.id ? 'brother' : 'sister'
    await checkAndRefreshMatches(user.id, gender)
  }

  revalidatePath('/dashboard')
  return { success: true }
}

export async function submitCheckinAction(connectionId: string, outcome: CheckinOutcome) {
  const result = await submitCheckin(connectionId, outcome)
  if (result.error) return { error: result.error }
  revalidatePath(`/dashboard/chat/${connectionId}`)
  return { success: true }
}

export async function sendMessage(
  connectionId: string,
  content: string,
  isSuggestedQuestion: boolean = false,
) {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { data, error } = await supabase
    .from('messages')
    .insert({
      connection_id: connectionId,
      sender_id: user.id,
      content: content.trim(),
      is_suggested_question: isSuggestedQuestion,
    })
    .select('id, connection_id, sender_id, content, is_suggested_question, created_at')
    .single()

  if (error) return { error: error.message }
  return { success: true, message: data }
}

export async function createMeetingRequest(
  connectionId: string,
  format: 'virtual' | 'in_person',
  slots: [string, string?, string?],
  locationOrLink?: string,
) {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { data, error } = await supabase
    .from('meeting_requests')
    .insert({
      connection_id: connectionId,
      requested_by: user.id,
      format,
      slot_1: slots[0],
      slot_2: slots[1] ?? null,
      slot_3: slots[2] ?? null,
      location_or_link: locationOrLink ?? null,
      status: 'pending',
    })
    .select('id')
    .single()

  if (error) return { error: error.message }

  // Fetch connection to find who to notify
  const { data: conn } = await supabase
    .from('connections')
    .select('brother_id, sister_id')
    .eq('id', connectionId)
    .single()

  if (conn) {
    const notifyId = conn.brother_id === user.id ? conn.sister_id : conn.brother_id
    const admin = createAdminClient()
    await admin.from('notifications').insert({
      profile_id: notifyId,
      type: 'meeting_requested',
      title: 'A meeting has been requested',
      body: 'Your connection has proposed meeting times. Please review and confirm.',
      read: false,
      metadata: { connectionId },
    })
  }

  revalidatePath(`/dashboard/meetings/${connectionId}`)
  return { success: true, meetingId: data?.id }
}

export async function confirmMeeting(meetingRequestId: string, confirmedSlot: string) {
  const supabase = await createServerSupabaseClient()
  const { error } = await supabase
    .rpc('confirm_meeting', {
      p_meeting_request_id: meetingRequestId,
      p_confirmed_slot: confirmedSlot,
    })
  if (error) return { error: error.message }
  return { success: true }
}

export async function declineMeeting(meetingRequestId: string) {
  const supabase = await createServerSupabaseClient()
  const { error } = await supabase
    .from('meeting_requests')
    .update({ status: 'cancelled' })
    .eq('id', meetingRequestId)
  if (error) return { error: error.message }
  return { success: true }
}

export async function confirmMeetingSlot(meetingRequestId: string, confirmedSlot: string) {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { data: meeting, error: fetchError } = await supabase
    .from('meeting_requests')
    .select('connection_id, requested_by')
    .eq('id', meetingRequestId)
    .single()

  if (fetchError || !meeting) return { error: 'Meeting not found' }

  const { error } = await supabase
    .from('meeting_requests')
    .update({
      confirmed_slot: confirmedSlot,
      status: 'confirmed',
      confirmed_at: new Date().toISOString(),
    })
    .eq('id', meetingRequestId)

  if (error) return { error: error.message }

  const admin = createAdminClient()
  await admin.from('notifications').insert({
    profile_id: meeting.requested_by,
    type: 'meeting_confirmed',
    title: 'Meeting time confirmed',
    body: `Your meeting has been confirmed for ${new Date(confirmedSlot).toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' })}.`,
    read: false,
    metadata: { connectionId: meeting.connection_id, meetingId: meetingRequestId },
  })

  revalidatePath(`/dashboard/meetings/${meeting.connection_id}`)
  return { success: true }
}
