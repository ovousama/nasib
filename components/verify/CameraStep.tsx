'use client'

import { RefObject } from 'react'

type Props = {
  videoRef: RefObject<HTMLVideoElement>
  canvasRef: RefObject<HTMLCanvasElement>
  stream: MediaStream | null
  setStream: (s: MediaStream | null) => void
  cameraActive: boolean
  setCameraActive: (v: boolean) => void
  onCapture: (imageData: string) => void
  onBack: () => void
  error: string | null
  setError: (e: string | null) => void
}

export default function CameraStep({
  videoRef, canvasRef, stream, setStream,
  cameraActive, setCameraActive,
  onCapture, onBack, error, setError,
}: Props) {

  async function startCamera() {
    try {
      setError(null)
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      })
      setStream(mediaStream)
      setCameraActive(true)
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream
        await videoRef.current.play()
      }
    } catch (err: unknown) {
      const e = err as { name?: string }
      if (e.name === 'NotAllowedError') {
        setError('Camera access was denied. Please allow camera access in your browser settings and try again.')
      } else if (e.name === 'NotFoundError') {
        setError('No camera found on this device.')
      } else {
        setError('Could not access camera. Please try again.')
      }
    }
  }

  function capturePhoto() {
    if (!videoRef.current || !canvasRef.current) return
    const video = videoRef.current
    const canvas = canvasRef.current
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.translate(canvas.width, 0)
    ctx.scale(-1, 1)
    ctx.drawImage(video, 0, 0)
    stream?.getTracks().forEach(t => t.stop())
    setCameraActive(false)
    onCapture(canvas.toDataURL('image/jpeg', 0.9))
  }

  return (
    <div style={{ maxWidth: '480px', margin: '0 auto', padding: '20px' }}>
      <button
        onClick={() => {
          stream?.getTracks().forEach(t => t.stop())
          setCameraActive(false)
          onBack()
        }}
        style={{
          background: 'transparent', border: 'none', color: '#9B9B9B',
          fontSize: '14px', cursor: 'pointer', padding: '0 0 20px',
          display: 'flex', alignItems: 'center', gap: '6px',
        }}
      >
        ← Back
      </button>

      <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '22px', fontWeight: 400, color: '#1A1A1A', marginBottom: '8px' }}>
        Take your selfie
      </h2>
      <p style={{ fontSize: '14px', color: '#9B9B9B', marginBottom: '20px', lineHeight: 1.5 }}>
        Position your face clearly in the frame. Make sure you are in good lighting.
      </p>

      {/* Camera viewfinder */}
      <div style={{
        position: 'relative', width: '100%', aspectRatio: '3/4',
        borderRadius: '20px', overflow: 'hidden', background: '#1A1A1A', marginBottom: '20px',
      }}>
        <video
          ref={videoRef}
          style={{
            width: '100%', height: '100%', objectFit: 'cover',
            transform: 'scaleX(-1)', display: cameraActive ? 'block' : 'none',
          }}
          playsInline
          muted
        />

        {cameraActive && (
          <div style={{
            position: 'absolute', inset: 0, display: 'flex',
            alignItems: 'center', justifyContent: 'center', pointerEvents: 'none',
          }}>
            <div style={{
              width: '200px', height: '240px', borderRadius: '50%',
              border: '2px solid rgba(255,255,255,0.4)',
              boxShadow: '0 0 0 9999px rgba(0,0,0,0.3)',
            }} />
          </div>
        )}

        {!cameraActive && !error && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: '16px' }}>
            <span style={{ fontSize: '48px', opacity: 0.4 }}>📷</span>
            <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '14px' }}>Camera not started</p>
          </div>
        )}

        {error && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', padding: '24px', textAlign: 'center' }}>
            <p style={{ color: '#F5A9A9', fontSize: '14px', lineHeight: 1.6 }}>{error}</p>
          </div>
        )}
      </div>

      <canvas ref={canvasRef} style={{ display: 'none' }} />

      {!cameraActive ? (
        <button
          onClick={startCamera}
          style={{
            width: '100%', background: '#AF4D98', color: 'white', border: 'none',
            borderRadius: '999px', padding: '16px', fontSize: '15px', fontWeight: 500, cursor: 'pointer',
          }}
        >
          Start camera
        </button>
      ) : (
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <button
            onClick={capturePhoto}
            style={{
              width: '72px', height: '72px', borderRadius: '50%', background: 'white',
              border: '4px solid #AF4D98', cursor: 'pointer', display: 'flex',
              alignItems: 'center', justifyContent: 'center', transition: 'transform 0.1s ease',
            }}
            onMouseDown={e => { e.currentTarget.style.transform = 'scale(0.95)' }}
            onMouseUp={e => { e.currentTarget.style.transform = 'scale(1)' }}
          >
            <div style={{ width: '52px', height: '52px', borderRadius: '50%', background: '#AF4D98' }} />
          </button>
        </div>
      )}

      <p style={{ textAlign: 'center', fontSize: '12px', color: '#9B9B9B', marginTop: '16px' }}>
        {cameraActive ? 'Tap the button to capture your photo' : 'Your camera will open when you tap above'}
      </p>
    </div>
  )
}
