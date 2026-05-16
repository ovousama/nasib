import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import {
  getWaliForCurrentUser,
  getWaliConnectionDetail,
  getWaliMessages,
  getWaliMeetingRequests,
} from '@/lib/database'
import WaliChatView from '@/components/wali/WaliChatView'

type Props = { params: Promise<{ connectionId: string }> }

export default async function WaliChatPage({ params }: Props) {
  const { connectionId } = await params
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const waliProfile = await getWaliForCurrentUser()
  if (!waliProfile) redirect('/auth/login')

  const [connection, messages, meetings] = await Promise.all([
    getWaliConnectionDetail(connectionId, waliProfile.sister_id),
    getWaliMessages(connectionId),
    getWaliMeetingRequests(connectionId),
  ])

  if (!connection) notFound()

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-[#EDE8E3] bg-white">
        <Link href="/wali/dashboard" className="text-[#9B9B9B] hover:text-[#1A1A1A] transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
            <path fillRule="evenodd" d="M17 10a.75.75 0 01-.75.75H5.612l4.158 3.96a.75.75 0 11-1.04 1.08l-5.5-5.25a.75.75 0 010-1.08l5.5-5.25a.75.75 0 111.04 1.08L5.612 9.25H16.25A.75.75 0 0117 10z" clipRule="evenodd" />
          </svg>
        </Link>
        <div className="flex-1 min-w-0">
          <p className="font-medium text-[#1A1A1A] truncate">{connection.other_first_name}</p>
          <p className="text-xs text-[#AF4D98]">Read-only view — You are observing this conversation</p>
        </div>
      </div>

      <WaliChatView
        connection={connection}
        initialMessages={messages}
        initialMeetings={meetings}
        sisterId={waliProfile.sister_id}
      />
    </div>
  )
}
