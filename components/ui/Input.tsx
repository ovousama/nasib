import { forwardRef } from 'react'

type Props = React.InputHTMLAttributes<HTMLInputElement> & {
  label?: string
  error?: string
  hint?: string
}

export default forwardRef<HTMLInputElement, Props>(function Input(
  { label, error, hint, id, className = '', ...props },
  ref,
) {
  return (
    <div className="space-y-1.5">
      {label && (
        <label htmlFor={id} className="block text-[11px] font-medium uppercase tracking-[0.06em] text-[#9B9B9B]">
          {label}
        </label>
      )}
      <input
        ref={ref}
        id={id}
        className={`
          w-full px-4 py-3.5 rounded-[10px] bg-white
          border text-[#1A1A1A] placeholder-[#9B9B9B] text-[15px]
          transition-colors duration-150
          focus:outline-none focus:ring-2 focus:border-[#AF4D98]
          ${error
            ? 'border-[#C13515] focus:ring-[#C13515]/10'
            : 'border-[#EDE8E3] focus:ring-[#AF4D98]/8'
          }
          ${className}
        `}
        {...props}
      />
      {hint && !error && <p className="text-xs text-[#9B9B9B]">{hint}</p>}
      {error && <p className="text-xs text-[#C13515]">{error}</p>}
    </div>
  )
})
