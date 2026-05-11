'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'
import { signUpWali } from '@/app/auth/actions'

type Mode = 'brother' | 'sister' | 'wali'

export default function SignupPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [mode, setMode] = useState<Mode | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [checkEmail, setCheckEmail] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (!mode) { setError('Please select your role.'); return }
    if (password.length < 8) { setError('Password must be at least 8 characters.'); return }
    if (password !== confirmPassword) { setError('Passwords do not match.'); return }

    setLoading(true)

    if (mode === 'wali') {
      const result = await signUpWali(email, password)
      if (result.error) { setError(result.error); setLoading(false); return }
      const supabase = createClient()
      const { error: signInError } = await supabase.auth.signInWithPassword({ email, password })
      if (signInError) { setError(signInError.message); setLoading(false); return }
      router.push('/wali/dashboard')
      return
    }

    const supabase = createClient()
    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { gender: mode },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    })

    if (signUpError) { setError(signUpError.message); setLoading(false); return }

    if (data.session && data.user) {
      const { error: profileError } = await supabase.from('profiles').insert({
        id: data.user.id,
        gender: mode,
        status: 'pending_verification',
      })
      if (profileError) { setError(profileError.message); setLoading(false); return }
      router.push('/onboarding')
    } else {
      setCheckEmail(true)
      setLoading(false)
    }
  }

  if (checkEmail) {
    return (
      <div className="min-h-screen bg-[#FDFAF7] flex items-center justify-center px-6">
        <div className="max-w-md w-full text-center">
          <h1 className="text-4xl font-semibold text-[#AF4D98] tracking-tight mb-2">Nasib</h1>
          <p className="text-[#6B6B6B] text-sm mb-10">Find your nasib</p>
          <div className="bg-white border border-[#EBEBEB] rounded-3xl p-10 shadow-[0_1px_2px_rgba(0,0,0,0.08),0_4px_12px_rgba(0,0,0,0.05)]">
            <div className="w-16 h-16 bg-[#AF4D98] rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h2 className="text-2xl font-semibold text-[#1A1A1A] tracking-tight mb-3">Check your email</h2>
            <p className="text-[#6B6B6B] text-sm leading-relaxed">
              We sent a confirmation link to{' '}
              <span className="font-medium text-[#1A1A1A]">{email}</span>.
              Click it to activate your account and begin your journey.
            </p>
          </div>
          <p className="text-sm text-[#9B9B9B] mt-6">
            Wrong email?{' '}
            <button
              onClick={() => { setCheckEmail(false); setEmail(''); setPassword(''); setConfirmPassword('') }}
              className="text-[#AF4D98] font-medium hover:underline"
            >
              Go back
            </button>
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#FDFAF7] flex">
      {/* Left brand panel */}
      <div className="hidden lg:flex lg:w-[45%] bg-gradient-to-br from-[#AF4D98] to-[#D66BA0] flex-col items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute top-[-80px] left-[-80px] w-64 h-64 rounded-full bg-white/5" />
        <div className="absolute bottom-[-60px] right-[-60px] w-80 h-80 rounded-full bg-white/5" />
        <div className="absolute top-1/3 right-[-40px] w-48 h-48 rounded-full bg-white/5" />
        <div className="relative z-10 text-center">
          <h1 className="text-6xl font-semibold text-white tracking-tight mb-4">Nasib</h1>
          <p className="text-white/80 text-lg font-medium">Begin your journey</p>
          <p className="text-white/60 text-sm mt-2">The halal way</p>
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 overflow-y-auto">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden text-center mb-10">
            <h1 className="text-4xl font-semibold text-[#AF4D98] tracking-tight">Nasib</h1>
            <p className="text-[#6B6B6B] text-sm mt-1">Find your nasib</p>
          </div>

          <div className="mb-8">
            <h2 className="text-3xl font-semibold text-[#1A1A1A] tracking-tight leading-snug">
              Begin your journey
            </h2>
            <p className="text-[#6B6B6B] mt-2 leading-relaxed">
              Create your account to get started
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Role selector */}
            <div>
              <p className="text-sm font-medium text-[#1A1A1A] mb-3">I am a…</p>
              <div className="grid grid-cols-2 gap-3 mb-3">
                {(['brother', 'sister'] as const).map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setMode(m)}
                    className={`py-5 px-4 rounded-2xl border-2 font-medium text-sm transition-all duration-150 text-left ${
                      mode === m
                        ? 'border-[#AF4D98] bg-[#F5E6F2]'
                        : 'border-[#EBEBEB] bg-white hover:border-[#D4D4D4]'
                    }`}
                  >
                    <div className="text-2xl mb-2">{m === 'brother' ? '☪️' : '🌸'}</div>
                    <div className={`font-semibold capitalize ${mode === m ? 'text-[#AF4D98]' : 'text-[#1A1A1A]'}`}>
                      {m}
                    </div>
                    <div className={`text-xs mt-0.5 ${mode === m ? 'text-[#AF4D98]/70' : 'text-[#9B9B9B]'}`}>
                      {m === 'brother' ? 'Looking for a spouse' : 'Looking for a spouse'}
                    </div>
                  </button>
                ))}
              </div>
              <button
                type="button"
                onClick={() => setMode('wali')}
                className={`w-full py-4 px-4 rounded-2xl border-2 font-medium text-sm transition-all duration-150 text-left ${
                  mode === 'wali'
                    ? 'border-[#AF4D98] bg-[#F5E6F2]'
                    : 'border-[#EBEBEB] bg-white hover:border-[#D4D4D4]'
                }`}
              >
                <span className="flex items-center gap-4">
                  <span className="text-2xl">🛡</span>
                  <span>
                    <span className={`font-semibold block text-sm ${mode === 'wali' ? 'text-[#AF4D98]' : 'text-[#1A1A1A]'}`}>
                      I am a wali
                    </span>
                    <span className={`text-xs ${mode === 'wali' ? 'text-[#AF4D98]/70' : 'text-[#9B9B9B]'}`}>
                      I received an invitation from a sister
                    </span>
                  </span>
                </span>
              </button>
            </div>

            {mode === 'wali' && (
              <div className="bg-[#FFF4CC] border border-[#FFB400]/20 rounded-xl px-4 py-3">
                <p className="text-xs text-[#6B4F00] leading-relaxed">
                  Your email must match the invitation. You will have read-only access to the sister&apos;s profile.
                </p>
              </div>
            )}

            <div className="space-y-1">
              <label htmlFor="email" className="block text-sm font-medium text-[#1A1A1A]">
                Email
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={mode === 'wali' ? 'Your invitation email' : 'you@example.com'}
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
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimum 8 characters"
                className="w-full px-4 py-3 rounded-xl border border-[#D4D4D4] text-[#1A1A1A] placeholder-[#9B9B9B] text-sm focus:outline-none focus:ring-2 focus:ring-[#AF4D98]/20 focus:border-[#AF4D98] transition-all duration-150"
              />
            </div>

            <div className="space-y-1">
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-[#1A1A1A]">
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repeat your password"
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
              {loading
                ? mode === 'wali' ? 'Verifying invitation…' : 'Creating account…'
                : mode === 'wali' ? 'Access Wali Dashboard' : 'Create Account'}
            </button>
          </form>

          <p className="text-center text-sm text-[#6B6B6B] mt-8">
            Already have an account?{' '}
            <Link href="/auth/login" className="text-[#AF4D98] font-medium hover:underline">
              Sign in
            </Link>
          </p>

          <p className="text-center text-xs text-[#9B9B9B] mt-6">
            By signing up you agree to use Nasib with sincere intention
          </p>
        </div>
      </div>
    </div>
  )
}
