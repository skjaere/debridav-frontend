import { useEffect, useState } from 'react'
import { apiFetch } from '../lib/api'
import type { GrafanaDashboard } from './useUiConfig'

export function useGrafanaDashboards(enabled: boolean) {
  const [dashboards, setDashboards] = useState<GrafanaDashboard[]>([])
  const [loading, setLoading] = useState(enabled)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!enabled) {
      setLoading(false)
      return
    }
    setLoading(true)
    apiFetch<GrafanaDashboard[]>('/api/v1/grafana/dashboards')
      .then(setDashboards)
      .catch(err => setError(err instanceof Error ? err.message : 'Failed to load dashboards'))
      .finally(() => setLoading(false))
  }, [enabled])

  return { dashboards, loading, error }
}
