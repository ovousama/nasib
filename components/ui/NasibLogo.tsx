type NasibLogoProps = {
  size?: 'sm' | 'md' | 'lg'
  theme?: 'light' | 'dark'
  className?: string
}

const sizeMap = {
  sm: { arabic: '22px' },
  md: { arabic: '30px' },
  lg: { arabic: '42px' },
}

export default function NasibLogo({
  size = 'md',
  theme = 'light',
  className = '',
}: NasibLogoProps) {
  const s = sizeMap[size]
  const primaryColor = theme === 'dark' ? '#E5A9A9' : '#AF4D98'

  return (
    <div
      className={className}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        lineHeight: 1,
        userSelect: 'none',
      }}
    >
      <span
        style={{
          fontFamily: 'var(--font-arabic, "Noto Naskh Arabic", serif)',
          fontSize: s.arabic,
          color: primaryColor,
          fontWeight: 500,
          letterSpacing: '0.02em',
          lineHeight: 1,
        }}
      >
        نصيب
      </span>
    </div>
  )
}
