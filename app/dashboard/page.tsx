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
  if (!profile) redirect('/onboarding')

  if (profile.status === 'pending_verification') {
    return <PendingVerification />
  }

  if (profile.gender === 'brother') {
    const [brotherProfile, matches, connections, sentInterestOtherIds, incomingInterests, notifications, { data: refRow }] = await Promise.all([
      getBrotherProfile(user.id),
      getBrotherMatches(user.id),
      getActiveConnections(user.id, 'brother'),
      getSentPendingInterestOtherIds(user.id, 'brother'),
      getIncomingPendingInterests(user.id, 'brother'),
      getNotifications(user.id),
      supabase.from('references').select('profile_id').eq('profile_id', user.id).maybeSingle(),
    ])

    if (!brotherProfile) redirect('/dashboard/profile/edit/basic')

    return (
      <BrotherDashboard
        profile={profile}
        brotherProfile={brotherProfile}
        matches={matches}
        connections={connections}
        sentInterestOtherIds={sentInterestOtherIds}
        incomingInterests={incomingInterests}
        notifications={notifications}
        profileComplete={profile.profile_complete ?? false}
        completionPercentage={profile.profile_completion_percentage ?? 0}
        hasReference={!!refRow}
      />
    )
  }

  if (profile.gender === 'sister') {
    const [sisterProfile, matches, connections, incomingInterests, notifications, { data: refRow }] = await Promise.all([
      getSisterProfile(user.id),
      getSisterMatches(user.id),
      getActiveConnections(user.id, 'sister'),
      getIncomingPendingInterests(user.id, 'sister'),
      getNotifications(user.id),
      supabase.from('references').select('profile_id').eq('profile_id', user.id).maybeSingle(),
    ])

    if (!sisterProfile) redirect('/dashboard/profile/edit/basic')

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
        profileComplete={profile.profile_complete ?? false}
        completionPercentage={profile.profile_completion_percentage ?? 0}
        hasReference={!!refRow}
      />
    )
  }

  redirect('/auth/login')
}

function PendingVerification() {
  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-8rem)] p-6">
      <div className="max-w-sm w-full text-center">
        <div className="w-12 h-12 bg-[#FEF9EC] rounded-full flex items-center justify-center mx-auto mb-5">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="#B8860B" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h2 className="text-xl font-medium text-[#1A1A1A] tracking-[-0.02em] mb-2">Application Under Review</h2>
        <p className="text-[#5C5C5C] text-sm leading-relaxed">
          JazakAllah khair for completing your profile. Our team is carefully reviewing your
          application and character reference. We will notify you once verified, in sha Allah.
        </p>
        <div className="mt-6 bg-[#FEF9EC] border border-[#EDE8E3] rounded-[10px] px-4 py-3">
          <p className="text-[#8A6A00] text-xs">
            Verification typically takes 2–5 business days.
          </p>
        </div>
      </div>
    </div>
  )
}
