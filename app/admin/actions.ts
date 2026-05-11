'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import * as adminDb from '@/lib/admin'

async function requireAdmin() {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || user.app_metadata?.role !== 'admin') throw new Error('Unauthorized')
}

export async function adminVerifyUser(userId: string) {
  await requireAdmin()
  try {
    await adminDb.verifyUser(userId)
    revalidatePath(`/admin/users/${userId}`)
    revalidatePath('/admin/users')
    return { success: true }
  } catch (e) { return { error: (e as Error).message } }
}

export async function adminUnverifyUser(userId: string) {
  await requireAdmin()
  try {
    await adminDb.unverifyUser(userId)
    revalidatePath(`/admin/users/${userId}`)
    revalidatePath('/admin/users')
    return { success: true }
  } catch (e) { return { error: (e as Error).message } }
}

export async function adminDeactivateUser(userId: string) {
  await requireAdmin()
  try {
    await adminDb.deactivateUser(userId)
    revalidatePath(`/admin/users/${userId}`)
    revalidatePath('/admin/users')
    return { success: true }
  } catch (e) { return { error: (e as Error).message } }
}

export async function adminExpireMatch(matchId: string) {
  await requireAdmin()
  try {
    await adminDb.expireMatch(matchId)
    revalidatePath('/admin/matches')
    return { success: true }
  } catch (e) { return { error: (e as Error).message } }
}

export async function adminAssignMatch(brotherId: string, sisterId: string, note: string) {
  await requireAdmin()
  try {
    await adminDb.assignMatch(brotherId, sisterId, note)
  } catch (e) { return { error: (e as Error).message } }
  revalidatePath('/admin/matches')
  redirect('/admin/matches')
}

export async function adminCloseConnection(connectionId: string) {
  await requireAdmin()
  try {
    await adminDb.closeConnection(connectionId)
    revalidatePath('/admin/connections')
    return { success: true }
  } catch (e) { return { error: (e as Error).message } }
}
