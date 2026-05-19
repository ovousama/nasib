'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { sendMessage, confirmMeeting, declineMeeting } from '@/app/dashboard/actions'
import type { Message, MeetingRequest, ConnectionDetail } from '@/lib/database'
import type { RealtimeChannel } from '@supabase/supabase-js'

type PendingProposal = { id: string; profile_id: string }

const SUGGESTED_QUESTIONS = [
  'What does a typical day look like for you?',
  'What are your long-term goals in life?',
  'How do you like to spend your weekends?',
  'What role does family play in your daily life?',
  'What qualities are most important to you in a spouse?',
]

type TimelineItem =
  | { kind: 'message'; created_at: string; msg: Message }
  | { kind: 'meeting'; created_at: string; meeting: MeetingRequest }

type Props = {
  connection: ConnectionDetail
  initialMessages: Message[]
  initialMeetings: MeetingRequest[]
  currentUserId: string
  checkinDone: boolean
  initialPendingProposal: PendingProposal | null
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

function MeetingCard({
  meeting, currentUserId, connectionId, checkinDone, onConfirm, onDecline,
}: {
  meeting: MeetingRequest
  currentUserId: string
  connectionId: string
  checkinDone: boolean
  onConfirm: (meetingId: string, slot: string) => Promise<void>
  onDecline: (meetingId: string) => Promise<void>
}) {
  const isSender = meeting.requested_by === currentUserId
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const slots = [meeting.slot_1, meeting.slot_2, meeting.slot_3].filter(Boolean) as string[]
  const formatLabel = meeting.format === 'in_person' ? 'In Person' : 'Virtual'

  if (meeting.status === 'confirmed') {
    const isPast = meeting.confirmed_slot ? new Date(meeting.confirmed_slot) < new Date() : false
    const showCheckin = isPast && !checkinDone
    return (
      <div className="mx-auto w-full max-w-[85%] my-3">
        <div className="bg-[#E6F9F7] border border-[#9DF7E5] rounded-[16px] p-4">
          <div className="flex items-center gap-2 mb-2">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 text-[#00A699] flex-shrink-0">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
            </svg>
            <span className="text-sm font-medium text-[#00A699]">Meeting Confirmed</span>
          </div>
          <p className="text-sm text-[#1A1A1A] font-medium mb-1">
            {meeting.confirmed_slot ? formatSlot(meeting.confirmed_slot) : ''}
          </p>
          <p className="text-xs text-[#5C5C5C]">{formatLabel}</p>
          {meeting.format === 'virtual' ? (
            <p className="text-xs text-[#00A699] mt-1">Meeting will take place in-app</p>
          ) : meeting.location_or_link ? (
            <p className="text-xs text-[#5C5C5C] mt-1">{meeting.location_or_link}</p>
          ) : null}
          {showCheckin && (
            <div className="mt-3 pt-3 border-t border-[#9DF7E5]/40">
              <Link
                href={`/dashboard/checkin/${connectionId}`}
                className="text-sm font-medium text-[#00A699] flex items-center justify-between"
              >
                <span>Complete Post-Meeting Check-in</span>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                  <path fillRule="evenodd" d="M3 10a.75.75 0 01.75-.75h10.638L10.23 5.29a.75.75 0 111.04-1.08l5.5 5.25a.75.75 0 010 1.08l-5.5 5.25a.75.75 0 11-1.04-1.08l4.158-3.96H3.75A.75.75 0 013 10z" clipRule="evenodd" />
                </svg>
              </Link>
            </div>
          )}
        </div>
      </div>
    )
  }

  if (meeting.status === 'cancelled') {
    return (
      <div className="mx-auto w-full max-w-[85%] my-3">
        <div className="bg-[#FAF4EE] border border-[#EDE8E3] rounded-[16px] p-3 text-center">
          <p className="text-xs text-[#9B9B9B]">Meeting request declined</p>
        </div>
      </div>
    )
  }

  if (isSender) {
    return (
      <div className="mx-auto w-full max-w-[85%] my-3">
        <div className="bg-white border border-[#EDE8E3] rounded-[16px] p-4 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
          <div className="flex items-center gap-2 mb-3">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 text-[#9B9B9B] flex-shrink-0">
              <path fillRule="evenodd" d="M5.75 2a.75.75 0 01.75.75V4h7V2.75a.75.75 0 011.5 0V4h.25A2.75 2.75 0 0118 6.75v8.5A2.75 2.75 0 0115.25 18H4.75A2.75 2.75 0 012 15.25v-8.5A2.75 2.75 0 014.75 4H5V2.75A.75.75 0 015.75 2zm-1 5.5c-.69 0-1.25.56-1.25 1.25v6.5c0 .69.56 1.25 1.25 1.25h10.5c.69 0 1.25-.56 1.25-1.25v-6.5c0-.69-.56-1.25-1.25-1.25H4.75z" clipRule="evenodd" />
            </svg>
            <span className="text-sm font-medium text-[#1A1A1A]">Meeting Request</span>
            <span className="ml-auto text-xs text-[#9B9B9B]">{formatLabel}</span>
          </div>
          <div className="space-y-1.5 mb-3">
            {slots.map((slot, i) => (
              <div key={slot} className="flex items-center gap-2">
                <span className="w-4 h-4 rounded-full bg-[#F9F0F6] text-[#AF4D98] text-[10px] flex items-center justify-center font-medium flex-shrink-0">
                  {i + 1}
                </span>
                <span className="text-sm text-[#5C5C5C]">{formatSlot(slot)}</span>
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

  return (
    <div className="mx-auto w-full max-w-[85%] my-3">
      <div className="bg-white border-l-2 border-l-[#AF4D98] border border-[#EDE8E3] rounded-[16px] p-4 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
        <div className="flex items-center gap-2 mb-3">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 text-[#AF4D98] flex-shrink-0">
            <path fillRule="evenodd" d="M5.75 2a.75.75 0 01.75.75V4h7V2.75a.75.75 0 011.5 0V4h.25A2.75 2.75 0 0118 6.75v8.5A2.75 2.75 0 0115.25 18H4.75A2.75 2.75 0 012 15.25v-8.5A2.75 2.75 0 014.75 4H5V2.75A.75.75 0 015.75 2zm-1 5.5c-.69 0-1.25.56-1.25 1.25v6.5c0 .69.56 1.25 1.25 1.25h10.5c.69 0 1.25-.56 1.25-1.25v-6.5c0-.69-.56-1.25-1.25-1.25H4.75z" clipRule="evenodd" />
          </svg>
          <span className="text-sm font-medium text-[#1A1A1A]">Meeting Request</span>
          <span className="ml-auto text-xs text-[#AF4D98] font-medium">{formatLabel}</span>
        </div>

        <p className="text-xs text-[#5C5C5C] mb-2">Select a time that works for you:</p>
        <div className="space-y-2 mb-4">
          {slots.map((slot) => (
            <button
              key={slot}
              onClick={() => setSelectedSlot(slot)}
              className={`w-full text-left px-3 py-2.5 rounded-[10px] border text-sm transition-colors ${
                selectedSlot === slot
                  ? 'border-[#AF4D98] bg-[#F9F0F6] text-[#AF4D98] font-medium'
                  : 'border-[#EDE8E3] text-[#1A1A1A] hover:border-[#D4CBC4]'
              }`}
            >
              <span className="flex items-center gap-2">
                <span className={`w-3.5 h-3.5 rounded-full border-2 flex-shrink-0 ${selectedSlot === slot ? 'border-[#AF4D98] bg-[#AF4D98]' : 'border-[#D4CBC4]'}`} />
                {formatSlot(slot)}
              </span>
            </button>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={async () => { setLoading(true); await onDecline(meeting.id); setLoading(false) }}
            disabled={loading}
            className="text-sm font-medium text-[#C13515] border border-[#C13515]/30 py-2.5 rounded-full hover:bg-[#FDECEA] disabled:opacity-50 transition-colors"
          >
            Decline
          </button>
          <button
            onClick={async () => {
              if (!selectedSlot) return
              setLoading(true)
              await onConfirm(meeting.id, selectedSlot)
              setLoading(false)
            }}
            disabled={!selectedSlot || loading}
            className="text-sm font-medium bg-[#AF4D98] text-white py-2.5 rounded-full hover:bg-[#9B3D85] disabled:opacity-40 transition-colors"
          >
            {loading ? '…' : 'Accept'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function ChatUI({ connection, initialMessages, initialMeetings, currentUserId, checkinDone, initialPendingProposal }: Props) {
  const router = useRouter()
  const [messages, setMessages] = useState<Message[]>(initialMessages)
  const [meetings, setMeetings] = useState<MeetingRequest[]>(initialMeetings)
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const [showSuggestions, setShowSuggestions] = useState(initialMessages.length === 0 && initialMeetings.length === 0)
  const [isConnected, setIsConnected] = useState(false)
  const [pendingProposal, setPendingProposal] = useState<PendingProposal | null>(initialPendingProposal)
  const [checkinLoading, setCheckinLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const channelRef = useRef<RealtimeChannel | null>(null)

  const scrollToBottom = () => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, meetings])

  useEffect(() => {
    const supabase = createClient()

    function handleNewMessage(msg: Message) {
      setMessages(prev => prev.some(m => m.id === msg.id) ? prev : [...prev, msg])
      scrollToBottom()
    }

    const channel = supabase
      .channel(`chat-${connection.id}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages', filter: `connection_id=eq.${connection.id}` }, (payload) => {
        handleNewMessage(payload.new as Message)
      })
      .on('broadcast', { event: 'new_message' }, ({ payload }) => {
        handleNewMessage(payload.message as Message)
      })
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'meeting_requests', filter: `connection_id=eq.${connection.id}` }, (payload) => {
        const meeting = payload.new as MeetingRequest
        setMeetings(prev => prev.some(m => m.id === meeting.id) ? prev : [...prev, meeting])
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'meeting_requests', filter: `connection_id=eq.${connection.id}` }, (payload) => {
        const updated = payload.new as MeetingRequest
        setMeetings(prev => prev.map(m => m.id === updated.id ? updated : m))
      })
      .subscribe((status) => {
        console.log('Chat subscription status:', status)
        setIsConnected(status === 'SUBSCRIBED')
      })

    channelRef.current = channel
    return () => { supabase.removeChannel(channel); channelRef.current = null }
  }, [connection.id])

  // Realtime: detect incoming nikah proposals from the other party
  useEffect(() => {
    const supabase = createClient()
    const channel = supabase
      .channel(`proposal-${connection.id}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'post_meeting_checkins', filter: `connection_id=eq.${connection.id}` },
        (payload) => {
          const row = payload.new as { outcome: string; is_proposal: boolean; profile_id: string; id: string }
          if (row.outcome === 'nikah_planning' && row.is_proposal && row.profile_id !== currentUserId) {
            setPendingProposal({ id: row.id, profile_id: row.profile_id })
          }
        }
      )
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [connection.id, currentUserId])

  const handleCheckin = async (outcome: 'nikah_planning' | 'continue') => {
    setCheckinLoading(true)
    const supabase = createClient()
    const { data, error } = await supabase.rpc('submit_checkin', {
      p_connection_id: connection.id,
      p_outcome: outcome,
    })
    setCheckinLoading(false)
    if (error) return
    const result = data as { status: string }
    if (result.status === 'confirmed') {
      router.push(`/dashboard/nikah/${connection.id}`)
    } else if (result.status === 'continue') {
      setPendingProposal(null)
    }
  }

  const handleSend = async (content: string, isSuggested = false) => {
    if (!content.trim() || sending) return
    setSending(true)
    setInput('')
    setShowSuggestions(false)

    const tempId = `temp-${Date.now()}`
    const optimistic: Message = {
      id: tempId,
      connection_id: connection.id,
      sender_id: currentUserId,
      content: content.trim(),
      is_suggested_question: isSuggested,
      created_at: new Date().toISOString(),
    }
    setMessages(prev => [...prev, optimistic])
    scrollToBottom()

    const result = await sendMessage(connection.id, content, isSuggested)
    setSending(false)

    if (result?.error) {
      setMessages(prev => prev.filter(m => m.id !== tempId))
      setInput(content)
      return
    }

    if (result?.message) {
      setMessages(prev => prev.map(m => m.id === tempId ? result.message! : m))
      channelRef.current?.send({
        type: 'broadcast',
        event: 'new_message',
        payload: { message: result.message },
      })
    }
  }

  const handleConfirm = async (meetingId: string, slot: string) => {
    const result = await confirmMeeting(meetingId, slot)
    if (!result?.error) {
      setMeetings(prev => prev.map(m =>
        m.id === meetingId ? { ...m, status: 'confirmed', confirmed_slot: slot, confirmed_at: new Date().toISOString() } : m,
      ))
    }
  }

  const handleDecline = async (meetingId: string) => {
    const result = await declineMeeting(meetingId)
    if (!result?.error) {
      setMeetings(prev => prev.map(m => m.id === meetingId ? { ...m, status: 'cancelled' } : m))
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend(input)
    }
  }

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
      {/* Nikah proposal banner */}
      {pendingProposal && (
        <div
          className="flex-shrink-0 px-5 py-4 flex flex-col gap-3"
          style={{ background: 'linear-gradient(135deg, #F5E6F2, #F4E4BA)', borderBottom: '1px solid rgba(175,77,152,0.2)' }}
        >
          <div>
            <p className="text-[15px] font-medium text-[#AF4D98]">🤍 Nikah Planning Proposed</p>
            <p className="text-[13px] text-[#5C5C5C] mt-1">
              Your match would like to move forward to nikah planning. Do you agree?
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => handleCheckin('nikah_planning')}
              disabled={checkinLoading}
              className="flex-1 bg-[#AF4D98] text-white rounded-full py-2.5 text-sm font-medium hover:bg-[#9B3D85] disabled:opacity-50 transition-colors"
            >
              Yes, I agree 🤍
            </button>
            <button
              onClick={() => handleCheckin('continue')}
              disabled={checkinLoading}
              className="flex-1 bg-white text-[#5C5C5C] border border-[#EDE8E3] rounded-full py-2.5 text-sm hover:border-[#D4CBC4] disabled:opacity-50 transition-colors"
            >
              Not yet
            </button>
          </div>
        </div>
      )}

      {/* Timeline */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-2 bg-[#FDF8F3]">
        {allItems.length === 0 && (
          <div className="text-center py-8">
            <p className="text-[#9B9B9B] text-sm">Bismillah. Begin your conversation with kindness.</p>
          </div>
        )}

        {grouped.map(group => (
          <div key={group.day}>
            <div className="text-center text-xs text-[#9B9B9B] my-3">
              {group.day}
            </div>

            {group.items.map(item => {
              if (item.kind === 'meeting') {
                return (
                  <MeetingCard
                    key={item.meeting.id}
                    meeting={item.meeting}
                    currentUserId={currentUserId}
                    connectionId={connection.id}
                    checkinDone={checkinDone}
                    onConfirm={handleConfirm}
                    onDecline={handleDecline}
                  />
                )
              }

              const msg = item.msg
              const isOwn = msg.sender_id === currentUserId
              return (
                <div key={msg.id} className={`flex mt-4 ${isOwn ? 'justify-end' : 'justify-start'}`}>
                  <div
                    className={`text-[15px] leading-relaxed px-4 py-2.5 ${
                      isOwn
                        ? 'bg-[#AF4D98] text-white rounded-[18px_18px_4px_18px] max-w-[75%] ml-auto'
                        : msg.is_suggested_question
                        ? 'bg-[#F9F0F6] text-[#AF4D98] border border-[#AF4D98]/10 rounded-[18px_18px_18px_4px] max-w-[75%]'
                        : 'bg-white border border-[#EDE8E3] text-[#1A1A1A] rounded-[18px_18px_18px_4px] max-w-[75%]'
                    }`}
                  >
                    {msg.is_suggested_question && !isOwn && (
                      <p className="text-[10px] font-medium text-[#AF4D98]/60 mb-1 uppercase tracking-wide">
                        Suggested question
                      </p>
                    )}
                    <p className="whitespace-pre-wrap break-words">{msg.content}</p>
                    <p className={`text-[10px] mt-1 text-right ${isOwn ? 'text-white/60' : 'text-[#9B9B9B]'}`}>
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

      {/* Wali notice */}
      <div className="mx-4 mb-2 bg-[#FFF4CC] border border-[#FFB400]/20 rounded-[10px] px-3 py-2 flex items-center justify-between gap-2">
        <p className="text-[#6B4F00] text-xs flex-1 text-center">
          The wali has been notified of this connection and can read this conversation.
        </p>
        <span className="text-[10px] flex-shrink-0" style={{ color: isConnected ? '#00A699' : '#9B9B9B' }}>
          {isConnected ? '● Live' : '○ Connecting…'}
        </span>
      </div>

      {/* Suggested questions */}
      {showSuggestions && (
        <div data-testid="suggested-questions" className="border-t border-[#EDE8E3] flex gap-2 px-4 py-2.5 overflow-x-auto">
          {SUGGESTED_QUESTIONS.map((q) => (
            <button
              key={q}
              onClick={() => handleSend(q, true)}
              className="flex-shrink-0 border border-[#EDE8E3] rounded-full px-3 py-1.5 text-sm text-[#5C5C5C] bg-white hover:border-[#AF4D98] hover:text-[#AF4D98] transition-colors whitespace-nowrap"
            >
              {q}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="border-t border-[#EDE8E3] px-4 py-3 bg-white flex items-center gap-2">
        <button
          onClick={() => setShowSuggestions(s => !s)}
          className="flex-shrink-0 text-[#9B9B9B] hover:text-[#AF4D98] transition-colors"
          aria-label="Suggested questions"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM8.94 6.94a.75.75 0 11-1.061-1.061 3 3 0 112.871 5.026v.345a.75.75 0 01-1.5 0v-.5c0-.72.57-1.172 1.081-1.287A1.5 1.5 0 108.94 6.94zM10 15a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
          </svg>
        </button>
        <textarea
          data-testid="message-input"
          ref={inputRef}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type a message…"
          rows={1}
          maxLength={1000}
          className="flex-1 bg-[#FDF8F3] rounded-full px-4 py-2.5 text-sm border border-[#EDE8E3] focus:outline-none focus:border-[#AF4D98] text-[#1A1A1A] placeholder-[#9B9B9B] resize-none max-h-32 overflow-y-auto transition-colors"
          style={{ height: 'auto' }}
          onInput={e => {
            const el = e.currentTarget
            el.style.height = 'auto'
            el.style.height = `${el.scrollHeight}px`
          }}
        />
        <button
          data-testid="send-btn"
          onClick={() => handleSend(input)}
          disabled={!input.trim() || sending}
          className="flex-shrink-0 w-10 h-10 rounded-full bg-[#AF4D98] flex items-center justify-center hover:bg-[#9B3D85] transition-colors disabled:opacity-40"
          aria-label="Send"
        >
          {sending ? (
            <svg className="animate-spin w-4 h-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 text-white">
              <path d="M3.105 2.289a.75.75 0 00-.826.95l1.903 6.308a.75.75 0 00.63.525l4.802.625-4.802.625a.75.75 0 00-.63.525L2.279 17.76a.75.75 0 00.826.95 28.896 28.896 0 0015.293-7.154.75.75 0 000-1.115A28.897 28.897 0 003.105 2.289z" />
            </svg>
          )}
        </button>
      </div>
    </div>
  )
}
