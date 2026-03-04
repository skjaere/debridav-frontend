import { useState, useMemo } from 'react'
import { GripVertical, Save, RotateCcw } from 'lucide-react'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { restrictToVerticalAxis } from '@dnd-kit/modifiers'
import { CSS } from '@dnd-kit/utilities'
import { Button } from '../ui/Button'
import { Toggle } from '../ui/Toggle'
import { Badge } from '../ui/Badge'
import { useToast } from '../../hooks/useToast'
import type { ConfigProperty } from '../../types/config'

const ALL_PROVIDERS = [
  { id: 'premiumize', label: 'Premiumize' },
  { id: 'real-debrid', label: 'Real-Debrid' },
  { id: 'torbox', label: 'TorBox' },
  { id: 'easynews', label: 'Easynews' },
] as const

type ProviderId = typeof ALL_PROVIDERS[number]['id']

interface ProviderEntry {
  id: ProviderId
  label: string
  enabled: boolean
}

function parseValue(value: string | null): ProviderEntry[] {
  const enabled = (value ?? '')
    .split(',')
    .map(s => s.trim().toLowerCase())
    .filter(Boolean)

  // Enabled providers in order, then disabled ones
  const entries: ProviderEntry[] = []
  const seen = new Set<string>()

  for (const id of enabled) {
    const provider = ALL_PROVIDERS.find(p => p.id === id)
    if (provider && !seen.has(id)) {
      entries.push({ id: provider.id, label: provider.label, enabled: true })
      seen.add(id)
    }
  }

  for (const provider of ALL_PROVIDERS) {
    if (!seen.has(provider.id)) {
      entries.push({ id: provider.id, label: provider.label, enabled: false })
    }
  }

  return entries
}

function serialize(entries: ProviderEntry[]): string {
  return entries.filter(e => e.enabled).map(e => e.id).join(',')
}

interface DebridClientsEditorProps {
  property: ConfigProperty
  onSave: (key: string, value: string | null) => Promise<ConfigProperty>
  onReset: (key: string) => Promise<ConfigProperty>
}

function SortableProviderRow({ entry, onToggle }: {
  entry: ProviderEntry
  onToggle: (id: ProviderId) => void
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: entry.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 10 : undefined,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-3 rounded-lg border px-4 py-3 transition-colors
        ${entry.enabled
          ? 'border-drac-current/50 bg-drac-bg'
          : 'border-drac-current/30 bg-drac-bg/50 opacity-60'
        }`}
    >
      <button
        type="button"
        className="cursor-grab touch-none text-drac-comment hover:text-drac-fg transition-colors"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="h-4 w-4" />
      </button>
      <Toggle checked={entry.enabled} onChange={() => onToggle(entry.id)} />
      <span className={`text-sm font-medium ${entry.enabled ? 'text-drac-fg' : 'text-drac-comment'}`}>
        {entry.label}
      </span>
      {entry.enabled && (
        <Badge variant="override" className="ml-auto">Enabled</Badge>
      )}
    </div>
  )
}

export function DebridClientsEditor({ property, onSave, onReset }: DebridClientsEditorProps) {
  const [entries, setEntries] = useState<ProviderEntry[]>(() => parseValue(property.effectiveValue))
  const [saving, setSaving] = useState(false)
  const [resetting, setResetting] = useState(false)
  const [confirmReset, setConfirmReset] = useState(false)
  const { addToast } = useToast()

  const sortableIds = useMemo(() => entries.map(e => e.id), [entries])

  const currentValue = serialize(entries)
  const isDirty = currentValue !== (property.effectiveValue ?? '')

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  function handleToggle(id: ProviderId) {
    setEntries(prev => prev.map(e => e.id === id ? { ...e, enabled: !e.enabled } : e))
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over || active.id === over.id) return

    const oldIndex = sortableIds.indexOf(active.id as ProviderId)
    const newIndex = sortableIds.indexOf(over.id as ProviderId)
    setEntries(prev => arrayMove(prev, oldIndex, newIndex))
  }

  async function handleSave() {
    try {
      setSaving(true)
      await onSave(property.key, currentValue)
      addToast('Saved debrid clients', 'success')
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
      setEntries(parseValue(updated.effectiveValue))
      setConfirmReset(false)
      addToast('Reset debrid clients to default', 'success')
    } catch (err) {
      addToast(err instanceof Error ? err.message : 'Reset failed', 'error')
    } finally {
      setResetting(false)
    }
  }

  return (
    <div className="rounded-lg border border-drac-current/50 bg-drac-bg p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <span className="text-sm font-medium text-drac-fg">Debrid Clients</span>
          <p className="text-xs text-drac-comment">Drag to set priority order. Top = highest priority.</p>
        </div>
        {property.hasOverride && <Badge variant="override">Override</Badge>}
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        modifiers={[restrictToVerticalAxis]}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={sortableIds} strategy={verticalListSortingStrategy}>
          <div className="space-y-2">
            {entries.map(entry => (
              <SortableProviderRow
                key={entry.id}
                entry={entry}
                onToggle={handleToggle}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      <div className="flex gap-2 pt-1">
        <Button size="sm" onClick={handleSave} disabled={!isDirty} loading={saving}>
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
  )
}
