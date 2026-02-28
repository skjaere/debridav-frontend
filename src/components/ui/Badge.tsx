import type { ReactNode } from 'react'

interface BadgeProps {
  children: ReactNode
  variant?: 'default' | 'override' | 'sensitive' | 'success'
}

const variants = {
  default: 'bg-drac-comment/30 text-drac-comment',
  override: 'bg-drac-orange/20 text-drac-orange',
  sensitive: 'bg-drac-red/20 text-drac-red',
  success: 'bg-drac-green/20 text-drac-green',
}

export function Badge({ children, variant = 'default' }: BadgeProps) {
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${variants[variant]}`}>
      {children}
    </span>
  )
}
