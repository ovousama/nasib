'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { adminCloseConnection } from '@/app/admin/actions'
import type { AdminConnection } from '@/lib/admin'

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: '2-digit' })
}

export default function ConnectionsTable({ connections }: { connections: AdminConnection[] }) {
  const router = useRouter()
  const [confirming, setConfirming] = useState<string | null>(null)
  const [loading, setLoading] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleClose = async (connId: string) => {
    setLoading(connId)
    setError(null)
    const result = await adminCloseConnection(connId)
    setLoading(null)
    setConfirming(null)
    if (result?.error) setError(result.error)
    else router.refresh()
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-[#EBEBEB] overflow-hidden">
      {error && (
        <div className="mx-4 mt-4 bg-red-50 border border-red-200 rounded-xl p-3 text-sm text-red-700">{error}</div>
      )}
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="border-b border-[#EBEBEB] bg-[#FDFAF7]">
              {['Brother', 'Sister', 'Status', 'Connected', 'Meetings', 'Actions'].map(h => (
                <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-[#6B6B6B] uppercase tracking-wide whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {connections.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-[#9B9B9B] text-sm">No connections found</td>
              </tr>
            )}
            {connections.map(conn => (
              <tr key={conn.id} className="hover:bg-[#FDFAF7] transition-colors">
                <td className="px-4 py-3 font-medium text-[#1A1A1A]">{conn.brother_name}</td>
                <td className="px-4 py-3 font-medium text-[#1A1A1A]">{conn.sister_name}</td>
                <td className="px-4 py-3">
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${conn.status === 'active' ? 'bg-green-100 text-[#AF4D98]' : 'bg-[#FDFAF7] text-[#6B6B6B]'}`}>
                    {conn.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-[#9B9B9B] text-xs whitespace-nowrap">{formatDate(conn.created_at)}</td>
                <td className="px-4 py-3 text-[#6B6B6B] text-center">{conn.meeting_count}</td>
                <td className="px-4 py-3">
                  {conn.status === 'active' && (
                    confirming === conn.id ? (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleClose(conn.id)}
                          disabled={loading === conn.id}
                          className="text-xs font-medium text-white bg-red-600 px-2.5 py-1 rounded-lg hover:bg-red-700 disabled:opacity-50"
                        >
                          {loading === conn.id ? '…' : 'Confirm'}
                        </button>
                        <button onClick={() => setConfirming(null)} className="text-xs text-[#9B9B9B] hover:text-[#6B6B6B]">
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setConfirming(conn.id)}
                        className="text-xs text-red-600 hover:text-red-700 font-medium"
                      >
                        Close
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
