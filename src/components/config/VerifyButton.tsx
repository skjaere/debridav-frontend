import { useState, useEffect } from 'react'
import { Zap, CheckCircle, XCircle } from 'lucide-react'
import { Button } from '../ui/Button'
import { useToast } from '../../hooks/useToast'
import type { ConfigTestResult } from '../../types/config'

interface VerifyButtonProps {
  prefix: string
  label: string
  testing: boolean
  onTest: (prefix: string, overrides?: Record<string, string>) => Promise<ConfigTestResult>
  overrides?: Record<string, string>
}

export function VerifyButton({ prefix, label, testing, onTest, overrides }: VerifyButtonProps) {
  const [lastResult, setLastResult] = useState<ConfigTestResult | null>(null)
  const { addToast } = useToast()

  useEffect(() => {
    setLastResult(null)
  }, [prefix])

  async function handleClick() {
    try {
      const hasOverrides = overrides && Object.keys(overrides).length > 0
      const result = await onTest(prefix, hasOverrides ? overrides : undefined)
      setLastResult(result)
      if (result.success) {
        addToast(`${label}: ${result.message} (${result.durationMs}ms)`, 'success')
      } else {
        addToast(`${label}: ${result.message}`, 'error')
      }
    } catch (err) {
      addToast(err instanceof Error ? err.message : 'Test failed', 'error')
    }
  }

  const ResultIcon = lastResult
    ? lastResult.success ? CheckCircle : XCircle
    : null

  const resultColor = lastResult
    ? lastResult.success ? 'text-drac-green' : 'text-drac-red'
    : ''

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleClick}
      loading={testing}
      className="gap-1.5"
    >
      {ResultIcon ? (
        <ResultIcon className={`h-3.5 w-3.5 ${resultColor}`} />
      ) : (
        <Zap className="h-3.5 w-3.5" />
      )}
      Verify
    </Button>
  )
}
