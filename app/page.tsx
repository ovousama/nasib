import { createServerSupabaseClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import LandingPage from '@/components/landing/LandingPage'

export const metadata = {
  title: 'Naseeb — Seek with sincerity',
  description:
    'Naseeb — Seek with sincerity. A halal matrimonial platform built around Islamic values. Serious intent, wali involvement, and deep compatibility.',
  openGraph: {
    title: 'Naseeb — Seek with sincerity',
    description:
      'Naseeb — Seek with sincerity. A halal matrimonial platform built around Islamic values.',
    type: 'website',
  },
}

export default async function RootPage() {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (user) {
    const role = user.app_metadata?.role
    if (role === 'admin') redirect('/admin')
    if (role === 'wali') redirect('/wali/dashboard')
    redirect('/dashboard')
  }

  return <LandingPage />
}
