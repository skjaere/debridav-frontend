import { useState, useEffect, useCallback, useRef } from 'react'
import { apiFetch } from '../lib/api'
import type { HealthQueueStatus, HealthQueueItem, HealthQueueHistoryPage } from '../types/config'

const POLL_INTERVAL = 5000
const PAGE_SIZE = 20
const DEBOUNCE_MS = 300

export function useHealthCheckQueue() {
  const [status, setStatus] = useState<HealthQueueStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const fetch = useCallback(async () => {
    try {
      setError(null)
      const data = await apiFetch<HealthQueueStatus>('/api/v1/health-queue/check')
      setStatus(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load health check queue')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetch()
    intervalRef.current = setInterval(fetch, POLL_INTERVAL)
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [fetch])

  return { status, loading, error }
}

export function useRepairQueue() {
  const [status, setStatus] = useState<HealthQueueStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const fetch = useCallback(async () => {
    try {
      setError(null)
      const data = await apiFetch<HealthQueueStatus>('/api/v1/health-queue/repair')
      setStatus(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load repair queue')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetch()
    intervalRef.current = setInterval(fetch, POLL_INTERVAL)
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [fetch])

  return { status, loading, error }
}

export function useHealthCheckHistory() {
  return useHealthHistory('/api/v1/health-queue/check/history')
}

export function useRepairHistory() {
  return useHealthHistory('/api/v1/health-queue/repair/history')
}

function useHealthHistory(endpoint: string) {
  const [items, setItems] = useState<HealthQueueItem[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [page, setPage] = useState(0)
  const [totalElements, setTotalElements] = useState(0)
  const [totalPages, setTotalPages] = useState(0)

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), DEBOUNCE_MS)
    return () => clearTimeout(timer)
  }, [search])

  const fetchPage = useCallback(async (pageNum: number, searchTerm: string) => {
    try {
      setError(null)
      setLoading(true)
      const params = new URLSearchParams({
        page: String(pageNum),
        size: String(PAGE_SIZE),
        search: searchTerm,
      })
      const data = await apiFetch<HealthQueueHistoryPage>(`${endpoint}?${params}`)
      setItems(data.content)
      setTotalElements(data.totalElements)
      setTotalPages(data.totalPages)
      setPage(data.page)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load history')
    } finally {
      setLoading(false)
    }
  }, [endpoint])

  useEffect(() => {
    fetchPage(0, debouncedSearch)
  }, [debouncedSearch, fetchPage])

  const goToPage = useCallback((p: number) => {
    fetchPage(p, debouncedSearch)
  }, [debouncedSearch, fetchPage])

  return {
    items, loading, error,
    search, setSearch,
    page, totalElements, totalPages,
    goToPage,
  }
}
