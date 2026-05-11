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
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-[#EBEBEB]">
      <h3 className="text-sm font-semibold text-[#6B6B6B] uppercase tracking-wide mb-4">Actions</h3>

      {error && (
        <div className="mb-3 bg-red-50 border border-red-200 rounded-xl p-3 text-sm text-red-700">{error}</div>
      )}

      <div className="space-y-2">
        {!verificationBadge && (
          <button
            onClick={() => run('verify', () => adminVerifyUser(userId))}
            disabled={loading !== null}
            className="w-full bg-[#AF4D98] text-white text-sm font-medium py-2.5 rounded-xl hover:bg-[#9B3D85] disabled:opacity-50 transition-colors"
          >
            {loading === 'verify' ? 'Verifying…' : 'Verify Profile'}
          </button>
        )}

        {verificationBadge && (
          <button
            onClick={() => run('unverify', () => adminUnverifyUser(userId))}
            disabled={loading !== null}
            className="w-full border border-amber-300 text-amber-700 text-sm font-medium py-2.5 rounded-xl hover:bg-amber-50 disabled:opacity-50 transition-colors"
          >
            {loading === 'unverify' ? 'Removing…' : 'Remove Verification'}
          </button>
        )}

        <a
          href={`/admin/matches/new?${gender === 'brother' ? 'brotherId' : 'sisterId'}=${userId}`}
          className="block w-full border border-[#AF4D98] text-[#AF4D98] text-sm font-medium py-2.5 rounded-xl hover:bg-[#F5E6F2] transition-colors text-center"
        >
          Assign Match
        </a>

        {currentStatus !== 'inactive' && (
          <>
            {!confirmDeactivate ? (
              <button
                onClick={() => setConfirmDeactivate(true)}
                className="w-full border border-red-300 text-red-600 text-sm font-medium py-2.5 rounded-xl hover:bg-red-50 transition-colors"
              >
                Deactivate Profile
              </button>
            ) : (
              <div className="border border-red-200 rounded-xl p-3 space-y-2">
                <p className="text-sm text-red-700 font-medium">Confirm deactivation?</p>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setConfirmDeactivate(false)}
                    className="text-sm text-[#6B6B6B] border border-[#EBEBEB] py-2 rounded-lg hover:bg-[#FDFAF7]"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => { setConfirmDeactivate(false); run('deactivate', () => adminDeactivateUser(userId)) }}
                    disabled={loading !== null}
                    className="text-sm font-medium bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 disabled:opacity-50"
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
