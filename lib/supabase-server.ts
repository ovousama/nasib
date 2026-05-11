import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

/**
 * Use in Server Components, Server Actions, and Route Handlers.
 * Do NOT import this in Client Components — use lib/supabase.ts instead.
 */
export async function createServerSupabaseClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options)
            })
          } catch {
            // Called from a Server Component — cookie writes are a no-op and safe to ignore
          }
        },
      },
    }
  )
}
