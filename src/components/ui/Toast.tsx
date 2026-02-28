import { X, CheckCircle, AlertCircle, Info } from 'lucide-react'
import { useToast } from '../../hooks/useToast'
import type { ToastType } from '../../context/ToastContext'

const icons: Record<ToastType, typeof CheckCircle> = {
  success: CheckCircle,
  error: AlertCircle,
  info: Info,
}

const colors: Record<ToastType, string> = {
  success: 'border-drac-green text-drac-green',
  error: 'border-drac-red text-drac-red',
  info: 'border-drac-cyan text-drac-cyan',
}

export function ToastContainer() {
  const { toasts, removeToast } = useToast()

  if (toasts.length === 0) return null

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
      {toasts.map(toast => {
        const Icon = icons[toast.type]
        return (
          <div
            key={toast.id}
            className={`flex items-center gap-3 rounded-lg border bg-drac-bg px-4 py-3 shadow-lg
              animate-[slideIn_0.2s_ease-out] ${colors[toast.type]}`}
          >
            <Icon className="h-5 w-5 shrink-0" />
            <span className="text-sm text-drac-fg">{toast.message}</span>
            <button
              onClick={() => removeToast(toast.id)}
              className="ml-2 shrink-0 text-drac-comment hover:text-drac-fg cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )
      })}
    </div>
  )
}
