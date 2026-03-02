import { useState } from 'react'
import { Save, RotateCcw } from 'lucide-react'
import { Button } from '../ui/Button'
import { Badge } from '../ui/Badge'
import { SensitiveField } from './SensitiveField'
import { useToast } from '../../hooks/useToast'
import type { ConfigProperty } from '../../types/config'

interface CredentialPairRowProps {
  label: string
  username: ConfigProperty
  password: ConfigProperty
  onSave: (key: string, value: string | null) => Promise<ConfigProperty>
  onReset: (key: string) => Promise<ConfigProperty>
  onEditChange?: (key: string, value: string | null) => void
}

export function CredentialPairRow({ label, username, password, onSave, onReset, onEditChange }: CredentialPairRowProps) {
  const [userValue, setUserValue] = useState(username.effectiveValue ?? '')
  const [passValue, setPassValue] = useState('')
  const [saving, setSaving] = useState(false)
  const [resetting, setResetting] = useState(false)
  const [confirmReset, setConfirmReset] = useState(false)
  const { addToast } = useToast()

  const userDirty = userValue !== (username.effectiveValue ?? '')
  const passDirty = passValue.length > 0
  const isDirty = userDirty || passDirty
  const hasOverride = username.hasOverride || password.hasOverride

  async function handleSave() {
    try {
      setSaving(true)
      if (userDirty) await onSave(username.key, userValue)
      if (passDirty) await onSave(password.key, passValue)
      if (passDirty) setPassValue('')
      onEditChange?.(username.key, null)
      onEditChange?.(password.key, null)
      addToast(`Saved ${label.toLowerCase()}`, 'success')
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
      const [updatedUser, updatedPass] = await Promise.all([
        username.hasOverride ? onReset(username.key) : Promise.resolve(username),
        password.hasOverride ? onReset(password.key) : Promise.resolve(password),
      ])
      setUserValue(updatedUser.effectiveValue ?? '')
      setPassValue('')
      setConfirmReset(false)
      onEditChange?.(username.key, null)
      onEditChange?.(password.key, null)
      addToast(`Reset ${label.toLowerCase()} to defaults`, 'success')
    } catch (err) {
      addToast(err instanceof Error ? err.message : 'Reset failed', 'error')
    } finally {
      setResetting(false)
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && isDirty) handleSave()
  }

  return (
    <div className="group rounded-lg border border-drac-current/50 bg-drac-bg p-4 transition-colors hover:border-drac-current">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <span className="text-sm font-medium text-drac-fg">{label}</span>
            {hasOverride && <Badge variant="override">Override</Badge>}
          </div>
          <code className="text-xs text-drac-cyan/70 break-all">{username.key}</code>
          {' '}
          <code className="text-xs text-drac-cyan/70 break-all">{password.key}</code>
        </div>

        <div className="flex flex-col gap-2 md:w-80 shrink-0">
          <input
            type="text"
            value={userValue}
            onChange={e => { setUserValue(e.target.value); onEditChange?.(username.key, e.target.value) }}
            onKeyDown={handleKeyDown}
            placeholder="Username"
            className="w-full rounded-lg border border-drac-current bg-drac-darker px-3 py-2
              text-sm text-drac-fg placeholder:text-drac-comment/60 outline-none
              focus:border-drac-cyan transition-colors"
          />
          <SensitiveField
            value={passValue}
            onChange={v => { setPassValue(v); onEditChange?.(password.key, v || null) }}
            onKeyDown={handleKeyDown}
            placeholder="Password"
          />

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
            {hasOverride && (
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
