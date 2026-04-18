import { useEffect, useRef, useState } from 'react'
import { apiFetch } from '../lib/api'

export interface Stream {
  name: string
  source: string
  bitrateBytesPerSec: number
}

export interface ActiveStreams {
  count: number
  bitrateBytesPerSec: number
  streams: Stream[]
}

export interface LibrarySource {
  source: string
  files: number
}

export interface Library {
  totalFiles: number
  bySource: LibrarySource[]
}

export interface QueueCounts {
  pending: number
  processing: number
}

export interface System {
  cpuUsage: number // 0..1
  memoryBytes: number
}

export interface Summary {
  activeStreams: ActiveStreams
  library: Library
  importQueue: QueueCounts
  healthQueue: QueueCounts
  system: System
}

const POLL_INTERVAL = 5000

export function useOverviewSummary() {
  const [summary, setSummary] = useState<Summary | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    let cancelled = false
    const fetchOnce = async () => {
      try {
        const data = await apiFetch<Summary>('/api/v1/summary')
        if (!cancelled) {
          setSummary(data)
          setError(null)
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to load summary')
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    fetchOnce()
    intervalRef.current = setInterval(fetchOnce, POLL_INTERVAL)
    return () => {
      cancelled = true
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [])

  return { summary, loading, error }
}
