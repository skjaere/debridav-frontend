import { useState } from 'react'

const GRAFANA_BASE = 'http://grafana.home.arpa'

const GRAFANA_DASHBOARDS = [
  { label: 'Platform', path: '/d/f6415a14-af35-4d81-8efb-9a018b0e3ed3/debridav3a-platform' },
  { label: 'Kubernetes', path: '/d/kubernetes-dashboard/kubernetes-cluster' },
  { label: 'Plex', path: '/d/plex-dashboard/plex-media-server' },
  { label: 'Rclone', path: '/d/rclone-mounts-dashboard/rclone-mounts' },
  { label: 'Sonarr & Radarr', path: '/d/scraparr-dashboard/sonarr-and-radarr' },
]

export function DashboardHome() {
  const [activeTab, setActiveTab] = useState(0)

  return (
    <div className="flex h-full flex-col gap-4">
      <div className="shrink-0">
        <h1 className="text-xl font-bold text-drac-fg">Dashboard</h1>
        <p className="text-sm text-drac-comment">Monitoring overview</p>
      </div>

      <div className="flex min-h-0 flex-1 flex-col">
        <div className="shrink-0 flex gap-1 border-b border-drac-current">
          {GRAFANA_DASHBOARDS.map((dashboard, i) => (
            <button
              key={dashboard.path}
              onClick={() => setActiveTab(i)}
              className={`px-4 py-2 text-sm font-medium transition-colors cursor-pointer
                ${activeTab === i
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
            src={`${GRAFANA_BASE}${GRAFANA_DASHBOARDS[activeTab].path}?orgId=1&kiosk`}
            className="h-full w-full border-0"
            title={GRAFANA_DASHBOARDS[activeTab].label}
          />
        </div>
      </div>
    </div>
  )
}
