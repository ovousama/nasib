'use client'

import BrotherIllustration from './BrotherIllustration'
import SisterIllustration from './SisterIllustration'

type Props = {
  size?: number
  className?: string
}

export default function CoupleIllustration({ size = 120, className = '' }: Props) {
  return (
    <div
      className={className}
      role="img"
      aria-label="Illustration of a Muslim couple"
      style={{
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'center',
        gap: '0px',
        position: 'relative',
      }}
    >
      <BrotherIllustration size={size} />

      {/* Heart between them */}
      <div style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        zIndex: 10,
        background: 'white',
        borderRadius: '50%',
        width: '36px',
        height: '36px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 2px 8px rgba(175,77,152,0.2)',
        fontSize: '16px',
      }}>
        🤍
      </div>

      <SisterIllustration size={size} />
    </div>
  )
}
