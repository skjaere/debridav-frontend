import { useState } from 'react'
import { useUiConfig } from '../hooks/useUiConfig'
import { useGrafanaDashboards } from '../hooks/useGrafanaDashboards'
import { Spinner } from '../components/ui/Spinner'
import { OverviewCards } from '../components/OverviewCards'

export function DashboardHome() {
  const { config, loading, error } = useUiConfig()
  const [activeTab, setActiveTab] = useState(0)

  return (
    <div className="flex h-full flex-col gap-4">
      <div className="shrink-0">
        <h1 className="text-xl font-bold text-drac-fg">Dashboard</h1>
        <p className="text-sm text-drac-comment">Monitoring overview</p>
      </div>

      {loading && (
        <div className="flex flex-1 items-center justify-center">
          <Spinner />
        </div>
      )}

      {!loading && error && (
        <div className="flex flex-1 items-center justify-center text-sm text-drac-red">
          {error}
        </div>
      )}

      {!loading && !error && !config?.grafana && <OverviewCards />}

      {!loading && !error && config?.grafana && (
        <GrafanaDashboards
          baseUrl={config.grafana.baseUrl}
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />
      )}
    </div>
  )
}

interface GrafanaDashboardsProps {
  baseUrl: string
  activeTab: number
  onTabChange: (i: number) => void
}

function GrafanaDashboards({ baseUrl, activeTab, onTabChange }: GrafanaDashboardsProps) {
  const { dashboards, loading, error } = useGrafanaDashboards(true)

  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <Spinner />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-1 items-center justify-center text-sm text-drac-red">
        {error}
      </div>
    )
  }

  if (dashboards.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center px-4 text-center text-sm text-drac-comment">
        No dashboards found in the <code className="mx-1 rounded bg-drac-current px-1">debridav</code> folder.
      </div>
    )
  }

  const safeTab = Math.min(activeTab, dashboards.length - 1)
  const current = dashboards[safeTab]

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="shrink-0 flex gap-1 border-b border-drac-current overflow-x-auto">
        {dashboards.map((dashboard, i) => (
          <button
            key={dashboard.path}
            onClick={() => onTabChange(i)}
            className={`whitespace-nowrap px-4 py-2 text-sm font-medium transition-colors cursor-pointer
              ${safeTab === i
                ? 'border-b-2 border-drac-cyan text-drac-cyan'
                : 'text-drac-comment hover:text-drac-fg'
              }`}
          >
            {dashboard.label}
          </button>
        ))}
      </div>
      <div className="mt-3 flex-1 rounded-lg border border-drac-current overflow-hidden">
        <iframe
          src={`${baseUrl}${current.path}?orgId=1&kiosk`}
          className="h-full w-full border-0"
          title={current.label}
        />
      </div>
    </div>
  )
}
