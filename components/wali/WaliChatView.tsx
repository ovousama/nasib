'use client'

import { useEffect, useRef, useState } from 'react'
import { createClient } from '@/lib/supabase'
import type { Message, MeetingRequest, ConnectionDetail } from '@/lib/database'

type TimelineItem =
  | { kind: 'message'; created_at: string; msg: Message }
  | { kind: 'meeting'; created_at: string; meeting: MeetingRequest }

type Props = {
  connection: ConnectionDetail
  initialMessages: Message[]
  initialMeetings: MeetingRequest[]
  sisterId: string
}

function formatTime(dateStr: string) {
  return new Date(dateStr).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
}

function formatSlot(dateStr: string) {
  return new Date(dateStr).toLocaleString('en-GB', {
    weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
  })
}

function formatDay(dateStr: string) {
  const d = new Date(dateStr)
  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(today.getDate() - 1)
  if (d.toDateString() === today.toDateString()) return 'Today'
  if (d.toDateString() === yesterday.toDateString()) return 'Yesterday'
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
}

function ReadOnlyMeetingCard({ meeting }: { meeting: MeetingRequest }) {
  const slots = [meeting.slot_1, meeting.slot_2, meeting.slot_3].filter(Boolean) as string[]
  const formatLabel = meeting.format === 'in_person' ? 'In Person' : 'Virtual'

  if (meeting.status === 'confirmed') {
    return (
      <div className="mx-auto w-full max-w-[85%] my-3">
        <div className="bg-[#E6F9F7] border border-[#00A699]/20 rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 text-[#00A699] flex-shrink-0">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
            </svg>
            <span className="text-sm font-semibold text-[#00A699]">Meeting Confirmed</span>
          </div>
          <p className="text-sm text-[#1A1A1A] font-medium mb-1">
            {meeting.confirmed_slot ? formatSlot(meeting.confirmed_slot) : ''}
          </p>
          <p className="text-xs text-[#6B6B6B]">{formatLabel}</p>
          {meeting.format === 'virtual' ? (
            <p className="text-xs text-[#00A699] mt-1">Meeting will take place in-app</p>
          ) : meeting.location_or_link ? (
            <p className="text-xs text-[#6B6B6B] mt-1">{meeting.location_or_link}</p>
          ) : null}
        </div>
      </div>
    )
  }

  if (meeting.status === 'cancelled') {
    return (
      <div className="mx-auto w-full max-w-[85%] my-3">
        <div className="bg-[#FDFAF7] border border-[#EBEBEB] rounded-2xl p-3 text-center">
          <p className="text-xs text-[#9B9B9B]">Meeting request declined</p>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto w-full max-w-[85%] my-3">
      <div className="bg-white border border-[#EBEBEB] rounded-2xl p-4 shadow-[0_1px_2px_rgba(0,0,0,0.08),0_4px_12px_rgba(0,0,0,0.05)]">
        <div className="flex items-center gap-2 mb-3">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 text-[#9B9B9B] flex-shrink-0">
            <path fillRule="evenodd" d="M5.75 2a.75.75 0 01.75.75V4h7V2.75a.75.75 0 011.5 0V4h.25A2.75 2.75 0 0118 6.75v8.5A2.75 2.75 0 0115.25 18H4.75A2.75 2.75 0 012 15.25v-8.5A2.75 2.75 0 014.75 4H5V2.75A.75.75 0 015.75 2zm-1 5.5c-.69 0-1.25.56-1.25 1.25v6.5c0 .69.56 1.25 1.25 1.25h10.5c.69 0 1.25-.56 1.25-1.25v-6.5c0-.69-.56-1.25-1.25-1.25H4.75z" clipRule="evenodd" />
          </svg>
          <span className="text-sm font-semibold text-[#1A1A1A]">Meeting Request</span>
          <span className="ml-auto text-xs text-[#9B9B9B]">{formatLabel}</span>
        </div>
        <div className="space-y-1.5 mb-3">
          {slots.map((slot, i) => (
            <div key={slot} className="flex items-center gap-2">
              <span className="w-4 h-4 rounded-full bg-[#F5E6F2] text-[#AF4D98] text-[10px] flex items-center justify-center font-medium flex-shrink-0">
                {i + 1}
              </span>
              <span className="text-sm text-[#6B6B6B]">{formatSlot(slot)}</span>
            </div>
          ))}
        </div>
        <p className="text-xs text-[#FFB400] flex items-center gap-1">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-3 h-3">
            <path fillRule="evenodd" d="M8 15A7 7 0 108 1a7 7 0 000 14zm.75-10.25a.75.75 0 00-1.5 0v4c0 .414.336.75.75.75h2.5a.75.75 0 000-1.5H8.75v-3.25z" clipRule="evenodd" />
          </svg>
          Awaiting response…
        </p>
      </div>
    </div>
  )
}

export default function WaliChatView({ connection, initialMessages, initialMeetings, sisterId }: Props) {
  const [messages, setMessages] = useState<Message[]>(initialMessages)
  const [meetings, setMeetings] = useState<MeetingRequest[]>(initialMeetings)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'instant' })
  }, [])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, meetings])

  useEffect(() => {
    const supabase = createClient()
    const channel = supabase
      .channel(`wali-chat:${connection.id}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages', filter: `connection_id=eq.${connection.id}` }, (payload) => {
        const msg = payload.new as Message
        setMessages(prev => prev.some(m => m.id === msg.id) ? prev : [...prev, msg])
      })
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'meeting_requests', filter: `connection_id=eq.${connection.id}` }, (payload) => {
        const meeting = payload.new as MeetingRequest
        setMeetings(prev => prev.some(m => m.id === meeting.id) ? prev : [...prev, meeting])
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'meeting_requests', filter: `connection_id=eq.${connection.id}` }, (payload) => {
        const updated = payload.new as MeetingRequest
        setMeetings(prev => prev.map(m => m.id === updated.id ? updated : m))
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [connection.id])

  const allItems: TimelineItem[] = [
    ...messages.map(m => ({ kind: 'message' as const, created_at: m.created_at, msg: m })),
    ...meetings.map(m => ({ kind: 'meeting' as const, created_at: m.created_at, meeting: m })),
  ].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())

  const grouped: { day: string; items: TimelineItem[] }[] = []
  for (const item of allItems) {
    const day = formatDay(item.created_at)
    const last = grouped[grouped.length - 1]
    if (last?.day === day) last.items.push(item)
    else grouped.push({ day, items: [item] })
  }

  return (
    <div className="flex flex-col h-full">
      {/* Wali observer banner */}
      <div className="bg-[#F5E6F2] border-b border-[#AF4D98]/10 px-4 py-2.5">
        <p className="text-xs text-[#AF4D98] font-medium text-center">
          👁 As wali you can see this conversation but cannot participate
        </p>
      </div>

      {/* Timeline */}
      <div className="flex-1 overflow-y-auto px-4 py-4 bg-[#FDFAF7]">
        {allItems.length === 0 && (
          <div className="text-center py-12">
            <p className="text-[#9B9B9B] text-sm">No messages yet in this conversation.</p>
          </div>
        )}

        {grouped.map(group => (
          <div key={group.day}>
            <div className="flex items-center gap-3 my-4">
              <div className="flex-1 h-px bg-[#EBEBEB]" />
              <span className="text-xs text-[#9B9B9B] font-medium">{group.day}</span>
              <div className="flex-1 h-px bg-[#EBEBEB]" />
            </div>

            {group.items.map(item => {
              if (item.kind === 'meeting') {
                return <ReadOnlyMeetingCard key={item.meeting.id} meeting={item.meeting} />
              }

              const msg = item.msg
              const isSister = msg.sender_id === sisterId
              return (
                <div key={msg.id} className={`flex mb-2 ${isSister ? 'justify-end' : 'justify-start'}`}>
                  <div
                    className={`max-w-[75%] rounded-3xl px-4 py-2.5 ${
                      isSister
                        ? 'bg-[#AF4D98] text-white rounded-tr-sm'
                        : msg.is_suggested_question
                        ? 'bg-[#F5E6F2] text-[#AF4D98] border border-[#AF4D98]/10 rounded-tl-sm'
                        : 'bg-white text-[#1A1A1A] border border-[#EBEBEB] shadow-sm rounded-tl-sm'
                    }`}
                  >
                    {msg.is_suggested_question && !isSister && (
                      <p className="text-[10px] font-medium text-[#AF4D98]/60 mb-1 uppercase tracking-wide">
                        Suggested question
                      </p>
                    )}
                    <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">{msg.content}</p>
                    <p className={`text-[10px] mt-1 text-right ${isSister ? 'text-white/60' : 'text-[#9B9B9B]'}`}>
                      {formatTime(msg.created_at)}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Read-only footer */}
      <div className="border-t border-[#EBEBEB] bg-white px-4 py-4">
        <p className="text-xs text-[#9B9B9B] text-center">
          Read-only view — only the sister and brother can send messages
        </p>
      </div>
    </div>
  )
}
