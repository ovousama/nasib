'use client'

import { useState } from 'react'
import type { AdminReference } from '@/lib/admin'

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: '2-digit' })
}

export default function ReferencesTable({ references }: { references: AdminReference[] }) {
  const [viewing, setViewing] = useState<AdminReference | null>(null)

  return (
    <>
      <div className="bg-white rounded-2xl shadow-sm border border-[#EBEBEB] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b border-[#EBEBEB] bg-[#FDFAF7]">
                {['Applicant', 'Gender', 'Referee Name', 'Referee Email', 'Relationship', 'Status', 'Submitted', 'Actions'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-[#6B6B6B] uppercase tracking-wide whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {references.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-[#9B9B9B] text-sm">No references found</td>
                </tr>
              )}
              {references.map(ref => (
                <tr key={ref.id} className="hover:bg-[#FDFAF7] transition-colors">
                  <td className="px-4 py-3 font-medium text-[#1A1A1A]">{ref.profile_name}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${ref.profile_gender === 'brother' ? 'bg-blue-50 text-blue-700' : 'bg-pink-50 text-pink-700'}`}>
                      {ref.profile_gender}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-[#1A1A1A]">{ref.referee_name}</td>
                  <td className="px-4 py-3 text-[#6B6B6B] text-xs">{ref.referee_email ?? '—'}</td>
                  <td className="px-4 py-3 text-[#6B6B6B] text-xs">{ref.referee_relationship ?? '—'}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${ref.status === 'completed' ? 'bg-green-100 text-[#AF4D98]' : 'bg-amber-100 text-amber-700'}`}>
                      {ref.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-[#9B9B9B] text-xs whitespace-nowrap">{formatDate(ref.created_at)}</td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => setViewing(ref)}
                      className="text-xs text-[#AF4D98] hover:underline font-medium"
                    >
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail modal */}
      {viewing && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-[#1A1A1A]">Reference Details</h3>
              <button onClick={() => setViewing(null)} className="text-[#9B9B9B] hover:text-[#6B6B6B]">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                  <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
                </svg>
              </button>
            </div>

            <div className="space-y-0 divide-y divide-gray-50">
              {[
                { label: 'Applicant', value: viewing.profile_name },
                { label: 'Gender', value: viewing.profile_gender },
                { label: 'Referee Name', value: viewing.referee_name },
                { label: 'Relationship', value: viewing.referee_relationship },
                { label: 'Email', value: viewing.referee_email },
                { label: 'Phone', value: viewing.referee_phone },
                { label: 'Status', value: viewing.status },
                { label: 'Submitted', value: formatDate(viewing.created_at) },
              ].map(({ label, value }) => value ? (
                <div key={label} className="flex justify-between py-2.5">
                  <span className="text-sm text-[#6B6B6B]">{label}</span>
                  <span className="text-sm text-[#1A1A1A] text-right ml-4 capitalize">{value}</span>
                </div>
              ) : null)}
            </div>

            <button
              onClick={() => setViewing(null)}
              className="w-full mt-5 bg-[#FDFAF7] text-[#1A1A1A] font-medium py-2.5 rounded-xl hover:bg-[#EBEBEB] transition-colors text-sm"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  )
}
