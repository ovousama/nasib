import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { getConnection, getMeetingRequests } from '@/lib/database'
import MeetingsUI from '@/components/dashboard/MeetingsUI'

type Props = { params: Promise<{ connectionId: string }> }

export default async function MeetingsPage({ params }: Props) {
  const { connectionId } = await params
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const [connection, meetings] = await Promise.all([
    getConnection(connectionId, user.id),
    getMeetingRequests(connectionId),
  ])

  if (!connection) notFound()

  return (
    <div className="min-h-screen pt-[72px] lg:pt-[76px]" style={{ background: 'linear-gradient(160deg, #F5E6F2 0%, #F4E4BA 60%, #FDF8F3 100%)' }}>
      <div className="bg-white border-b border-[#EDE8E3] px-4 py-3 flex items-center gap-3">
        <Link href={`/dashboard/chat/${connectionId}`} className="text-[#5C5C5C] hover:text-[#1A1A1A] transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
            <path fillRule="evenodd" d="M17 10a.75.75 0 01-.75.75H5.612l4.158 3.96a.75.75 0 11-1.04 1.08l-5.5-5.25a.75.75 0 010-1.08l5.5-5.25a.75.75 0 111.04 1.08L5.612 9.25H16.25A.75.75 0 0117 10z" clipRule="evenodd" />
          </svg>
        </Link>
        <div className="flex-1">
          <p className="font-medium text-[#1A1A1A]">Meetings</p>
          <p className="text-xs text-[#5C5C5C]">With {connection.other_first_name}</p>
        </div>
      </div>

      <MeetingsUI
        connection={connection}
        initialMeetings={meetings}
        currentUserId={user.id}
      />
    </div>
  )
}
