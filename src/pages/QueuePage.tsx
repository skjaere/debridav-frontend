import { useState } from 'react'
import {
  ListOrdered,
  Loader,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  ChevronDown,
  ChevronRight,
} from 'lucide-react'
import { Spinner } from '../components/ui/Spinner'
import { useUsenetQueue } from '../hooks/useUsenetQueue'
import type { QueueItem } from '../types/config'

function formatSize(bytes: number | null): string {
  if (bytes == null) return '—'
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`
}

function formatTime(iso: string | null): string {
  if (!iso) return '—'
  const d = new Date(iso)
  return (
    d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) +
    ' ' +
    d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })
  )
}

function StatusBadge({ status }: { status: string }) {
  let color = 'bg-drac-comment/20 text-drac-comment'
  if (status === 'COMPLETED') color = 'bg-drac-green/15 text-drac-green'
  else if (status === 'FAILED') color = 'bg-drac-red/15 text-drac-red'
  else if (status === 'ARTICLES_MISSING') color = 'bg-drac-orange/15 text-drac-orange'
  else if (['DOWNLOADING', 'EXTRACTING', 'VERIFYING', 'REPAIRING', 'POST_PROCESSING', 'VALIDATING'].includes(status))
    color = 'bg-drac-orange/15 text-drac-orange'
  else if (['CREATED', 'QUEUED', 'CACHED'].includes(status))
    color = 'bg-drac-purple/15 text-drac-purple'

  return (
    <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ${color}`}>
      {status}
    </span>
  )
}

function ProgressBar({ percent }: { percent: number }) {
  return (
    <div className="h-1.5 w-24 rounded-full bg-drac-current">
      <div
        className="h-full rounded-full bg-drac-cyan transition-all"
        style={{ width: `${Math.min(100, Math.max(0, percent))}%` }}
      />
    </div>
  )
}

function ErrorDetail({ message }: { message: string }) {
  const [expanded, setExpanded] = useState(false)
  const isMultiline = message.includes('\n')

  return (
    <div className="mt-2">
      {isMultiline ? (
        <>
          <button
            onClick={(e) => { e.stopPropagation(); setExpanded(!expanded) }}
            className="flex items-center gap-1 text-xs text-drac-red/70 hover:text-drac-red transition-colors"
          >
            {expanded ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
            {expanded ? 'Hide details' : 'Show details'}
          </button>
          {expanded && (
            <pre className="mt-1.5 max-h-48 overflow-auto rounded-md bg-drac-bg/50 px-3 py-2 text-xs text-drac-red/80 leading-relaxed">
              {message}
            </pre>
          )}
        </>
      ) : (
        <p className="text-xs text-drac-red/70">{message}</p>
      )}
    </div>
  )
}

function Section({
  title,
  icon,
  items,
  defaultOpen,
  renderItem,
}: {
  title: string
  icon: React.ReactNode
  items: QueueItem[]
  defaultOpen: boolean
  renderItem: (item: QueueItem, index: number) => React.ReactNode
}) {
  const [open, setOpen] = useState(defaultOpen)

  return (
    <div className="rounded-lg border border-drac-current bg-drac-darker">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-drac-current/30 transition-colors"
      >
        {open ? (
          <ChevronDown className="h-4 w-4 text-drac-comment" />
        ) : (
          <ChevronRight className="h-4 w-4 text-drac-comment" />
        )}
        {icon}
        <span className="text-sm font-semibold text-drac-fg">{title}</span>
        <span className="ml-auto text-xs text-drac-comment">{items.length}</span>
      </button>
      {open && (
        <div className="divide-y divide-drac-current border-t border-drac-current">
          {items.length === 0 ? (
            <div className="px-4 py-6 text-center text-sm text-drac-comment">No items</div>
          ) : (
            items.map((item, i) => renderItem(item, i))
          )}
        </div>
      )}
    </div>
  )
}

function HistoryIcon({ status }: { status: string }) {
  if (status === 'COMPLETED') return <CheckCircle className="h-4 w-4 shrink-0 text-drac-green" />
  if (status === 'ARTICLES_MISSING') return <AlertTriangle className="h-4 w-4 shrink-0 text-drac-orange" />
  return <XCircle className="h-4 w-4 shrink-0 text-drac-red" />
}

export function QueuePage() {
  const { queue, loading, error } = useUsenetQueue()

  return (
    <div className="max-w-5xl space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-drac-cyan/15">
          <ListOrdered className="h-5 w-5 text-drac-cyan" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-drac-fg">NZB Import Queue</h1>
          <p className="text-sm text-drac-comment">Monitor NZB import progress and history</p>
        </div>
      </div>

      {loading ? (
        <Spinner />
      ) : error ? (
        <div className="rounded-lg bg-drac-red/10 px-4 py-3 text-sm text-drac-red">{error}</div>
      ) : queue ? (
        <div className="space-y-4">
          <Section
            title="Processing"
            icon={<Loader className="h-4 w-4 text-drac-orange" />}
            items={queue.processing}
            defaultOpen={true}
            renderItem={(item) => (
              <div key={item.id} className="flex items-center gap-3 px-4 py-3">
                <Loader className="h-4 w-4 shrink-0 animate-spin text-drac-orange" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm text-drac-fg">{item.name}</p>
                  <div className="mt-1 flex items-center gap-3">
                    <StatusBadge status={item.status} />
                    {item.percentCompleted != null && (
                      <>
                        <ProgressBar percent={item.percentCompleted} />
                        <span className="text-xs text-drac-comment">{item.percentCompleted}%</span>
                      </>
                    )}
                  </div>
                </div>
                <span className="hidden shrink-0 text-xs text-drac-comment/60 sm:block">
                  {formatSize(item.size)}
                </span>
              </div>
            )}
          />

          <Section
            title="Pending"
            icon={<Clock className="h-4 w-4 text-drac-purple" />}
            items={queue.pending}
            defaultOpen={true}
            renderItem={(item, index) => (
              <div key={item.id} className="flex items-center gap-3 px-4 py-3">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-drac-purple/15 text-xs font-medium text-drac-purple">
                  {index + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm text-drac-fg">{item.name}</p>
                  <StatusBadge status={item.status} />
                </div>
                <span className="hidden shrink-0 text-xs text-drac-comment/60 sm:block">
                  {formatSize(item.size)}
                </span>
              </div>
            )}
          />

          <Section
            title="History"
            icon={<CheckCircle className="h-4 w-4 text-drac-green" />}
            items={queue.history}
            defaultOpen={false}
            renderItem={(item) => (
              <div key={item.id} className="px-4 py-3">
                <div className="flex items-center gap-3">
                  <HistoryIcon status={item.status} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm text-drac-fg">{item.name}</p>
                    <StatusBadge status={item.status} />
                  </div>
                  <div className="hidden shrink-0 text-right sm:block">
                    <p className="text-xs text-drac-comment/60">{formatSize(item.size)}</p>
                    <p className="text-xs text-drac-comment/40">{formatTime(item.updatedAt)}</p>
                  </div>
                </div>
                {item.errorMessage && <ErrorDetail message={item.errorMessage} />}
              </div>
            )}
          />
        </div>
      ) : null}
    </div>
  )
}
