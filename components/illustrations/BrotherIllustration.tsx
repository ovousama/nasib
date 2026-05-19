'use client'

type Props = {
  size?: number
  className?: string
}

export default function BrotherIllustration({ size = 200, className = '' }: Props) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      role="img"
      aria-label="Illustration of a Muslim brother wearing kufi"
    >
      {/* Background circle */}
      <circle cx="100" cy="100" r="100" fill="#F4E4BA"/>

      {/* Body / Thobe */}
      <rect x="45" y="118" width="110" height="72" rx="20" fill="#F0EDE8"/>
      <ellipse cx="100" cy="165" rx="55" ry="45" fill="#F0EDE8"/>

      {/* Collar detail */}
      <path d="M88 118 L100 130 L112 118" stroke="#D4CEC8" strokeWidth="2" fill="none"/>

      {/* Neck */}
      <rect x="88" y="100" width="24" height="20" rx="4" fill="#C8A882"/>

      {/* Face */}
      <circle cx="100" cy="88" r="28" fill="#C8A882"/>

      {/* Kufi cap */}
      <ellipse cx="100" cy="65" rx="26" ry="12" fill="#AF4D98"/>
      <rect x="74" y="60" width="52" height="10" rx="3" fill="#AF4D98"/>

      {/* Kufi pattern detail */}
      <path d="M78 64 Q100 60 122 64" stroke="#D66BA0" strokeWidth="1.5" fill="none" opacity="0.5"/>

      {/* Hair/head sides */}
      <path d="M72 74 Q68 80 70 88 Q72 84 76 80 Z" fill="#3D2314" opacity="0.3"/>
      <path d="M128 74 Q132 80 130 88 Q128 84 124 80 Z" fill="#3D2314" opacity="0.3"/>

      {/* Ears */}
      <ellipse cx="72" cy="88" rx="6" ry="8" fill="#C8A882"/>
      <ellipse cx="128" cy="88" rx="6" ry="8" fill="#C8A882"/>

      {/* Eyes */}
      <ellipse cx="91" cy="86" rx="4" ry="4.5" fill="#3D2314"/>
      <ellipse cx="109" cy="86" rx="4" ry="4.5" fill="#3D2314"/>

      {/* Eye shine */}
      <circle cx="93" cy="84" r="1.5" fill="white"/>
      <circle cx="111" cy="84" r="1.5" fill="white"/>

      {/* Eyebrows */}
      <path d="M86 80 Q91 78 96 80" stroke="#3D2314" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
      <path d="M104 80 Q109 78 114 80" stroke="#3D2314" strokeWidth="2.5" strokeLinecap="round" fill="none"/>

      {/* Nose */}
      <path d="M97 91 Q100 95 103 91" stroke="#A07850" strokeWidth="1.5" strokeLinecap="round" fill="none"/>

      {/* Smile */}
      <path d="M91 98 Q100 105 109 98" stroke="#A07850" strokeWidth="2" strokeLinecap="round" fill="none"/>

      {/* Beard */}
      <path d="M76 96 Q78 108 85 114 Q100 120 115 114 Q122 108 124 96 Q112 104 100 105 Q88 104 76 96 Z" fill="#3D2314" opacity="0.25"/>

      {/* Hands */}
      <ellipse cx="58" cy="148" rx="13" ry="11" fill="#C8A882"/>
      <ellipse cx="142" cy="148" rx="13" ry="11" fill="#C8A882"/>
    </svg>
  )
}
