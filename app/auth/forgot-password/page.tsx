'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [sent, setSent] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const supabase = createClient()
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    })

    setLoading(false)
    if (resetError) {
      setError(resetError.message)
    } else {
      setSent(true)
    }
  }

  return (
    <div className="min-h-screen bg-[#FDF8F3] flex flex-col items-center justify-center px-6 py-16">
      <div className="w-full max-w-[380px]">

        {/* Wordmark */}
        <div className="text-center mb-12">
          <h1 className="text-[32px] font-medium text-[#AF4D98] tracking-[-0.03em]">Nasib</h1>
          <p className="text-[13px] text-[#9B9B9B] mt-1.5 italic">نصيب — your portion, your destiny</p>
        </div>

        {sent ? (
          <div className="text-center">
            <div className="w-14 h-14 bg-[#F5E6F2] rounded-full flex items-center justify-center mx-auto mb-5">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="#AF4D98" className="w-7 h-7">
                <path d="M3 4a2 2 0 00-2 2v1.161l8.441 4.221a1.25 1.25 0 001.118 0L19 7.162V6a2 2 0 00-2-2H3z" />
                <path d="M19 8.839l-7.77 3.885a2.75 2.75 0 01-2.46 0L1 8.839V14a2 2 0 002 2h14a2 2 0 002-2V8.839z" />
              </svg>
            </div>
            <h2 className="text-[22px] font-medium text-[#1A1A1A] tracking-[-0.02em] mb-3">Check your inbox</h2>
            <p className="text-[14px] text-[#5C5C5C] leading-relaxed mb-2">
              We sent a reset link to{' '}
              <span className="font-medium text-[#1A1A1A]">{email}</span>.
            </p>
            <p className="text-[14px] text-[#9B9B9B] mb-8">
              It may take a minute to arrive.
            </p>
            <Link
              href="/auth/login"
              className="text-sm text-[#AF4D98] font-medium hover:underline"
            >
              Back to login
            </Link>
          </div>
        ) : (
          <>
            <div className="mb-8">
              <h2 className="text-[22px] font-medium text-[#1A1A1A] tracking-[-0.02em] mb-2">
                Reset your password
              </h2>
              <p className="text-[14px] text-[#9B9B9B] leading-relaxed">
                Enter your email and we&apos;ll send you a reset link.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-1.5">
                <label
                  htmlFor="email"
                  className="block text-[11px] font-medium uppercase tracking-[0.06em] text-[#9B9B9B]"
                >
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full px-4 py-3.5 rounded-[10px] border border-[#EDE8E3] bg-white text-[#1A1A1A] placeholder-[#9B9B9B] text-[15px] focus:outline-none focus:border-[#AF4D98] focus:ring-2 focus:ring-[#AF4D98]/8 transition-colors"
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
                {loading ? 'Sending…' : 'Send reset link'}
              </button>
            </form>

            <p className="text-center text-sm text-[#5C5C5C] mt-8">
              <Link href="/auth/login" className="text-[#AF4D98] font-medium hover:underline">
                Back to login
              </Link>
            </p>
          </>
        )}

        {/* Quranic verse */}
        <div className="text-center mt-16">
          <p className="text-[14px] text-[#9B9B9B] leading-loose">
            وَهُوَ الْغَفُورُ الرَّحِيمُ
          </p>
          <p className="text-[12px] text-[#B8B0A8] mt-1 italic">
            &ldquo;And He is the Forgiving, the Merciful&rdquo; — Ash-Shu&apos;ara 26:9
          </p>
        </div>

      </div>
    </div>
  )
}
