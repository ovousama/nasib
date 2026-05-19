'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import CheckinUI from '@/components/dashboard/CheckinUI'
import CoupleIllustration from '@/components/illustrations/CoupleIllustration'
import type { ConnectionDetail } from '@/lib/database'

type PageState = 'loading' | 'checkin' | 'waiting_for_response'

export default function CheckinPage() {
  const { connectionId } = useParams<{ connectionId: string }>()
  const router = useRouter()
  const [pageState, setPageState] = useState<PageState>('loading')
  const [connection, setConnection] = useState<ConnectionDetail | null>(null)

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

      const { data: myCheckin } = await supabase
        .from('post_meeting_checkins')
        .select('id, outcome')
        .eq('connection_id', connectionId)
        .eq('profile_id', user.id)
        .order('created_at', { ascending: false })
        .maybeSingle()

      if (myCheckin?.outcome) {
        if (myCheckin.outcome === 'nikah_planning') {
          setPageState('waiting_for_response')
          return
        }
        router.replace(`/dashboard/chat/${connectionId}`)
        return
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
      setPageState('checkin')
    }

    load()
  }, [connectionId, router])

  if (pageState === 'loading' || (pageState === 'checkin' && !connection)) return null

  if (pageState === 'waiting_for_response') {
    return (
      <div style={{ minHeight: '100vh', background: '#FDF8F3', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px', textAlign: 'center' }}>
        <CoupleIllustration size={120} className="illustration-enter mb-4" />
        <h2 style={{ fontSize: '20px', fontWeight: 500, color: '#1A1A1A', marginBottom: '8px' }}>Waiting for their response</h2>
        <p style={{ fontSize: '14px', color: '#5C5C5C', maxWidth: '300px', lineHeight: 1.6 }}>
          Your response has been recorded. You will be notified when your match responds, in sha Allah.
        </p>
      </div>
    )
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'center', paddingTop: '32px', paddingBottom: '8px' }}>
        <CoupleIllustration size={120} className="illustration-enter" />
      </div>
      <CheckinUI
        connection={connection!}
        connectionId={connectionId}
        hasPendingProposal={false}
      />
    </div>
  )
}
