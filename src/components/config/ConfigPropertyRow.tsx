import { useState } from 'react'
import { Save, RotateCcw } from 'lucide-react'
import { Button } from '../ui/Button'
import { Badge } from '../ui/Badge'
import { Toggle } from '../ui/Toggle'
import { SensitiveField } from './SensitiveField'
import { useToast } from '../../hooks/useToast'
import type { ConfigProperty } from '../../types/config'

interface ConfigPropertyRowProps {
  property: ConfigProperty
  onSave: (key: string, value: string | null) => Promise<ConfigProperty>
  onReset: (key: string) => Promise<ConfigProperty>
  onEditChange?: (key: string, value: string | null) => void
}

export function ConfigPropertyRow({ property, onSave, onReset, onEditChange }: ConfigPropertyRowProps) {
  const isBoolean = !property.sensitive && property.type === 'BOOLEAN'
  const isNumber = !property.sensitive && (property.type === 'INT' || property.type === 'LONG')
  const displayValue = property.sensitive ? '' : (property.effectiveValue ?? '')
  const [editValue, setEditValue] = useState(displayValue)
  const [boolValue, setBoolValue] = useState(property.effectiveValue === 'true')
  const [saving, setSaving] = useState(false)
  const [resetting, setResetting] = useState(false)
  const [confirmReset, setConfirmReset] = useState(false)
  const { addToast } = useToast()

  const isDirty = property.sensitive
    ? editValue.length > 0
    : isBoolean
      ? String(boolValue) !== (property.effectiveValue ?? 'false')
      : editValue !== (property.effectiveValue ?? '')

  const shortKey = property.key.includes('.')
    ? property.key.substring(property.key.indexOf('.') + 1)
    : property.key

  async function handleSave() {
    try {
      setSaving(true)
      const valueToSave = isBoolean ? String(boolValue) : editValue
      await onSave(property.key, valueToSave)
      if (property.sensitive) setEditValue('')
      onEditChange?.(property.key, null)
      addToast(`Saved ${shortKey}`, 'success')
    } catch (err) {
      addToast(err instanceof Error ? err.message : 'Save failed', 'error')
    } finally {
      setSaving(false)
    }
  }

  async function handleReset() {
    if (!confirmReset) {
      setConfirmReset(true)
      setTimeout(() => setConfirmReset(false), 3000)
      return
    }
    try {
      setResetting(true)
      const updated = await onReset(property.key)
      setEditValue(updated.sensitive ? '' : (updated.effectiveValue ?? ''))
      if (isBoolean) setBoolValue(updated.effectiveValue === 'true')
      setConfirmReset(false)
      onEditChange?.(property.key, null)
      addToast(`Reset ${shortKey} to default`, 'success')
    } catch (err) {
      addToast(err instanceof Error ? err.message : 'Reset failed', 'error')
    } finally {
      setResetting(false)
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && isDirty) {
      handleSave()
    }
  }

  return (
    <div className="group rounded-lg border border-drac-current/50 bg-drac-bg p-4 transition-colors hover:border-drac-current">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:gap-4">
        {/* Info section */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            {property.name ? (
              <span className="text-sm font-medium text-drac-fg">{property.name}</span>
            ) : (
              <code className="text-sm font-medium text-drac-cyan break-all">{property.key}</code>
            )}
            {property.hasOverride && <Badge variant="override">Override</Badge>}
            {property.sensitive && <Badge variant="sensitive">Sensitive</Badge>}
          </div>
          {property.name && (
            <code className="text-xs text-drac-cyan/70 break-all">{property.key}</code>
          )}
          <p className="text-xs text-drac-comment leading-relaxed">{property.description}</p>
          {property.defaultValue !== null && !property.sensitive && (
            <p className="mt-1 text-xs text-drac-comment/60">
              Default: <code className="text-drac-comment">{property.defaultValue}</code>
            </p>
          )}
        </div>

        {/* Edit section */}
        <div className="flex flex-col gap-2 md:w-80 shrink-0">
          {property.sensitive ? (
            <SensitiveField
              value={editValue}
              onChange={v => { setEditValue(v); onEditChange?.(property.key, v || null) }}
              onKeyDown={handleKeyDown}
            />
          ) : isBoolean ? (
            <div className="flex items-center gap-2 py-1.5">
              <Toggle
                checked={boolValue}
                onChange={v => { setBoolValue(v); onEditChange?.(property.key, String(v)) }}
              />
              <span className="text-sm text-drac-comment">
                {boolValue ? 'true' : 'false'}
              </span>
            </div>
          ) : (
            <input
              type={isNumber ? 'number' : 'text'}
              step={isNumber ? 1 : undefined}
              value={editValue}
              onChange={e => { setEditValue(e.target.value); onEditChange?.(property.key, e.target.value) }}
              onKeyDown={handleKeyDown}
              className="w-full rounded-lg border border-drac-current bg-drac-darker px-3 py-2
                text-sm text-drac-fg placeholder:text-drac-comment/60 outline-none
                focus:border-drac-cyan transition-colors"
            />
          )}

          <div className="flex gap-2">
            <Button
              size="sm"
              onClick={handleSave}
              disabled={!isDirty}
              loading={saving}
            >
              <Save className="h-3.5 w-3.5" />
              Save
            </Button>
            {property.hasOverride && (
              <Button
                size="sm"
                variant={confirmReset ? 'danger' : 'secondary'}
                onClick={handleReset}
                loading={resetting}
              >
                <RotateCcw className="h-3.5 w-3.5" />
                {confirmReset ? 'Confirm?' : 'Reset'}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
