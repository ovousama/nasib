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
    pending_verification: 'bg-[#FEF9EC] text-[#8A6A00]',
    active: 'bg-[#F9F0F6] text-[#AF4D98]',
    verified: 'bg-[#E6F9F7] text-[#00857A]',
    inactive: 'bg-[#FAF4EE] text-[#9B9B9B]',
  }
  return (
    <span className={`inline-block text-[11px] font-medium px-2.5 py-1 rounded-full ${map[status] ?? 'bg-[#FAF4EE] text-[#9B9B9B]'}`}>
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
          <h2 className="text-xl font-medium tracking-[-0.02em] text-[#1A1A1A]">Users</h2>
          <p className="text-sm text-[#5C5C5C] mt-0.5">{total} total</p>
        </div>
      </div>

      <Suspense>
        <UsersFilter />
      </Suspense>

      <div className="bg-white rounded-[16px] shadow-[0_1px_3px_rgba(0,0,0,0.06)] border border-[#EDE8E3] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b border-[#EDE8E3]">
                {['Name', 'Gender', 'Age', 'Location', 'Status', 'Verified', 'Reference', 'Joined', ''].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-[11px] font-medium uppercase tracking-[0.06em] text-[#9B9B9B] whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {users.length === 0 && (
                <tr>
                  <td colSpan={9} className="px-4 py-8 text-center text-[#9B9B9B] text-sm">
                    No users found
                  </td>
                </tr>
              )}
              {users.map((user, idx) => (
                <tr key={user.id} className={`border-b border-[#EDE8E3] hover:bg-[#FAF4EE] transition-colors ${idx === users.length - 1 ? 'border-b-0' : ''}`}>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="flex flex-col gap-1">
                      <span className="font-medium text-[#1A1A1A]">
                        {user.full_name || <span className="text-[#9B9B9B] italic">No profile</span>}
                      </span>
                      {needsRefresh.has(user.id) && (
                        <Link
                          href={`/admin/matches/new?userId=${user.id}`}
                          className="inline-flex w-fit items-center gap-1 text-[10px] font-medium bg-[#FEF9EC] text-[#8A6A00] border border-[#F0D060] px-1.5 py-0.5 rounded-full hover:bg-[#FEF3CC] transition-colors"
                          title="User needs new matches — click to create"
                        >
                          Needs Matches
                        </Link>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-[11px] font-medium px-2.5 py-1 rounded-full ${user.gender === 'brother' ? 'bg-blue-50 text-blue-700' : 'bg-pink-50 text-pink-700'}`}>
                      {user.gender}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-[#5C5C5C]">{user.age ?? '—'}</td>
                  <td className="px-4 py-3 text-[#5C5C5C] max-w-[120px] truncate">{user.location ?? '—'}</td>
                  <td className="px-4 py-3"><StatusBadge status={user.status} /></td>
                  <td className="px-4 py-3">
                    {user.verification_badge ? (
                      <span className="text-[#AF4D98] text-[11px] font-medium">Yes</span>
                    ) : (
                      <span className="text-[#9B9B9B] text-[11px]">No</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {user.reference_status ? (
                      <span className={`text-[11px] font-medium px-2.5 py-1 rounded-full ${user.reference_status === 'completed' ? 'bg-[#E6F9F7] text-[#00857A]' : 'bg-[#FEF9EC] text-[#8A6A00]'}`}>
                        {user.reference_status}
                      </span>
                    ) : (
                      <span className="text-[#9B9B9B] text-[11px]">—</span>
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
          <div className="flex items-center justify-between px-4 py-3 border-t border-[#EDE8E3]">
            <p className="text-xs text-[#5C5C5C]">
              Page {page} of {totalPages} · {total} users
            </p>
            <div className="flex gap-2">
              {page > 1 && (
                <Link
                  href={`/admin/users?${new URLSearchParams({ ...Object.fromEntries(Object.entries(params).filter(([, v]) => typeof v === 'string') as [string, string][]), page: String(page - 1) })}`}
                  className="text-xs text-[#AF4D98] border border-[#EDE8E3] px-3 py-1.5 rounded-full hover:bg-[#F9F0F6] transition-colors font-medium"
                >
                  Previous
                </Link>
              )}
              {page < totalPages && (
                <Link
                  href={`/admin/users?${new URLSearchParams({ ...Object.fromEntries(Object.entries(params).filter(([, v]) => typeof v === 'string') as [string, string][]), page: String(page + 1) })}`}
                  className="text-xs bg-[#AF4D98] text-white px-3 py-1.5 rounded-full hover:bg-[#9B3D85] transition-colors font-medium"
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
