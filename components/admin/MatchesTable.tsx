'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { adminExpireMatch } from '@/app/admin/actions'
import type { AdminMatch } from '@/lib/admin'

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: '2-digit' })
}

export default function MatchesTable({ matches }: { matches: AdminMatch[] }) {
  const router = useRouter()
  const [confirming, setConfirming] = useState<string | null>(null)
  const [loading, setLoading] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleExpire = async (matchId: string) => {
    setLoading(matchId)
    setError(null)
    const result = await adminExpireMatch(matchId)
    setLoading(null)
    setConfirming(null)
    if (result?.error) setError(result.error)
    else router.refresh()
  }

  return (
    <div className="bg-white rounded-[16px] shadow-[0_1px_3px_rgba(0,0,0,0.06)] border border-[#EDE8E3] overflow-hidden">
      {error && (
        <div className="mx-4 mt-4 bg-red-50 border border-red-200 rounded-[10px] p-3 text-sm text-red-700">{error}</div>
      )}
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="border-b border-[#EDE8E3]">
              {['Brother', 'Sister', 'Compatibility Note', 'Status', 'Assigned', 'Actions'].map(h => (
                <th key={h} className="text-left px-4 py-3 text-[11px] font-medium uppercase tracking-[0.06em] text-[#9B9B9B] whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {matches.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-[#9B9B9B] text-sm">No matches found</td>
              </tr>
            )}
            {matches.map((m, idx) => (
              <tr key={m.id} className={`border-b border-[#EDE8E3] hover:bg-[#FAF4EE] transition-colors ${idx === matches.length - 1 ? 'border-b-0' : ''}`}>
                <td className="px-4 py-3 font-medium text-[#1A1A1A]">{m.brother_name}</td>
                <td className="px-4 py-3 font-medium text-[#1A1A1A]">{m.sister_name}</td>
                <td className="px-4 py-3 text-[#5C5C5C] max-w-[200px] truncate">{m.compatibility_note ?? '—'}</td>
                <td className="px-4 py-3">
                  <span className={`text-[11px] font-medium px-2.5 py-1 rounded-full ${m.status === 'active' ? 'bg-[#F9F0F6] text-[#AF4D98]' : 'bg-[#FAF4EE] text-[#9B9B9B]'}`}>
                    {m.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-[#9B9B9B] text-xs whitespace-nowrap">{formatDate(m.created_at)}</td>
                <td className="px-4 py-3">
                  {m.status === 'active' && (
                    confirming === m.id ? (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleExpire(m.id)}
                          disabled={loading === m.id}
                          className="text-xs font-medium text-white bg-red-600 px-2.5 py-1 rounded-full hover:bg-red-700 disabled:opacity-50 transition-colors"
                        >
                          {loading === m.id ? '…' : 'Confirm'}
                        </button>
                        <button onClick={() => setConfirming(null)} className="text-xs text-[#9B9B9B] hover:text-[#5C5C5C]">
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setConfirming(m.id)}
                        className="text-sm text-[#C13515]"
                      >
                        Expire
                      </button>
                    )
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
