type Size = 'sm' | 'md' | 'lg' | 'xl'

type Props = {
  src?: string | null
  name?: string
  size?: Size
  className?: string
}

const sizeClasses: Record<Size, string> = {
  sm: 'w-8 h-8 text-xs',
  md: 'w-12 h-12 text-sm',
  lg: 'w-16 h-16 text-lg',
  xl: 'w-24 h-24 text-2xl',
}

export default function Avatar({ src, name, size = 'md', className = '' }: Props) {
  const initial = name?.[0]?.toUpperCase() ?? '?'

  return (
    <div
      className={`
        rounded-full flex-shrink-0 flex items-center justify-center
        ring-2 ring-white
        shadow-[0_1px_2px_rgba(0,0,0,0.08),0_4px_12px_rgba(0,0,0,0.05)]
        ${sizeClasses[size]}
        ${!src ? 'bg-[#F4E4BA] text-[#AF4D98] font-semibold' : ''}
        ${className}
      `}
    >
      {src ? (
        <img
          src={src}
          alt={name}
          className="w-full h-full rounded-full object-cover"
        />
      ) : (
        <span>{initial}</span>
      )}
    </div>
  )
}
