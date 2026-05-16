'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { adminVerifyUser, adminUnverifyUser, adminDeactivateUser } from '@/app/admin/actions'

type Props = {
  userId: string
  currentStatus: string
  verificationBadge: boolean
  gender: 'brother' | 'sister'
}

export default function UserDetailActions({ userId, currentStatus, verificationBadge, gender }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [confirmDeactivate, setConfirmDeactivate] = useState(false)

  const run = async (action: string, fn: () => Promise<{ error?: string } | undefined>) => {
    setLoading(action)
    setError(null)
    const result = await fn()
    setLoading(null)
    if (result?.error) {
      setError(result.error)
    } else {
      router.refresh()
    }
  }

  return (
    <div className="bg-white rounded-[16px] p-5 shadow-[0_1px_3px_rgba(0,0,0,0.06)] border border-[#EDE8E3]">
      <h3 className="text-[11px] font-medium uppercase tracking-[0.06em] text-[#9B9B9B] mb-4">Actions</h3>

      {error && (
        <div className="mb-3 bg-red-50 border border-red-200 rounded-[10px] p-3 text-sm text-red-700">{error}</div>
      )}

      <div className="space-y-2">
        {!verificationBadge && (
          <button
            onClick={() => run('verify', () => adminVerifyUser(userId))}
            disabled={loading !== null}
            className="w-full rounded-full bg-[#AF4D98] text-white text-sm font-medium py-2 hover:bg-[#9B3D85] disabled:opacity-50 transition-colors"
          >
            {loading === 'verify' ? 'Verifying…' : 'Verify Profile'}
          </button>
        )}

        {verificationBadge && (
          <button
            onClick={() => run('unverify', () => adminUnverifyUser(userId))}
            disabled={loading !== null}
            className="w-full rounded-full border border-amber-300 text-amber-700 text-sm font-medium py-2 hover:bg-amber-50 disabled:opacity-50 transition-colors"
          >
            {loading === 'unverify' ? 'Removing…' : 'Remove Verification'}
          </button>
        )}

        <a
          href={`/admin/matches/new?${gender === 'brother' ? 'brotherId' : 'sisterId'}=${userId}`}
          className="block w-full rounded-full border border-[#EDE8E3] text-[#5C5C5C] text-sm font-medium py-2 hover:border-[#D4CBC4] transition-colors text-center"
        >
          Assign Match
        </a>

        {currentStatus !== 'inactive' && (
          <>
            {!confirmDeactivate ? (
              <button
                onClick={() => setConfirmDeactivate(true)}
                className="w-full text-sm text-[#C13515] py-2"
              >
                Deactivate Profile
              </button>
            ) : (
              <div className="border border-red-200 rounded-[10px] p-3 space-y-2">
                <p className="text-sm text-red-700 font-medium">Confirm deactivation?</p>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setConfirmDeactivate(false)}
                    className="text-sm text-[#5C5C5C] rounded-full border border-[#EDE8E3] py-2 hover:border-[#D4CBC4] transition-colors font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => { setConfirmDeactivate(false); run('deactivate', () => adminDeactivateUser(userId)) }}
                    disabled={loading !== null}
                    className="text-sm font-medium bg-red-600 text-white py-2 rounded-full hover:bg-red-700 disabled:opacity-50 transition-colors"
                  >
                    {loading === 'deactivate' ? '…' : 'Deactivate'}
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
