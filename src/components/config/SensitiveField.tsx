import { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'

interface SensitiveFieldProps {
  value: string
  onChange: (value: string) => void
  onKeyDown?: (e: React.KeyboardEvent) => void
  placeholder?: string
}

export function SensitiveField({ value, onChange, onKeyDown, placeholder }: SensitiveFieldProps) {
  const [visible, setVisible] = useState(false)

  return (
    <div className="relative">
      <input
        type={visible ? 'text' : 'password'}
        value={value}
        onChange={e => onChange(e.target.value)}
        onKeyDown={onKeyDown}
        placeholder={placeholder || 'Enter new value'}
        className="w-full rounded-lg border border-drac-current bg-drac-darker px-3 py-2 pr-10
          text-sm text-drac-fg placeholder:text-drac-comment/60 outline-none
          focus:border-drac-cyan transition-colors"
      />
      <button
        type="button"
        onClick={() => setVisible(!visible)}
        className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-drac-comment
          hover:text-drac-fg cursor-pointer"
      >
        {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
      </button>
    </div>
  )
}
