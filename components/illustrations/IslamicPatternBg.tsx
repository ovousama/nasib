'use client'

export default function IslamicPatternBg({
  opacity = 0.05,
  color = '#AF4D98',
}: {
  opacity?: number
  color?: string
}) {
  return (
    <svg
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
      }}
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <defs>
        <pattern
          id="islamic-pattern"
          x="0"
          y="0"
          width="60"
          height="60"
          patternUnits="userSpaceOnUse"
        >
          {/* 8-pointed star */}
          <path
            d="M30 5 L33 22 L48 15 L38 28 L55 30 L38 32 L48 45 L33 38 L30 55 L27 38 L12 45 L22 32 L5 30 L22 28 L12 15 L27 22 Z"
            fill={color}
            opacity={opacity}
          />
          {/* Small diamond accents */}
          <path d="M0 0 L5 0 L0 5 Z" fill={color} opacity={opacity * 0.5}/>
          <path d="M60 0 L55 0 L60 5 Z" fill={color} opacity={opacity * 0.5}/>
          <path d="M0 60 L5 60 L0 55 Z" fill={color} opacity={opacity * 0.5}/>
          <path d="M60 60 L55 60 L60 55 Z" fill={color} opacity={opacity * 0.5}/>
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#islamic-pattern)"/>
    </svg>
  )
}
