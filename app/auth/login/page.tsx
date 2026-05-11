'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'

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
    <div className="min-h-screen bg-[#FDFAF7] flex">
      {/* Left brand panel — hidden on mobile */}
      <div className="hidden lg:flex lg:w-[45%] bg-gradient-to-br from-[#AF4D98] to-[#D66BA0] flex-col items-center justify-center p-12 relative overflow-hidden">
        {/* Decorative circles */}
        <div className="absolute top-[-80px] left-[-80px] w-64 h-64 rounded-full bg-white/5" />
        <div className="absolute bottom-[-60px] right-[-60px] w-80 h-80 rounded-full bg-white/5" />
        <div className="absolute top-1/3 right-[-40px] w-48 h-48 rounded-full bg-white/5" />

        <div className="relative z-10 text-center">
          <h1 className="text-6xl font-semibold text-white tracking-tight mb-4">Nasib</h1>
          <p className="text-white/80 text-lg font-medium">Find your nasib</p>
          <p className="text-white/60 text-sm mt-2">The halal way</p>
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden text-center mb-10">
            <h1 className="text-4xl font-semibold text-[#AF4D98] tracking-tight">Nasib</h1>
            <p className="text-[#6B6B6B] text-sm mt-1">Find your nasib</p>
          </div>

          <div className="mb-8">
            <h2 className="text-3xl font-semibold text-[#1A1A1A] tracking-tight leading-snug">
              Welcome back
            </h2>
            <p className="text-[#6B6B6B] mt-2 leading-relaxed">
              Sign in to continue your journey
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-1">
              <label htmlFor="email" className="block text-sm font-medium text-[#1A1A1A]">
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
                className="w-full px-4 py-3 rounded-xl border border-[#D4D4D4] text-[#1A1A1A] placeholder-[#9B9B9B] text-sm focus:outline-none focus:ring-2 focus:ring-[#AF4D98]/20 focus:border-[#AF4D98] transition-all duration-150"
              />
            </div>

            <div className="space-y-1">
              <label htmlFor="password" className="block text-sm font-medium text-[#1A1A1A]">
                Password
              </label>
              <input
                id="password"
                type="password"
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Your password"
                className="w-full px-4 py-3 rounded-xl border border-[#D4D4D4] text-[#1A1A1A] placeholder-[#9B9B9B] text-sm focus:outline-none focus:ring-2 focus:ring-[#AF4D98]/20 focus:border-[#AF4D98] transition-all duration-150"
              />
            </div>

            {error && (
              <div className="bg-[#FDECEA] border border-[#C13515]/20 text-[#C13515] text-sm rounded-xl px-4 py-3">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-[#AF4D98] text-white font-medium rounded-full hover:bg-[#9B3D85] active:scale-95 transition-all duration-200 shadow-sm hover:shadow-md disabled:opacity-40 disabled:cursor-not-allowed text-sm"
            >
              {loading ? 'Signing in…' : 'Sign In'}
            </button>
          </form>

          <p className="text-center text-sm text-[#6B6B6B] mt-8">
            Don&apos;t have an account?{' '}
            <Link href="/auth/signup" className="text-[#AF4D98] font-medium hover:underline">
              Create one
            </Link>
          </p>

          <p className="text-center text-xs text-[#9B9B9B] mt-6">
            May Allah make it easy for you
          </p>
        </div>
      </div>
    </div>
  )
}
