import Link from 'next/link'
import { Suspense } from 'react'
import { getAllUsers, getUsersNeedingMatchRefresh } from '@/lib/admin'
import UsersFilter from '@/components/admin/UsersFilter'

type Props = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

function str(v: string | string[] | undefined): string | undefined {
  return typeof v === 'string' ? v : undefined
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    pending_verification: 'bg-amber-100 text-amber-700',
    active: 'bg-green-100 text-[#AF4D98]',
    verified: 'bg-green-100 text-[#AF4D98]',
    inactive: 'bg-[#FDFAF7] text-[#6B6B6B]',
  }
  return (
    <span className={`inline-block text-xs font-medium px-2 py-0.5 rounded-full ${map[status] ?? 'bg-[#FDFAF7] text-[#6B6B6B]'}`}>
      {status.replace(/_/g, ' ')}
    </span>
  )
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: '2-digit' })
}

export default async function UsersPage({ searchParams }: Props) {
  const params = await searchParams
  const page = parseInt(str(params.page) ?? '1')
  const pageSize = 20

  const [{ users, total }, needsRefreshIds] = await Promise.all([
    getAllUsers({
      gender: str(params.gender) as 'brother' | 'sister' | undefined,
      status: str(params.status),
      search: str(params.search),
      page,
      pageSize,
    }),
    getUsersNeedingMatchRefresh(),
  ])

  const needsRefresh = new Set(needsRefreshIds)
  const totalPages = Math.ceil(total / pageSize)

  return (
    <div className="max-w-7xl">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-xl font-bold text-[#1A1A1A]">Users</h2>
          <p className="text-sm text-[#6B6B6B] mt-0.5">{total} total</p>
        </div>
      </div>

      <Suspense>
        <UsersFilter />
      </Suspense>

      <div className="bg-white rounded-2xl shadow-sm border border-[#EBEBEB] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b border-[#EBEBEB] bg-[#FDFAF7]">
                {['Name', 'Gender', 'Age', 'Location', 'Status', 'Verified', 'Reference', 'Joined', ''].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-[#6B6B6B] uppercase tracking-wide whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {users.length === 0 && (
                <tr>
                  <td colSpan={9} className="px-4 py-8 text-center text-[#9B9B9B] text-sm">
                    No users found
                  </td>
                </tr>
              )}
              {users.map(user => (
                <tr key={user.id} className="hover:bg-[#FDFAF7] transition-colors">
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="flex flex-col gap-1">
                      <span className="font-medium text-[#1A1A1A]">
                        {user.full_name || <span className="text-[#9B9B9B] italic">No profile</span>}
                      </span>
                      {needsRefresh.has(user.id) && (
                        <Link
                          href={`/admin/matches/new?userId=${user.id}`}
                          className="inline-flex w-fit items-center gap-1 text-[10px] font-semibold bg-amber-100 text-amber-700 border border-amber-200 px-1.5 py-0.5 rounded-full hover:bg-amber-200 transition-colors"
                          title="User needs new matches — click to create"
                        >
                          🔄 Needs Matches
                        </Link>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${user.gender === 'brother' ? 'bg-blue-50 text-blue-700' : 'bg-pink-50 text-pink-700'}`}>
                      {user.gender}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-[#6B6B6B]">{user.age ?? '—'}</td>
                  <td className="px-4 py-3 text-[#6B6B6B] max-w-[120px] truncate">{user.location ?? '—'}</td>
                  <td className="px-4 py-3"><StatusBadge status={user.status} /></td>
                  <td className="px-4 py-3">
                    {user.verification_badge ? (
                      <span className="text-[#AF4D98] text-xs font-medium">Yes</span>
                    ) : (
                      <span className="text-[#9B9B9B] text-xs">No</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {user.reference_status ? (
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${user.reference_status === 'completed' ? 'bg-[#F5E6F2] text-[#AF4D98]' : 'bg-amber-50 text-amber-700'}`}>
                        {user.reference_status}
                      </span>
                    ) : (
                      <span className="text-[#9B9B9B] text-xs">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-[#9B9B9B] text-xs whitespace-nowrap">{formatDate(user.created_at)}</td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/users/${user.id}`}
                      className="text-[#AF4D98] text-xs font-medium hover:underline"
                    >
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-[#EBEBEB]">
            <p className="text-xs text-[#6B6B6B]">
              Page {page} of {totalPages} · {total} users
            </p>
            <div className="flex gap-2">
              {page > 1 && (
                <Link
                  href={`/admin/users?${new URLSearchParams({ ...Object.fromEntries(Object.entries(params).filter(([, v]) => typeof v === 'string') as [string, string][]), page: String(page - 1) })}`}
                  className="text-xs text-[#AF4D98] border border-[#AF4D98] px-3 py-1.5 rounded-lg hover:bg-[#F5E6F2]"
                >
                  Previous
                </Link>
              )}
              {page < totalPages && (
                <Link
                  href={`/admin/users?${new URLSearchParams({ ...Object.fromEntries(Object.entries(params).filter(([, v]) => typeof v === 'string') as [string, string][]), page: String(page + 1) })}`}
                  className="text-xs bg-[#AF4D98] text-white px-3 py-1.5 rounded-lg hover:bg-[#9B3D85]"
                >
                  Next
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
