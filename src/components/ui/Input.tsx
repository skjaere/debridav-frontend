import { forwardRef, type InputHTMLAttributes } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ error, className = '', ...props }, ref) => (
    <div className="flex flex-col gap-1">
      <input
        ref={ref}
        className={`w-full rounded-lg border bg-drac-darker px-3 py-2 text-sm text-drac-fg
          placeholder:text-drac-comment/60 outline-none transition-colors
          ${error ? 'border-drac-red' : 'border-drac-current focus:border-drac-cyan'}
          ${className}`}
        {...props}
      />
      {error && <span className="text-xs text-drac-red">{error}</span>}
    </div>
  )
)
