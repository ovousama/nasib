import { createServerSupabaseClient } from './supabase-server'
import { createAdminClient } from './supabase-admin'

function toPublicUrl(pathOrUrl: string | null | undefined, bucket: string): string | null {
  if (!pathOrUrl) return null
  if (pathOrUrl.startsWith('http')) return pathOrUrl
  return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${bucket}/${pathOrUrl}`
}

// ─── Enum Types ───────────────────────────────────────────────────────────────

export type GenderType = 'brother' | 'sister'
export type ProfileStatusType = 'pending_verification' | 'verified' | 'active' | 'inactive'
export type ReligiosityType = 'practicing' | 'moderately_practicing' | 'learning'
export type ContactMethodType = 'phone' | 'email' | 'whatsapp'
export type ReferenceStatusType = 'pending' | 'completed'
export type MatchStatusType = 'active' | 'expired'
export type InterestStatusType = 'pending' | 'accepted' | 'declined'
export type ConnectionStatusType = 'active' | 'closed' | 'nikah_planning'
export type CheckinOutcome = 'continue' | 'nikah_planning' | 'close'

// ─── Table Types ──────────────────────────────────────────────────────────────

export type Profile = {
  id: string
  gender: GenderType
  status: ProfileStatusType
  verification_badge: boolean
  created_at: string
  updated_at: string
  profile_complete: boolean
  profile_completion_percentage: number
}

export type BrotherProfile = {
  id: string
  full_name: string
  age: number
  location: string | null
  ethnicity: string | null
  languages: string[] | null
  religiosity_level: ReligiosityType | null
  madhab: string | null
  prayer_frequency: string | null
  islamic_knowledge_level: string | null
  has_beard: boolean | null
  occupation: string | null
  education_level: string | null
  living_situation: string | null
  willing_to_relocate: boolean | null
  financial_readiness: string | null
  polygamy_openness: boolean | null
  previously_married: boolean | null
  has_children: boolean | null
  wants_children: boolean | null
  timeline_to_marry: string | null
  spouse_religiosity_preference: string | null
  spouse_age_min: number | null
  spouse_age_max: number | null
  dealbreakers: string[] | null
  character_description: string | null
  goals: string | null
  photo_url: string | null
  photo_urls: string[] | null
  created_at: string
  updated_at: string
}

export type SisterProfile = {
  id: string
  full_name: string
  age: number
  location: string | null
  ethnicity: string | null
  languages: string[] | null
  religiosity_level: ReligiosityType | null
  madhab: string | null
  prayer_frequency: string | null
  islamic_knowledge_level: string | null
  wears_hijab: string | null
  occupation: string | null
  education_level: string | null
  living_situation: string | null
  willing_to_relocate: boolean | null
  previously_married: boolean | null
  has_children: boolean | null
  wants_children: boolean | null
  timeline_to_marry: string | null
  spouse_religiosity_preference: string | null
  spouse_age_min: number | null
  spouse_age_max: number | null
  dealbreakers: string[] | null
  character_description: string | null
  goals: string | null
  photo_urls: string[] | null
  photos_uploaded: boolean
  created_at: string
  updated_at: string
}

export type WaliProfile = {
  id: string
  sister_id: string
  full_name: string
  relationship: string
  phone: string | null
  email: string | null
  preferred_contact_method: ContactMethodType
  notified_at: string | null
  created_at: string
}

export type Reference = {
  id: string
  profile_id: string
  referee_name: string
  referee_relationship: string | null
  referee_email: string | null
  referee_phone: string | null
  status: ReferenceStatusType
  created_at: string
}

// ─── Enriched Types ───────────────────────────────────────────────────────────

export type MatchProfile = {
  id: string
  full_name: string
  age: number
  location: string | null
  verification_badge: boolean
  religiosity_level: string | null
  education_level: string | null
  wants_children: boolean | null
  timeline_to_marry: string | null
  photo_url: string | null
}

export type MatchWithProfile = {
  id: string
  brother_id: string
  sister_id: string
  compatibility_note: string | null
  status: MatchStatusType
  created_at: string
  other_profile: MatchProfile | null
}

export type SisterMatchBrother = {
  id: string
  full_name: string
  age: number
  location: string | null
  religiosity_level: string | null
  wants_children: boolean | null
  timeline_to_marry: string | null
  photo_url: string | null
  photo_urls: string[] | null
  verification_badge: boolean
}

export type SisterMatchInterest = {
  id: string
  brother_id: string
  status: string
  intro_message: string | null
}

export type SisterMatch = {
  id: string
  brother_id: string
  sister_id: string
  compatibility_note: string | null
  status: string
  created_at: string
  brother: SisterMatchBrother | null
  interest: SisterMatchInterest | null
}

export type InterestOtherProfile = {
  id: string
  full_name: string
  age: number
  location: string | null
  verification_badge: boolean
  compatibility_note: string | null
  photo_url: string | null
  photo_urls: string[] | null
}

export type InterestBrotherProfile = InterestOtherProfile

export type Message = {
  id: string
  connection_id: string
  sender_id: string
  content: string
  is_suggested_question: boolean
  created_at: string
}

export type MeetingRequest = {
  id: string
  connection_id: string
  requested_by: string
  format: 'virtual' | 'in_person'
  slot_1: string | null
  slot_2: string | null
  slot_3: string | null
  confirmed_slot: string | null
  location_or_link: string | null
  status: 'pending' | 'confirmed' | 'cancelled'
  wali_notified: boolean
  created_at: string
  confirmed_at: string | null
}

export type ConnectionDetail = {
  id: string
  brother_id: string
  sister_id: string
  status: ConnectionStatusType
  photos_released: boolean
  created_at: string
  other_name: string
  other_first_name: string
  other_id: string
  current_user_gender: GenderType
}

export type InterestWithProfile = {
  id: string
  brother_id: string
  sister_id: string
  intro_message: string | null
  status: InterestStatusType
  initiated_by: string | null
  created_at: string
  responded_at: string | null
  other_profile: InterestOtherProfile | null
}

export type ConnectionWithProfile = {
  id: string
  brother_id: string
  sister_id: string
  interest_id: string | null
  status: ConnectionStatusType
  photos_released: boolean
  created_at: string
  closed_at: string | null
  other_name: string
  other_photo_urls?: string[] | null
}

export type Notification = {
  id: string
  profile_id: string
  type: string
  title: string
  body: string
  read: boolean
  created_at: string
  metadata: Record<string, string> | null
}

export type SisterMatchData = {
  id: string
  full_name: string
  age: number
  location: string | null
  religiosity_level: string | null
  wants_children: boolean | null
  timeline_to_marry: string | null
  verification_badge: boolean
}

export type BrotherMatch = {
  id: string
  brother_id: string
  sister_id: string
  compatibility_note: string | null
  status: string
  created_at: string
  sister: SisterMatchData
}

// ─── Query Helpers ────────────────────────────────────────────────────────────

export async function getProfile(userId: string): Promise<Profile | null> {
  const supabase = await createServerSupabaseClient()
  const { data } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()
  return data
}

export async function getBrotherProfile(userId: string): Promise<BrotherProfile | null> {
  const supabase = await createServerSupabaseClient()
  const { data } = await supabase
    .from('brother_profiles')
    .select('*')
    .eq('id', userId)
    .single()
  if (!data) return null
  return { ...data, photo_url: toPublicUrl(data.photo_url, 'brother-photos') }
}

export async function getSisterProfile(userId: string): Promise<SisterProfile | null> {
  const supabase = await createServerSupabaseClient()
  const { data } = await supabase
    .from('sister_profiles')
    .select('*')
    .eq('id', userId)
    .single()
  if (!data) return null
  return {
    ...data,
    photo_urls: data.photo_urls?.map((u: string) => toPublicUrl(u, 'sister-photos') ?? u) ?? null,
  }
}

export async function getWaliProfile(sisterId: string): Promise<WaliProfile | null> {
  const supabase = await createServerSupabaseClient()
  const { data } = await supabase
    .from('wali_profiles')
    .select('*')
    .eq('sister_id', sisterId)
    .single()
  return data
}

export async function getReference(userId: string): Promise<Reference | null> {
  const supabase = await createServerSupabaseClient()
  const { data } = await supabase
    .from('references')
    .select('id, profile_id, referee_name, referee_relationship, referee_email, referee_phone, status, created_at')
    .eq('profile_id', userId)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()
  return data
}

export async function getBrotherMatches(userId: string): Promise<BrotherMatch[]> {
  const supabase = await createServerSupabaseClient()

  const { data: matches, error: matchError } = await supabase
    .from('matches')
    .select('*')
    .eq('brother_id', userId)
    .eq('status', 'active')

  if (matchError || !matches || matches.length === 0) return []

  const sisterIds = matches.map(m => m.sister_id)

  const { data: sisterProfiles } = await supabase
    .from('sister_profiles')
    .select('id, full_name, age, location, religiosity_level, wants_children, timeline_to_marry')
    .in('id', sisterIds)

  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, verification_badge')
    .in('id', sisterIds)

  return matches.map(match => ({
    id: match.id,
    brother_id: match.brother_id,
    sister_id: match.sister_id,
    compatibility_note: match.compatibility_note ?? null,
    status: match.status,
    created_at: match.created_at,
    sister: {
      ...sisterProfiles?.find(s => s.id === match.sister_id),
      verification_badge: profiles?.find(p => p.id === match.sister_id)?.verification_badge ?? false,
    } as SisterMatchData,
  }))
}

export async function getMatches(userId: string, gender: GenderType): Promise<MatchWithProfile[]> {
  const supabase = await createServerSupabaseClient()

  if (gender === 'brother') {
    const { data: rows } = await supabase
      .from('matches')
      .select(`
        id, brother_id, sister_id, compatibility_note, status, created_at,
        sister_profiles (
          id, full_name, age, location,
          religiosity_level, education_level, wants_children, timeline_to_marry
        ),
        profiles!matches_sister_id_fkey (
          verification_badge
        )
      `)
      .eq('brother_id', userId)
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(5)

    if (!rows?.length) return []

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (rows as any[]).map(row => {
      const sp = row.sister_profiles
      const pf = Array.isArray(row.profiles) ? row.profiles[0] : row.profiles
      return {
        id: row.id,
        brother_id: row.brother_id,
        sister_id: row.sister_id,
        compatibility_note: row.compatibility_note ?? null,
        status: row.status,
        created_at: row.created_at,
        other_profile: sp
          ? {
              id: sp.id,
              full_name: sp.full_name,
              age: sp.age,
              location: sp.location ?? null,
              verification_badge: pf?.verification_badge ?? false,
              religiosity_level: sp.religiosity_level ?? null,
              education_level: sp.education_level ?? null,
              wants_children: sp.wants_children ?? null,
              timeline_to_marry: sp.timeline_to_marry ?? null,
              photo_url: null,
            }
          : null,
      } satisfies MatchWithProfile
    })
  }
  return []
}

export async function getSisterMatches(userId: string): Promise<SisterMatch[]> {
  const supabase = await createServerSupabaseClient()

  const { data: matches, error: matchError } = await supabase
    .from('matches')
    .select('id, brother_id, sister_id, compatibility_note, status, created_at')
    .eq('sister_id', userId)
    .eq('status', 'active')
    .order('created_at', { ascending: false })
    .limit(5)

  if (matchError || !matches?.length) return []

  const brotherIds = matches.map(m => m.brother_id)

  const [
    { data: brotherProfiles },
    { data: profiles },
    { data: existingInterests },
  ] = await Promise.all([
    supabase
      .from('brother_profiles')
      .select('id, full_name, age, location, religiosity_level, wants_children, timeline_to_marry, photo_url, photo_urls')
      .in('id', brotherIds),
    supabase
      .from('profiles')
      .select('id, verification_badge')
      .in('id', brotherIds),
    supabase
      .from('interests')
      .select('id, brother_id, status, intro_message')
      .eq('sister_id', userId)
      .eq('initiated_by', userId)
      .in('brother_id', brotherIds),
  ])

  return matches.map(match => {
    const bp = brotherProfiles?.find(b => b.id === match.brother_id)
    const pf = profiles?.find(p => p.id === match.brother_id)
    const interest = existingInterests?.find(i => i.brother_id === match.brother_id) ?? null
    return {
      id: match.id,
      brother_id: match.brother_id,
      sister_id: match.sister_id,
      compatibility_note: match.compatibility_note ?? null,
      status: match.status,
      created_at: match.created_at,
      brother: bp
        ? {
            id: bp.id,
            full_name: bp.full_name,
            age: bp.age,
            location: bp.location ?? null,
            religiosity_level: bp.religiosity_level ?? null,
            wants_children: bp.wants_children ?? null,
            timeline_to_marry: bp.timeline_to_marry ?? null,
            photo_url: toPublicUrl(bp.photo_urls?.[0] ?? bp.photo_url, 'brother-photos'),
            photo_urls: bp.photo_urls?.map((p: string) => toPublicUrl(p, 'brother-photos')).filter(Boolean) as string[] | null ?? null,
            verification_badge: pf?.verification_badge ?? false,
          }
        : null,
      interest,
    }
  })
}

export async function getActiveConnections(userId: string, gender: GenderType): Promise<ConnectionWithProfile[]> {
  const supabase = await createServerSupabaseClient()
  const isBrother = gender === 'brother'

  const { data: conns } = await supabase
    .from('connections')
    .select('id, brother_id, sister_id, interest_id, status, photos_released, created_at, closed_at')
    .eq(isBrother ? 'brother_id' : 'sister_id', userId)
    .in('status', ['active', 'nikah_planning'])
    .order('created_at', { ascending: false })

  if (!conns?.length) return []

  const otherIds = conns.map(c => (isBrother ? c.sister_id : c.brother_id))
  const profileTable = isBrother ? 'sister_profiles' : 'brother_profiles'
  const fallback = isBrother ? 'Sister' : 'Brother'

  const profileSelect = isBrother ? 'id, full_name, photo_urls' : 'id, full_name'
  const { data: otherProfiles } = await supabase
    .from(profileTable)
    .select(profileSelect)
    .in('id', otherIds)

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return conns.map(conn => {
    const otherId = isBrother ? conn.sister_id : conn.brother_id
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const other = (otherProfiles as any[])?.find((p: { id: string }) => p.id === otherId)
    return {
      ...conn,
      other_name: other?.full_name ?? fallback,
      ...(isBrother ? { other_photo_urls: (other?.photo_urls ?? null) as string[] | null } : {}),
    }
  })
}

export async function getIncomingPendingInterests(userId: string, gender: GenderType): Promise<InterestWithProfile[]> {
  const supabase = await createServerSupabaseClient()
  const userCol = gender === 'brother' ? 'brother_id' : 'sister_id'
  const otherCol = gender === 'brother' ? 'sister_id' : 'brother_id'
  const otherTable = gender === 'brother' ? 'sister_profiles' : 'brother_profiles'
  const matchOtherCol = gender === 'brother' ? 'sister_id' : 'brother_id'

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let query: any = supabase
    .from('interests')
    .select('id, brother_id, sister_id, intro_message, status, initiated_by, created_at, responded_at')
    .eq(userCol, userId)
    .eq('status', 'pending')
    .order('created_at', { ascending: false })

  if (gender === 'brother') {
    query = query.neq('initiated_by', userId)
  } else {
    query = query.or(`initiated_by.is.null,initiated_by.neq.${userId}`)
  }

  const { data: interests } = await query
  if (!interests?.length) return []

  const otherIds = interests.map((i: { brother_id: string; sister_id: string }) => i[otherCol as 'brother_id' | 'sister_id'])

  const photoSelect = gender === 'brother' ? 'id, full_name, age, location, photo_urls' : 'id, full_name, age, location, photo_url, photo_urls'

  const [{ data: profiles }, { data: profileStatuses }, { data: matchNotes }] = await Promise.all([
    supabase.from(otherTable).select(photoSelect).in('id', otherIds),
    supabase.from('profiles').select('id, verification_badge').in('id', otherIds),
    supabase.from('matches')
      .select(`${matchOtherCol}, compatibility_note`)
      .eq(userCol, userId)
      .in(matchOtherCol, otherIds),
  ])

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (interests as any[]).map(interest => {
    const otherId = interest[otherCol]
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const profile = (profiles as any[])?.find((p: { id: string }) => p.id === otherId)
    const ps = profileStatuses?.find(p => p.id === otherId)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const note = (matchNotes as any[])?.find((m: Record<string, unknown>) => m[matchOtherCol] === otherId)
    return {
      ...interest,
      other_profile: profile
        ? {
            id: otherId,
            full_name: profile.full_name,
            age: profile.age,
            location: profile.location ?? null,
            verification_badge: ps?.verification_badge ?? false,
            compatibility_note: note?.compatibility_note ?? null,
            photo_url: gender === 'brother'
              ? toPublicUrl(profile.photo_urls?.[0], 'sister-photos')
              : toPublicUrl(profile.photo_urls?.[0] ?? profile.photo_url, 'brother-photos'),
            photo_urls: gender === 'brother'
              ? null
              : profile.photo_urls?.map((p: string) => toPublicUrl(p, 'brother-photos')).filter(Boolean) as string[] | null ?? null,
          }
        : null,
    }
  })
}

export async function getSentPendingInterestOtherIds(userId: string, gender: GenderType): Promise<string[]> {
  const supabase = await createServerSupabaseClient()
  const userCol = gender === 'brother' ? 'brother_id' : 'sister_id'
  const otherCol = gender === 'brother' ? 'sister_id' : 'brother_id'

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let query: any = supabase
    .from('interests')
    .select(otherCol)
    .eq(userCol, userId)
    .eq('status', 'pending')

  query = query.eq('initiated_by', userId)

  const { data } = await query
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return data?.map((d: Record<string, string>) => d[otherCol]) ?? []
}

export { getSentPendingInterestOtherIds as getSentInterestIds }

export async function getNotifications(userId: string): Promise<Notification[]> {
  const supabase = await createServerSupabaseClient()
  const { data } = await supabase
    .from('notifications')
    .select('*')
    .eq('profile_id', userId)
    .eq('read', false)
    .order('created_at', { ascending: false })
    .limit(20)
  return data ?? []
}

export async function getAllNotifications(userId: string): Promise<Notification[]> {
  const supabase = await createServerSupabaseClient()
  const { data } = await supabase
    .from('notifications')
    .select('*')
    .eq('profile_id', userId)
    .order('created_at', { ascending: false })
    .limit(100)
  return data ?? []
}

export async function markAllNotificationsRead(userId: string): Promise<void> {
  const supabase = await createServerSupabaseClient()
  await supabase
    .from('notifications')
    .update({ read: true })
    .eq('profile_id', userId)
    .eq('read', false)
}

export async function getUnreadNotificationCount(userId: string): Promise<number> {
  const supabase = await createServerSupabaseClient()
  const { count } = await supabase
    .from('notifications')
    .select('id', { count: 'exact', head: true })
    .eq('profile_id', userId)
    .eq('read', false)
  return count ?? 0
}

export async function getConnection(connectionId: string, userId: string): Promise<ConnectionDetail | null> {
  const supabase = await createServerSupabaseClient()

  const { data: conn } = await supabase
    .from('connections')
    .select('id, brother_id, sister_id, status, photos_released, created_at')
    .eq('id', connectionId)
    .single()

  if (!conn) return null

  const isBrother = conn.brother_id === userId
  const otherId = isBrother ? conn.sister_id : conn.brother_id
  const profileTable = isBrother ? 'sister_profiles' : 'brother_profiles'

  const { data: otherProfile } = await supabase
    .from(profileTable)
    .select('id, full_name')
    .eq('id', otherId)
    .single()

  const otherName = otherProfile?.full_name ?? (isBrother ? 'Sister' : 'Brother')

  return {
    ...conn,
    other_name: otherName,
    other_first_name: otherName.split(' ')[0],
    other_id: otherId,
    current_user_gender: isBrother ? 'brother' : 'sister',
  }
}

export async function getMessages(connectionId: string): Promise<Message[]> {
  const supabase = await createServerSupabaseClient()
  const { data } = await supabase
    .from('messages')
    .select('id, connection_id, sender_id, content, is_suggested_question, created_at')
    .eq('connection_id', connectionId)
    .order('created_at', { ascending: true })
    .limit(200)
  return data ?? []
}

export async function getMeetingRequests(connectionId: string): Promise<MeetingRequest[]> {
  const supabase = await createServerSupabaseClient()
  const { data } = await supabase
    .from('meeting_requests')
    .select('id, connection_id, requested_by, format, slot_1, slot_2, slot_3, confirmed_slot, location_or_link, status, wali_notified, created_at, confirmed_at')
    .eq('connection_id', connectionId)
    .order('created_at', { ascending: false })
  return data ?? []
}

export async function getPublicBrotherProfile(brotherId: string): Promise<BrotherProfile | null> {
  const supabase = await createServerSupabaseClient()
  const { data } = await supabase
    .from('brother_profiles')
    .select('*')
    .eq('id', brotherId)
    .single()
  return data
}

export async function getPublicSisterProfile(sisterId: string): Promise<SisterProfile | null> {
  const supabase = await createServerSupabaseClient()
  const { data } = await supabase
    .from('sister_profiles')
    .select('*')
    .eq('id', sisterId)
    .single()
  return data
}

export async function createNotification(
  profileId: string,
  type: string,
  title: string,
  body: string,
): Promise<void> {
  const admin = createAdminClient()
  await admin.from('notifications').insert({ profile_id: profileId, type, title, body, read: false })
}

export async function submitCheckin(connectionId: string, outcome: CheckinOutcome): Promise<{ error?: string }> {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  console.log('Submitting checkin:', {
    connectionId,
    outcome,
    currentUserId: user?.id ?? null,
    userEmail: user?.email ?? null,
  })
  const { data, error } = await supabase.rpc('submit_checkin', {
    p_connection_id: connectionId,
    p_outcome: outcome,
  })
  console.log('Checkin result:', { data, error })
  if (error) return { error: error.message }
  return {}
}

export async function getCheckinStatus(connectionId: string, userId: string): Promise<boolean> {
  const supabase = await createServerSupabaseClient()
  const { data } = await supabase
    .from('post_meeting_checkins')
    .select('id')
    .eq('connection_id', connectionId)
    .eq('profile_id', userId)
    .maybeSingle()
  return !!data
}

export async function checkAndRefreshMatches(userId: string, gender: GenderType): Promise<void> {
  const supabase = await createServerSupabaseClient()
  const idCol = gender === 'brother' ? 'brother_id' : 'sister_id'

  const [{ count: connCount }, { count: matchCount }] = await Promise.all([
    supabase.from('connections').select('id', { count: 'exact', head: true }).eq(idCol, userId).eq('status', 'active'),
    supabase.from('matches').select('id', { count: 'exact', head: true }).eq(idCol, userId).eq('status', 'active'),
  ])

  if ((connCount ?? 0) === 0 && (matchCount ?? 0) === 0) {
    const admin = createAdminClient()
    await admin.from('notifications').insert({
      profile_id: userId,
      type: 'match_refresh',
      title: 'New matches are being prepared',
      body: 'Your connection has ended and your matches have been exhausted. Our team will prepare new matches for you in sha Allah.',
      read: false,
    })
  }
}

// ─── Wali Functions ───────────────────────────────────────────────────────────

export async function getWaliForCurrentUser(): Promise<WaliProfile | null> {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user?.email) return null
  const admin = createAdminClient()
  const { data } = await admin
    .from('wali_profiles')
    .select('*')
    .eq('email', user.email)
    .maybeSingle()
  return data as WaliProfile | null
}

export async function getWaliSisterData(sisterId: string): Promise<{ profile: Profile; sisterProfile: SisterProfile } | null> {
  const admin = createAdminClient()
  const [{ data: profile }, { data: sisterProfile }] = await Promise.all([
    admin.from('profiles').select('*').eq('id', sisterId).single(),
    admin.from('sister_profiles').select('*').eq('id', sisterId).single(),
  ])
  if (!profile || !sisterProfile) return null
  const sp = sisterProfile as SisterProfile
  return {
    profile: profile as Profile,
    sisterProfile: {
      ...sp,
      photo_urls: sp.photo_urls?.map(u => toPublicUrl(u, 'sister-photos') ?? u) ?? null,
    },
  }
}

export async function getWaliSisterMatches(sisterId: string): Promise<SisterMatch[]> {
  const admin = createAdminClient()

  const { data: matches } = await admin
    .from('matches')
    .select('id, brother_id, sister_id, compatibility_note, status, created_at')
    .eq('sister_id', sisterId)
    .eq('status', 'active')
    .order('created_at', { ascending: false })
    .limit(5)

  if (!matches?.length) return []

  const brotherIds = matches.map((m: { brother_id: string }) => m.brother_id)

  const [{ data: brotherProfiles }, { data: profiles }] = await Promise.all([
    admin.from('brother_profiles')
      .select('id, full_name, age, location, photo_url, photo_urls')
      .in('id', brotherIds),
    admin.from('profiles').select('id, verification_badge').in('id', brotherIds),
  ])

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (matches as any[]).map(match => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const bp = (brotherProfiles as any[])?.find((b: { id: string }) => b.id === match.brother_id)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const pf = (profiles as any[])?.find((p: { id: string }) => p.id === match.brother_id)
    return {
      id: match.id,
      brother_id: match.brother_id,
      sister_id: match.sister_id,
      compatibility_note: match.compatibility_note ?? null,
      status: match.status,
      created_at: match.created_at,
      brother: bp ? {
        id: bp.id,
        full_name: bp.full_name,
        age: bp.age,
        location: bp.location ?? null,
        religiosity_level: null,
        wants_children: null,
        timeline_to_marry: null,
        photo_url: toPublicUrl(bp.photo_urls?.[0] ?? bp.photo_url, 'brother-photos'),
        photo_urls: bp.photo_urls?.map((p: string) => toPublicUrl(p, 'brother-photos')).filter(Boolean) as string[] | null ?? null,
        verification_badge: pf?.verification_badge ?? false,
      } : null,
      interest: null,
    }
  })
}

export async function getWaliSisterConnections(sisterId: string): Promise<ConnectionWithProfile[]> {
  const admin = createAdminClient()

  const { data: conns } = await admin
    .from('connections')
    .select('id, brother_id, sister_id, interest_id, status, photos_released, created_at, closed_at')
    .eq('sister_id', sisterId)
    .eq('status', 'active')
    .order('created_at', { ascending: false })

  if (!conns?.length) return []

  const brotherIds = (conns as { brother_id: string }[]).map(c => c.brother_id)
  const { data: brotherProfiles } = await admin
    .from('brother_profiles')
    .select('id, full_name')
    .in('id', brotherIds)

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (conns as any[]).map(conn => ({
    ...conn,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    other_name: (brotherProfiles as any[])?.find((p: { id: string }) => p.id === conn.brother_id)?.full_name ?? 'Brother',
  })) as ConnectionWithProfile[]
}

export async function getWaliSisterIncomingInterests(sisterId: string): Promise<InterestWithProfile[]> {
  const admin = createAdminClient()

  const { data: interests } = await admin
    .from('interests')
    .select('id, brother_id, sister_id, intro_message, status, initiated_by, created_at, responded_at')
    .eq('sister_id', sisterId)
    .eq('status', 'pending')
    .or(`initiated_by.is.null,initiated_by.neq.${sisterId}`)
    .order('created_at', { ascending: false })

  if (!interests?.length) return []

  const brotherIds = (interests as { brother_id: string }[]).map(i => i.brother_id)

  const [{ data: brotherProfiles }, { data: profileStatuses }, { data: matchNotes }] = await Promise.all([
    admin.from('brother_profiles').select('id, full_name, age, location, photo_url').in('id', brotherIds),
    admin.from('profiles').select('id, verification_badge').in('id', brotherIds),
    admin.from('matches').select('brother_id, compatibility_note').eq('sister_id', sisterId).in('brother_id', brotherIds),
  ])

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (interests as any[]).map(interest => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const bp = (brotherProfiles as any[])?.find((p: { id: string }) => p.id === interest.brother_id)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const ps = (profileStatuses as any[])?.find((p: { id: string }) => p.id === interest.brother_id)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const note = (matchNotes as any[])?.find((m: { brother_id: string }) => m.brother_id === interest.brother_id)
    return {
      ...interest,
      other_profile: bp ? {
        id: interest.brother_id,
        full_name: bp.full_name,
        age: bp.age,
        location: bp.location ?? null,
        verification_badge: ps?.verification_badge ?? false,
        compatibility_note: note?.compatibility_note ?? null,
        photo_url: toPublicUrl(bp.photo_url, 'brother-photos'),
      } : null,
    } as InterestWithProfile
  })
}

export async function getWaliSisterNotifications(sisterId: string): Promise<Notification[]> {
  const admin = createAdminClient()
  const { data } = await admin
    .from('notifications')
    .select('*')
    .eq('profile_id', sisterId)
    .order('created_at', { ascending: false })
    .limit(10)
  return (data ?? []) as Notification[]
}

export async function getWaliConnectionDetail(connectionId: string, sisterId: string): Promise<ConnectionDetail | null> {
  const admin = createAdminClient()

  const { data: conn } = await admin
    .from('connections')
    .select('id, brother_id, sister_id, status, photos_released, created_at')
    .eq('id', connectionId)
    .eq('sister_id', sisterId)
    .single()

  if (!conn) return null

  const { data: brotherProfile } = await admin
    .from('brother_profiles')
    .select('id, full_name')
    .eq('id', conn.brother_id)
    .single()

  const otherName = brotherProfile?.full_name ?? 'Brother'

  return {
    ...conn,
    other_name: otherName,
    other_first_name: otherName.split(' ')[0],
    other_id: conn.brother_id,
    current_user_gender: 'sister' as GenderType,
  }
}

export async function getWaliMessages(connectionId: string): Promise<Message[]> {
  const admin = createAdminClient()
  const { data } = await admin
    .from('messages')
    .select('id, connection_id, sender_id, content, is_suggested_question, created_at')
    .eq('connection_id', connectionId)
    .order('created_at', { ascending: true })
    .limit(200)
  return (data ?? []) as Message[]
}

export async function getWaliMeetingRequests(connectionId: string): Promise<MeetingRequest[]> {
  const admin = createAdminClient()
  const { data } = await admin
    .from('meeting_requests')
    .select('id, connection_id, requested_by, format, slot_1, slot_2, slot_3, confirmed_slot, location_or_link, status, wali_notified, created_at, confirmed_at')
    .eq('connection_id', connectionId)
    .order('created_at', { ascending: false })
  return (data ?? []) as MeetingRequest[]
}

export type ProfileForViewing = {
  // From profiles
  id: string
  gender: GenderType
  verification_badge: boolean
  // Core profile fields (present for both brother and sister)
  full_name: string
  age: number
  location: string | null
  ethnicity: string | null
  languages: string[] | null
  religiosity_level: string | null
  madhab: string | null
  prayer_frequency: string | null
  islamic_knowledge_level: string | null
  occupation: string | null
  education_level: string | null
  living_situation: string | null
  willing_to_relocate: boolean | null
  previously_married: boolean | null
  has_children: boolean | null
  wants_children: boolean | null
  timeline_to_marry: string | null
  spouse_religiosity_preference: string | null
  spouse_age_min: number | null
  spouse_age_max: number | null
  dealbreakers: string[] | null
  character_description: string | null
  goals: string | null
  // Brother-specific (null for sisters)
  has_beard: boolean | null
  financial_readiness: string | null
  polygamy_openness: boolean | null
  photo_url: string | null
  // Sister-specific (null for brothers)
  wears_hijab: string | null
  // Reference (null if no reference exists)
  reference: {
    status: string
    referee_name: string
    referee_relationship: string | null
    // Additional referee response fields (may be null if questionnaire not completed yet)
    how_long_known: string | null
    character_description: string | null
    islamic_practice_description: string | null
    ready_for_marriage: boolean | null
    would_recommend: boolean | null
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [key: string]: any
  } | null
  // All other additional columns (from ALTER TABLE, not in TS types)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any
}

export async function getProfileForViewing(userId: string): Promise<ProfileForViewing | null> {
  const supabase = await createServerSupabaseClient()

  const { data: baseProfile, error: baseError } = await supabase
    .from('profiles')
    .select('id, gender, verification_badge, status')
    .eq('id', userId)
    .single()

  console.log('Base profile:', baseProfile, baseError)

  if (baseError || !baseProfile) {
    console.error('Cannot access profile:', baseError)
    return null
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let extended: any = null

  if (baseProfile.gender === 'brother') {
    const { data: brotherProfile, error } = await supabase
      .from('brother_profiles')
      .select('*')
      .eq('id', userId)
      .single()

    console.log('Brother profile:', brotherProfile, error)
    extended = brotherProfile
  } else {
    // Deliberately excludes health_background_disclosure — it is private
    const { data: sisterProfile, error } = await supabase
      .from('sister_profiles')
      .select('*')
      .eq('id', userId)
      .single()

    console.log('Sister profile:', sisterProfile, error)
    extended = sisterProfile
  }

  const { data: ref } = await supabase
    .from('references')
    .select('*')
    .eq('profile_id', userId)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const ext = extended as any

  return {
    ...baseProfile,
    ...(ext ?? {}),
    has_beard: ext?.has_beard ?? null,
    financial_readiness: ext?.financial_readiness ?? null,
    polygamy_openness: ext?.polygamy_openness ?? null,
    photo_url: ext?.photo_url ? toPublicUrl(ext.photo_url, 'brother-photos') : null,
    wears_hijab: ext?.wears_hijab ?? null,
    reference: ref
      ? {
          ...ref,
          status: ref.status,
          referee_name: ref.referee_name,
          referee_relationship: ref.referee_relationship ?? null,
          how_long_known: ref.how_long_known ?? null,
          character_description: ref.character_description ?? null,
          islamic_practice_description: ref.islamic_practice_description ?? null,
          ready_for_marriage: ref.ready_for_marriage ?? null,
          would_recommend: ref.would_recommend ?? null,
        }
      : null,
  } as ProfileForViewing
}
