import { useState, useEffect, useCallback } from 'react'
import { apiFetch } from '../lib/api'
import type { NntpPool, ConfigTestResult } from '../types/config'

export function useNntpPools() {
  const [pools, setPools] = useState<NntpPool[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchPools = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await apiFetch<NntpPool[]>('/api/v1/config/nntp-pools')
      setPools(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load pools')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchPools()
  }, [fetchPools])

  const savePools = useCallback(async (updated: NntpPool[]): Promise<NntpPool[]> => {
    setSaving(true)
    try {
      const data = await apiFetch<NntpPool[]>('/api/v1/config/nntp-pools', {
        method: 'PUT',
        body: JSON.stringify(updated),
      })
      setPools(data)
      return data
    } finally {
      setSaving(false)
    }
  }, [])

  const testPool = useCallback(async (pool: NntpPool): Promise<ConfigTestResult> => {
    return apiFetch<ConfigTestResult>('/api/v1/config/nntp-pools/test', {
      method: 'POST',
      body: JSON.stringify(pool),
    })
  }, [])

  return { pools, loading, saving, error, savePools, fetchPools, testPool }
}
