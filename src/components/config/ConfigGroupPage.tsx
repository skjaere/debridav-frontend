import { useState, useCallback } from 'react'
import { ConfigPropertyRow } from './ConfigPropertyRow'
import { VerifyButton } from './VerifyButton'
import { Spinner } from '../ui/Spinner'
import { Toggle } from '../ui/Toggle'
import type { ConfigProperty, ConfigTestResult } from '../../types/config'
import type { GroupMeta } from '../../lib/constants'

interface ConfigGroupPageProps {
  group: GroupMeta
  properties: ConfigProperty[]
  loading: boolean
  onSave: (key: string, value: string | null) => Promise<ConfigProperty>
  onReset: (key: string) => Promise<ConfigProperty>
  isTestable?: (prefix: string) => boolean
  testingPrefix?: string | null
  onTest?: (prefix: string, overrides?: Record<string, string>) => Promise<ConfigTestResult>
}

function matchesSubgroup(key: string, prefixes: string[]): boolean {
  return prefixes.some(p => key.startsWith(p))
}

export function ConfigGroupPage({ group, properties, loading, onSave, onReset, isTestable, testingPrefix, onTest }: ConfigGroupPageProps) {
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [dirtyValues, setDirtyValues] = useState<Record<string, string>>({})

  const handleEditChange = useCallback((key: string, value: string | null) => {
    setDirtyValues(prev => {
      if (value === null) {
        const { [key]: _, ...rest } = prev
        return rest
      }
      return { ...prev, [key]: value }
    })
  }, [])

  function getDirtyForPrefixes(prefixes: string[]): Record<string, string> {
    const result: Record<string, string> = {}
    for (const [key, value] of Object.entries(dirtyValues)) {
      if (prefixes.some(p => key.startsWith(p))) {
        result[key] = value
      }
    }
    return result
  }

  if (loading) return <Spinner />

  const hasAdvanced = properties.some(p => p.advanced)
  const visibleProps = showAdvanced ? properties : properties.filter(p => !p.advanced)

  const Icon = group.icon

  const advancedToggle = hasAdvanced && (
    <div className="flex items-center gap-2">
      <Toggle checked={showAdvanced} onChange={setShowAdvanced} />
      <span className="text-sm text-drac-comment">Show advanced</span>
    </div>
  )

  if (group.subgroups) {
    return (
      <div className="max-w-4xl space-y-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-drac-cyan/15">
              <Icon className="h-5 w-5 text-drac-cyan" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-drac-fg">{group.label} Configuration</h1>
              <p className="text-sm text-drac-comment">{group.description}</p>
            </div>
          </div>
          {advancedToggle}
        </div>

        {group.subgroups.map(sub => {
          const subProps = visibleProps.filter(p => matchesSubgroup(p.key, sub.prefixes))
          if (subProps.length === 0) return null
          return (
            <section key={sub.key}>
              <div className="mb-3 flex items-center gap-3">
                <h2 className="text-base font-semibold text-drac-cyan">{sub.label}</h2>
                {isTestable?.(sub.key) && onTest && (
                  <VerifyButton
                    prefix={sub.key}
                    label={sub.label}
                    testing={testingPrefix === sub.key}
                    onTest={onTest}
                    overrides={getDirtyForPrefixes(sub.prefixes)}
                  />
                )}
              </div>
              <div className="space-y-2">
                {subProps.map(prop => (
                  <ConfigPropertyRow
                    key={prop.key}
                    property={prop}
                    onSave={onSave}
                    onReset={onReset}
                    onEditChange={handleEditChange}
                  />
                ))}
              </div>
            </section>
          )
        })}
      </div>
    )
  }

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-drac-cyan/15">
            <Icon className="h-5 w-5 text-drac-cyan" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-drac-fg">{group.label} Configuration</h1>
            <p className="text-sm text-drac-comment">{group.description}</p>
          </div>
          {isTestable?.(group.key) && onTest && (
            <VerifyButton
              prefix={group.key}
              label={group.label}
              testing={testingPrefix === group.key}
              onTest={onTest}
              overrides={dirtyValues}
            />
          )}
        </div>
        {advancedToggle}
      </div>

      <div className="space-y-2">
        {visibleProps.map(prop => (
          <ConfigPropertyRow
            key={prop.key}
            property={prop}
            onSave={onSave}
            onReset={onReset}
            onEditChange={handleEditChange}
          />
        ))}
      </div>
    </div>
  )
}
