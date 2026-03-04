import { useState, useRef, useLayoutEffect, type ReactNode } from 'react'
import { createPortal } from 'react-dom'

interface TooltipProps {
  content: ReactNode
  children: ReactNode
}

export function Tooltip({ content, children }: TooltipProps) {
  const [visible, setVisible] = useState(false)
  const [coords, setCoords] = useState({ top: 0, left: 0 })
  const [position, setPosition] = useState<'bottom' | 'top'>('bottom')
  const triggerRef = useRef<HTMLSpanElement>(null)

  useLayoutEffect(() => {
    if (visible && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect()
      const spaceBelow = window.innerHeight - rect.bottom
      const pos = spaceBelow < 120 ? 'top' : 'bottom'
      setPosition(pos)
      setCoords({
        left: rect.left + rect.width / 2,
        top: pos === 'bottom' ? rect.bottom + 6 : rect.top - 6,
      })
    }
  }, [visible])

  return (
    <span
      ref={triggerRef}
      className="relative inline-flex"
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
    >
      {children}
      {visible && createPortal(
        <span
          style={{ top: coords.top, left: coords.left }}
          className={`fixed z-[100] w-64 -translate-x-1/2 rounded-lg border border-drac-current
            bg-drac-darker px-3 py-2 text-xs text-drac-fg shadow-lg pointer-events-none
            ${position === 'top' ? '-translate-y-full' : ''}`}
        >
          {content}
        </span>,
        document.body
      )}
    </span>
  )
}
