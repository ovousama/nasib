'use server'

import { createAdminClient } from '@/lib/supabase-admin'

export async function signUpWali(email: string, password: string): Promise<{ success?: true; error?: string }> {
  const admin = createAdminClient()

  // Verify email exists in wali_profiles before creating an auth account
  const { data: waliProfile } = await admin
    .from('wali_profiles')
    .select('id')
    .eq('email', email.toLowerCase().trim())
    .maybeSingle()

  if (!waliProfile) {
    return {
      error: 'We could not find an invitation for this email. Please check with the sister who invited you.',
    }
  }

  // Create auth user with wali role in app_metadata (bypasses email confirmation)
  const { error: authError } = await admin.auth.admin.createUser({
    email: email.toLowerCase().trim(),
    password,
    email_confirm: true,
    app_metadata: { role: 'wali' },
  })

  if (authError) {
    if (authError.message.toLowerCase().includes('already been registered') || authError.message.toLowerCase().includes('already exists')) {
      return { error: 'An account with this email already exists. Please sign in instead.' }
    }
    return { error: authError.message }
  }

  return { success: true }
}
