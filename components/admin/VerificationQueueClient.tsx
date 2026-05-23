/* eslint-disable @next/next/no-img-element */
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  approveVerification,
  rejectVerification,
  getVerificationSelfieUrl,
  getProfilePhotoUrls,
} from '@/app/admin/verification/actions'

type VerificationRequest = {
  id: string
  gender: string
  verification_status: string
  verification_selfie_path: string | null
  verification_submitted_at: string | null
  verification_rejection_reason: string | null
  profile: {
    full_name: string | null
    age: number | null
    location: string | null
    photo_urls: string[] | null
    photo_url: string | null
  } | null
}

const REJECTION_REASONS = [
  'Face not clearly visible',
  'Photo too dark or blurry',
  'Face does not match profile photos',
  'Sunglasses or face covering',
  'Photo appears edited or filtered',
  'Other',
]

function SelfieImage({ selfiePath }: { selfiePath: string | null }) {
  const [url, setUrl] = useState<string | null>(null)

  useEffect(() => {
    if (!selfiePath) return
    getVerificationSelfieUrl(selfiePath).then(setUrl)
  }, [selfiePath])

  if (!selfiePath) return (
    <div style={{ aspectRatio: '3/4', borderRadius: '12px', background: '#F5F5F5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <span style={{ color: '#9B9B9B', fontSize: '13px' }}>No selfie</span>
    </div>
  )
  if (!url) return (
    <div style={{ aspectRatio: '3/4', borderRadius: '12px', background: '#F5F5F5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="w-5 h-5 border-2 border-[#AF4D98] border-t-transparent rounded-full animate-spin" />
    </div>
  )
  return (
    <div style={{ aspectRatio: '3/4', borderRadius: '12px', overflow: 'hidden' }}>
      <img src={url} alt="Selfie" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
    </div>
  )
}

function ProfilePhotosGrid({ gender, photoUrls, photoUrl }: { gender: string; photoUrls: string[] | null; photoUrl: string | null }) {
  const [urls, setUrls] = useState<string[]>([])

  useEffect(() => {
    const paths = photoUrls?.length ? photoUrls : photoUrl ? [photoUrl] : []
    if (!paths.length) return
    getProfilePhotoUrls(gender, paths).then(setUrls)
  }, [gender, photoUrls, photoUrl])

  if (!urls.length) return (
    <div style={{ aspectRatio: '3/4', borderRadius: '12px', background: '#F5F5F5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <span style={{ color: '#9B9B9B', fontSize: '13px' }}>No photos</span>
    </div>
  )

  return (
    <div style={{ display: 'grid', gridTemplateColumns: urls.length > 1 ? '1fr 1fr' : '1fr', gap: '6px' }}>
      {urls.slice(0, 4).map((url, i) => (
        <div key={i} style={{ aspectRatio: '3/4', borderRadius: '8px', overflow: 'hidden' }}>
          <img src={url} alt={`Profile photo ${i + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </div>
      ))}
    </div>
  )
}

export default function VerificationQueueClient({ requests }: { requests: VerificationRequest[] }) {
  const router = useRouter()
  const [processing, setProcessing] = useState<string | null>(null)
  const [rejectingId, setRejectingId] = useState<string | null>(null)
  const [rejectionReason, setRejectionReason] = useState('')
  const [actionError, setActionError] = useState<string | null>(null)

  async function handleApprove(userId: string) {
    setProcessing(userId)
    setActionError(null)
    const result = await approveVerification(userId)
    setProcessing(null)
    if (result.error) { setActionError(result.error); return }
    router.refresh()
  }

  async function handleReject(userId: string, reason: string) {
    setProcessing(userId)
    setActionError(null)
    const result = await rejectVerification(userId, reason)
    setProcessing(null)
    if (result.error) { setActionError(result.error); return }
    setRejectingId(null)
    setRejectionReason('')
    router.refresh()
  }

  if (requests.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 20px' }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>✓</div>
        <h2 style={{ fontSize: '20px', fontWeight: 500, color: '#1A1A1A', marginBottom: '8px' }}>All clear</h2>
        <p style={{ fontSize: '15px', color: '#9B9B9B' }}>No pending verification requests.</p>
      </div>
    )
  }

  return (
    <div>
      {actionError && (
        <div style={{ background: '#FDECEA', border: '1px solid #F5C6C6', borderRadius: '10px', padding: '12px 16px', marginBottom: '20px' }}>
          <p style={{ fontSize: '13px', color: '#C13515', margin: 0 }}>{actionError}</p>
        </div>
      )}

      <div style={{ marginBottom: '24px' }}>
        <p style={{ fontSize: '13px', color: '#9B9B9B' }}>
          {requests.length} pending {requests.length === 1 ? 'request' : 'requests'} — oldest first
        </p>
      </div>

      {requests.map(request => (
        <div key={request.id} style={{ background: 'white', border: '1px solid #EDE8E3', borderRadius: '16px', padding: '20px', marginBottom: '16px' }}>

          {/* Side-by-side photo comparison */}
          <div style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: '11px', color: '#9B9B9B', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px' }}>
                Live selfie
              </p>
              <SelfieImage selfiePath={request.verification_selfie_path} />
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: '11px', color: '#9B9B9B', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px' }}>
                Profile photos
              </p>
              <ProfilePhotosGrid
                gender={request.gender}
                photoUrls={request.profile?.photo_urls ?? null}
                photoUrl={request.profile?.photo_url ?? null}
              />
            </div>
          </div>

          {/* User info */}
          <div style={{ padding: '12px', background: '#FDFAF7', borderRadius: '10px', marginBottom: '16px' }}>
            <p style={{ fontSize: '14px', fontWeight: 500, color: '#1A1A1A', marginBottom: '2px' }}>
              {request.profile?.full_name ?? '—'}
            </p>
            <p style={{ fontSize: '13px', color: '#9B9B9B' }}>
              {[request.profile?.age ? `${request.profile.age} yrs` : null, request.profile?.location, request.gender].filter(Boolean).join(' · ')}
            </p>
            {request.verification_submitted_at && (
              <p style={{ fontSize: '12px', color: '#9B9B9B', marginTop: '4px' }}>
                Submitted: {new Date(request.verification_submitted_at).toLocaleDateString('en-GB', {
                  day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
                })}
              </p>
            )}
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={() => handleApprove(request.id)}
              disabled={processing === request.id}
              style={{
                flex: 1, background: '#0A8A7A', color: 'white', border: 'none',
                borderRadius: '999px', padding: '12px', fontSize: '14px', fontWeight: 500,
                cursor: processing === request.id ? 'not-allowed' : 'pointer',
                opacity: processing === request.id ? 0.6 : 1,
              }}
            >
              {processing === request.id ? '…' : '✓ Verify'}
            </button>
            <button
              onClick={() => { setRejectingId(request.id); setRejectionReason('') }}
              disabled={processing === request.id}
              style={{
                flex: 1, background: 'white', color: '#C13515', border: '1px solid #C13515',
                borderRadius: '999px', padding: '12px', fontSize: '14px', fontWeight: 500,
                cursor: 'pointer',
              }}
            >
              ✗ Reject
            </button>
          </div>
        </div>
      ))}

      {/* Reject modal */}
      {rejectingId && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
          zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px',
        }}>
          <div style={{ background: 'white', borderRadius: '20px', padding: '28px', width: '100%', maxWidth: '400px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 500, color: '#1A1A1A', marginBottom: '16px' }}>
              Reject verification
            </h3>
            <p style={{ fontSize: '14px', color: '#9B9B9B', marginBottom: '16px' }}>
              Select a reason — this will be shown to the user so they can resubmit.
            </p>

            {REJECTION_REASONS.map(reason => (
              <div
                key={reason}
                onClick={() => setRejectionReason(reason)}
                style={{
                  padding: '12px 16px', borderRadius: '10px', cursor: 'pointer', marginBottom: '8px',
                  border: `1px solid ${rejectionReason === reason ? '#AF4D98' : '#EDE8E3'}`,
                  background: rejectionReason === reason ? '#F5E6F2' : 'white',
                  fontSize: '14px',
                  color: rejectionReason === reason ? '#AF4D98' : '#1A1A1A',
                  transition: 'all 0.15s ease',
                }}
              >
                {reason}
              </div>
            ))}

            <div style={{ display: 'flex', gap: '10px', marginTop: '16px' }}>
              <button
                onClick={() => { setRejectingId(null); setRejectionReason('') }}
                style={{
                  flex: 1, background: 'white', border: '1px solid #EDE8E3',
                  borderRadius: '999px', padding: '12px', fontSize: '14px', cursor: 'pointer',
                }}
              >
                Cancel
              </button>
              <button
                onClick={() => handleReject(rejectingId, rejectionReason)}
                disabled={!rejectionReason || processing === rejectingId}
                style={{
                  flex: 1, background: rejectionReason ? '#C13515' : '#EDE8E3',
                  color: rejectionReason ? 'white' : '#9B9B9B', border: 'none',
                  borderRadius: '999px', padding: '12px', fontSize: '14px', fontWeight: 500,
                  cursor: rejectionReason ? 'pointer' : 'not-allowed',
                }}
              >
                {processing === rejectingId ? '…' : 'Reject'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
