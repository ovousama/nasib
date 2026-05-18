'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { setUserGender } from '@/app/onboarding/actions'

export default function GenderSelectionPage() {
  const router = useRouter()
  const [selected, setSelected] = useState<'brother' | 'sister' | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleContinue() {
    if (!selected) return
    setLoading(true)
    setError(null)
    try {
      await setUserGender(selected)
      router.push(selected === 'brother' ? '/onboarding/brother' : '/onboarding/sister')
    } catch {
      setError('Something went wrong. Please try again.')
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: '#FDF8F3', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
      <p style={{ fontFamily: 'Noto Naskh Arabic, serif', fontSize: '32px', color: '#AF4D98', marginBottom: '8px' }}>نصيب</p>
      <h1 style={{ fontSize: '24px', fontWeight: 500, color: '#1A1A1A', marginBottom: '8px', textAlign: 'center' }}>Welcome to Naseeb</h1>
      <p style={{ fontSize: '14px', color: '#9B9B9B', marginBottom: '32px', textAlign: 'center' }}>First, tell us who you are</p>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', width: '100%', maxWidth: '360px', marginBottom: '24px' }}>
        <button
          type="button"
          onClick={() => setSelected('brother')}
          style={{
            border: `1.5px solid ${selected === 'brother' ? '#AF4D98' : '#EDE8E3'}`,
            borderRadius: '16px',
            padding: '28px 20px',
            textAlign: 'center',
            cursor: 'pointer',
            background: selected === 'brother' ? '#F5E6F2' : 'white',
            transition: 'all 0.15s',
          }}
        >
          <p style={{ fontSize: '28px', marginBottom: '8px' }}>أخ</p>
          <p style={{ fontSize: '14px', fontWeight: 500, color: '#1A1A1A', marginBottom: '4px' }}>I am a brother</p>
          <p style={{ fontSize: '12px', color: '#9B9B9B' }}>Looking for a righteous wife</p>
        </button>

        <button
          type="button"
          onClick={() => setSelected('sister')}
          style={{
            border: `1.5px solid ${selected === 'sister' ? '#AF4D98' : '#EDE8E3'}`,
            borderRadius: '16px',
            padding: '28px 20px',
            textAlign: 'center',
            cursor: 'pointer',
            background: selected === 'sister' ? '#F5E6F2' : 'white',
            transition: 'all 0.15s',
          }}
        >
          <p style={{ fontSize: '28px', marginBottom: '8px' }}>أخت</p>
          <p style={{ fontSize: '14px', fontWeight: 500, color: '#1A1A1A', marginBottom: '4px' }}>I am a sister</p>
          <p style={{ fontSize: '12px', color: '#9B9B9B' }}>Looking for a righteous husband</p>
        </button>
      </div>

      {error && (
        <p style={{ color: '#C13515', fontSize: '14px', marginBottom: '16px', textAlign: 'center' }}>{error}</p>
      )}

      <button
        type="button"
        onClick={handleContinue}
        disabled={!selected || loading}
        style={{
          width: '100%',
          maxWidth: '360px',
          background: '#AF4D98',
          color: 'white',
          border: 'none',
          borderRadius: '100px',
          padding: '14px 24px',
          fontSize: '14px',
          fontWeight: 500,
          cursor: selected && !loading ? 'pointer' : 'not-allowed',
          opacity: !selected || loading ? 0.4 : 1,
          transition: 'opacity 0.15s',
        }}
      >
        {loading ? 'Continuing…' : 'Continue'}
      </button>
    </div>
  )
}
