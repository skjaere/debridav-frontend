import { NavLink } from 'react-router'
import { LayoutDashboard } from 'lucide-react'
import { CONFIG_GROUPS } from '../../lib/constants'

interface SidebarProps {
  onNavigate?: () => void
}

export function Sidebar({ onNavigate }: SidebarProps) {
  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
      isActive
        ? 'bg-drac-cyan/15 text-drac-cyan'
        : 'text-drac-comment hover:bg-drac-current hover:text-drac-fg'
    }`

  return (
    <aside className="flex h-full w-64 flex-col border-r border-drac-current bg-drac-darker">
      <div className="flex items-center gap-3 border-b border-drac-current px-5 py-4">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-drac-cyan/20">
          <span className="text-lg font-bold text-drac-cyan">D</span>
        </div>
        <div>
          <h1 className="text-base font-bold text-drac-fg">DebriDAV</h1>
          <p className="text-xs text-drac-comment">Admin Dashboard</p>
        </div>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
        <NavLink to="/" end className={linkClass} onClick={onNavigate}>
          <LayoutDashboard className="h-4 w-4" />
          Dashboard
        </NavLink>

        <div className="pb-1 pt-4">
          <p className="px-3 text-xs font-semibold uppercase tracking-wider text-drac-comment/60">
            Configuration
          </p>
        </div>

        {CONFIG_GROUPS.map(group => {
          const Icon = group.icon
          return (
            <NavLink key={group.key} to={group.path} className={linkClass} onClick={onNavigate}>
              <Icon className="h-4 w-4" />
              {group.label}
            </NavLink>
          )
        })}
      </nav>

      <div className="border-t border-drac-current px-5 py-3">
        <p className="text-xs text-drac-comment/50">v1.0.0</p>
      </div>
    </aside>
  )
}
