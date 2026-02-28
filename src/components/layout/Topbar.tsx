import { Menu, LogOut } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'

interface TopbarProps {
  onMenuClick: () => void
}

export function Topbar({ onMenuClick }: TopbarProps) {
  const { logout } = useAuth()

  return (
    <header className="flex h-14 items-center justify-between border-b border-drac-current bg-drac-darker px-4">
      <button
        onClick={onMenuClick}
        className="rounded-lg p-2 text-drac-comment hover:bg-drac-current hover:text-drac-fg md:hidden cursor-pointer"
      >
        <Menu className="h-5 w-5" />
      </button>

      <div className="md:hidden" />

      <div className="hidden md:block" />

      <button
        onClick={logout}
        className="flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm text-drac-comment
          hover:bg-drac-current hover:text-drac-red transition-colors cursor-pointer"
      >
        <LogOut className="h-4 w-4" />
        <span className="hidden sm:inline">Logout</span>
      </button>
    </header>
  )
}
