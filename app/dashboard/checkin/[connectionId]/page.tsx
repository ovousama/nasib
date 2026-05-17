'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import CheckinUI from '@/components/dashboard/CheckinUI'
import type { ConnectionDetail } from '@/lib/database'

export default function CheckinPage() {
  const { connectionId } = useParams<{ connectionId: string }>()
  const router = useRouter()
  const [connection, setConnection] = useState<ConnectionDetail | null>(null)
  const [hasPendingProposal, setHasPendingProposal] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        router.replace('/auth/login')
        return
      }

      const { data: conn } = await supabase
        .from('connections')
        .select('id, brother_id, sister_id, status, photos_released, created_at')
        .eq('id', connectionId)
        .single()

      if (!conn) {
        router.replace('/dashboard')
        return
      }

      if (conn.status !== 'active') {
        router.replace(`/dashboard/chat/${connectionId}`)
        return
      }

      // Check for an existing checkin from this user
      const { data: myCheckin } = await supabase
        .from('post_meeting_checkins')
        .select('id, is_proposal, proposal_status')
        .eq('connection_id', connectionId)
        .eq('profile_id', user.id)
        .order('created_at', { ascending: false })
        .maybeSingle()

      if (myCheckin) {
        const isPendingProposal = myCheckin.is_proposal && myCheckin.proposal_status === 'pending'
        if (!isPendingProposal) {
          // Already submitted a final answer — nothing left to do here
          router.replace(`/dashboard/chat/${connectionId}`)
          return
        }
        setHasPendingProposal(true)
      }

      const isBrother = conn.brother_id === user.id
      const otherId = isBrother ? conn.sister_id : conn.brother_id
      const profileTable = isBrother ? 'sister_profiles' : 'brother_profiles'

      const { data: otherProfile } = await supabase
        .from(profileTable)
        .select('id, full_name')
        .eq('id', otherId)
        .single()

      const otherName = otherProfile?.full_name ?? (isBrother ? 'Sister' : 'Brother')

      setConnection({
        id: conn.id,
        brother_id: conn.brother_id,
        sister_id: conn.sister_id,
        status: conn.status,
        photos_released: conn.photos_released,
        created_at: conn.created_at,
        other_name: otherName,
        other_first_name: otherName.split(' ')[0],
        other_id: otherId,
        current_user_gender: isBrother ? 'brother' : 'sister',
      })
      setLoading(false)
    }

    load()
  }, [connectionId, router])

  if (loading || !connection) return null

  return (
    <CheckinUI
      connection={connection}
      connectionId={connectionId}
      hasPendingProposal={hasPendingProposal}
    />
  )
}
