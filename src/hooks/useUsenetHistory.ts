import { useState, useEffect, useCallback } from 'react'
import { apiFetch } from '../lib/api'
import type { HistoryPage, QueueItem } from '../types/config'

const PAGE_SIZE = 20
const DEBOUNCE_MS = 300

export type SortField = 'updatedAt' | 'name'
export type SortDir = 'asc' | 'desc'

export function useUsenetHistory() {
  const [items, setItems] = useState<QueueItem[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [page, setPage] = useState(0)
  const [totalElements, setTotalElements] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [sortField, setSortField] = useState<SortField>('updatedAt')
  const [sortDir, setSortDir] = useState<SortDir>('desc')

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), DEBOUNCE_MS)
    return () => clearTimeout(timer)
  }, [search])

  const fetchPage = useCallback(async (pageNum: number, searchTerm: string, sort: SortField, direction: SortDir) => {
    try {
      setError(null)
      setLoading(true)
      const params = new URLSearchParams({
        page: String(pageNum),
        size: String(PAGE_SIZE),
        search: searchTerm,
        sort,
        direction,
      })
      const data = await apiFetch<HistoryPage>(`/api/v1/queue/history?${params}`)
      setItems(data.content)
      setTotalElements(data.totalElements)
      setTotalPages(data.totalPages)
      setPage(data.page)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load history')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchPage(0, debouncedSearch, sortField, sortDir)
  }, [debouncedSearch, sortField, sortDir, fetchPage])

  const goToPage = useCallback((p: number) => {
    fetchPage(p, debouncedSearch, sortField, sortDir)
  }, [debouncedSearch, sortField, sortDir, fetchPage])

  const refresh = useCallback(() => {
    fetchPage(page, debouncedSearch, sortField, sortDir)
  }, [page, debouncedSearch, sortField, sortDir, fetchPage])

  const toggleSort = useCallback((field: SortField) => {
    if (field === sortField) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDir(field === 'name' ? 'asc' : 'desc')
    }
  }, [sortField])

  return {
    items, loading, error,
    search, setSearch,
    page, totalElements, totalPages,
    sortField, sortDir, toggleSort,
    goToPage, refresh,
  }
}
