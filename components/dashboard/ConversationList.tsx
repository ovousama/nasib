'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase'

type Conversation = {
  id: string
  otherName: string
  status: string
}

export default function ConversationList({ userId }: { userId: string }) {
  const pathname = usePathname()
  const [conversations, setConversations] = useState<Conversation[]>([])

  useEffect(() => {
    async function load() {
      const supabase = createClient()

      const { data: profile } = await supabase
        .from('profiles')
        .select('gender')
        .eq('id', userId)
        .single()

      const isBrother = profile?.gender === 'brother'

      const { data: conns } = await supabase
        .from('connections')
        .select('id, brother_id, sister_id, status')
        .eq(isBrother ? 'brother_id' : 'sister_id', userId)
        .in('status', ['active', 'nikah_planning'])
        .order('created_at', { ascending: false })

      if (!conns?.length) { setConversations([]); return }

      const otherIds = conns.map(c => isBrother ? c.sister_id : c.brother_id)
      const profileTable = isBrother ? 'sister_profiles' : 'brother_profiles'
      const fallback = isBrother ? 'Sister' : 'Brother'

      const { data: profiles } = await supabase
        .from(profileTable)
        .select('id, full_name')
        .in('id', otherIds)

      setConversations(conns.map(c => ({
        id: c.id,
        otherName: profiles?.find(p => p.id === (isBrother ? c.sister_id : c.brother_id))?.full_name ?? fallback,
        status: c.status,
      })))
    }
    load()
  }, [userId])

  return (
    <div className="w-80 flex-shrink-0 border-r border-[#EDE8E3] bg-white flex flex-col h-full">
      <div className="px-4 py-4 border-b border-[#EDE8E3]">
        <p className="text-[12px] font-medium uppercase tracking-[0.06em] text-[#9B9B9B]">Conversations</p>
      </div>
      <div className="flex-1 overflow-y-auto">
        {conversations.map(conv => {
          const isActive = pathname === `/dashboard/chat/${conv.id}`
          const initials = conv.otherName.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()
          return (
            <Link
              key={conv.id}
              href={`/dashboard/chat/${conv.id}`}
              className={`flex items-center gap-3 px-4 py-3.5 border-b border-[#EDE8E3] hover:bg-[#FAF4EE] transition-colors ${
                isActive ? 'bg-[#F9F0F6]' : ''
              }`}
            >
              <div className="w-9 h-9 rounded-full bg-[#F5E6F2] flex items-center justify-center flex-shrink-0">
                <span className="text-[12px] font-medium text-[#AF4D98]">{initials}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-medium truncate ${isActive ? 'text-[#AF4D98]' : 'text-[#1A1A1A]'}`}>
                  {conv.otherName.split(' ')[0]}
                </p>
                {conv.status === 'nikah_planning' && (
                  <p className="text-xs text-[#AF4D98] mt-0.5">Nikah planning</p>
                )}
              </div>
            </Link>
          )
        })}
        {conversations.length === 0 && (
          <div className="px-4 py-8 text-center">
            <p className="text-sm text-[#9B9B9B]">No active conversations</p>
          </div>
        )}
      </div>
    </div>
  )
}
