import Link from 'next/link'
import { getAllBrothers, getAllSisters } from '@/lib/admin'
import NewMatchForm from '@/components/admin/NewMatchForm'

type Props = {
  searchParams: Promise<{ brotherId?: string; sisterId?: string }>
}

export default async function NewMatchPage({ searchParams }: Props) {
  const params = await searchParams
  const [brothers, sisters] = await Promise.all([getAllBrothers(), getAllSisters()])

  return (
    <div className="max-w-2xl">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/admin/matches" className="text-[#9B9B9B] hover:text-[#6B6B6B]">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
            <path fillRule="evenodd" d="M17 10a.75.75 0 01-.75.75H5.612l4.158 3.96a.75.75 0 11-1.04 1.08l-5.5-5.25a.75.75 0 010-1.08l5.5-5.25a.75.75 0 111.04 1.08L5.612 9.25H16.25A.75.75 0 0117 10z" clipRule="evenodd" />
          </svg>
        </Link>
        <div>
          <h2 className="text-xl font-bold text-[#1A1A1A]">Assign New Match</h2>
          <p className="text-sm text-[#6B6B6B] mt-0.5">Select a brother and sister to create a match</p>
        </div>
      </div>

      <NewMatchForm
        brothers={brothers}
        sisters={sisters}
        defaultBrotherId={params.brotherId ?? ''}
        defaultSisterId={params.sisterId ?? ''}
      />
    </div>
  )
}
