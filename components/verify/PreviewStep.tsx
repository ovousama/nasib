/* eslint-disable @next/next/no-img-element */
'use client'

type Props = {
  capturedImage: string
  uploading: boolean
  error: string | null
  onRetake: () => void
  onSubmit: () => void
}

export default function PreviewStep({ capturedImage, uploading, error, onRetake, onSubmit }: Props) {
  return (
    <div style={{ maxWidth: '480px', margin: '0 auto', padding: '20px' }}>
      <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '22px', fontWeight: 400, color: '#1A1A1A', marginBottom: '8px' }}>
        Looks good?
      </h2>
      <p style={{ fontSize: '14px', color: '#9B9B9B', marginBottom: '20px', lineHeight: 1.5 }}>
        Make sure your face is clearly visible before submitting.
      </p>

      <div style={{ width: '100%', aspectRatio: '3/4', borderRadius: '20px', overflow: 'hidden', marginBottom: '24px' }}>
        <img src={capturedImage} alt="Your selfie" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      </div>

      {error && (
        <div style={{ background: '#FDECEA', border: '1px solid #F5C6C6', borderRadius: '12px', padding: '12px 16px', marginBottom: '16px' }}>
          <p style={{ fontSize: '13px', color: '#C13515', margin: 0 }}>{error}</p>
        </div>
      )}

      <button
        onClick={onSubmit}
        disabled={uploading}
        style={{
          width: '100%', background: '#AF4D98', color: 'white', border: 'none',
          borderRadius: '999px', padding: '14px', fontSize: '15px', fontWeight: 500,
          cursor: uploading ? 'not-allowed' : 'pointer', opacity: uploading ? 0.7 : 1, marginBottom: '12px',
        }}
      >
        {uploading ? 'Submitting...' : 'Submit for verification →'}
      </button>

      <button
        onClick={onRetake}
        disabled={uploading}
        style={{
          width: '100%', background: 'transparent', border: '1px solid #EDE8E3',
          borderRadius: '999px', padding: '14px', fontSize: '15px', color: '#5C5C5C', cursor: 'pointer',
        }}
      >
        Retake photo
      </button>
    </div>
  )
}
