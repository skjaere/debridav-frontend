import { useState, useEffect, useCallback } from 'react'
import { apiFetch } from '../lib/api'
import type { ConfigTestResult, TestablePrefixInfo } from '../types/config'

export function useConfigTest() {
  const [testablePrefixes, setTestablePrefixes] = useState<Set<string>>(new Set())
  const [testingPrefix, setTestingPrefix] = useState<string | null>(null)

  useEffect(() => {
    apiFetch<TestablePrefixInfo[]>('/api/v1/config/testable')
      .then(data => setTestablePrefixes(new Set(data.map(d => d.prefix))))
      .catch(() => {})
  }, [])

  const isTestable = useCallback(
    (prefix: string) => testablePrefixes.has(prefix),
    [testablePrefixes]
  )

  const testPrefix = useCallback(async (prefix: string, overrides?: Record<string, string>): Promise<ConfigTestResult> => {
    setTestingPrefix(prefix)
    try {
      return await apiFetch<ConfigTestResult>(`/api/v1/config/test/${prefix}`, {
        method: 'POST',
        body: JSON.stringify(overrides ? { overrides } : {}),
      })
    } finally {
      setTestingPrefix(null)
    }
  }, [])

  return { testPrefix, testingPrefix, isTestable }
}
