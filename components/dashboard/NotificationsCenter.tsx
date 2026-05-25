'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { markNotificationRead, markAllNotificationsRead } from '@/app/dashboard/actions'
import { getNotificationRoute } from '@/components/dashboard/DashboardShell'
import type { Notification } from '@/lib/database'


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
    <div className="bg-[#FDF8F3] min-h-screen px-6 pt-[72px] pb-6 lg:pt-[76px]">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-[26px] font-medium text-[#1A1A1A] tracking-[-0.02em]">Notifications</h1>
          {hasUnread && (
            <p className="text-sm text-[#9B9B9B] mt-0.5">
              {effectiveNotifications.filter(n => !n.read).length} unread
            </p>
          )}
        </div>
        {hasUnread && (
          <button
            data-testid="mark-all-read-btn"
            onClick={handleMarkAll}
            disabled={markingAll || isPending}
            className="text-sm font-medium text-[#AF4D98] disabled:opacity-50 transition-colors"
          >
            {markingAll ? 'Marking…' : 'Mark all read'}
          </button>
        )}
      </div>

      {/* Empty state */}
      {notifications.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <p className="text-[20px] text-[#F4E4BA] mb-2">نصيب</p>
          <p className="text-lg font-medium text-[#1A1A1A] mt-3">No notifications yet</p>
          <p className="text-sm text-[#9B9B9B] max-w-[260px] mx-auto text-center mt-1">
            We will notify you when something happens, in sha Allah.
          </p>
        </div>
      )}

      {/* Grouped list */}
      <div className="space-y-6">
        {groups.map(group => (
          <div key={group.label}>
            <p className="text-[11px] font-medium uppercase tracking-[0.06em] text-[#9B9B9B] mb-4">
              {group.label}
            </p>
            <div className="space-y-2">
              {group.items.map(notif => {
                const isUnread = !notif.read
                return (
                  <button
                    key={notif.id}
                    onClick={() => handleClick(notif)}
                    className={`w-full text-left rounded-[16px] p-4 border transition-all duration-150 group ${
                      isUnread
                        ? 'bg-[#F9F0F6] border-[#EDE8E3] shadow-[0_1px_3px_rgba(0,0,0,0.06)]'
                        : 'bg-white border-[#EDE8E3]'
                    } hover:border-[#D4CBC4]`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 mt-0.5">
                        <span className={`inline-block w-1.5 h-1.5 rounded-full flex-shrink-0 mt-1 ${isUnread ? 'bg-[#AF4D98]' : 'bg-[#EDE8E3]'}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <p className={`text-sm leading-snug ${isUnread ? 'font-medium text-[#1A1A1A]' : 'font-normal text-[#5C5C5C]'}`}>
                            {notif.title}
                          </p>
                          <span className="text-xs text-[#9B9B9B] flex-shrink-0 mt-0.5">
                            {formatRelative(notif.created_at)}
                          </span>
                        </div>
                        <p className="text-xs text-[#9B9B9B] mt-0.5 leading-relaxed line-clamp-2">
                          {notif.body}
                        </p>
                      </div>
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
