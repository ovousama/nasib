type Variant = 'verified' | 'pending' | 'active' | 'closed' | 'primary'

type Props = {
  variant?: Variant
  children: React.ReactNode
  className?: string
}

const variantClasses: Record<Variant, string> = {
  verified: 'bg-[#E6F9F7] text-[#00857A]',
  pending:  'bg-[#FEF9EC] text-[#8A6A00]',
  active:   'bg-[#F9F0F6] text-[#AF4D98]',
  closed:   'bg-[#FAF4EE] text-[#9B9B9B]',
  primary:  'bg-[#AF4D98] text-white',
}

export default function Badge({ variant = 'active', children, className = '' }: Props) {
  return (
    <span
      className={`inline-flex items-center gap-1 text-[11px] font-medium px-2.5 py-1 rounded-full ${variantClasses[variant]} ${className}`}
    >
      {children}
    </span>
  )
}
