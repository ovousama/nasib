'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'
import { signUpWali } from '@/app/auth/actions'
import NasibLogo from '@/components/ui/NasibLogo'
import AuthSidePanel from '@/components/auth/AuthSidePanel'

const inputCls = "w-full px-4 py-3.5 rounded-[10px] border border-[#EDE8E3] bg-white text-[#1A1A1A] placeholder-[#9B9B9B] text-[15px] focus:outline-none focus:border-[#AF4D98] focus:ring-2 focus:ring-[#AF4D98]/8 transition-colors"
const labelCls = "block text-[11px] font-medium uppercase tracking-[0.06em] text-[#9B9B9B] mb-1.5"

function EyeIcon({ open }: { open: boolean }) {
  if (open) return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
      <path fillRule="evenodd" d="M3.28 2.22a.75.75 0 00-1.06 1.06l14.5 14.5a.75.75 0 101.06-1.06l-1.745-1.745a10.029 10.029 0 003.3-4.38 1.651 1.651 0 000-1.185A10.004 10.004 0 009.999 3a9.956 9.956 0 00-4.744 1.194L3.28 2.22zM7.752 6.69l1.092 1.092a2.5 2.5 0 013.374 3.373l1.091 1.092a4 4 0 00-5.557-5.557z" clipRule="evenodd" />
      <path d="M10.748 13.93l2.523 2.524a9.987 9.987 0 01-3.27.547c-4.258 0-7.894-2.66-9.337-6.41a1.651 1.651 0 010-1.186A10.007 10.007 0 012.839 6.02L6.07 9.252a4 4 0 004.678 4.678z" />
    </svg>
  )
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
      <path d="M10 12.5a2.5 2.5 0 100-5 2.5 2.5 0 000 5z" />
      <path fillRule="evenodd" d="M.664 10.59a1.651 1.651 0 010-1.186A10.004 10.004 0 0110 3c4.257 0 7.893 2.66 9.336 6.41.147.381.146.804 0 1.186A10.004 10.004 0 0110 17c-4.257 0-7.893-2.66-9.336-6.41z" clipRule="evenodd" />
    </svg>
  )
}

export default function SignupPage() {
  const router = useRouter()

  // Account
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  // About you
  const [fullName, setFullName] = useState('')
  const [age, setAge] = useState('')
  const [location, setLocation] = useState('')
  const [gender, setGender] = useState<'brother' | 'sister' | null>(null)

  // Wali toggle (secondary path)
  const [showWali, setShowWali] = useState(false)
  const [waliEmail, setWaliEmail] = useState('')
  const [waliPassword, setWaliPassword] = useState('')

  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [checkEmail, setCheckEmail] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (!gender) { setError('Please select Brother or Sister.'); return }
    if (password.length < 8) { setError('Password must be at least 8 characters.'); return }
    if (password !== confirmPassword) { setError('Passwords do not match.'); return }
    const ageNum = parseInt(age)
    if (isNaN(ageNum) || ageNum < 18) { setError('You must be at least 18 years old.'); return }
    if (!fullName.trim()) { setError('Please enter your full name.'); return }
    if (!location.trim()) { setError('Please enter your location.'); return }

    setLoading(true)
    const supabase = createClient()
    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName.trim(),
          gender,
          age: ageNum,
          location: location.trim(),
        },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    })

    if (signUpError) { setError(signUpError.message); setLoading(false); return }

    if (data.session && data.user) {
      // Email auto-confirmed (e.g. dev mode) — go directly to dashboard
      router.push('/dashboard')
    } else {
      setCheckEmail(true)
      setLoading(false)
    }
  }

  async function handleWaliSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    const result = await signUpWali(waliEmail, waliPassword)
    if (result.error) { setError(result.error); setLoading(false); return }
    const supabase = createClient()
    const { error: signInError } = await supabase.auth.signInWithPassword({ email: waliEmail, password: waliPassword })
    if (signInError) { setError(signInError.message); setLoading(false); return }
    router.push('/wali/dashboard')
  }

  if (checkEmail) {
    return (
      <div className="min-h-screen bg-[#FDF8F3] flex flex-col items-center justify-center px-6 py-16">
        <div className="w-full max-w-[380px] text-center">
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '48px' }}>
            <NasibLogo size="lg" theme="light" />
          </div>
          <div className="bg-white border border-[#EDE8E3] rounded-[20px] p-8 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
            <div className="w-12 h-12 bg-[#F9F0F6] rounded-full flex items-center justify-center mx-auto mb-5">
              <svg className="w-6 h-6 text-[#AF4D98]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
              </svg>
            </div>
            <h2 className="text-xl font-medium text-[#1A1A1A] tracking-[-0.02em] mb-2">Check your inbox</h2>
            <p className="text-[#5C5C5C] text-sm leading-relaxed">
              We sent a verification link to{' '}
              <span className="font-medium text-[#1A1A1A]">{email}</span>.
              Click it to activate your account.
            </p>
          </div>
          <p className="text-sm text-[#9B9B9B] mt-6">
            Wrong email?{' '}
            <button onClick={() => { setCheckEmail(false); setPassword(''); setConfirmPassword('') }}
              className="text-[#AF4D98] font-medium hover:underline">
              Go back
            </button>
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#FDF8F3] lg:grid lg:grid-cols-2">
      <AuthSidePanel headline="Halal matchmaking built around your deen. Wali involvement, deep compatibility, and serious intent — from the very first step." />
      <div className="flex flex-col items-center justify-center px-6 py-16 lg:py-0 lg:overflow-y-auto">
        <div className="w-full max-w-[400px]">

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', paddingBottom: '32px' }}>
            <NasibLogo size="lg" theme="light" />
          </div>

          <h1 className="text-[22px] font-medium text-[#1A1A1A] tracking-[-0.02em] text-center mb-8">
            Create your account
          </h1>

          <form onSubmit={handleSubmit}>
            {/* Section 1 — Account */}
            <div className="mb-8">
              <p className={labelCls}>Account</p>
              <div className="space-y-4">
                <div>
                  <label className={labelCls}>Email</label>
                  <input type="email" required value={email} onChange={e => setEmail(e.target.value)}
                    placeholder="you@example.com" className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Password</label>
                  <div className="relative">
                    <input type={showPassword ? 'text' : 'password'} required minLength={8}
                      value={password} onChange={e => setPassword(e.target.value)}
                      placeholder="Minimum 8 characters" className={inputCls} />
                    <button type="button" onClick={() => setShowPassword(v => !v)} tabIndex={-1}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-[#9B9B9B] hover:text-[#5C5C5C]">
                      <EyeIcon open={showPassword} />
                    </button>
                  </div>
                </div>
                <div>
                  <label className={labelCls}>Confirm password</label>
                  <div className="relative">
                    <input type={showConfirm ? 'text' : 'password'} required
                      value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)}
                      placeholder="Repeat your password" className={inputCls} />
                    <button type="button" onClick={() => setShowConfirm(v => !v)} tabIndex={-1}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-[#9B9B9B] hover:text-[#5C5C5C]">
                      <EyeIcon open={showConfirm} />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Divider */}
            <div className="flex items-center gap-3 mb-8">
              <div className="flex-1 h-px bg-[#EDE8E3]" />
              <span className="text-xs text-[#D4CBC4]">◇</span>
              <div className="flex-1 h-px bg-[#EDE8E3]" />
            </div>

            {/* Section 2 — About you */}
            <div className="mb-6">
              <p className={labelCls}>About you</p>
              <div className="space-y-4">
                <div>
                  <label className={labelCls}>Full name</label>
                  <input type="text" required value={fullName} onChange={e => setFullName(e.target.value)}
                    placeholder="e.g. Abdullah Khan" className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Age</label>
                  <input type="number" required min={18} max={99} value={age} onChange={e => setAge(e.target.value)}
                    placeholder="Must be 18 or older" className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Location</label>
                  <input type="text" required value={location} onChange={e => setLocation(e.target.value)}
                    placeholder="e.g. London, UK" className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>I am a</label>
                  <div className="grid grid-cols-2 gap-3">
                    {(['brother', 'sister'] as const).map(g => (
                      <button key={g} type="button" onClick={() => setGender(g)}
                        className={`py-5 px-4 rounded-[16px] border-[1.5px] text-left transition-colors ${
                          gender === g
                            ? 'border-[#AF4D98] bg-[#F9F0F6]'
                            : 'border-[#EDE8E3] bg-white hover:border-[#D4CBC4]'
                        }`}>
                        <div className={`font-medium text-[16px] capitalize ${gender === g ? 'text-[#AF4D98]' : 'text-[#1A1A1A]'}`}>
                          {g}
                        </div>
                        <div className={`text-xs mt-1 ${gender === g ? 'text-[#AF4D98]/70' : 'text-[#9B9B9B]'}`}>
                          Seeking a spouse
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {error && (
              <div className="border border-[#C13515]/20 bg-[#FDECEA] text-[#C13515] text-sm rounded-[10px] px-4 py-3 mb-4">
                {error}
              </div>
            )}

            <button type="submit" disabled={loading}
              className="w-full py-3.5 bg-[#AF4D98] text-white font-medium rounded-full text-[15px] hover:bg-[#9B3D85] transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
              {loading ? 'Creating account…' : 'Create my account →'}
            </button>
          </form>

          <p className="text-center text-sm text-[#5C5C5C] mt-6">
            Already have an account?{' '}
            <Link href="/auth/login" className="text-[#AF4D98] font-medium hover:underline">
              Sign in
            </Link>
          </p>

          <p className="text-center text-xs text-[#9B9B9B] mt-3">
            By signing up you agree to use Naseeb with sincere intention
          </p>

          {/* Wali secondary path */}
          <div className="mt-6 pt-6 border-t border-[#EDE8E3]">
            <button type="button" onClick={() => setShowWali(v => !v)}
              className="w-full text-center text-xs text-[#9B9B9B] hover:text-[#5C5C5C]">
              Are you a wali with an invitation?{' '}
              <span className="text-[#AF4D98]">{showWali ? 'Hide' : 'Sign up here'}</span>
            </button>
            {showWali && (
              <form onSubmit={handleWaliSubmit} className="mt-4 space-y-3">
                <div className="bg-[#FEF9EC] border border-[#EDE8E3] rounded-[10px] px-4 py-3">
                  <p className="text-xs text-[#8A6A00]">Your email must match the invitation you received.</p>
                </div>
                <input type="email" required value={waliEmail} onChange={e => setWaliEmail(e.target.value)}
                  placeholder="Your invitation email" className={inputCls} />
                <input type="password" required minLength={8} value={waliPassword} onChange={e => setWaliPassword(e.target.value)}
                  placeholder="Choose a password" className={inputCls} />
                <button type="submit" disabled={loading}
                  className="w-full py-3 bg-[#EDE8E3] text-[#5C5C5C] font-medium rounded-full text-[14px] hover:bg-[#D4CBC4] transition-colors disabled:opacity-40">
                  {loading ? 'Verifying…' : 'Access Wali Dashboard'}
                </button>
              </form>
            )}
          </div>

        </div>
      </div>
    </div>
  )
}
