'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { submitCheckinAction } from '@/app/dashboard/actions'
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

export default function CheckinUI({ connection, connectionId }: { connection: ConnectionDetail; connectionId: string }) {
  const router = useRouter()
  const [selected, setSelected] = useState<CheckinOutcome | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async () => {
    if (!selected) return
    setLoading(true)
    setError(null)
    const result = await submitCheckinAction(connectionId, selected)
    setLoading(false)
    if (result?.error) {
      setError(result.error)
      return
    }
    if (selected === 'nikah_planning') {
      router.push(`/dashboard/nikah/${connectionId}`)
    } else {
      router.push(`/dashboard/chat/${connectionId}`)
    }
  }

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
        <p className="text-sm text-[#9B9B9B] mt-1">
          With {connection.other_first_name}
        </p>
      </div>

      <div className="flex-1 px-6 py-6">
        <p className="text-sm text-[#5C5C5C] mb-6 leading-relaxed">
          Bismillah. After your meeting, please share how you would like to proceed. Both parties must submit their responses independently.
        </p>

        <div className="space-y-3 mb-6">
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

        <div className="bg-[#FAF4EE] border border-[#EDE8E3] rounded-[12px] px-4 py-3 mb-6">
          <p className="text-xs text-[#5C5C5C] leading-relaxed">
            Your response is private. The outcome is only actioned when both parties agree. An admin reviews all nikah planning requests.
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
