import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { getConnection, getMessages, getMeetingRequests, getCheckinStatus } from '@/lib/database'
import ChatUI from '@/components/dashboard/ChatUI'

type Props = { params: Promise<{ connectionId: string }> }

export default async function ChatPage({ params }: Props) {
  const { connectionId } = await params
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const [connection, messages, meetings, checkinDone, { data: pendingProposal }] = await Promise.all([
    getConnection(connectionId, user.id),
    getMessages(connectionId),
    getMeetingRequests(connectionId),
    getCheckinStatus(connectionId, user.id),
    supabase
      .from('post_meeting_checkins')
      .select('id, profile_id')
      .eq('connection_id', connectionId)
      .eq('outcome', 'nikah_planning')
      .eq('is_proposal', true)
      .eq('proposal_status', 'pending')
      .neq('profile_id', user.id)
      .maybeSingle(),
  ])

  if (!connection) notFound()
  if (connection.status !== 'active') {
    return (
      <div className="flex flex-col h-full items-center justify-center p-8 text-center">
        <p className="text-[#5C5C5C] text-sm">This connection has been closed.</p>
        <Link href="/dashboard" className="mt-4 text-[#AF4D98] text-sm font-medium">
          Back to dashboard
        </Link>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      {/* Chat header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-[#EDE8E3] bg-white">
        <Link href="/dashboard" className="text-[#9B9B9B] hover:text-[#1A1A1A] transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
            <path fillRule="evenodd" d="M17 10a.75.75 0 01-.75.75H5.612l4.158 3.96a.75.75 0 11-1.04 1.08l-5.5-5.25a.75.75 0 010-1.08l5.5-5.25a.75.75 0 111.04 1.08L5.612 9.25H16.25A.75.75 0 0117 10z" clipRule="evenodd" />
          </svg>
        </Link>
        <div className="flex-1 min-w-0">
          <p className="font-medium text-[#1A1A1A] truncate">{connection.other_first_name}</p>
          <p className="text-xs text-[#00A699]">Active connection</p>
        </div>
        <Link
          data-testid="request-meeting-btn"
          href={`/dashboard/meetings/${connectionId}`}
          className="text-sm font-medium text-[#AF4D98] border border-[#AF4D98] px-4 py-1.5 rounded-full hover:bg-[#F5E6F2] transition-colors"
        >
          Meeting
        </Link>
      </div>

      <ChatUI
        connection={connection}
        initialMessages={messages}
        initialMeetings={meetings}
        currentUserId={user.id}
        checkinDone={checkinDone}
        initialPendingProposal={pendingProposal ?? null}
      />
    </div>
  )
}
