import { useState, useEffect, useCallback, useRef } from 'react'
import { apiFetch } from '../lib/api'
import type { QueueStatus } from '../types/config'

const POLL_INTERVAL = 5000

export function useUsenetQueue() {
  const [queue, setQueue] = useState<QueueStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const fetchQueue = useCallback(async () => {
    try {
      setError(null)
      const data = await apiFetch<QueueStatus>('/api/v1/queue')
      setQueue(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load queue')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchQueue()
    intervalRef.current = setInterval(fetchQueue, POLL_INTERVAL)
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [fetchQueue])

  return { queue, loading, error, refetch: fetchQueue }
}
