'use client'

type Props = {
  size?: number
  className?: string
}

export default function SisterIllustration({ size = 200, className = '' }: Props) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      role="img"
      aria-label="Illustration of a Muslim sister wearing hijab"
    >
      {/* Background circle */}
      <circle cx="100" cy="100" r="100" fill="#F5E6F2"/>

      {/* Body / Abaya */}
      <ellipse cx="100" cy="165" rx="55" ry="45" fill="#AF4D98"/>
      <rect x="45" y="120" width="110" height="70" rx="20" fill="#AF4D98"/>

      {/* Neck */}
      <rect x="88" y="100" width="24" height="20" rx="4" fill="#F4C49E"/>

      {/* Face */}
      <circle cx="100" cy="90" r="28" fill="#F4C49E"/>

      {/* Hijab outer */}
      <ellipse cx="100" cy="78" rx="34" ry="30" fill="#D66BA0"/>

      {/* Hijab drape left */}
      <path d="M66 78 Q50 100 55 130 Q70 140 85 135 Q75 110 78 90 Z" fill="#D66BA0"/>

      {/* Hijab drape right */}
      <path d="M134 78 Q150 100 145 130 Q130 140 115 135 Q125 110 122 90 Z" fill="#D66BA0"/>

      {/* Hijab inner frame around face */}
      <path d="M72 88 Q72 62 100 62 Q128 62 128 88 Q128 96 100 98 Q72 96 72 88 Z" fill="#E8A0CC"/>

      {/* Face visible area */}
      <circle cx="100" cy="90" r="22" fill="#F4C49E"/>

      {/* Eyes */}
      <ellipse cx="91" cy="87" rx="4" ry="4.5" fill="#3D2314"/>
      <ellipse cx="109" cy="87" rx="4" ry="4.5" fill="#3D2314"/>

      {/* Eye shine */}
      <circle cx="93" cy="85" r="1.5" fill="white"/>
      <circle cx="111" cy="85" r="1.5" fill="white"/>

      {/* Eyebrows */}
      <path d="M86 81 Q91 79 96 81" stroke="#3D2314" strokeWidth="2" strokeLinecap="round" fill="none"/>
      <path d="M104 81 Q109 79 114 81" stroke="#3D2314" strokeWidth="2" strokeLinecap="round" fill="none"/>

      {/* Nose */}
      <path d="M98 92 Q100 95 102 92" stroke="#C4956A" strokeWidth="1.5" strokeLinecap="round" fill="none"/>

      {/* Smile */}
      <path d="M91 98 Q100 105 109 98" stroke="#C4956A" strokeWidth="2" strokeLinecap="round" fill="none"/>

      {/* Cheeks */}
      <circle cx="86" cy="96" r="6" fill="#F2A8C4" opacity="0.4"/>
      <circle cx="114" cy="96" r="6" fill="#F2A8C4" opacity="0.4"/>

      {/* Hands */}
      <ellipse cx="60" cy="145" rx="12" ry="10" fill="#F4C49E"/>
      <ellipse cx="140" cy="145" rx="12" ry="10" fill="#F4C49E"/>

      {/* Small decorative heart */}
      <path d="M96 168 C96 165 100 163 100 163 C100 163 104 165 104 168 C104 171 100 174 100 174 C100 174 96 171 96 168 Z" fill="#F4E4BA" opacity="0.6"/>
    </svg>
  )
}
