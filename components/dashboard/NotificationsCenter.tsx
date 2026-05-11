'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { markNotificationRead, markAllNotificationsRead } from '@/app/dashboard/actions'
import { getNotificationRoute } from '@/components/dashboard/DashboardShell'
import type { Notification } from '@/lib/database'

const NOTIFICATION_ICONS: Record<string, string> = {
  interest_received: '💌',
  new_interest: '💌',
  interest_accepted: '✅',
  mutual_interest: '✅',
  interest_declined: '🤝',
  connection_closed: '🔒',
  meeting_confirmed: '📅',
  meeting_requested: '🗓',
  checkin_complete: '🤍',
  nikah_planning: '☀️',
  match_ready: '⭐',
  match_refresh: '🔄',
}

function getIcon(type: string) {
  return NOTIFICATION_ICONS[type] ?? '🔔'
}

function formatRelative(dateStr: string): string {
  const diffMs = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diffMs / 60000)
  if (mins < 1) return 'Just now'
  if (mins < 60) return `${mins} min ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs} hour${hrs > 1 ? 's' : ''} ago`
  const days = Math.floor(hrs / 24)
  if (days === 1) return 'Yesterday'
  return `${days} days ago`
}

function groupByDate(notifications: Notification[]) {
  const todayStart = new Date()
  todayStart.setHours(0, 0, 0, 0)
  const yesterdayStart = new Date(todayStart.getTime() - 86400000)

  const groups: { label: string; items: Notification[] }[] = []
  const today = notifications.filter(n => new Date(n.created_at) >= todayStart)
  const yesterday = notifications.filter(n => {
    const d = new Date(n.created_at)
    return d >= yesterdayStart && d < todayStart
  })
  const earlier = notifications.filter(n => new Date(n.created_at) < yesterdayStart)

  if (today.length) groups.push({ label: 'Today', items: today })
  if (yesterday.length) groups.push({ label: 'Yesterday', items: yesterday })
  if (earlier.length) groups.push({ label: 'Earlier', items: earlier })

  return groups
}

type Props = {
  notifications: Notification[]
}

export default function NotificationsCenter({ notifications }: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [localRead, setLocalRead] = useState<Set<string>>(new Set())
  const [markingAll, setMarkingAll] = useState(false)

  const effectiveNotifications = notifications.map(n => ({
    ...n,
    read: n.read || localRead.has(n.id),
  }))

  const hasUnread = effectiveNotifications.some(n => !n.read)
  const groups = groupByDate(effectiveNotifications)

  const handleClick = async (notif: Notification) => {
    if (!notif.read && !localRead.has(notif.id)) {
      setLocalRead(prev => new Set(prev).add(notif.id))
      startTransition(async () => { await markNotificationRead(notif.id) })
    }
    const route = getNotificationRoute(notif.type, notif.metadata)
    router.push(route)
  }

  const handleMarkAll = async () => {
    setMarkingAll(true)
    const unreadIds = notifications.filter(n => !n.read).map(n => n.id)
    setLocalRead(new Set(unreadIds))
    await markAllNotificationsRead()
    setMarkingAll(false)
    router.refresh()
  }

  return (
    <div className="px-6 py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-[#1A1A1A] tracking-tight">Notifications</h1>
          {hasUnread && (
            <p className="text-sm text-[#6B6B6B] mt-0.5 leading-relaxed">
              {effectiveNotifications.filter(n => !n.read).length} unread
            </p>
          )}
        </div>
        {hasUnread && (
          <button
            onClick={handleMarkAll}
            disabled={markingAll || isPending}
            className="text-xs font-medium text-[#AF4D98] border border-[#AF4D98] px-4 py-2 rounded-full hover:bg-[#F5E6F2] disabled:opacity-50 transition-colors active:scale-95"
          >
            {markingAll ? 'Marking…' : 'Mark all read'}
          </button>
        )}
      </div>

      {/* Empty state */}
      {notifications.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-16 h-16 bg-[#F5E6F2] rounded-2xl flex items-center justify-center mb-4 text-2xl">
            🔔
          </div>
          <p className="text-[#6B6B6B] text-sm leading-relaxed max-w-[240px]">
            No notifications yet. We will notify you when something happens, in sha Allah.
          </p>
        </div>
      )}

      {/* Grouped list */}
      <div className="space-y-6">
        {groups.map(group => (
          <div key={group.label}>
            <p className="text-xs font-semibold text-[#9B9B9B] uppercase tracking-wide mb-3">
              {group.label}
            </p>
            <div className="space-y-2">
              {group.items.map(notif => {
                const isUnread = !notif.read
                return (
                  <button
                    key={notif.id}
                    onClick={() => handleClick(notif)}
                    className={`w-full text-left rounded-2xl p-4 border transition-all duration-200 group ${
                      isUnread
                        ? 'bg-white border-l-[3px] border-l-[#AF4D98] border-t-[#EBEBEB] border-r-[#EBEBEB] border-b-[#EBEBEB] shadow-[0_1px_2px_rgba(0,0,0,0.08),0_4px_12px_rgba(0,0,0,0.05)]'
                        : 'bg-white border-[#EBEBEB] border-l-[3px] border-l-transparent opacity-70 hover:opacity-100'
                    } hover:shadow-[0_2px_4px_rgba(0,0,0,0.08),0_8px_24px_rgba(0,0,0,0.08)]`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-9 h-9 rounded-xl bg-[#F5E6F2] flex items-center justify-center flex-shrink-0 text-base">
                        {getIcon(notif.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <p className={`text-sm leading-snug ${isUnread ? 'font-semibold text-[#1A1A1A]' : 'font-medium text-[#6B6B6B]'}`}>
                            {notif.title}
                          </p>
                          <span className="text-[10px] text-[#9B9B9B] flex-shrink-0 mt-0.5">
                            {formatRelative(notif.created_at)}
                          </span>
                        </div>
                        <p className="text-xs text-[#6B6B6B] mt-0.5 leading-relaxed line-clamp-2">
                          {notif.body}
                        </p>
                      </div>
                      {isUnread && (
                        <span className="w-2 h-2 rounded-full bg-[#AF4D98] flex-shrink-0 mt-1.5" />
                      )}
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
