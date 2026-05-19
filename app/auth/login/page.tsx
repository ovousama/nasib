'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'
import NasibLogo from '@/components/ui/NasibLogo'
import AuthSidePanel from '@/components/auth/AuthSidePanel'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const supabase = createClient()
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password })

    if (signInError) {
      setError(
        signInError.message === 'Invalid login credentials'
          ? 'Incorrect email or password. Please try again.'
          : signInError.message,
      )
      setLoading(false)
      return
    }

    router.push('/dashboard')
    router.refresh()
  }

  return (
    <div className="min-h-screen bg-[#FDF8F3] lg:grid lg:grid-cols-2">
      <AuthSidePanel headline="Halal matchmaking built around your deen. Wali involvement, deep compatibility, and serious intent — from the very first step." />
      <div className="flex flex-col items-center justify-center px-6 py-16 lg:py-0">
      <div className="w-full max-w-[380px]">

        {/* Logo */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', paddingBottom: '48px' }}>
          <NasibLogo size="lg" theme="light" />
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-1.5">
            <label htmlFor="email" className="block text-[11px] font-medium uppercase tracking-[0.06em] text-[#9B9B9B]">
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full px-4 py-3.5 rounded-[10px] border border-[#EDE8E3] bg-white text-[#1A1A1A] placeholder-[#9B9B9B] text-[15px] focus:outline-none focus:border-[#AF4D98] focus:ring-2 focus:ring-[#AF4D98]/8 transition-colors"
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label htmlFor="password" className="block text-[11px] font-medium uppercase tracking-[0.06em] text-[#9B9B9B]">
                Password
              </label>
              <Link href="/auth/forgot-password" className="text-[12px] text-[#9B9B9B] hover:text-[#AF4D98] transition-colors">
                Forgot password?
              </Link>
            </div>
            <input
              id="password"
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Your password"
              className="w-full px-4 py-3.5 rounded-[10px] border border-[#EDE8E3] bg-white text-[#1A1A1A] placeholder-[#9B9B9B] text-[15px] focus:outline-none focus:border-[#AF4D98] focus:ring-2 focus:ring-[#AF4D98]/8 transition-colors"
            />
          </div>

          {error && (
            <div data-testid="auth-error" className="border border-[#C13515]/20 bg-[#FDECEA] text-[#C13515] text-sm rounded-[10px] px-4 py-3">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-[#AF4D98] text-white font-medium rounded-full text-[15px] hover:bg-[#9B3D85] transition-colors disabled:opacity-40 disabled:cursor-not-allowed mt-2"
          >
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        <p className="text-center text-sm text-[#5C5C5C] mt-8">
          Don&apos;t have an account?{' '}
          <Link href="/auth/signup" className="text-[#AF4D98] font-medium hover:underline">
            Create one
          </Link>
        </p>

        {/* Quranic verse — only on mobile (desktop has the side panel) */}
        <div className="text-center mt-16 lg:hidden">
          <p className="text-[14px] text-[#9B9B9B] leading-loose">
            وَمِنْ آيَاتِهِ أَنْ خَلَقَ لَكُم مِّنْ أَنفُسِكُمْ أَزْوَاجًا
          </p>
          <p className="text-[12px] text-[#B8B0A8] mt-1">
            &ldquo;And of His signs is that He created for you mates&rdquo; — Ar-Rum 30:21
          </p>
        </div>

      </div>
      </div>
    </div>
  )
}
