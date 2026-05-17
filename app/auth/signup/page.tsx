'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'
import { signUpWali } from '@/app/auth/actions'
import NasibLogo from '@/components/ui/NasibLogo'

type Mode = 'brother' | 'sister' | 'wali'

const inputCls = "w-full px-4 py-3.5 rounded-[10px] border border-[#EDE8E3] bg-white text-[#1A1A1A] placeholder-[#9B9B9B] text-[15px] focus:outline-none focus:border-[#AF4D98] focus:ring-2 focus:ring-[#AF4D98]/8 transition-colors"
const labelCls = "block text-[11px] font-medium uppercase tracking-[0.06em] text-[#9B9B9B]"

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
      <div className="min-h-screen bg-[#FDF8F3] flex flex-col items-center justify-center px-6 py-16">
        <div className="w-full max-w-[380px] text-center">
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '48px' }}>
            <NasibLogo size="lg" theme="light" />
            <p style={{ marginTop: '16px', fontSize: '13px', color: '#9B9B9B', fontStyle: 'italic', textAlign: 'center' }}>
              Your portion, your destiny
            </p>
          </div>

          <div className="bg-white border border-[#EDE8E3] rounded-[20px] p-8 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
            <div className="w-12 h-12 bg-[#F9F0F6] rounded-full flex items-center justify-center mx-auto mb-5">
              <svg className="w-6 h-6 text-[#AF4D98]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
              </svg>
            </div>
            <h2 className="text-xl font-medium text-[#1A1A1A] tracking-[-0.02em] mb-2">Check your email</h2>
            <p className="text-[#5C5C5C] text-sm leading-relaxed">
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
    <div className="min-h-screen bg-[#FDF8F3] flex flex-col items-center justify-center px-6 py-16">
      <div className="w-full max-w-[380px]">

        {/* Logo */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', paddingBottom: '40px' }}>
          <NasibLogo size="lg" theme="light" />
          <p style={{ marginTop: '16px', fontSize: '13px', color: '#9B9B9B', fontStyle: 'italic', textAlign: 'center' }}>
            Your portion, your destiny
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Role selector */}
          <div className="space-y-2">
            <p className="text-[11px] font-medium uppercase tracking-[0.06em] text-[#9B9B9B]">I am a</p>
            <div className="grid grid-cols-2 gap-2.5">
              {(['brother', 'sister'] as const).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setMode(m)}
                  className={`py-4 px-4 rounded-[16px] border-[1.5px] font-medium text-sm transition-colors text-left ${
                    mode === m
                      ? 'border-[#AF4D98] bg-[#F9F0F6] text-[#AF4D98]'
                      : 'border-[#EDE8E3] bg-white text-[#1A1A1A] hover:border-[#D4CBC4]'
                  }`}
                >
                  <div className="font-medium capitalize text-[15px]">{m}</div>
                  <div className={`text-xs mt-0.5 ${mode === m ? 'text-[#AF4D98]/70' : 'text-[#9B9B9B]'}`}>
                    Seeking a spouse
                  </div>
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={() => setMode('wali')}
              className={`w-full py-3.5 px-4 rounded-[16px] border-[1.5px] font-medium text-sm transition-colors text-left flex items-center gap-3 ${
                mode === 'wali'
                  ? 'border-[#AF4D98] bg-[#F9F0F6]'
                  : 'border-[#EDE8E3] bg-white hover:border-[#D4CBC4]'
              }`}
            >
              <div className="w-8 h-8 rounded-full bg-[#FAF4EE] flex items-center justify-center flex-shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="#AF4D98" className="w-4 h-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                </svg>
              </div>
              <div>
                <div className={`font-medium text-[15px] ${mode === 'wali' ? 'text-[#AF4D98]' : 'text-[#1A1A1A]'}`}>
                  I am a wali
                </div>
                <div className={`text-xs mt-0.5 ${mode === 'wali' ? 'text-[#AF4D98]/70' : 'text-[#9B9B9B]'}`}>
                  I received an invitation from a sister
                </div>
              </div>
            </button>
          </div>

          {mode === 'wali' && (
            <div className="bg-[#FEF9EC] border border-[#EDE8E3] rounded-[10px] px-4 py-3">
              <p className="text-xs text-[#8A6A00] leading-relaxed">
                Your email must match the invitation. You will have read-only access to the sister&apos;s profile.
              </p>
            </div>
          )}

          <div className="space-y-1.5">
            <label htmlFor="email" className={labelCls}>Email</label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={mode === 'wali' ? 'Your invitation email' : 'you@example.com'}
              className={inputCls}
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="password" className={labelCls}>Password</label>
            <input
              id="password"
              type="password"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Minimum 8 characters"
              className={inputCls}
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="confirmPassword" className={labelCls}>Confirm password</label>
            <input
              id="confirmPassword"
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Repeat your password"
              className={inputCls}
            />
          </div>

          {error && (
            <div className="border border-[#C13515]/20 bg-[#FDECEA] text-[#C13515] text-sm rounded-[10px] px-4 py-3">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-[#AF4D98] text-white font-medium rounded-full text-[15px] hover:bg-[#9B3D85] transition-colors disabled:opacity-40 disabled:cursor-not-allowed mt-2"
          >
            {loading
              ? mode === 'wali' ? 'Verifying invitation…' : 'Creating account…'
              : mode === 'wali' ? 'Access Wali Dashboard' : 'Create account'}
          </button>
        </form>

        <p className="text-center text-sm text-[#5C5C5C] mt-8">
          Already have an account?{' '}
          <Link href="/auth/login" className="text-[#AF4D98] font-medium hover:underline">
            Sign in
          </Link>
        </p>

        <p className="text-center text-xs text-[#9B9B9B] mt-4">
          By signing up you agree to use Naseeb with sincere intention
        </p>

        {/* Quranic verse */}
        <div className="text-center mt-14">
          <p className="text-[14px] text-[#9B9B9B] leading-loose">
            وَمِنْ آيَاتِهِ أَنْ خَلَقَ لَكُم مِّنْ أَنفُسِكُمْ أَزْوَاجًا
          </p>
          <p className="text-[12px] text-[#B8B0A8] mt-1">
            &ldquo;And of His signs is that He created for you mates&rdquo; — Ar-Rum 30:21
          </p>
        </div>

      </div>
    </div>
  )
}
