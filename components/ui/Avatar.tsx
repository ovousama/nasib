import Image from 'next/image'

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
  lg: 'w-16 h-16 text-base',
  xl: 'w-20 h-20 text-xl',
}

const imgSizes: Record<Size, number> = { sm: 32, md: 48, lg: 64, xl: 80 }

export default function Avatar({ src, name, size = 'md', className = '' }: Props) {
  const initial = name?.[0]?.toUpperCase() ?? '?'

  return (
    <div
      className={`
        rounded-full flex-shrink-0 flex items-center justify-center
        ring-2 ring-white
        shadow-[0_1px_3px_rgba(0,0,0,0.06)]
        ${sizeClasses[size]}
        ${!src ? 'bg-[#F4E4BA] text-[#AF4D98] font-medium' : ''}
        ${className}
      `}
    >
      {src ? (
        <Image
          src={src}
          alt={name ?? ''}
          width={imgSizes[size]}
          height={imgSizes[size]}
          className="w-full h-full rounded-full object-cover"
        />
      ) : (
        <span>{initial}</span>
      )}
    </div>
  )
}
