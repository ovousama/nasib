import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { getConnection } from '@/lib/database'

type Props = { params: Promise<{ connectionId: string }> }

export default async function NikahPage({ params }: Props) {
  const { connectionId } = await params
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const connection = await getConnection(connectionId, user.id)
  if (!connection) redirect('/dashboard')

  return (
    <div className="min-h-screen bg-[#FDFAF7]">
      <div className="px-4 pt-8 pb-4 bg-white border-b border-[#EBEBEB]">
        <Link href="/dashboard" className="text-[#9B9B9B] hover:text-[#6B6B6B] text-sm flex items-center gap-1 mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
            <path fillRule="evenodd" d="M17 10a.75.75 0 01-.75.75H5.612l4.158 3.96a.75.75 0 11-1.04 1.08l-5.5-5.25a.75.75 0 010-1.08l5.5-5.25a.75.75 0 111.04 1.08L5.612 9.25H16.25A.75.75 0 0117 10z" clipRule="evenodd" />
          </svg>
          Back to dashboard
        </Link>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 text-amber-600">
              <path d="M9.653 16.915l-.005-.003-.019-.01a20.759 20.759 0 01-1.162-.682 22.045 22.045 0 01-2.582-2.075C4.504 12.382 3 10.561 3 8.17a5.17 5.17 0 0110 0 5.17 5.17 0 015 .828 5.17 5.17 0 01-5 5.17zm0 0l.005-.003.019-.01a20.759 20.759 0 001.162-.682 22.045 22.045 0 002.582-2.075C14.496 12.382 16 10.561 16 8.17A5.17 5.17 0 006 8.17a5.17 5.17 0 005 5.17z" />
            </svg>
          </div>
          <div>
            <h1 className="text-xl font-bold text-[#1A1A1A]">Nikah Planning</h1>
            <p className="text-sm text-amber-700">Alhamdulillah — May Allah bless this union</p>
          </div>
        </div>
      </div>

      <div className="px-4 py-6 space-y-5 max-w-lg">
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
          <p className="text-sm text-amber-800 leading-relaxed">
            You have expressed your intention to proceed to nikah with <strong>{connection.other_first_name}</strong>. An admin will be in touch to guide you through the next steps. BarakAllahu feekum.
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-[#EBEBEB] shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-[#FDFAF7]">
            <h2 className="text-sm font-semibold text-[#1A1A1A]">Nikah Checklist</h2>
          </div>
          <div className="divide-y divide-gray-50">
            {[
              { label: 'Wali agreement confirmed', note: 'The wali must be present and in agreement.' },
              { label: 'Two male witnesses arranged', note: 'Two adult Muslim men are required.' },
              { label: 'Mahr (dowry) agreed upon', note: 'An amount must be agreed before the nikah.' },
              { label: 'Imam or officiant arranged', note: 'A qualified person to conduct the ceremony.' },
              { label: 'Marriage contract prepared', note: 'Written record of terms agreed.' },
            ].map(item => (
              <div key={item.label} className="px-4 py-3">
                <p className="text-sm font-medium text-[#1A1A1A]">{item.label}</p>
                <p className="text-xs text-[#9B9B9B] mt-0.5">{item.note}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-[#EBEBEB] shadow-sm p-4">
          <h2 className="text-sm font-semibold text-[#1A1A1A] mb-3">Dua for Marriage</h2>
          <div className="bg-[#FDFAF7] rounded-xl p-4 text-center mb-3">
            <p className="text-lg font-arabic leading-loose text-[#1A1A1A] mb-2">
              بَارَكَ اللَّهُ لَكَ، وَبَارَكَ عَلَيْكَ، وَجَمَعَ بَيْنَكُمَا فِي خَيْرٍ
            </p>
            <p className="text-xs text-[#6B6B6B] italic">
              &ldquo;May Allah bless you, and may He bless on you, and may He join you together in goodness.&rdquo;
            </p>
            <p className="text-[10px] text-[#9B9B9B] mt-1">Abu Dawud · Tirmidhi</p>
          </div>
        </div>

        <button
          onClick={() => window.print()}
          className="w-full border border-gray-300 text-[#6B6B6B] font-medium py-2.5 rounded-xl hover:bg-[#FDFAF7] transition-colors text-sm flex items-center justify-center gap-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
            <path fillRule="evenodd" d="M5 2.75C5 1.784 5.784 1 6.75 1h6.5c.966 0 1.75.784 1.75 1.75v3.552c.377.046.752.097 1.126.153A2.212 2.212 0 0118 8.653v4.097A2.25 2.25 0 0115.75 15h-.241l.305 1.984A1.75 1.75 0 0114.084 19H5.915a1.75 1.75 0 01-1.73-2.016L4.49 15H4.25A2.25 2.25 0 012 12.75V8.653c0-1.082.775-2.034 1.874-2.198.374-.056.75-.107 1.126-.153V2.75zm4.5 14.5h1l.321-2h-1.642l.321 2zm-4.049 0h1.572l-.321-2H5.377l.074.481A.25.25 0 005.7 17.25zm9.449-2h-1.323l-.321 2h1.572l.074-.481a.25.25 0 00-.002-.037L14.9 15.25zM6.5 4v8.25a.75.75 0 01-1.5 0v-3.5H4.25a.75.75 0 010-1.5H5V4h10v3.25h.75a.75.75 0 010 1.5H15v3.5a.75.75 0 01-1.5 0V4h-7z" clipRule="evenodd" />
          </svg>
          Print Checklist
        </button>
      </div>
    </div>
  )
}
