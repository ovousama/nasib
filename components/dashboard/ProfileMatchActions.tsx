'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { expressInterest } from '@/app/dashboard/actions'

type Props = {
  brotherId: string
  sisterId: string
  targetFirstName: string
  hasSentInterest: boolean
}

export default function ProfileMatchActions({ brotherId, sisterId, targetFirstName, hasSentInterest }: Props) {
  const router = useRouter()
  const [modalOpen, setModalOpen] = useState(false)
  const [introMessage, setIntroMessage] = useState('')
  const [sending, setSending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (hasSentInterest) {
    return (
      <div className="fixed bottom-0 left-0 right-0 z-10 bg-white border-t border-[#EDE8E3] px-5 py-4 pb-safe">
        <div className="max-w-lg mx-auto">
          <div className="w-full text-center py-3 bg-[#F5E6F2] text-[#7B2F6E] text-sm font-medium rounded-full">
            Awaiting response
          </div>
        </div>
      </div>
    )
  }

  async function handleSend() {
    setSending(true)
    setError(null)
    const result = await expressInterest(brotherId, sisterId, introMessage.trim() || undefined)
    setSending(false)
    if (result?.error) {
      setError(result.error)
    } else if (result?.mutual && result.connectionId) {
      router.push(`/dashboard/chat/${result.connectionId}`)
    } else {
      setModalOpen(false)
      router.push('/dashboard')
    }
  }

  return (
    <>
      <div className="fixed bottom-0 left-0 right-0 z-10 bg-white border-t border-[#EDE8E3] px-5 py-4 pb-safe">
        <div className="max-w-lg mx-auto">
          <button
            onClick={() => { setIntroMessage(''); setError(null); setModalOpen(true) }}
            className="block w-full py-3 bg-[#AF4D98] text-white text-sm font-medium rounded-full hover:bg-[#9B3D85] transition-colors"
          >
            Express Interest
          </button>
        </div>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-4">
          <div className="bg-white rounded-[24px] p-8 w-full max-w-sm shadow-[0_4px_8px_rgba(0,0,0,0.08),0_16px_40px_rgba(0,0,0,0.12)]">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-medium text-[#1A1A1A] tracking-[-0.02em]">
                Express Interest in {targetFirstName}
              </h3>
              <button onClick={() => setModalOpen(false)} className="text-[#9B9B9B] hover:text-[#1A1A1A] transition-colors p-1" aria-label="Close">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                  <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
                </svg>
              </button>
            </div>
            <p className="text-sm text-[#5C5C5C] mb-4 leading-relaxed">
              Write a short message to introduce yourself. This is optional but encouraged.
            </p>
            <textarea
              value={introMessage}
              onChange={e => setIntroMessage(e.target.value)}
              placeholder="Assalamu Alaikum, I came across your profile and felt it aligned well with what I am looking for…"
              rows={4}
              maxLength={300}
              className="w-full border border-[#EDE8E3] rounded-[12px] px-4 py-3 text-sm text-[#1A1A1A] placeholder:text-[#9B9B9B] focus:outline-none focus:ring-2 focus:ring-[#AF4D98]/8 focus:border-[#AF4D98] resize-none transition-all duration-150"
            />
            <p className="text-xs text-[#9B9B9B] text-right mt-1 mb-5">{introMessage.length}/300</p>
            {error && (
              <div className="mb-4 bg-[#FDECEA] border border-[#C13515]/20 rounded-[12px] p-3 text-sm text-[#C13515]">{error}</div>
            )}
            <div className="space-y-2">
              <button
                onClick={handleSend}
                disabled={sending}
                className="w-full rounded-full bg-[#AF4D98] text-white font-medium py-3 hover:bg-[#9B3D85] disabled:opacity-50 transition-colors text-sm"
              >
                {sending ? 'Sending…' : 'Send Interest'}
              </button>
              <button onClick={() => setModalOpen(false)} className="w-full text-[#9B9B9B] text-sm py-2 hover:text-[#1A1A1A] transition-colors">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
