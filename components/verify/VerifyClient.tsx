'use client'

import { useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import CameraStep from './CameraStep'
import PreviewStep from './PreviewStep'

type Step = 'intro' | 'camera' | 'preview' | 'submitted'

type Props = {
  userId: string
  status: string
  submittedAt: string | null
  rejectionReason: string | null
}

export default function VerifyClient({ status, rejectionReason }: Props) {
  const router = useRouter()
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [capturedImage, setCapturedImage] = useState<string | null>(null)
  const [cameraActive, setCameraActive] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [step, setStep] = useState<Step>(status === 'pending' ? 'submitted' : 'intro')


  if (step === 'intro') {
    return (
      <div style={{ maxWidth: '480px', margin: '0 auto', padding: '40px 20px', textAlign: 'center' }}>
        <p style={{ fontFamily: 'Noto Naskh Arabic, serif', fontSize: '32px', color: '#AF4D98', marginBottom: '24px' }}>نصيب</p>

        <div style={{
          width: '80px', height: '80px', borderRadius: '50%', background: '#F5E6F2',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 24px', fontSize: '36px',
        }}>
          📷
        </div>

        <h1 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '26px', fontWeight: 400, color: '#1A1A1A', marginBottom: '12px' }}>
          Verify your identity
        </h1>

        <p style={{ fontSize: '15px', color: '#5C5C5C', lineHeight: 1.7, marginBottom: '32px' }}>
          To keep Naseeb trustworthy and safe for everyone, we ask every member to complete a simple photo verification.
          <br /><br />
          You will take a live selfie using your camera. Our team will compare it to your profile photos and verify your account within 24 hours, in sha Allah.
        </p>

        <div style={{ background: '#FDFAF7', border: '1px solid #EDE8E3', borderRadius: '16px', padding: '20px', marginBottom: '32px', textAlign: 'left' }}>
          <p style={{ fontSize: '13px', fontWeight: 500, color: '#1A1A1A', marginBottom: '12px' }}>What to expect:</p>
          {[
            'Your camera will open',
            'Take a clear selfie in good lighting',
            'Our admin team reviews within 24 hours',
            'You will be notified when verified',
          ].map((item, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', marginBottom: '8px' }}>
              <span style={{
                width: '20px', height: '20px', borderRadius: '50%', background: '#AF4D98',
                color: 'white', fontSize: '11px', display: 'flex', alignItems: 'center',
                justifyContent: 'center', flexShrink: 0, marginTop: '1px',
              }}>
                {i + 1}
              </span>
              <p style={{ fontSize: '14px', color: '#5C5C5C', margin: 0, lineHeight: 1.5 }}>{item}</p>
            </div>
          ))}
        </div>

        <p style={{ fontSize: '12px', color: '#9B9B9B', marginBottom: '24px', lineHeight: 1.5 }}>
          Your selfie is stored securely and is only seen by our admin team. It is never shown to other members.
        </p>

        {status === 'rejected' && rejectionReason && (
          <div style={{ background: '#FDECEA', border: '1px solid #F5C6C6', borderRadius: '12px', padding: '16px', marginBottom: '24px', textAlign: 'left' }}>
            <p style={{ fontSize: '13px', fontWeight: 500, color: '#C13515', marginBottom: '4px' }}>Previous submission was rejected</p>
            <p style={{ fontSize: '13px', color: '#C13515', margin: 0, lineHeight: 1.5 }}>Reason: {rejectionReason}</p>
          </div>
        )}

        <button
          onClick={() => setStep('camera')}
          style={{
            width: '100%', background: '#AF4D98', color: 'white', border: 'none',
            borderRadius: '999px', padding: '14px', fontSize: '15px', fontWeight: 500, cursor: 'pointer',
          }}
        >
          Open camera →
        </button>

        <button
          onClick={() => router.push('/dashboard')}
          style={{
            width: '100%', background: 'transparent', border: 'none', color: '#9B9B9B',
            fontSize: '14px', cursor: 'pointer', padding: '12px', marginTop: '8px',
          }}
        >
          Do this later
        </button>
      </div>
    )
  }

  if (step === 'camera') {
    return (
      <CameraStep
        videoRef={videoRef}
        canvasRef={canvasRef}
        stream={stream}
        setStream={setStream}
        cameraActive={cameraActive}
        setCameraActive={setCameraActive}
        onCapture={(imageData) => { setCapturedImage(imageData); setStep('preview') }}
        onBack={() => setStep('intro')}
        error={error}
        setError={setError}
      />
    )
  }

  if (step === 'preview' && capturedImage) {
    return (
      <PreviewStep
        capturedImage={capturedImage}
        uploading={uploading}
        error={error}
        onRetake={() => { setCapturedImage(null); setStep('camera') }}
        onSubmit={async () => {
          setUploading(true)
          setError(null)

          try {
            const supabase = createClient()

            const { data: { user }, error: authError } = await supabase.auth.getUser()

            if (authError || !user) {
              setError('Your session has expired. Please sign in again.')
              setUploading(false)
              return
            }

            const authenticatedUserId = user.id

            const response = await fetch(capturedImage)
            const blob = await response.blob()
            const file = new File([blob], `selfie-${Date.now()}.jpg`, { type: 'image/jpeg' })

            const fileName = `selfie-${Date.now()}.jpg`
            const uploadPath = `${authenticatedUserId}/${fileName}`

            const { data: uploadData, error: uploadError } = await supabase.storage
              .from('verification-selfies')
              .upload(uploadPath, file, { contentType: 'image/jpeg', upsert: true })

            if (uploadError) {
              console.error('Storage upload error:', uploadError)
              setError(`Could not upload photo: ${uploadError.message}`)
              setUploading(false)
              return
            }

            const { error: updateError } = await supabase
              .from('profiles')
              .update({
                verification_status: 'pending',
                verification_selfie_path: uploadData.path,
                verification_submitted_at: new Date().toISOString(),
              })
              .eq('id', authenticatedUserId)

            if (updateError) {
              console.error('Profile update error:', updateError)
              setError(`Could not save verification: ${updateError.message}`)
              setUploading(false)
              return
            }

            await supabase.from('notifications').insert({
              profile_id: authenticatedUserId,
              type: 'verification_submitted',
              title: 'Verification submitted',
              body: 'Your identity verification is under review. We will notify you within 24 hours, in sha Allah.',
            })

            stream?.getTracks().forEach(t => t.stop())

            setStep('submitted')

          } catch (err: unknown) {
            console.error('Verification error:', err)
            setError((err as { message?: string }).message ?? 'Something went wrong. Please try again.')
          } finally {
            setUploading(false)
          }
        }}
      />
    )
  }

  if (step === 'submitted') {
    return (
      <div style={{ maxWidth: '480px', margin: '0 auto', padding: '60px 20px', textAlign: 'center' }}>
        <div style={{
          width: '80px', height: '80px', borderRadius: '50%', background: '#E6F7F5',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 24px', fontSize: '36px',
        }}>
          ✓
        </div>

        <h1 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '26px', fontWeight: 400, color: '#1A1A1A', marginBottom: '12px' }}>
          Verification submitted
        </h1>

        <p style={{ fontSize: '15px', color: '#5C5C5C', lineHeight: 1.7, marginBottom: '12px' }}>
          Jazakallah khair. Our team will review your selfie within 24 hours and notify you once verified, in sha Allah.
        </p>

        <p style={{ fontSize: '13px', color: '#9B9B9B', marginBottom: '32px' }}>
          You can continue completing your profile while we review your verification.
        </p>

        <button
          onClick={() => router.push('/dashboard')}
          style={{
            width: '100%', background: '#AF4D98', color: 'white', border: 'none',
            borderRadius: '999px', padding: '14px', fontSize: '15px', fontWeight: 500, cursor: 'pointer',
          }}
        >
          Back to dashboard
        </button>
      </div>
    )
  }

  return null
}
