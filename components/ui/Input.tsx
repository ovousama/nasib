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
    <div className="space-y-1">
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-[#1A1A1A]">
          {label}
        </label>
      )}
      <input
        ref={ref}
        id={id}
        className={`
          w-full px-4 py-3 rounded-xl
          border text-[#1A1A1A] placeholder-[#9B9B9B] text-sm
          transition-all duration-150
          focus:outline-none focus:ring-2 focus:border-[#AF4D98]
          ${error
            ? 'border-[#C13515] ring-[#C13515]/20 focus:ring-[#C13515]/20'
            : 'border-[#D4D4D4] focus:ring-[#AF4D98]/20'
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
