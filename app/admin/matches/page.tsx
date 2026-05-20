import Link from 'next/link'
import { getAllMatches } from '@/lib/admin'
import MatchesTable from '@/components/admin/MatchesTable'

type Props = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function MatchesPage({ searchParams }: Props) {
  const params = await searchParams
  const status = typeof params.status === 'string' ? params.status : undefined
  const matches = await getAllMatches({ status })

  return (
    <div className="max-w-6xl">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-xl font-medium tracking-[-0.02em] text-[#1A1A1A]">Matches</h2>
          <p className="text-sm text-[#5C5C5C] mt-0.5">{matches.length} total</p>
        </div>
        <Link
          href="/admin/matches/new"
          className="rounded-full bg-[#AF4D98] text-white text-sm font-medium px-4 py-2 hover:bg-[#9B3D85] transition-colors"
        >
          + Assign New Match
        </Link>
      </div>

      <div className="flex gap-3 mb-5">
        {[
          { label: 'All', value: '' },
          { label: 'Active', value: 'active' },
          { label: 'Expired', value: 'expired' },
          { label: 'History', value: 'closed' },
        ].map(opt => (
          <Link
            key={opt.value}
            href={`/admin/matches${opt.value ? `?status=${opt.value}` : ''}`}
            className={`text-sm font-medium px-3 py-1.5 rounded-full border transition-colors ${
              (status ?? '') === opt.value
                ? 'bg-[#AF4D98] text-white border-[#AF4D98]'
                : 'text-[#5C5C5C] border-[#EDE8E3] hover:border-[#D4CBC4]'
            }`}
          >
            {opt.label}
          </Link>
        ))}
      </div>

      <MatchesTable matches={matches} />
    </div>
  )
}
