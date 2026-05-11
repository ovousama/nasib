type Variant = 'verified' | 'pending' | 'active' | 'closed' | 'primary'

type Props = {
  variant?: Variant
  children: React.ReactNode
  className?: string
}

const variantClasses: Record<Variant, string> = {
  verified: 'bg-[#E6F9F7] text-[#00A699]',
  pending: 'bg-[#FFF4CC] text-[#6B4F00]',
  active: 'bg-[#F5E6F2] text-[#AF4D98]',
  closed: 'bg-[#F7F7F7] text-[#6B6B6B]',
  primary: 'bg-[#AF4D98] text-white',
}

export default function Badge({ variant = 'active', children, className = '' }: Props) {
  return (
    <span
      className={`inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full ${variantClasses[variant]} ${className}`}
    >
      {children}
    </span>
  )
}
