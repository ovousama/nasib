import { getAllConnections } from '@/lib/admin'
import ConnectionsTable from '@/components/admin/ConnectionsTable'

export default async function ConnectionsPage() {
  const connections = await getAllConnections()
  const active = connections.filter(c => c.status === 'active')
  const closed = connections.filter(c => c.status !== 'active')

  return (
    <div className="max-w-6xl">
      <div className="mb-5">
        <h2 className="text-xl font-bold text-[#1A1A1A]">Connections</h2>
        <p className="text-sm text-[#6B6B6B] mt-0.5">{active.length} active · {closed.length} closed</p>
      </div>

      {active.length > 0 && (
        <div className="mb-8">
          <h3 className="text-sm font-semibold text-[#1A1A1A] mb-3">Active</h3>
          <ConnectionsTable connections={active} />
        </div>
      )}

      {closed.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-[#1A1A1A] mb-3">Closed</h3>
          <ConnectionsTable connections={closed} />
        </div>
      )}

      {connections.length === 0 && (
        <div className="bg-white rounded-2xl p-8 text-center border border-dashed border-[#EBEBEB]">
          <p className="text-[#9B9B9B] text-sm">No connections yet</p>
        </div>
      )}
    </div>
  )
}
