import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { calculateCompletion } from '@/lib/profile-completion'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const type = searchParams.get('type')

  if (!code) {
    return NextResponse.redirect(`${origin}/auth/login`)
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const pendingCookies: Array<{ name: string; value: string; options: any }> = []

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll() },
        setAll(cookiesToSet) {
          pendingCookies.splice(0, pendingCookies.length, ...cookiesToSet)
        },
      },
    }
  )

  const { data, error } = await supabase.auth.exchangeCodeForSession(code)

  if (error || !data.session) {
    return NextResponse.redirect(`${origin}/auth/login`)
  }

  // Password reset — session is set, just redirect
  if (type === 'recovery') {
    const response = NextResponse.redirect(`${origin}/auth/reset-password`)
    pendingCookies.forEach(({ name, value, options }) => response.cookies.set(name, value, options))
    return response
  }

  const user = data.session.user
  const gender = user.user_metadata?.gender as 'brother' | 'sister' | undefined

  // Check if profile row already exists (re-verification / returning user)
  const { data: existingProfile } = await supabase
    .from('profiles')
    .select('id, gender')
    .eq('id', user.id)
    .single()

  if (existingProfile?.gender) {
    // Already set up — go to dashboard
    const response = NextResponse.redirect(`${origin}/dashboard`)
    pendingCookies.forEach(({ name, value, options }) => response.cookies.set(name, value, options))
    return response
  }

  if (!gender) {
    // No gender in metadata — show gender selection
    const response = NextResponse.redirect(`${origin}/onboarding`)
    pendingCookies.forEach(({ name, value, options }) => response.cookies.set(name, value, options))
    return response
  }

  // First-time verification: create profiles row and gender profile row
  // (check first to avoid constraint errors)
  const { data: existingProfiles } = await supabase
    .from('profiles')
    .select('id')
    .eq('id', user.id)
    .maybeSingle()
  if (!existingProfiles) {
    await supabase.from('profiles').insert({
      id: user.id,
      gender,
      status: 'active',
      profile_complete: false,
      profile_completion_percentage: 0,
    })
  }

  const fullName = user.user_metadata?.full_name as string | undefined
  const age = user.user_metadata?.age as number | string | undefined
  const location = user.user_metadata?.location as string | undefined

  const table = gender === 'brother' ? 'brother_profiles' : 'sister_profiles'

  // Insert gender profile row only if it doesn't exist
  const { data: existingGenderProfile } = await supabase
    .from(table)
    .select('id')
    .eq('id', user.id)
    .maybeSingle()
  if (!existingGenderProfile) {
    await supabase.from(table).insert({ id: user.id })
  }

  // Update basic info if present in user metadata
  const updateData: Record<string, unknown> = {}
  if (fullName) updateData.full_name = fullName
  if (age)      updateData.age       = parseInt(String(age))
  if (location) updateData.location  = location
  if (Object.keys(updateData).length > 0) {
    await supabase.from(table).update(updateData).eq('id', user.id)
  }

  // Calculate initial completion percentage from the basic info we just saved
  const profileData: Record<string, unknown> = {
    full_name: fullName ?? null,
    age: age ? parseInt(String(age)) : null,
    location: location ?? null,
  }
  const { percentage } = calculateCompletion(profileData, gender)

  await supabase
    .from('profiles')
    .update({ profile_completion_percentage: percentage })
    .eq('id', user.id)

  const response = NextResponse.redirect(`${origin}/dashboard`)
  pendingCookies.forEach(({ name, value, options }) => response.cookies.set(name, value, options))
  return response
}
