'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { useCallback } from 'react'

export default function UsersFilter() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const update = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString())
      if (value) {
        params.set(key, value)
      } else {
        params.delete(key)
      }
      params.delete('page')
      router.push(`${pathname}?${params.toString()}`)
    },
    [router, pathname, searchParams],
  )

  return (
    <div className="flex flex-wrap gap-3 mb-5">
      <input
        type="text"
        defaultValue={searchParams.get('search') ?? ''}
        placeholder="Search by name…"
        onChange={e => update('search', e.target.value)}
        className="border border-[#EDE8E3] rounded-full px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#AF4D98] w-48"
      />

      <select
        defaultValue={searchParams.get('gender') ?? ''}
        onChange={e => update('gender', e.target.value)}
        className="border border-[#EDE8E3] rounded-full px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#AF4D98] bg-white"
      >
        <option value="">All genders</option>
        <option value="brother">Brothers</option>
        <option value="sister">Sisters</option>
      </select>

      <select
        defaultValue={searchParams.get('status') ?? ''}
        onChange={e => update('status', e.target.value)}
        className="border border-[#EDE8E3] rounded-full px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#AF4D98] bg-white"
      >
        <option value="">All statuses</option>
        <option value="pending_verification">Pending Verification</option>
        <option value="active">Active</option>
        <option value="verified">Verified</option>
        <option value="inactive">Inactive</option>
      </select>
    </div>
  )
}
