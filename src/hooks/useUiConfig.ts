import { useEffect, useState } from 'react'
import { apiFetch } from '../lib/api'

export interface GrafanaDashboard {
  label: string
  path: string
}

export interface GrafanaConfig {
  baseUrl: string
}

export interface UiConfig {
  grafana: GrafanaConfig | null
  version: string | null
}

export function useUiConfig() {
  const [config, setConfig] = useState<UiConfig | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    apiFetch<UiConfig>('/api/v1/ui-config')
      .then(setConfig)
      .catch(err => setError(err instanceof Error ? err.message : 'Failed to load UI config'))
      .finally(() => setLoading(false))
  }, [])

  return { config, loading, error }
}
