import { createAdminClient } from './supabase-admin'
import type { BrotherProfile, SisterProfile } from './database'

// ─── Types ────────────────────────────────────────────────────────────────────

export type AdminUser = {
  id: string
  gender: 'brother' | 'sister'
  status: string
  verification_badge: boolean
  full_name: string
  age: number | null
  location: string | null
  reference_status: string | null
  created_at: string
  profile_complete: boolean
  profile_completion_percentage: number
}

export type AdminStats = {
  total_brothers: number
  total_sisters: number
  pending_verification: number
  active_connections: number
  total_matches: number
  confirmed_meetings: number
}

export type AdminMatch = {
  id: string
  brother_id: string
  brother_name: string
  sister_id: string
  sister_name: string
  compatibility_note: string | null
  status: string
  created_at: string
}

export type AdminReference = {
  id: string
  profile_id: string
  profile_name: string
  profile_gender: string
  referee_name: string
  referee_email: string | null
  referee_phone: string | null
  referee_relationship: string | null
  status: string
  created_at: string
}

export type AdminConnection = {
  id: string
  brother_id: string
  brother_name: string
  sister_id: string
  sister_name: string
  status: string
  created_at: string
  meeting_count: number
}

export type AdminUserDetail = {
  id: string
  gender: 'brother' | 'sister'
  status: string
  verification_badge: boolean
  created_at: string
  brotherProfile: BrotherProfile | null
  sisterProfile: SisterProfile | null
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  reference: Record<string, any> | null
  matches: {
    id: string
    other_id: string
    other_name: string
    compatibility_note: string | null
    status: string
    created_at: string
  }[]
  connections: {
    id: string
    other_id: string
    other_name: string
    status: string
    created_at: string
  }[]
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function pickOne<T>(val: T | T[] | null | undefined): T | null {
  if (val === null || val === undefined) return null
  return Array.isArray(val) ? (val[0] ?? null) : val
}

// ─── Functions ────────────────────────────────────────────────────────────────

export async function getAdminStats(): Promise<AdminStats> {
  const admin = createAdminClient()

  const [
    { count: brothers },
    { count: sisters },
    { count: pending },
    { count: connections },
    { count: matches },
    { count: meetings },
  ] = await Promise.all([
    admin.from('profiles').select('id', { count: 'exact', head: true }).eq('gender', 'brother'),
    admin.from('profiles').select('id', { count: 'exact', head: true }).eq('gender', 'sister'),
    admin.from('profiles').select('id', { count: 'exact', head: true }).eq('status', 'pending_verification'),
    admin.from('connections').select('id', { count: 'exact', head: true }).eq('status', 'active'),
    admin.from('matches').select('id', { count: 'exact', head: true }).eq('status', 'active'),
    admin.from('meeting_requests').select('id', { count: 'exact', head: true }).eq('status', 'confirmed'),
  ])

  return {
    total_brothers: brothers ?? 0,
    total_sisters: sisters ?? 0,
    pending_verification: pending ?? 0,
    active_connections: connections ?? 0,
    total_matches: matches ?? 0,
    confirmed_meetings: meetings ?? 0,
  }
}

export async function getAllUsers(options: {
  gender?: 'brother' | 'sister'
  status?: string
  search?: string
  page?: number
  pageSize?: number
} = {}): Promise<{ users: AdminUser[]; total: number }> {
  const admin = createAdminClient()
  const { gender, status, search, page = 1, pageSize = 20 } = options

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let query: any = admin
    .from('profiles')
    .select('id, gender, status, verification_badge, created_at, profile_complete, profile_completion_percentage, brother_profiles(full_name, age, location), sister_profiles(full_name, age, location)')
    .order('created_at', { ascending: false })

  if (gender) query = query.eq('gender', gender)
  if (status) query = query.eq('status', status)

  const { data: profiles } = await query
  if (!profiles?.length) return { users: [], total: 0 }

  const profileIds = profiles.map((p: { id: string }) => p.id)
  const { data: refs } = await admin
    .from('references')
    .select('profile_id, status')
    .in('profile_id', profileIds)

  const refMap = Object.fromEntries(refs?.map(r => [r.profile_id, r.status]) ?? [])

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let users: AdminUser[] = (profiles as any[]).map(p => {
    const bp = pickOne(p.brother_profiles)
    const sp = pickOne(p.sister_profiles)
    return {
      id: p.id,
      gender: p.gender as 'brother' | 'sister',
      status: p.status,
      verification_badge: p.verification_badge,
      full_name: bp?.full_name ?? sp?.full_name ?? '',
      age: bp?.age ?? sp?.age ?? null,
      location: bp?.location ?? sp?.location ?? null,
      reference_status: refMap[p.id] ?? null,
      created_at: p.created_at,
      profile_complete: p.profile_complete ?? false,
      profile_completion_percentage: p.profile_completion_percentage ?? 0,
    }
  })

  if (search) {
    const q = search.toLowerCase()
    users = users.filter(u => u.full_name.toLowerCase().includes(q))
  }

  const total = users.length
  const paginated = users.slice((page - 1) * pageSize, page * pageSize)
  return { users: paginated, total }
}

export async function getUserDetail(userId: string): Promise<AdminUserDetail | null> {
  const admin = createAdminClient()

  const [
    { data: profile },
    { data: brotherProfile },
    { data: sisterProfile },
    { data: reference },
    { data: matches },
    { data: connections },
  ] = await Promise.all([
    admin.from('profiles').select('id, gender, status, verification_badge, created_at').eq('id', userId).single(),
    admin.from('brother_profiles').select('*').eq('id', userId).maybeSingle(),
    admin.from('sister_profiles').select('*').eq('id', userId).maybeSingle(),
    admin.from('references').select('*').eq('profile_id', userId).maybeSingle(),
    admin.from('matches').select('id, brother_id, sister_id, compatibility_note, status, created_at').or(`brother_id.eq.${userId},sister_id.eq.${userId}`),
    admin.from('connections').select('id, brother_id, sister_id, status, created_at').or(`brother_id.eq.${userId},sister_id.eq.${userId}`),
  ])

  if (!profile) return null

  const matchOtherIds = matches?.map(m => m.brother_id === userId ? m.sister_id : m.brother_id) ?? []
  const connOtherIds = connections?.map(c => c.brother_id === userId ? c.sister_id : c.brother_id) ?? []
  const allOtherIds = Array.from(new Set([...matchOtherIds, ...connOtherIds]))

  const [{ data: otherBros }, { data: otherSis }] = await Promise.all([
    allOtherIds.length
      ? admin.from('brother_profiles').select('id, full_name').in('id', allOtherIds)
      : Promise.resolve({ data: [] }),
    allOtherIds.length
      ? admin.from('sister_profiles').select('id, full_name').in('id', allOtherIds)
      : Promise.resolve({ data: [] }),
  ])

  const nameMap = Object.fromEntries([
    ...(otherBros ?? []).map(b => [b.id, b.full_name]),
    ...(otherSis ?? []).map(s => [s.id, s.full_name]),
  ])

  return {
    id: profile.id,
    gender: profile.gender as 'brother' | 'sister',
    status: profile.status,
    verification_badge: profile.verification_badge,
    created_at: profile.created_at,
    brotherProfile: brotherProfile as BrotherProfile | null,
    sisterProfile: sisterProfile as SisterProfile | null,
    reference: reference as Record<string, unknown> | null,
    matches: (matches ?? []).map(m => {
      const otherId = m.brother_id === userId ? m.sister_id : m.brother_id
      return { id: m.id, other_id: otherId, other_name: nameMap[otherId] ?? 'Unknown', compatibility_note: m.compatibility_note ?? null, status: m.status, created_at: m.created_at }
    }),
    connections: (connections ?? []).map(c => {
      const otherId = c.brother_id === userId ? c.sister_id : c.brother_id
      return { id: c.id, other_id: otherId, other_name: nameMap[otherId] ?? 'Unknown', status: c.status, created_at: c.created_at }
    }),
  }
}

export async function verifyUser(userId: string): Promise<void> {
  const admin = createAdminClient()
  const { error } = await admin.from('profiles').update({ status: 'active', verification_badge: true }).eq('id', userId)
  if (error) throw error
}

export async function unverifyUser(userId: string): Promise<void> {
  const admin = createAdminClient()
  const { error } = await admin.from('profiles').update({ verification_badge: false }).eq('id', userId)
  if (error) throw error
}

export async function deactivateUser(userId: string): Promise<void> {
  const admin = createAdminClient()
  const { error } = await admin.from('profiles').update({ status: 'inactive' }).eq('id', userId)
  if (error) throw error
}

export async function getAllMatches(options: { status?: string } = {}): Promise<AdminMatch[]> {
  const admin = createAdminClient()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let query: any = admin
    .from('matches')
    .select('id, brother_id, sister_id, compatibility_note, status, created_at')
    .order('created_at', { ascending: false })

  if (options.status) query = query.eq('status', options.status)

  const { data: matches } = await query
  if (!matches?.length) return []

  const brotherIds = matches.map((m: { brother_id: string }) => m.brother_id)
  const sisterIds = matches.map((m: { sister_id: string }) => m.sister_id)

  const [{ data: brothers }, { data: sisters }] = await Promise.all([
    admin.from('brother_profiles').select('id, full_name').in('id', brotherIds),
    admin.from('sister_profiles').select('id, full_name').in('id', sisterIds),
  ])

  const bNames = Object.fromEntries(brothers?.map(b => [b.id, b.full_name]) ?? [])
  const sNames = Object.fromEntries(sisters?.map(s => [s.id, s.full_name]) ?? [])

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (matches as any[]).map(m => ({
    id: m.id,
    brother_id: m.brother_id,
    brother_name: bNames[m.brother_id] ?? 'Unknown',
    sister_id: m.sister_id,
    sister_name: sNames[m.sister_id] ?? 'Unknown',
    compatibility_note: m.compatibility_note ?? null,
    status: m.status,
    created_at: m.created_at,
  }))
}

export async function expireMatch(matchId: string): Promise<void> {
  const admin = createAdminClient()
  const { error } = await admin.from('matches').update({ status: 'expired' }).eq('id', matchId)
  if (error) throw error
}

export async function assignMatch(brotherId: string, sisterId: string, compatibilityNote: string): Promise<void> {
  const admin = createAdminClient()

  const [{ count: bCount }, { count: sCount }, { data: existing }] = await Promise.all([
    admin.from('matches').select('id', { count: 'exact', head: true }).eq('brother_id', brotherId).eq('status', 'active'),
    admin.from('matches').select('id', { count: 'exact', head: true }).eq('sister_id', sisterId).eq('status', 'active'),
    admin.from('matches').select('id').eq('brother_id', brotherId).eq('sister_id', sisterId).eq('status', 'active').maybeSingle(),
  ])

  if ((bCount ?? 0) >= 5) throw new Error('Brother already has 5 active matches')
  if ((sCount ?? 0) >= 5) throw new Error('Sister already has 5 active matches')
  if (existing) throw new Error('This pair is already matched')

  const { error } = await admin.from('matches').insert({
    brother_id: brotherId,
    sister_id: sisterId,
    compatibility_note: compatibilityNote || null,
    status: 'active',
  })
  if (error) throw error
}

export async function getAllReferences(): Promise<AdminReference[]> {
  const admin = createAdminClient()

  const { data: refs } = await admin
    .from('references')
    .select('id, profile_id, referee_name, referee_email, referee_phone, referee_relationship, status, created_at')
    .order('created_at', { ascending: false })

  if (!refs?.length) return []

  const profileIds = refs.map(r => r.profile_id)

  const [{ data: brothers }, { data: sisters }, { data: profileRows }] = await Promise.all([
    admin.from('brother_profiles').select('id, full_name').in('id', profileIds),
    admin.from('sister_profiles').select('id, full_name').in('id', profileIds),
    admin.from('profiles').select('id, gender').in('id', profileIds),
  ])

  const nameMap = Object.fromEntries([
    ...(brothers ?? []).map(b => [b.id, b.full_name]),
    ...(sisters ?? []).map(s => [s.id, s.full_name]),
  ])
  const genderMap = Object.fromEntries(profileRows?.map(p => [p.id, p.gender]) ?? [])

  return refs.map(r => ({
    id: r.id,
    profile_id: r.profile_id,
    profile_name: nameMap[r.profile_id] ?? 'Unknown',
    profile_gender: genderMap[r.profile_id] ?? 'unknown',
    referee_name: r.referee_name,
    referee_email: r.referee_email ?? null,
    referee_phone: r.referee_phone ?? null,
    referee_relationship: r.referee_relationship ?? null,
    status: r.status,
    created_at: r.created_at,
  }))
}

export async function getAllConnections(): Promise<AdminConnection[]> {
  const admin = createAdminClient()

  const { data: conns } = await admin
    .from('connections')
    .select('id, brother_id, sister_id, status, created_at')
    .order('created_at', { ascending: false })

  if (!conns?.length) return []

  const brotherIds = conns.map(c => c.brother_id)
  const sisterIds = conns.map(c => c.sister_id)
  const connIds = conns.map(c => c.id)

  const [{ data: brothers }, { data: sisters }, { data: meetingRows }] = await Promise.all([
    admin.from('brother_profiles').select('id, full_name').in('id', brotherIds),
    admin.from('sister_profiles').select('id, full_name').in('id', sisterIds),
    admin.from('meeting_requests').select('connection_id').in('connection_id', connIds).eq('status', 'confirmed'),
  ])

  const bNames = Object.fromEntries(brothers?.map(b => [b.id, b.full_name]) ?? [])
  const sNames = Object.fromEntries(sisters?.map(s => [s.id, s.full_name]) ?? [])
  const meetingCounts: Record<string, number> = {}
  meetingRows?.forEach(m => { meetingCounts[m.connection_id] = (meetingCounts[m.connection_id] ?? 0) + 1 })

  return conns.map(c => ({
    id: c.id,
    brother_id: c.brother_id,
    brother_name: bNames[c.brother_id] ?? 'Unknown',
    sister_id: c.sister_id,
    sister_name: sNames[c.sister_id] ?? 'Unknown',
    status: c.status,
    created_at: c.created_at,
    meeting_count: meetingCounts[c.id] ?? 0,
  }))
}

export async function closeConnection(connectionId: string): Promise<void> {
  const admin = createAdminClient()
  const { error } = await admin
    .from('connections')
    .update({ status: 'closed', closed_at: new Date().toISOString() })
    .eq('id', connectionId)
  if (error) throw error
}

export async function getAllBrothers(): Promise<{ id: string; full_name: string; profile_complete: boolean; profile_completion_percentage: number }[]> {
  const admin = createAdminClient()
  const { data: brotherData } = await admin.from('brother_profiles').select('id, full_name').order('full_name')
  if (!brotherData?.length) return []
  const ids = brotherData.map(b => b.id)
  const { data: profileData } = await admin.from('profiles').select('id, profile_complete, profile_completion_percentage').in('id', ids)
  const profileMap = Object.fromEntries((profileData ?? []).map(p => [p.id, p]))
  return brotherData.map(b => ({
    id: b.id,
    full_name: b.full_name,
    profile_complete: profileMap[b.id]?.profile_complete ?? false,
    profile_completion_percentage: profileMap[b.id]?.profile_completion_percentage ?? 0,
  }))
}

export async function getAllSisters(): Promise<{ id: string; full_name: string; profile_complete: boolean; profile_completion_percentage: number }[]> {
  const admin = createAdminClient()
  const { data: sisterData } = await admin.from('sister_profiles').select('id, full_name').order('full_name')
  if (!sisterData?.length) return []
  const ids = sisterData.map(s => s.id)
  const { data: profileData } = await admin.from('profiles').select('id, profile_complete, profile_completion_percentage').in('id', ids)
  const profileMap = Object.fromEntries((profileData ?? []).map(p => [p.id, p]))
  return sisterData.map(s => ({
    id: s.id,
    full_name: s.full_name,
    profile_complete: profileMap[s.id]?.profile_complete ?? false,
    profile_completion_percentage: profileMap[s.id]?.profile_completion_percentage ?? 0,
  }))
}

export async function getUsersNeedingMatchRefresh(): Promise<string[]> {
  const admin = createAdminClient()
  const { data } = await admin
    .from('notifications')
    .select('profile_id')
    .eq('type', 'match_refresh')
    .eq('read', false)
  const ids = Array.from(new Set(data?.map(d => d.profile_id as string) ?? []))
  return ids
}

