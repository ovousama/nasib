import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

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

  const path = request.nextUrl.pathname

  // ALWAYS let these through — no auth check
  const alwaysPublic = [
    '/auth/callback',
    '/auth/reset-password',
    '/auth/forgot-password',
  ]
  if (alwaysPublic.some(r => path.startsWith(r))) {
    return supabaseResponse
  }

  const { data: { user } } = await supabase.auth.getUser()

  // Not logged in — allow login/signup, block everything else
  if (!user) {
    if (path.startsWith('/auth')) return supabaseResponse
    return NextResponse.redirect(new URL('/auth/login', request.url))
  }

  const role = user.app_metadata?.role

  // ADMIN
  if (role === 'admin') {
    if (path === '/auth/login' || path === '/auth/signup') {
      return NextResponse.redirect(new URL('/admin', request.url))
    }
    if (
      path.startsWith('/dashboard') ||
      path.startsWith('/wali') ||
      path.startsWith('/onboarding')
    ) {
      return NextResponse.redirect(new URL('/admin', request.url))
    }
    return supabaseResponse
  }

  // WALI
  if (role === 'wali') {
    if (path === '/auth/login' || path === '/auth/signup') {
      return NextResponse.redirect(new URL('/wali/dashboard', request.url))
    }
    if (!path.startsWith('/wali')) {
      return NextResponse.redirect(new URL('/wali/dashboard', request.url))
    }
    return supabaseResponse
  }

  // REGULAR USER (brother or sister)
  if (path === '/auth/login' || path === '/auth/signup') {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  if (path.startsWith('/wali') || path.startsWith('/admin')) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|favicon.svg|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
