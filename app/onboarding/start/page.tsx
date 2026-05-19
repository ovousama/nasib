'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import BrotherIllustration from '@/components/illustrations/BrotherIllustration'
import SisterIllustration from '@/components/illustrations/SisterIllustration'
import IslamicPatternBg from '@/components/illustrations/IslamicPatternBg'

export default function OnboardingStart() {
  const router = useRouter()
  const [gender, setGender] = useState<'brother' | 'sister' | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchGender() {
      try {
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) { router.replace('/auth/login'); return }
        const { data: profile } = await supabase.from('profiles').select('gender').eq('id', user.id).single()
        if (profile?.gender) setGender(profile.gender as 'brother' | 'sister')
      } catch {}
      setLoading(false)
    }
    fetchGender()
  }, [router])

  function handleBegin() {
    if (typeof window !== 'undefined') {
      localStorage.setItem('naseeb_onboarding_started', 'true')
    }
    if (gender === 'sister') {
      router.push('/onboarding/sister')
    } else {
      router.push('/onboarding/brother')
    }
  }

  const checklist = [
    'Your background & lifestyle',
    'Your deen & practice',
    'Your family values',
    'Your emotional world',
    'Your marriage vision',
    'A reference from someone who knows you',
    ...(gender === 'sister' ? ['Your wali details'] : []),
  ]

  return (
    <div style={{
      minHeight: '100vh',
      background: '#FDF8F3',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
      position: 'relative',
      overflow: 'hidden',
    }}>
      <IslamicPatternBg opacity={0.03} color="#AF4D98" />
      <div style={{ maxWidth: '480px', width: '100%', position: 'relative', zIndex: 1 }}>

        {/* Gender-appropriate illustration */}
        {!loading && gender && (
          <div className="illustration-enter" style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}>
            {gender === 'sister'
              ? <SisterIllustration size={160} />
              : <BrotherIllustration size={160} />}
          </div>
        )}

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <span style={{
            fontFamily: "'Noto Naskh Arabic', serif",
            fontSize: '36px',
            color: '#AF4D98',
            fontWeight: 500,
          }}>
            نصيب
          </span>
        </div>

        {/* Arabic verse */}
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <p style={{
            fontFamily: "'Noto Naskh Arabic', serif",
            fontSize: '20px',
            color: '#AF4D98',
            direction: 'rtl',
            marginBottom: '6px',
            lineHeight: 1.6,
          }}>
            وَمِنْ آيَاتِهِ أَنْ خَلَقَ لَكُم مِّنْ أَنفُسِكُمْ أَزْوَاجًا
          </p>
          <p style={{ fontSize: '13px', color: '#9B9B9B', fontStyle: 'italic', marginBottom: '4px' }}>
            And of His signs is that He created for you mates
          </p>
          <p style={{ fontSize: '11px', color: '#9B9B9B' }}>
            — Ar-Rum 30:21
          </p>
        </div>

        {/* Divider */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '28px' }}>
          <div style={{ flex: 1, height: '1px', background: '#EDE8E3' }} />
          <span style={{ color: '#D4CBC4', fontSize: '14px' }}>◇</span>
          <div style={{ flex: 1, height: '1px', background: '#EDE8E3' }} />
        </div>

        {/* Heading */}
        <h1 style={{ fontSize: '28px', fontWeight: 400, color: '#1A1A1A', marginBottom: '16px', letterSpacing: '-0.02em' }}>
          Before you begin
        </h1>

        {/* Body text */}
        <p style={{ fontSize: '15px', color: '#5C5C5C', lineHeight: 1.7, marginBottom: '12px' }}>
          Naseeb is built for serious seekers — those who are ready to approach marriage with intention,
          honesty, and trust in Allah&apos;s plan.
        </p>
        <p style={{ fontSize: '15px', color: '#5C5C5C', lineHeight: 1.7, marginBottom: '12px' }}>
          Before we can introduce you to compatible matches, we need to understand who you are beyond the
          basics. This profile is thorough by design — the more you share, the better your matches will be.
        </p>
        <p style={{ fontSize: '15px', color: '#5C5C5C', lineHeight: 1.7, marginBottom: '24px' }}>
          Your answers are private and never shared publicly. They are only visible to your assigned
          matches after mutual interest is confirmed.
        </p>

        {/* Checklist */}
        <div style={{ marginBottom: '28px' }}>
          <p style={{ fontSize: '13px', fontWeight: 500, color: '#9B9B9B', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '12px' }}>
            This profile covers
          </p>
          {loading ? null : checklist.map((item, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
              <span style={{ color: '#AF4D98', fontSize: '13px', fontWeight: 600 }}>✓</span>
              <span style={{ fontSize: '14px', color: '#1A1A1A' }}>{item}</span>
            </div>
          ))}
        </div>

        {/* Du'a */}
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <p style={{
            fontFamily: "'Noto Naskh Arabic', serif",
            fontSize: '16px',
            color: '#AF4D98',
            marginBottom: '4px',
            direction: 'rtl',
          }}>
            اللَّهُمَّ يَسِّرْ وَلَا تُعَسِّرْ
          </p>
          <p style={{ fontSize: '12px', color: '#9B9B9B', fontStyle: 'italic' }}>
            O Allah, make it easy and do not make it difficult
          </p>
        </div>

        {/* Begin button */}
        <button
          type="button"
          onClick={handleBegin}
          disabled={loading}
          style={{
            width: '100%',
            background: '#AF4D98',
            color: 'white',
            border: 'none',
            borderRadius: '999px',
            padding: '14px 24px',
            fontSize: '14px',
            fontWeight: 500,
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.6 : 1,
            transition: 'opacity 0.2s',
          }}
        >
          Begin my profile →
        </button>
      </div>
    </div>
  )
}
