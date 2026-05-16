type Props = {
  children: React.ReactNode
  className?: string
  hover?: boolean
  padding?: 'sm' | 'md' | 'lg' | 'none'
  onClick?: () => void
}

const paddingClasses = {
  none: '',
  sm:   'p-4',
  md:   'p-5',
  lg:   'p-6',
}

export default function Card({ children, className = '', hover = false, padding = 'md', onClick }: Props) {
  return (
    <div
      onClick={onClick}
      className={`
        bg-white rounded-[16px] border border-[#EDE8E3]
        shadow-[0_1px_3px_rgba(0,0,0,0.06)]
        ${hover ? 'hover:border-[#D4CBC4] hover:-translate-y-px transition-all duration-150 cursor-pointer' : ''}
        ${paddingClasses[padding]}
        ${className}
      `}
    >
      {children}
    </div>
  )
}
