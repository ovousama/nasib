import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')

  if (!code) {
    return NextResponse.redirect(`${origin}/auth/login`)
  }

  const response = NextResponse.redirect(`${origin}/onboarding`)

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options)
          })
        },
      },
    }
  )

  const { data, error } = await supabase.auth.exchangeCodeForSession(code)

  if (error || !data.session) {
    return NextResponse.redirect(`${origin}/auth/login`)
  }

  const user = data.session.user
  const gender = user.user_metadata?.gender as 'brother' | 'sister' | undefined

  if (gender) {
    // Upsert so this is safe whether or not the profile was created during signup
    await supabase
      .from('profiles')
      .upsert(
        { id: user.id, gender, status: 'pending_verification' },
        { onConflict: 'id' }
      )
  }

  return response
}
