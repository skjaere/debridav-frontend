import { useState, useEffect } from 'react'

type Unit = 'seconds' | 'minutes' | 'hours' | 'days'

const UNITS: { value: Unit; label: string; suffix: string; seconds: number }[] = [
  { value: 'seconds', label: 'Seconds', suffix: 'S', seconds: 1 },
  { value: 'minutes', label: 'Minutes', suffix: 'M', seconds: 60 },
  { value: 'hours', label: 'Hours', suffix: 'H', seconds: 3600 },
  { value: 'days', label: 'Days', suffix: 'D', seconds: 86400 },
]

/** Spring Boot shorthand suffixes → seconds */
const SHORTHAND: Record<string, number> = {
  d: 86400,
  h: 3600,
  m: 60,
  s: 1,
  ms: 0.001,
}

/** Convert any supported duration string to total seconds */
function toSeconds(input: string): number | null {
  if (!input) return null

  // ISO 8601: P...D T...H...M...S
  const iso = input.match(/^P(?:(\d+)D)?(?:T(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?)?$/)
  if (iso) {
    return (parseInt(iso[1] || '0') * 86400)
      + (parseInt(iso[2] || '0') * 3600)
      + (parseInt(iso[3] || '0') * 60)
      + parseInt(iso[4] || '0')
  }

  // Spring Boot shorthand: 10m, 24h, 7d, 30s, 500ms
  const sh = input.match(/^(\d+)(ms|[dhms])$/)
  if (sh) {
    return parseInt(sh[1]) * (SHORTHAND[sh[2]] ?? 1)
  }

  return null
}

/** Parse any duration format into amount + unit */
function parseDuration(input: string): { amount: number; unit: Unit } {
  if (!input) return { amount: 0, unit: 'seconds' }

  const totalSeconds = toSeconds(input)
  if (totalSeconds === null || totalSeconds < 0) return { amount: 0, unit: 'seconds' }

  // Pick the best-fitting unit (largest unit that divides evenly)
  for (let i = UNITS.length - 1; i >= 0; i--) {
    const u = UNITS[i]
    if (totalSeconds >= u.seconds && totalSeconds % u.seconds === 0) {
      return { amount: totalSeconds / u.seconds, unit: u.value }
    }
  }

  return { amount: totalSeconds, unit: 'seconds' }
}

/** Serialize amount + unit back to ISO 8601 duration */
function toIso(amount: number, unit: Unit): string {
  if (unit === 'days') return `P${amount}D`
  const suffix = UNITS.find(u => u.value === unit)!.suffix
  return `PT${amount}${suffix}`
}

/** Format an ISO 8601 duration to a human-readable string, e.g. "24 Hours" */
export function formatDuration(iso: string): string {
  const { amount, unit } = parseDuration(iso)
  const label = UNITS.find(u => u.value === unit)!.label
  return `${amount} ${amount === 1 ? label.replace(/s$/, '') : label}`
}

interface DurationFieldProps {
  value: string
  onChange: (iso: string) => void
  onKeyDown?: (e: React.KeyboardEvent) => void
}

export function DurationField({ value, onChange, onKeyDown }: DurationFieldProps) {
  const [parsed, setParsed] = useState(() => parseDuration(value))

  useEffect(() => {
    setParsed(parseDuration(value))
  }, [value])

  function handleAmountChange(newAmount: number) {
    const clamped = Math.max(0, newAmount)
    setParsed(prev => ({ ...prev, amount: clamped }))
    onChange(toIso(clamped, parsed.unit))
  }

  function handleUnitChange(newUnit: Unit) {
    setParsed(prev => ({ ...prev, unit: newUnit }))
    onChange(toIso(parsed.amount, newUnit))
  }

  return (
    <div className="flex gap-2">
      <input
        type="number"
        min={0}
        step={1}
        value={parsed.amount}
        onChange={e => handleAmountChange(parseInt(e.target.value) || 0)}
        onKeyDown={onKeyDown}
        className="w-24 rounded-lg border border-drac-current bg-drac-darker px-3 py-2
          text-sm text-drac-fg outline-none focus:border-drac-cyan transition-colors"
      />
      <select
        value={parsed.unit}
        onChange={e => handleUnitChange(e.target.value as Unit)}
        className="flex-1 rounded-lg border border-drac-current bg-drac-darker px-3 py-2
          text-sm text-drac-fg outline-none focus:border-drac-cyan transition-colors
          cursor-pointer"
      >
        {UNITS.map(u => (
          <option key={u.value} value={u.value}>{u.label}</option>
        ))}
      </select>
    </div>
  )
}
