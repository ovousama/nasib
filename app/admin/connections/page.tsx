import { getAllConnections } from '@/lib/admin'
import ConnectionsTable from '@/components/admin/ConnectionsTable'

export default async function ConnectionsPage() {
  const connections = await getAllConnections()
  const active = connections.filter(c => c.status === 'active')
  const closed = connections.filter(c => c.status !== 'active')

  return (
    <div className="max-w-6xl">
      <div className="mb-5">
        <h2 className="text-xl font-medium tracking-[-0.02em] text-[#1A1A1A]">Connections</h2>
        <p className="text-sm text-[#5C5C5C] mt-0.5">{active.length} active · {closed.length} closed</p>
      </div>

      {active.length > 0 && (
        <div className="mb-8">
          <h3 className="text-sm font-medium tracking-[-0.02em] text-[#1A1A1A] mb-3">Active</h3>
          <ConnectionsTable connections={active} />
        </div>
      )}

      {closed.length > 0 && (
        <div>
          <h3 className="text-sm font-medium tracking-[-0.02em] text-[#1A1A1A] mb-3">Closed</h3>
          <ConnectionsTable connections={closed} />
        </div>
      )}

      {connections.length === 0 && (
        <div className="bg-white rounded-[16px] p-8 text-center border border-dashed border-[#EDE8E3]">
          <p className="text-[#9B9B9B] text-sm">No connections yet</p>
        </div>
      )}
    </div>
  )
}
