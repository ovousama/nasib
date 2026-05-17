'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'
import type { CheckinOutcome, ConnectionDetail } from '@/lib/database'

type Option = {
  outcome: CheckinOutcome
  title: string
  description: string
  icon: React.ReactNode
  borderColor: string
  bgColor: string
  titleColor: string
}

const OPTIONS: Option[] = [
  {
    outcome: 'continue',
    title: 'Continue',
    description: 'We would like to continue getting to know each other.',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-6 h-6">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.536-4.464a.75.75 0 10-1.061-1.061 3.5 3.5 0 01-4.95 0 .75.75 0 00-1.06 1.06 5 5 0 007.07 0zM9 8.5c0 .828-.448 1.5-1 1.5s-1-.672-1-1.5S7.448 7 8 7s1 .672 1 1.5zm3 1.5c.552 0 1-.672 1-1.5S12.552 7 12 7s-1 .672-1 1.5.448 1.5 1 1.5z" clipRule="evenodd" />
      </svg>
    ),
    borderColor: 'border-[#AF4D98]',
    bgColor: 'bg-[#F9F0F6]',
    titleColor: 'text-[#AF4D98]',
  },
  {
    outcome: 'nikah_planning',
    title: 'Proceed to Nikah',
    description: 'Alhamdulillah, we feel ready to move forward with nikah.',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-6 h-6">
        <path d="M9.653 16.915l-.005-.003-.019-.01a20.759 20.759 0 01-1.162-.682 22.045 22.045 0 01-2.582-2.075C4.504 12.382 3 10.561 3 8.17a5.17 5.17 0 0110 0 5.17 5.17 0 015 .828 5.17 5.17 0 01-5 5.17zm0 0l.005-.003.019-.01a20.759 20.759 0 001.162-.682 22.045 22.045 0 002.582-2.075C14.496 12.382 16 10.561 16 8.17A5.17 5.17 0 006 8.17a5.17 5.17 0 005 5.17z" />
      </svg>
    ),
    borderColor: 'border-[#D4CBC4]',
    bgColor: 'bg-[#FAF4EE]',
    titleColor: 'text-[#5C5C5C]',
  },
  {
    outcome: 'close',
    title: 'Close Connection',
    description: 'This connection is not the right fit. Close with respect.',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-6 h-6">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" />
      </svg>
    ),
    borderColor: 'border-[#EDE8E3]',
    bgColor: 'bg-[#FAF4EE]',
    titleColor: 'text-[#9B9B9B]',
  },
]

type CheckinResult = {
  status: 'confirmed' | 'proposed' | 'continue' | 'closed'
  message: string
  connectionId?: string
}

type Props = {
  connection: ConnectionDetail
  connectionId: string
  hasPendingProposal: boolean
}

export default function CheckinUI({ connection, connectionId, hasPendingProposal }: Props) {
  const router = useRouter()
  const [selected, setSelected] = useState<CheckinOutcome | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  // ── Waiting screen — user already proposed, other party hasn't responded ──
  if (hasPendingProposal) {
    return (
      <div className="min-h-screen bg-[#FDF8F3] flex flex-col items-center justify-center px-6">
        <p className="text-[24px] mb-4">🤍</p>
        <h2
          className="text-2xl text-[#AF4D98] mb-3 text-center"
          style={{ fontFamily: 'var(--font-cormorant)', fontWeight: 400 }}
        >
          Waiting for their response
        </h2>
        <p className="text-sm text-[#9B9B9B] text-center leading-relaxed max-w-xs">
          You have proposed nikah planning. We will notify you as soon as your match responds, in sha Allah.
        </p>
        <button
          onClick={() => router.push(`/dashboard/chat/${connectionId}`)}
          className="mt-6 border border-[#EDE8E3] rounded-full px-6 py-2.5 text-sm text-[#9B9B9B] hover:border-[#D4CBC4] transition-colors"
        >
          Back to chat
        </button>
      </div>
    )
  }

  // ── Success screen ────────────────────────────────────────────────────────
  if (successMessage) {
    return (
      <div className="min-h-screen bg-[#FDF8F3] flex items-center justify-center px-6">
        <p className="text-[#1A1A1A] text-lg font-medium text-center">{successMessage}</p>
      </div>
    )
  }

  // ── Submit handler ────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    if (!selected) return
    setLoading(true)
    setError(null)

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    console.log('Current user:', user?.id)

    if (!user) {
      console.error('No authenticated user')
      setError('Please log in again to continue.')
      setLoading(false)
      return
    }

    const { data, error } = await supabase.rpc('submit_checkin', {
      p_connection_id: connectionId,
      p_outcome: selected,
    })

    console.log('Checkin response:', { data, error })
    setLoading(false)

    if (error) {
      if (error.message.includes('Unauthorized')) {
        setError('You are not authorized to submit this check-in.')
      } else if (error.message.includes('Not authenticated')) {
        setError('Please log in again to continue.')
      } else {
        setError('Something went wrong. Please try again.')
      }
      return
    }

    const result = data as CheckinResult

    if (result.status === 'confirmed') {
      setSuccessMessage('Mabrook! You are both ready. May Allah bless your union. 🤍')
      setTimeout(() => router.push(`/dashboard/nikah/${connectionId}`), 2000)
    } else if (result.status === 'proposed') {
      setSuccessMessage(
        'Your response has been sent. We are waiting for the other party to respond. You will be notified when they do.'
      )
      setTimeout(() => router.push(`/dashboard/chat/${connectionId}`), 3000)
    } else if (result.status === 'continue') {
      setSuccessMessage('May Allah make it easy for you. Keep going.')
      setTimeout(() => router.push(`/dashboard/chat/${connectionId}`), 2000)
    } else if (result.status === 'closed') {
      setSuccessMessage('Jazakallah khair. Connection closed respectfully.')
      setTimeout(() => router.push('/dashboard'), 2000)
    }
  }

  // ── Main form ─────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#FDF8F3] flex flex-col">
      <div className="px-6 pt-8 pb-4 bg-white border-b border-[#EDE8E3]">
        <Link href={`/dashboard/chat/${connectionId}`} className="text-[#9B9B9B] hover:text-[#5C5C5C] text-sm flex items-center gap-1 mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
            <path fillRule="evenodd" d="M17 10a.75.75 0 01-.75.75H5.612l4.158 3.96a.75.75 0 11-1.04 1.08l-5.5-5.25a.75.75 0 010-1.08l5.5-5.25a.75.75 0 111.04 1.08L5.612 9.25H16.25A.75.75 0 0117 10z" clipRule="evenodd" />
          </svg>
          Back to chat
        </Link>
        <h1 className="text-[26px] font-medium text-[#1A1A1A] tracking-[-0.02em]">Post-Meeting Check-in</h1>
        <p className="text-sm text-[#9B9B9B] mt-1">With {connection.other_first_name}</p>
      </div>

      <div className="flex-1 px-6 py-6">
        <p className="text-sm text-[#5C5C5C] mb-6 leading-relaxed">
          Bismillah. After your meeting, please share how you would like to proceed. Your response is private.
        </p>

        <div className="space-y-3 mb-2">
          {OPTIONS.map(opt => (
            <button
              key={opt.outcome}
              onClick={() => setSelected(opt.outcome)}
              className={`w-full text-left p-4 rounded-[16px] border-2 transition-all duration-150 ${
                selected === opt.outcome
                  ? `${opt.borderColor} ${opt.bgColor}`
                  : 'border-[#EDE8E3] bg-white hover:border-[#D4CBC4]'
              }`}
            >
              <div className="flex items-start gap-3">
                <span className={selected === opt.outcome ? opt.titleColor : 'text-[#9B9B9B]'}>
                  {opt.icon}
                </span>
                <div>
                  <p className={`font-medium text-sm ${selected === opt.outcome ? opt.titleColor : 'text-[#1A1A1A]'}`}>
                    {opt.title}
                  </p>
                  <p className="text-xs text-[#9B9B9B] mt-0.5">{opt.description}</p>
                </div>
                <div className="ml-auto flex-shrink-0">
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                    selected === opt.outcome ? `${opt.borderColor} bg-white` : 'border-[#D4CBC4]'
                  }`}>
                    {selected === opt.outcome && (
                      <div className={`w-2.5 h-2.5 rounded-full ${
                        opt.outcome === 'continue' ? 'bg-[#AF4D98]' :
                        opt.outcome === 'nikah_planning' ? 'bg-[#D4CBC4]' : 'bg-[#9B9B9B]'
                      }`} />
                    )}
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Nikah planning explanation — shown only when that option is selected */}
        {selected === 'nikah_planning' && (
          <div className="mt-3 mb-2 rounded-[12px] px-4 py-3" style={{ background: '#F5E6F2', border: '1px solid rgba(175,77,152,0.2)' }}>
            <p className="text-[13px] font-medium text-[#AF4D98] mb-1">How this works</p>
            <p className="text-[13px] text-[#5C5C5C] leading-relaxed">
              Selecting this will send a proposal to your match. Nikah planning will only begin once both of you have agreed. If your match is not ready, your connection will continue as normal.
            </p>
          </div>
        )}

        <div className="bg-[#FAF4EE] border border-[#EDE8E3] rounded-[12px] px-4 py-3 mb-6 mt-4">
          <p className="text-xs text-[#5C5C5C] leading-relaxed">
            Your response is private. Nikah planning only begins when both parties agree. An admin reviews all nikah planning requests.
          </p>
        </div>

        {error && (
          <div className="mb-4 bg-[#FDECEA] border border-[#C13515]/20 rounded-[12px] p-3 text-sm text-[#C13515]">
            {error}
          </div>
        )}

        <button
          onClick={handleSubmit}
          disabled={!selected || loading}
          className="w-full rounded-full bg-[#AF4D98] text-white font-medium py-3 hover:bg-[#9B3D85] disabled:opacity-40 transition-colors text-sm"
        >
          {loading ? 'Submitting…' : 'Submit Response'}
        </button>
      </div>
    </div>
  )
}
