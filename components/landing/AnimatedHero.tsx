'use client'

import { useEffect, useState, useRef } from 'react'

const ARABIC = 'نصيب'
const ENGLISH = 'Naseeb'

const ARABIC_CHARS = ['ن', 'نص', 'نصي', 'نصيب']
const ENGLISH_CHARS = ['N', 'Na', 'Nas', 'Nase', 'Nasee', 'Naseeb']

type AnimationStep = {
  text: string
  isArabic: boolean
  duration: number
}

export default function AnimatedHero() {
  const [displayText, setDisplayText] = useState('')
  const [isArabic, setIsArabic] = useState(true)
  const timeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([])

  useEffect(() => {
    const sequence: AnimationStep[] = []

    // Phase 1: Type Arabic نصيب
    ARABIC_CHARS.forEach((text, i) => {
      sequence.push({ text, isArabic: true, duration: i === 0 ? 300 : 120 })
    })

    // Phase 2: Pause on نصيب
    sequence.push({ text: ARABIC, isArabic: true, duration: 1500 })

    // Phase 3: Delete Arabic
    const arabicDelete = [...ARABIC_CHARS].reverse().slice(1)
    arabicDelete.forEach(text => {
      sequence.push({ text, isArabic: true, duration: 80 })
    })
    sequence.push({ text: '', isArabic: false, duration: 150 })

    // Phase 4: Type English Naseeb
    ENGLISH_CHARS.forEach((text, i) => {
      sequence.push({ text, isArabic: false, duration: i === 0 ? 200 : 120 })
    })

    // Phase 5: Pause on Naseeb
    sequence.push({ text: ENGLISH, isArabic: false, duration: 1500 })

    // Phase 6: Delete English
    const englishDelete = [...ENGLISH_CHARS].reverse().slice(1)
    englishDelete.forEach(text => {
      sequence.push({ text, isArabic: false, duration: 80 })
    })
    sequence.push({ text: '', isArabic: true, duration: 150 })

    // Phase 7: Type Arabic again — final, then stop
    ARABIC_CHARS.forEach((text, i) => {
      sequence.push({ text, isArabic: true, duration: i === 0 ? 200 : 120 })
    })

    let elapsed = 0
    sequence.forEach((step, index) => {
      const timeout = setTimeout(() => {
        setDisplayText(step.text)
        setIsArabic(step.isArabic)
        if (index === sequence.length - 1) {
          // Final state reached — clear all refs so React knows we're done
          timeoutsRef.current = []
        }
      }, elapsed)
      timeoutsRef.current.push(timeout)
      elapsed += step.duration
    })

    return () => {
      timeoutsRef.current.forEach(t => clearTimeout(t))
    }
  }, [])

  return (
    <h1
      style={{
        fontFamily: 'var(--font-cormorant, "Cormorant Garamond", serif)',
        fontSize: 'clamp(52px, 8vw, 110px)',
        fontWeight: 300,
        letterSpacing: '-0.03em',
        color: '#1A1A1A',
        textAlign: 'center',
        lineHeight: 1.1,
        marginBottom: '28px',
        display: 'flex',
        alignItems: 'baseline',
        justifyContent: 'center',
        gap: '0.25em',
        flexWrap: 'wrap',
      }}
    >
      <span>Find your</span>
      <span
        style={{
          fontFamily: isArabic
            ? 'var(--font-arabic, "Noto Naskh Arabic", serif)'
            : 'var(--font-cormorant, "Cormorant Garamond", serif)',
          color: '#AF4D98',
          direction: isArabic ? 'rtl' : 'ltr',
          display: 'inline-block',
          minWidth: isArabic ? '120px' : '180px',
          textAlign: 'center',
        }}
      >
        {displayText}
      </span>
    </h1>
  )
}
