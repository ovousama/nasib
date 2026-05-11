import Link from 'next/link'
import { getAllReferences } from '@/lib/admin'
import ReferencesTable from '@/components/admin/ReferencesTable'

type Props = {
  searchParams: Promise<{ status?: string }>
}

export default async function ReferencesPage({ searchParams }: Props) {
  const { status } = await searchParams
  const allRefs = await getAllReferences()
  const references = status ? allRefs.filter(r => r.status === status) : allRefs

  return (
    <div className="max-w-7xl">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-xl font-bold text-[#1A1A1A]">References</h2>
          <p className="text-sm text-[#6B6B6B] mt-0.5">{references.length} total</p>
        </div>
      </div>

      <div className="flex gap-3 mb-5">
        {[
          { label: 'All', value: '' },
          { label: 'Pending', value: 'pending' },
          { label: 'Completed', value: 'completed' },
        ].map(opt => (
          <Link
            key={opt.value}
            href={`/admin/references${opt.value ? `?status=${opt.value}` : ''}`}
            className={`text-sm font-medium px-3 py-1.5 rounded-lg border transition-colors ${
              (status ?? '') === opt.value
                ? 'bg-[#AF4D98] text-white border-[#AF4D98]'
                : 'text-[#6B6B6B] border-[#EBEBEB] hover:border-gray-300'
            }`}
          >
            {opt.label}
          </Link>
        ))}
      </div>

      <ReferencesTable references={references} />
    </div>
  )
}
