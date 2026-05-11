import { redirect } from 'next/navigation'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import {
  getProfile,
  getBrotherProfile,
  getSisterProfile,
  getWaliProfile,
  getBrotherMatches,
  getSisterMatches,
  getActiveConnections,
  getIncomingPendingInterests,
  getSentPendingInterestOtherIds,
  getNotifications,
} from '@/lib/database'
import BrotherDashboard from '@/components/dashboard/BrotherDashboard'
import SisterDashboard from '@/components/dashboard/SisterDashboard'

export default async function DashboardPage() {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/auth/login')

  const profile = await getProfile(user.id)
  if (!profile) redirect('/auth/login')

  if (profile.status === 'pending_verification') {
    return <PendingVerification />
  }

  if (profile.gender === 'brother') {
    const [brotherProfile, matches, connections, sentInterestOtherIds, incomingInterests, notifications] = await Promise.all([
      getBrotherProfile(user.id),
      getBrotherMatches(user.id),
      getActiveConnections(user.id, 'brother'),
      getSentPendingInterestOtherIds(user.id, 'brother'),
      getIncomingPendingInterests(user.id, 'brother'),
      getNotifications(user.id),
    ])

    if (!brotherProfile) redirect('/onboarding/brother')

    return (
      <BrotherDashboard
        profile={profile}
        brotherProfile={brotherProfile}
        matches={matches}
        connections={connections}
        sentInterestOtherIds={sentInterestOtherIds}
        incomingInterests={incomingInterests}
        notifications={notifications}
      />
    )
  }

  if (profile.gender === 'sister') {
    const [sisterProfile, matches, connections, incomingInterests, notifications] = await Promise.all([
      getSisterProfile(user.id),
      getSisterMatches(user.id),
      getActiveConnections(user.id, 'sister'),
      getIncomingPendingInterests(user.id, 'sister'),
      getNotifications(user.id),
    ])

    if (!sisterProfile) redirect('/onboarding/sister')

    const waliProfile = await getWaliProfile(user.id)

    return (
      <SisterDashboard
        profile={profile}
        sisterProfile={sisterProfile}
        waliProfile={waliProfile}
        matches={matches}
        connections={connections}
        incomingInterests={incomingInterests}
        notifications={notifications}
      />
    )
  }

  redirect('/auth/login')
}

function PendingVerification() {
  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-8rem)] p-4">
      <div className="bg-white rounded-2xl p-8 max-w-sm w-full shadow-sm border border-gray-100 text-center">
        <div className="w-16 h-16 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-5">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="#d97706" className="w-8 h-8">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-3">Application Under Review</h2>
        <p className="text-gray-600 text-sm leading-relaxed mb-6">
          JazakAllah khair for completing your profile. Our team is carefully reviewing your
          application and character reference. We will notify you once verified, in sha Allah.
        </p>
        <div className="bg-amber-50 rounded-xl p-3 border border-amber-100">
          <p className="text-amber-700 text-xs font-medium">
            Verification typically takes 2–5 business days.
          </p>
        </div>
      </div>
    </div>
  )
}
