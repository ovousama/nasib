'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import BottomNav from './BottomNav'

type ToastItem = {
  id: string
  title: string
  body: string
  route: string
}

type RealtimeNotif = {
  id: string
  type: string
  title: string
  body: string
  metadata: Record<string, string> | null
}

type Props = {
  userId: string
  initialUnreadCount: number
  children: React.ReactNode
}

export function getNotificationRoute(type: string, metadata: Record<string, string> | null): string {
  const meta = metadata ?? {}
  switch (type) {
    case 'interest_received':
    case 'new_interest':
      return '/dashboard#interests'
    case 'interest_accepted':
    case 'mutual_interest':
      return meta.connectionId ? `/dashboard/chat/${meta.connectionId}` : '/dashboard'
    case 'interest_declined':
    case 'connection_closed':
      return '/dashboard'
    case 'meeting_confirmed':
    case 'meeting_requested':
      return meta.connectionId ? `/dashboard/chat/${meta.connectionId}` : '/dashboard'
    case 'checkin_complete':
      return '/dashboard'
    case 'nikah_planning':
      return meta.connectionId ? `/dashboard/nikah/${meta.connectionId}` : '/dashboard'
    case 'match_ready':
    case 'match_refresh':
      return '/dashboard#matches'
    default:
      return '/dashboard'
  }
}

export default function DashboardShell({ userId, initialUnreadCount, children }: Props) {
  const router = useRouter()
  const [unreadCount, setUnreadCount] = useState(initialUnreadCount)
  const [toasts, setToasts] = useState<ToastItem[]>([])

  const dismissToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }, [])

  const refreshCount = useCallback(async () => {
    const supabase = createClient()
    const { count } = await supabase
      .from('notifications')
      .select('id', { count: 'exact', head: true })
      .eq('profile_id', userId)
      .eq('read', false)
    setUnreadCount(count ?? 0)
  }, [userId])

  useEffect(() => {
    const supabase = createClient()

    const channel = supabase
      .channel(`notif:${userId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'notifications', filter: `profile_id=eq.${userId}` },
        (payload) => {
          const notif = payload.new as RealtimeNotif
          const route = getNotificationRoute(notif.type, notif.metadata)
          const toast: ToastItem = { id: notif.id, title: notif.title, body: notif.body, route }
          setUnreadCount(prev => prev + 1)
          setToasts(prev => [...prev.slice(-2), toast])
          setTimeout(() => dismissToast(notif.id), 4000)
        },
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'notifications', filter: `profile_id=eq.${userId}` },
        () => refreshCount(),
      )
      .subscribe()

    const matchChannel = supabase
      .channel('matches-changes')
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'matches', filter: 'status=eq.expired' },
        (payload) => {
          window.dispatchEvent(new CustomEvent('match-expired', { detail: payload.new }))
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
      supabase.removeChannel(matchChannel)
    }
  }, [userId, dismissToast, refreshCount])

  return (
    <>
      <main className="flex-1 pb-20">
        {children}
      </main>
      <BottomNav unreadCount={unreadCount} />

      {/* Toast notifications */}
      <div className="fixed bottom-24 right-4 z-50 flex flex-col gap-2 items-end pointer-events-none">
        {toasts.map(toast => (
          <div
            key={toast.id}
            className="bg-white border border-[#EDE8E3] shadow-[0_2px_8px_rgba(0,0,0,0.08)] rounded-[16px] px-4 py-3 max-w-[280px] w-full pointer-events-auto cursor-pointer"
            onClick={() => {
              dismissToast(toast.id)
              router.push(toast.route)
            }}
          >
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 rounded-full bg-[#AF4D98] flex-shrink-0 mt-1.5" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-[#1A1A1A] leading-tight">{toast.title}</p>
                <p className="text-xs text-[#9B9B9B] mt-0.5 line-clamp-2">{toast.body}</p>
              </div>
              <button
                onClick={e => { e.stopPropagation(); dismissToast(toast.id) }}
                className="text-[#9B9B9B] hover:text-[#5C5C5C] flex-shrink-0 mt-0.5 transition-colors"
                aria-label="Dismiss"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                  <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
                </svg>
              </button>
            </div>
          </div>
        ))}
      </div>
    </>
  )
}
