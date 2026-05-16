import Link from 'next/link'
import { getAdminStats } from '@/lib/admin'

function StatCard({
  label,
  value,
  href,
  color = 'green',
}: {
  label: string
  value: number
  href: string
  color?: 'green' | 'amber' | 'blue' | 'gray'
}) {
  return (
    <Link href={href} className="bg-white rounded-[16px] p-5 shadow-[0_1px_3px_rgba(0,0,0,0.06)] border border-[#EDE8E3] hover:border-[#AF4D98] transition-colors block">
      <p className="text-[11px] uppercase tracking-[0.06em] text-[#9B9B9B] mt-1">{label}</p>
      <p className={`text-2xl font-medium tracking-[-0.02em] mt-1 ${color === 'green' ? 'text-[#AF4D98]' : color === 'amber' ? 'text-amber-600' : color === 'blue' ? 'text-blue-600' : 'text-[#1A1A1A]'}`}>
        {value.toLocaleString()}
      </p>
    </Link>
  )
}

export default async function AdminDashboard() {
  const stats = await getAdminStats()

  return (
    <div className="max-w-5xl">
      <div className="mb-6">
        <h2 className="text-xl font-medium tracking-[-0.02em] text-[#1A1A1A]">Overview</h2>
        <p className="text-sm text-[#5C5C5C] mt-1">Platform statistics at a glance</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        <StatCard label="Brothers" value={stats.total_brothers} href="/admin/users?gender=brother" color="green" />
        <StatCard label="Sisters" value={stats.total_sisters} href="/admin/users?gender=sister" color="green" />
        <StatCard label="Pending Verification" value={stats.pending_verification} href="/admin/users?status=pending_verification" color="amber" />
        <StatCard label="Active Connections" value={stats.active_connections} href="/admin/connections" color="blue" />
        <StatCard label="Active Matches" value={stats.total_matches} href="/admin/matches" color="green" />
        <StatCard label="Confirmed Meetings" value={stats.confirmed_meetings} href="/admin/connections" color="gray" />
      </div>

      <div className="mb-4">
        <h3 className="text-base font-medium tracking-[-0.02em] text-[#1A1A1A] mb-3">Quick Actions</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Review Users', href: '/admin/users?status=pending_verification', desc: 'Pending verification' },
            { label: 'Assign Match', href: '/admin/matches/new', desc: 'Create new match' },
            { label: 'View References', href: '/admin/references?status=pending', desc: 'Pending references' },
            { label: 'All Connections', href: '/admin/connections', desc: 'Active connections' },
          ].map(action => (
            <Link
              key={action.href}
              href={action.href}
              className="bg-white rounded-[16px] p-4 shadow-[0_1px_3px_rgba(0,0,0,0.06)] border border-[#EDE8E3] hover:border-[#AF4D98] hover:bg-[#F9F0F6] transition-colors"
            >
              <p className="text-sm font-medium text-[#1A1A1A]">{action.label}</p>
              <p className="text-xs text-[#5C5C5C] mt-0.5">{action.desc}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
