import { useState, useEffect, useMemo } from 'react'
import { Plus, Trash2, Save, RotateCcw, Zap, CheckCircle, XCircle, GripVertical } from 'lucide-react'
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
import { SensitiveField } from './SensitiveField'
import { useToast } from '../../hooks/useToast'
import type { NntpPool, ConfigTestResult } from '../../types/config'

const DEFAULT_POOL: NntpPool = {
  host: '',
  port: 563,
  username: '',
  password: '',
  useTls: true,
  maxConnections: 8,
  priority: 0,
}

interface NntpPoolEditorProps {
  pools: NntpPool[]
  saving: boolean
  onSave: (pools: NntpPool[]) => Promise<NntpPool[]>
  onTestPool: (pool: NntpPool) => Promise<ConfigTestResult>
}

interface SortablePoolCardProps {
  pool: NntpPool
  index: number
  id: string
  testResult?: ConfigTestResult
  testingIndex: number | null
  confirmRemove: number | null
  onUpdate: (index: number, patch: Partial<NntpPool>) => void
  onRemove: (index: number) => void
  onTest: (index: number) => void
}

function SortablePoolCard({
  pool,
  index,
  id,
  testResult,
  testingIndex,
  confirmRemove,
  onUpdate,
  onRemove,
  onTest,
}: SortablePoolCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id })

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
      className="rounded-lg border border-drac-current/50 bg-drac-bg p-4 space-y-3"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="cursor-grab touch-none text-drac-comment hover:text-drac-fg transition-colors"
            {...attributes}
            {...listeners}
          >
            <GripVertical className="h-4 w-4" />
          </button>
          <span className="text-sm font-medium text-drac-fg">
            Pool {index + 1}{pool.host ? ` — ${pool.host}` : ''}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <Button
            size="sm"
            variant="ghost"
            className="gap-1.5"
            onClick={() => onTest(index)}
            loading={testingIndex === index}
            disabled={!pool.host}
          >
            {testResult ? (
              testResult.success
                ? <CheckCircle className="h-3.5 w-3.5 text-drac-green" />
                : <XCircle className="h-3.5 w-3.5 text-drac-red" />
            ) : (
              <Zap className="h-3.5 w-3.5" />
            )}
            Test
          </Button>
          <Button
            size="sm"
            variant={confirmRemove === index ? 'danger' : 'ghost'}
            onClick={() => onRemove(index)}
          >
            <Trash2 className="h-3.5 w-3.5" />
            {confirmRemove === index ? 'Confirm?' : 'Remove'}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <Field label="Host">
          <input
            type="text"
            value={pool.host}
            onChange={e => onUpdate(index, { host: e.target.value })}
            placeholder="news.example.com"
            className="w-full rounded-lg border border-drac-current bg-drac-darker px-3 py-2
              text-sm text-drac-fg placeholder:text-drac-comment/60 outline-none
              focus:border-drac-cyan transition-colors"
          />
        </Field>

        <Field label="Port">
          <input
            type="number"
            value={pool.port}
            onChange={e => onUpdate(index, { port: parseInt(e.target.value) || 563 })}
            className="w-full rounded-lg border border-drac-current bg-drac-darker px-3 py-2
              text-sm text-drac-fg outline-none focus:border-drac-cyan transition-colors"
          />
        </Field>

        <Field label="Username">
          <input
            type="text"
            value={pool.username}
            onChange={e => onUpdate(index, { username: e.target.value })}
            className="w-full rounded-lg border border-drac-current bg-drac-darker px-3 py-2
              text-sm text-drac-fg placeholder:text-drac-comment/60 outline-none
              focus:border-drac-cyan transition-colors"
          />
        </Field>

        <Field label="Password">
          <SensitiveField
            value={pool.password}
            onChange={v => onUpdate(index, { password: v })}
            placeholder="Enter password"
          />
        </Field>

        <Field label="Use TLS">
          <div className="flex items-center gap-2 py-1.5">
            <Toggle
              checked={pool.useTls}
              onChange={v => onUpdate(index, { useTls: v })}
            />
            <span className="text-sm text-drac-comment">
              {pool.useTls ? 'Enabled' : 'Disabled'}
            </span>
          </div>
        </Field>

        <Field label="Max Connections">
          <input
            type="number"
            value={pool.maxConnections}
            onChange={e => onUpdate(index, { maxConnections: parseInt(e.target.value) || 8 })}
            min={1}
            className="w-full rounded-lg border border-drac-current bg-drac-darker px-3 py-2
              text-sm text-drac-fg outline-none focus:border-drac-cyan transition-colors"
          />
        </Field>
      </div>
    </div>
  )
}

export function NntpPoolEditor({ pools: initialPools, saving, onSave, onTestPool }: NntpPoolEditorProps) {
  const [pools, setPools] = useState<NntpPool[]>(initialPools)
  const [confirmReset, setConfirmReset] = useState(false)
  const [confirmRemove, setConfirmRemove] = useState<number | null>(null)
  const [testingIndex, setTestingIndex] = useState<number | null>(null)
  const [testResults, setTestResults] = useState<Record<number, ConfigTestResult>>({})
  const { addToast } = useToast()

  useEffect(() => {
    setPools(initialPools)
  }, [initialPools])

  const sortableIds = useMemo(() => pools.map((_, i) => `pool-${i}`), [pools])

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  function updatePool(index: number, patch: Partial<NntpPool>) {
    setPools(prev => prev.map((p, i) => i === index ? { ...p, ...patch } : p))
  }

  function addPool() {
    const maxPriority = pools.length > 0
      ? Math.max(...pools.map(p => p.priority))
      : -1
    setPools(prev => [...prev, { ...DEFAULT_POOL, priority: maxPriority + 1 }])
  }

  function removePool(index: number) {
    if (confirmRemove !== index) {
      setConfirmRemove(index)
      setTimeout(() => setConfirmRemove(null), 3000)
      return
    }
    setPools(prev => {
      const next = prev.filter((_, i) => i !== index)
      return next.map((p, i) => ({ ...p, priority: i }))
    })
    setConfirmRemove(null)
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over || active.id === over.id) return

    const oldIndex = sortableIds.indexOf(active.id as string)
    const newIndex = sortableIds.indexOf(over.id as string)

    setPools(prev => {
      const reordered = arrayMove(prev, oldIndex, newIndex)
      return reordered.map((p, i) => ({ ...p, priority: i }))
    })

    // Remap test results to follow pool positions
    setTestResults(prev => {
      const remapped: Record<number, ConfigTestResult> = {}
      for (const [key, val] of Object.entries(prev)) {
        let idx = parseInt(key)
        if (idx === oldIndex) {
          idx = newIndex
        } else if (oldIndex < newIndex && idx > oldIndex && idx <= newIndex) {
          idx--
        } else if (oldIndex > newIndex && idx >= newIndex && idx < oldIndex) {
          idx++
        }
        remapped[idx] = val
      }
      return remapped
    })
  }

  async function handleTestPool(index: number) {
    setTestingIndex(index)
    try {
      const result = await onTestPool(pools[index])
      setTestResults(prev => ({ ...prev, [index]: result }))
      if (result.success) {
        addToast(`Pool ${index + 1}: ${result.message} (${result.durationMs}ms)`, 'success')
      } else {
        addToast(`Pool ${index + 1}: ${result.message}`, 'error')
      }
    } catch (err) {
      addToast(err instanceof Error ? err.message : 'Test failed', 'error')
    } finally {
      setTestingIndex(null)
    }
  }

  async function handleSave() {
    try {
      await onSave(pools)
      addToast('NNTP pools saved', 'success')
    } catch (err) {
      addToast(err instanceof Error ? err.message : 'Save failed', 'error')
    }
  }

  async function handleReset() {
    if (!confirmReset) {
      setConfirmReset(true)
      setTimeout(() => setConfirmReset(false), 3000)
      return
    }
    try {
      await onSave([])
      setConfirmReset(false)
      addToast('NNTP pools reset to defaults', 'success')
    } catch (err) {
      addToast(err instanceof Error ? err.message : 'Reset failed', 'error')
    }
  }

  return (
    <section>
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-base font-semibold text-drac-cyan">Server Pools</h2>
        <Button size="sm" variant="secondary" onClick={addPool}>
          <Plus className="h-3.5 w-3.5" />
          Add Pool
        </Button>
      </div>

      {pools.length === 0 && (
        <div className="rounded-lg border border-drac-current/50 bg-drac-bg p-6 text-center text-sm text-drac-comment">
          No pools configured. Add a pool to connect to a Usenet server.
        </div>
      )}

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        modifiers={[restrictToVerticalAxis]}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={sortableIds} strategy={verticalListSortingStrategy}>
          <div className="space-y-3">
            {pools.map((pool, i) => (
              <SortablePoolCard
                key={sortableIds[i]}
                id={sortableIds[i]}
                pool={pool}
                index={i}
                testResult={testResults[i]}
                testingIndex={testingIndex}
                confirmRemove={confirmRemove}
                onUpdate={updatePool}
                onRemove={removePool}
                onTest={handleTestPool}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      <div className="mt-4 flex gap-2">
        <Button onClick={handleSave} loading={saving} disabled={saving}>
          <Save className="h-4 w-4" />
          Save All Pools
        </Button>
        <Button variant={confirmReset ? 'danger' : 'secondary'} onClick={handleReset} disabled={saving}>
          <RotateCcw className="h-4 w-4" />
          {confirmReset ? 'Confirm Reset?' : 'Reset to Defaults'}
        </Button>
      </div>
    </section>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1 block text-xs font-medium text-drac-comment">{label}</label>
      {children}
    </div>
  )
}
