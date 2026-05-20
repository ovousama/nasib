'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'

export default function OnboardingStart() {
  const router = useRouter()
  const [gender, setGender] = useState<'brother' | 'sister' | null>(null)
  const [hasSignificantData, setHasSignificantData] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      try {
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) { router.replace('/auth/login'); return }

        const { data: profile } = await supabase
          .from('profiles')
          .select('gender')
          .eq('id', user.id)
          .single()

        if (!profile?.gender) { setLoading(false); return }
        const g = profile.gender as 'brother' | 'sister'
        setGender(g)

        const table = g === 'brother' ? 'brother_profiles' : 'sister_profiles'
        const { data: gp } = await supabase
          .from(table)
          .select('religiosity_level, occupation')
          .eq('id', user.id)
          .single()

        // "Significant data" = beyond just the basic info captured at signup
        if (gp?.religiosity_level || gp?.occupation) {
          setHasSignificantData(true)
        }
      } catch {}
      setLoading(false)
    }
    fetchData()
  }, [router])

  function handleBegin() {
    // Route to /onboarding which will forward-check to the first incomplete step
    router.push('/onboarding')
  }

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#FDF8F3', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="w-8 h-8 border-2 border-[#AF4D98] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  // If user already has significant data, skip the disclaimer and jump straight to first incomplete step
  if (hasSignificantData) {
    router.replace('/onboarding')
    return null
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
    }}>
      <div style={{ maxWidth: '480px', width: '100%' }}>

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
          <p style={{ fontSize: '11px', color: '#9B9B9B' }}>— Ar-Rum 30:21</p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '28px' }}>
          <div style={{ flex: 1, height: '1px', background: '#EDE8E3' }} />
          <span style={{ color: '#D4CBC4', fontSize: '14px' }}>◇</span>
          <div style={{ flex: 1, height: '1px', background: '#EDE8E3' }} />
        </div>

        <h1 style={{ fontSize: '28px', fontWeight: 400, color: '#1A1A1A', marginBottom: '16px', letterSpacing: '-0.02em' }}>
          Before you begin
        </h1>

        <p style={{ fontSize: '15px', color: '#5C5C5C', lineHeight: 1.7, marginBottom: '12px' }}>
          Naseeb is built for serious seekers — those who are ready to approach marriage with intention,
          honesty, and trust in Allah&apos;s plan.
        </p>
        <p style={{ fontSize: '15px', color: '#5C5C5C', lineHeight: 1.7, marginBottom: '12px' }}>
          Before we can introduce you to compatible matches, we need to understand who you are beyond the
          basics. This profile is thorough by design — the more you share, the better your matches will be.
        </p>
        <p style={{ fontSize: '15px', color: '#5C5C5C', lineHeight: 1.7, marginBottom: '24px' }}>
          Set aside about an hour. You can save and return at any time.
        </p>

        <div style={{ marginBottom: '28px' }}>
          <p style={{ fontSize: '13px', fontWeight: 500, color: '#9B9B9B', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '12px' }}>
            This profile covers
          </p>
          {checklist.map((item, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
              <span style={{ color: '#AF4D98', fontSize: '13px', fontWeight: 600 }}>✓</span>
              <span style={{ fontSize: '14px', color: '#1A1A1A' }}>{item}</span>
            </div>
          ))}
        </div>

        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <p style={{ fontFamily: "'Noto Naskh Arabic', serif", fontSize: '16px', color: '#AF4D98', marginBottom: '4px', direction: 'rtl' }}>
            اللَّهُمَّ يَسِّرْ وَلَا تُعَسِّرْ
          </p>
          <p style={{ fontSize: '12px', color: '#9B9B9B', fontStyle: 'italic' }}>
            O Allah, make it easy and do not make it difficult
          </p>
        </div>

        <button
          type="button"
          onClick={handleBegin}
          style={{
            width: '100%',
            background: '#AF4D98',
            color: 'white',
            border: 'none',
            borderRadius: '999px',
            padding: '14px 24px',
            fontSize: '14px',
            fontWeight: 500,
            cursor: 'pointer',
          }}
        >
          Begin my profile →
        </button>
      </div>
    </div>
  )
}
