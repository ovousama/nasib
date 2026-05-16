'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { acceptInterest, declineInterest } from '@/app/dashboard/actions'

export default function ProfileInterestActions({ interestId }: { interestId: string }) {
  const router = useRouter()
  const [accepting, setAccepting] = useState(false)
  const [declining, setDeclining] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleAccept() {
    setAccepting(true)
    setError(null)
    const result = await acceptInterest(interestId)
    if (result?.error) {
      setError(result.error)
      setAccepting(false)
    } else if (result?.connectionId) {
      router.push(`/dashboard/chat/${result.connectionId}`)
    } else {
      router.push('/dashboard')
    }
  }

  async function handleDecline() {
    setDeclining(true)
    await declineInterest(interestId)
    router.push('/dashboard')
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-10 bg-white border-t border-[#EDE8E3] px-5 py-4 pb-safe">
      {error && (
        <p className="text-xs text-[#C13515] text-center mb-2">{error}</p>
      )}
      <div className="flex gap-3 max-w-lg mx-auto">
        <button
          onClick={handleDecline}
          disabled={declining || accepting}
          className="flex-1 py-3 text-sm font-medium text-[#9B9B9B] hover:text-[#1A1A1A] disabled:opacity-50 transition-colors"
        >
          {declining ? '…' : 'Decline'}
        </button>
        <button
          onClick={handleAccept}
          disabled={accepting || declining}
          className="flex-[2] py-3 bg-[#AF4D98] text-white text-sm font-medium rounded-full hover:bg-[#9B3D85] disabled:opacity-50 transition-colors"
        >
          {accepting ? 'Accepting…' : 'Accept'}
        </button>
      </div>
    </div>
  )
}
