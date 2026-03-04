import { useState, useEffect, useCallback } from 'react'
import { apiFetch } from '../lib/api'
import type { ConfigProperty, ConfigUpdateRequest } from '../types/config'

export function useConfig() {
  const [properties, setProperties] = useState<ConfigProperty[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchAll = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await apiFetch<ConfigProperty[]>('/api/v1/config')
      setProperties(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load config')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchAll()
  }, [fetchAll])

  const updateProperty = useCallback(async (key: string, value: string | null): Promise<ConfigProperty> => {
    const body: ConfigUpdateRequest = { value }
    const updated = await apiFetch<ConfigProperty>(`/api/v1/config/${key}`, {
      method: 'PUT',
      body: JSON.stringify(body),
    })
    setProperties(prev => prev.map(p => (p.key === key ? updated : p)))
    return updated
  }, [])

  const resetProperty = useCallback(async (key: string): Promise<ConfigProperty> => {
    const updated = await apiFetch<ConfigProperty>(`/api/v1/config/${key}`, {
      method: 'DELETE',
    })
    setProperties(prev => prev.map(p => (p.key === key ? updated : p)))
    return updated
  }, [])

  const getByGroup = useCallback(
    (group: string) =>
      properties
        .filter(p => p.group === group)
        .sort((a, b) => Number(a.advanced) - Number(b.advanced)),
    [properties]
  )

  return { properties, loading, error, fetchAll, updateProperty, resetProperty, getByGroup }
}
