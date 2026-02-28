import type { ReactNode } from 'react'

interface CardProps {
  children: ReactNode
  className?: string
}

export function Card({ children, className = '' }: CardProps) {
  return (
    <div className={`rounded-xl border border-drac-current bg-drac-current/30 p-5 ${className}`}>
      {children}
    </div>
  )
}
