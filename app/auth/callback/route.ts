import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const type = searchParams.get('type')

  if (!code) {
    return NextResponse.redirect(`${origin}/auth/login`)
  }

  // Collect session cookies so we can forward them onto the redirect response
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const pendingCookies: Array<{ name: string; value: string; options: any }> = []

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
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

  // Check if a profile row with gender already exists (re-verification / new device)
  const { data: existingProfile } = await supabase
    .from('profiles')
    .select('id, gender')
    .eq('id', user.id)
    .single()

  let redirectTo = '/onboarding'

  if (existingProfile?.gender) {
    // Profile exists — go straight to dashboard
    redirectTo = '/dashboard'
  } else if (gender) {
    // First verification and gender is in metadata — create the profile row
    await supabase.from('profiles').upsert(
      { id: user.id, gender, status: 'pending_verification' },
      { onConflict: 'id', ignoreDuplicates: true }
    )
  }
  // If no gender anywhere, fall through to /onboarding which renders GenderSelectionPage

  const response = NextResponse.redirect(`${origin}${redirectTo}`)
  pendingCookies.forEach(({ name, value, options }) => response.cookies.set(name, value, options))
  return response
}
