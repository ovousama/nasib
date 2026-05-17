import { redirect } from 'next/navigation'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import AdminSidebar from '@/components/admin/AdminSidebar'
import NasibLogo from '@/components/ui/NasibLogo'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user || user.app_metadata?.role !== 'admin') {
    redirect('/dashboard')
  }

  return (
    <div className="flex min-h-screen bg-[#FDF8F3]">
      <AdminSidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-white border-b border-[#EDE8E3] px-6 py-4 flex items-center justify-between sticky top-0 z-10">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <NasibLogo size="sm" theme="light" />
            <span style={{ fontSize: '11px', letterSpacing: '0.15em', textTransform: 'uppercase', color: '#9B9B9B', fontWeight: 400, marginTop: '2px' }}>
              Admin
            </span>
          </div>
          <span className="text-xs text-[#9B9B9B]">{user.email}</span>
        </header>
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
