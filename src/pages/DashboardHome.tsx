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

      {!loading && !error && (
        <DashboardTabs
          grafanaBaseUrl={config?.grafana?.baseUrl ?? null}
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />
      )}
    </div>
  )
}

interface DashboardTabsProps {
  grafanaBaseUrl: string | null
  activeTab: number
  onTabChange: (i: number) => void
}

const OVERVIEW_TAB = { label: 'Overview', kind: 'overview' as const }

/**
 * Single tabbed view: "Overview" is always tab 0 (showing [OverviewCards]); each
 * Grafana dashboard registered under the `debridav` folder is appended as an
 * additional tab. If Grafana isn't enabled (or returns no dashboards), the tab
 * bar collapses to just Overview and the bar itself is hidden — there's no point
 * showing a single-tab strip.
 */
function DashboardTabs({ grafanaBaseUrl, activeTab, onTabChange }: DashboardTabsProps) {
  const grafanaEnabled = grafanaBaseUrl !== null
  const { dashboards, loading, error } = useGrafanaDashboards(grafanaEnabled)

  if (grafanaEnabled && loading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <Spinner />
      </div>
    )
  }

  if (grafanaEnabled && error) {
    return (
      <div className="flex flex-1 items-center justify-center text-sm text-drac-red">
        {error}
      </div>
    )
  }

  const tabs = [
    OVERVIEW_TAB,
    ...(grafanaEnabled
      ? dashboards.map((d) => ({ label: d.label, kind: 'grafana' as const, path: d.path }))
      : []),
  ]
  const safeTab = Math.min(Math.max(activeTab, 0), tabs.length - 1)
  const current = tabs[safeTab]

  return (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col">
      {tabs.length > 1 && (
        <div className="shrink-0 w-full overflow-x-auto border-b border-drac-current">
          <div className="flex gap-1 whitespace-nowrap">
            {tabs.map((tab, i) => (
              <button
                key={`${tab.kind}-${i}`}
                onClick={() => onTabChange(i)}
                className={`px-4 py-2 text-sm font-medium transition-colors cursor-pointer
                  ${safeTab === i
                    ? 'border-b-2 border-drac-cyan text-drac-cyan'
                    : 'text-drac-comment hover:text-drac-fg'
                  }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      )}
      <div className={`flex min-h-0 min-w-0 flex-1 flex-col ${tabs.length > 1 ? 'mt-3' : ''}`}>
        {current.kind === 'overview' ? (
          <OverviewCards />
        ) : (
          <div className="flex-1 rounded-lg border border-drac-current overflow-hidden">
            <iframe
              src={`${grafanaBaseUrl}${current.path}?orgId=1&kiosk`}
              className="h-full w-full border-0"
              title={current.label}
            />
          </div>
        )}
      </div>
    </div>
  )
}
