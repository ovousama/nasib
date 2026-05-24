'use client'

/* eslint-disable @next/next/no-img-element */

import { useState } from 'react'
import { formatFieldValue } from '@/lib/field-labels'

type Props = {
  fullName: string
  age?: number | null
  location?: string | null
  ethnicity?: string | null
  languages?: string[] | string | null
  photoUrls: string[]
  photosVisible: boolean
  verificationBadge: boolean
}

export default function ProfileHeader({
  fullName,
  age,
  location,
  ethnicity,
  languages,
  photoUrls,
  photosVisible,
  verificationBadge,
}: Props) {
  const [activePhotoIndex, setActivePhotoIndex] = useState(0)
  const showPhotos = photosVisible && photoUrls.length > 0
  const initial = (fullName?.[0] ?? '?').toUpperCase()

  const languagesText = Array.isArray(languages) ? languages.join(', ') : (languages ?? '')
  const ethnicityText = ethnicity ? formatFieldValue(ethnicity, 'ethnicity') : ''
  const subline = [ethnicityText, languagesText].filter(Boolean).join(' · ')

  return (
    <div style={{ textAlign: 'center', padding: '8px 0 32px' }}>
      {showPhotos ? (
        <div style={{
          width: '100px',
          height: '100px',
          borderRadius: '50%',
          margin: '0 auto 16px',
          overflow: 'hidden',
          border: '3px solid white',
          boxShadow: '0 0 0 2px #AF4D98',
        }}>
          <img
            src={photoUrls[activePhotoIndex]}
            alt={fullName}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        </div>
      ) : (
        <div style={{
          width: '100px',
          height: '100px',
          borderRadius: '50%',
          margin: '0 auto 16px',
          background: 'linear-gradient(135deg, #F5E6F2, #F4E4BA)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: '3px solid white',
          boxShadow: '0 0 0 2px #AF4D98',
          position: 'relative',
        }}>
          <span style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '38px', color: '#AF4D98' }}>
            {initial}
          </span>
          {!photosVisible && (
            <div style={{
              position: 'absolute',
              bottom: '-2px',
              right: '-2px',
              width: '28px',
              height: '28px',
              borderRadius: '50%',
              background: '#1A1A1A',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '2px solid white',
            }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
            </div>
          )}
        </div>
      )}

      {showPhotos && photoUrls.length > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginBottom: '16px' }}>
          {photoUrls.map((url, i) => (
            <button
              key={i}
              onClick={() => setActivePhotoIndex(i)}
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                overflow: 'hidden',
                border: activePhotoIndex === i ? '2px solid #AF4D98' : '2px solid transparent',
                padding: 0,
                cursor: 'pointer',
                background: 'transparent',
              }}
            >
              <img src={url} alt={`Photo ${i + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </button>
          ))}
        </div>
      )}

      <h1 style={{
        fontFamily: 'Cormorant Garamond, serif',
        fontSize: '28px',
        fontWeight: 400,
        color: '#1A1A1A',
        margin: '0 0 6px',
        letterSpacing: '-0.01em',
      }}>
        {fullName}
      </h1>

      {(age || location) && (
        <p style={{ fontSize: '14px', color: '#9B9B9B', margin: '0 0 14px' }}>
          {[age ? `${age} yrs` : null, location].filter(Boolean).join(' · ')}
        </p>
      )}

      {verificationBadge && (
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '5px',
          background: '#E6F7F5',
          color: '#0A8A7A',
          fontSize: '12px',
          fontWeight: 500,
          padding: '4px 12px',
          borderRadius: '999px',
          marginBottom: '14px',
        }}>
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <circle cx="6" cy="6" r="6" fill="#0A8A7A" />
            <path d="M3 6L5 8L9 4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Verified
        </div>
      )}

      {subline && (
        <p style={{ fontSize: '13px', color: '#9B9B9B', margin: 0 }}>
          {subline}
        </p>
      )}

      {!photosVisible && (
        <p style={{ fontSize: '12px', color: '#9B7090', marginTop: '12px', marginBottom: 0, fontStyle: 'italic' }}>
          🔒 Photos remain private until your interest is accepted
        </p>
      )}
    </div>
  )
}
