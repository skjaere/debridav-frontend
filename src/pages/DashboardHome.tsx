import { useState } from 'react'
import { useUiConfig } from '../hooks/useUiConfig'
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
          grafana={config.grafana}
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />
      )}
    </div>
  )
}

interface GrafanaDashboardsProps {
  grafana: NonNullable<ReturnType<typeof useUiConfig>['config']>['grafana']
  activeTab: number
  onTabChange: (i: number) => void
}

function GrafanaDashboards({ grafana, activeTab, onTabChange }: GrafanaDashboardsProps) {
  if (!grafana || grafana.dashboards.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center text-sm text-drac-comment">
        No dashboards configured.
      </div>
    )
  }

  const safeTab = Math.min(activeTab, grafana.dashboards.length - 1)
  const current = grafana.dashboards[safeTab]

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="shrink-0 flex gap-1 border-b border-drac-current">
        {grafana.dashboards.map((dashboard, i) => (
          <button
            key={dashboard.path}
            onClick={() => onTabChange(i)}
            className={`px-4 py-2 text-sm font-medium transition-colors cursor-pointer
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
          src={`${grafana.baseUrl}${current.path}?orgId=1&kiosk`}
          className="h-full w-full border-0"
          title={current.label}
        />
      </div>
    </div>
  )
}
