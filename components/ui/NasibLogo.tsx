type NasibLogoProps = {
  size?: 'sm' | 'md' | 'lg'
  theme?: 'light' | 'dark'
  className?: string
}

const sizeMap = {
  sm: { arabic: '22px', latin: '9px', gap: '2px' },
  md: { arabic: '30px', latin: '11px', gap: '3px' },
  lg: { arabic: '42px', latin: '13px', gap: '4px' },
}

export default function NasibLogo({
  size = 'md',
  theme = 'light',
  className = '',
}: NasibLogoProps) {
  const s = sizeMap[size]
  const primaryColor = theme === 'dark' ? '#E5A9A9' : '#AF4D98'
  const latinColor = theme === 'dark' ? '#6B6B6B' : '#9B9B9B'

  return (
    <div
      className={className}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        lineHeight: 1,
        gap: s.gap,
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
      <span
        style={{
          fontFamily: 'var(--font-inter, "Inter", system-ui, sans-serif)',
          fontSize: s.latin,
          color: latinColor,
          fontWeight: 200,
          letterSpacing: '0.3em',
          textTransform: 'uppercase',
          lineHeight: 1,
        }}
      >
        Naseeb
      </span>
    </div>
  )
}
