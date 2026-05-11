import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  const { pathname } = request.nextUrl
  const isAuthRoute = pathname.startsWith('/auth/')
  const isWaliRoute = pathname.startsWith('/wali/')
  const isDashboardRoute = pathname.startsWith('/dashboard')
  const isWali = user?.app_metadata?.role === 'wali'

  // Unauthenticated user → login
  if (!user && !isAuthRoute) {
    const url = request.nextUrl.clone()
    url.pathname = '/auth/login'
    return NextResponse.redirect(url)
  }

  if (user) {
    // Authenticated wali on auth pages → wali dashboard
    if (isAuthRoute) {
      const url = request.nextUrl.clone()
      url.pathname = isWali ? '/wali/dashboard' : '/dashboard'
      return NextResponse.redirect(url)
    }

    // Wali trying to access regular dashboard → redirect to wali dashboard
    if (isWali && isDashboardRoute) {
      const url = request.nextUrl.clone()
      url.pathname = '/wali/dashboard'
      return NextResponse.redirect(url)
    }

    // Non-wali trying to access wali routes → redirect to dashboard
    if (!isWali && isWaliRoute) {
      const url = request.nextUrl.clone()
      url.pathname = '/dashboard'
      return NextResponse.redirect(url)
    }
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
