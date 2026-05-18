import { createServerSupabaseClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import LandingPage from '@/components/landing/LandingPage'

export const metadata = {
  title: 'Naseeb — نصيب | Halal Matrimonial',
  description:
    'A halal matrimonial platform built around Islamic values. Serious intent, wali involvement, and deep compatibility — from the very first step.',
  openGraph: {
    title: 'Naseeb — نصيب | Halal Matrimonial',
    description:
      'Find your naseeb. A halal matrimonial platform built around Islamic values.',
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
