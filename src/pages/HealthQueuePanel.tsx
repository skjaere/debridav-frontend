import { useState } from 'react'
import {
  HeartPulse,
  Wrench,
  ChevronDown,
  ChevronRight,
  Search,
  ChevronsLeft,
  ChevronsRight,
  ChevronLeft,
  ChevronRight as ChevronRightIcon,
} from 'lucide-react'
import { Spinner } from '../components/ui/Spinner'
import {
  useHealthCheckQueue,
  useRepairQueue,
  useHealthCheckHistory,
  useRepairHistory,
} from '../hooks/useHealthQueue'
import type { HealthQueueItem } from '../types/config'

function formatTime(iso: string | null): string {
  if (!iso) return '\u2014'
  const d = new Date(iso)
  return (
    d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) +
    ' ' +
    d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })
  )
}

function TypeBadge({ type }: { type: string }) {
  const isNzb = type === 'NZB'
  return (
    <span
      className={`inline-flex items-center rounded px-1.5 py-0.5 text-xs font-medium ${
        isNzb
          ? 'bg-drac-purple/20 text-drac-purple'
          : 'bg-drac-cyan/20 text-drac-cyan'
      }`}
    >
      {type}
    </span>
  )
}

function ActionBadge({ action }: { action: string | null }) {
  if (!action) return <span className="text-xs text-drac-comment/40">{'\u2014'}</span>
  const colors: Record<string, string> = {
    REPAIRED: 'bg-drac-green/20 text-drac-green',
    DELETED: 'bg-drac-red/20 text-drac-red',
    SKIPPED: 'bg-drac-comment/20 text-drac-comment',
  }
  return (
    <span className={`inline-flex items-center rounded px-1.5 py-0.5 text-xs font-medium ${colors[action] ?? 'bg-drac-comment/20 text-drac-comment'}`}>
      {action}
    </span>
  )
}

function Pagination({
  page,
  totalPages,
  onPageChange,
}: {
  page: number
  totalPages: number
  onPageChange: (p: number) => void
}) {
  if (totalPages <= 1) return null

  const pages: (number | 'ellipsis')[] = []
  const addPage = (p: number) => { if (!pages.includes(p)) pages.push(p) }

  addPage(0)
  for (let i = Math.max(1, page - 1); i <= Math.min(totalPages - 2, page + 1); i++) {
    addPage(i)
  }
  if (totalPages > 1) addPage(totalPages - 1)

  const withEllipsis: (number | 'ellipsis')[] = []
  for (let i = 0; i < pages.length; i++) {
    const p = pages[i] as number
    if (i > 0 && p - (pages[i - 1] as number) > 1) {
      withEllipsis.push('ellipsis')
    }
    withEllipsis.push(p)
  }

  const btnBase = 'flex h-7 min-w-7 items-center justify-center rounded text-xs transition-colors'
  const btnEnabled = 'hover:bg-drac-current/40 text-drac-comment hover:text-drac-fg'
  const btnDisabled = 'text-drac-comment/30 cursor-default'

  return (
    <div className="flex items-center justify-center gap-1 border-t border-drac-current px-4 py-2">
      <button onClick={() => onPageChange(0)} disabled={page === 0} className={`${btnBase} ${page === 0 ? btnDisabled : btnEnabled}`}>
        <ChevronsLeft className="h-3.5 w-3.5" />
      </button>
      <button onClick={() => onPageChange(page - 1)} disabled={page === 0} className={`${btnBase} ${page === 0 ? btnDisabled : btnEnabled}`}>
        <ChevronLeft className="h-3.5 w-3.5" />
      </button>
      {withEllipsis.map((item, idx) =>
        item === 'ellipsis' ? (
          <span key={`e${idx}`} className="px-1 text-xs text-drac-comment/40">...</span>
        ) : (
          <button
            key={item}
            onClick={() => onPageChange(item)}
            className={`${btnBase} px-1.5 ${item === page ? 'bg-drac-cyan/20 text-drac-cyan font-semibold' : btnEnabled}`}
          >
            {item + 1}
          </button>
        )
      )}
      <button onClick={() => onPageChange(page + 1)} disabled={page >= totalPages - 1} className={`${btnBase} ${page >= totalPages - 1 ? btnDisabled : btnEnabled}`}>
        <ChevronRightIcon className="h-3.5 w-3.5" />
      </button>
      <button onClick={() => onPageChange(totalPages - 1)} disabled={page >= totalPages - 1} className={`${btnBase} ${page >= totalPages - 1 ? btnDisabled : btnEnabled}`}>
        <ChevronsRight className="h-3.5 w-3.5" />
      </button>
    </div>
  )
}

const PAGE_SIZE = 20

function PendingTable({
  title,
  icon,
  items,
}: {
  title: string
  icon: React.ReactNode
  items: HealthQueueItem[]
}) {
  const [open, setOpen] = useState(true)
  const [page, setPage] = useState(0)
  const colSpan = 5
  const totalPages = Math.max(1, Math.ceil(items.length / PAGE_SIZE))
  const pageItems = items.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE)

  return (
    <div className="overflow-hidden rounded-lg border border-drac-current bg-drac-darker">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-drac-current/30 transition-colors"
      >
        {open ? <ChevronDown className="h-4 w-4 text-drac-comment" /> : <ChevronRight className="h-4 w-4 text-drac-comment" />}
        {icon}
        <span className="text-sm font-semibold text-drac-fg">{title}</span>
        <span className="ml-auto text-xs text-drac-comment">{items.length}</span>
      </button>
      {open && (
        <div className="overflow-x-auto border-t border-drac-current">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-drac-current bg-drac-current/30">
                <th className="px-4 py-2 text-left font-medium text-drac-comment">Name</th>
                <th className="hidden px-4 py-2 text-left font-medium text-drac-comment sm:table-cell">Type</th>
                <th className="hidden px-4 py-2 text-left font-medium text-drac-comment sm:table-cell">Category</th>
                <th className="px-4 py-2 text-right font-medium text-drac-comment">Reads</th>
                <th className="px-4 py-2 text-right font-medium text-drac-comment">Enqueued</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-drac-current">
              {items.length === 0 ? (
                <tr>
                  <td colSpan={colSpan} className="px-4 py-6 text-center text-sm text-drac-comment">
                    No pending items
                  </td>
                </tr>
              ) : (
                pageItems.map(item => (
                  <tr key={`${item.type}-${item.msgId}`} className="hover:bg-drac-current/20 transition-colors">
                    <td className="max-w-xs px-4 py-3">
                      <p className="truncate text-drac-fg">{item.name ?? `#${item.documentId}`}</p>
                    </td>
                    <td className="hidden px-4 py-3 sm:table-cell">
                      <TypeBadge type={item.type} />
                    </td>
                    <td className="hidden px-4 py-3 text-xs text-drac-comment/60 sm:table-cell">
                      {item.category ?? '\u2014'}
                    </td>
                    <td className="px-4 py-3 text-right text-xs text-drac-comment/60">
                      {item.readCount}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-right text-xs text-drac-comment/60">
                      {formatTime(item.enqueuedAt)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
          <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
        </div>
      )}
    </div>
  )
}

function HistoryTable({
  title,
  icon,
  history,
  showAction,
}: {
  title: string
  icon: React.ReactNode
  history: ReturnType<typeof useHealthCheckHistory>
  showAction: boolean
}) {
  const [open, setOpen] = useState(false)
  const colSpan = showAction ? 6 : 5

  return (
    <div className="overflow-hidden rounded-lg border border-drac-current bg-drac-darker">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-drac-current/30 transition-colors"
      >
        {open ? <ChevronDown className="h-4 w-4 text-drac-comment" /> : <ChevronRight className="h-4 w-4 text-drac-comment" />}
        {icon}
        <span className="text-sm font-semibold text-drac-fg">{title}</span>
        <span className="ml-auto text-xs text-drac-comment">{history.totalElements}</span>
      </button>
      {open && (
        <div className="overflow-x-auto border-t border-drac-current">
          <div className="flex items-center gap-2 border-b border-drac-current bg-drac-current/20 px-4 py-2">
            <Search className="h-3.5 w-3.5 text-drac-comment/50" />
            <input
              type="text"
              value={history.search}
              onChange={(e) => history.setSearch(e.target.value)}
              placeholder="Search by name..."
              className="flex-1 bg-transparent text-xs text-drac-fg placeholder-drac-comment/40 outline-none"
            />
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-drac-current bg-drac-current/30">
                <th className="px-4 py-2 text-left font-medium text-drac-comment">Name</th>
                <th className="hidden px-4 py-2 text-left font-medium text-drac-comment sm:table-cell">Type</th>
                <th className="hidden px-4 py-2 text-left font-medium text-drac-comment sm:table-cell">Category</th>
                <th className="px-4 py-2 text-right font-medium text-drac-comment">Reads</th>
                {showAction && (
                  <th className="hidden px-4 py-2 text-left font-medium text-drac-comment sm:table-cell">Action</th>
                )}
                <th className="px-4 py-2 text-right font-medium text-drac-comment">Archived</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-drac-current">
              {history.loading ? (
                <tr>
                  <td colSpan={colSpan} className="px-4 py-6 text-center">
                    <Spinner />
                  </td>
                </tr>
              ) : history.items.length === 0 ? (
                <tr>
                  <td colSpan={colSpan} className="px-4 py-6 text-center text-sm text-drac-comment">
                    {history.search ? 'No matching items' : 'No archived items'}
                  </td>
                </tr>
              ) : (
                history.items.map(item => (
                  <tr key={`${item.type}-${item.msgId}`} className="hover:bg-drac-current/20 transition-colors">
                    <td className="max-w-xs px-4 py-3">
                      <p className="truncate text-drac-fg">{item.name ?? `#${item.documentId}`}</p>
                    </td>
                    <td className="hidden px-4 py-3 sm:table-cell">
                      <TypeBadge type={item.type} />
                    </td>
                    <td className="hidden px-4 py-3 text-xs text-drac-comment/60 sm:table-cell">
                      {item.category ?? '\u2014'}
                    </td>
                    <td className="px-4 py-3 text-right text-xs text-drac-comment/60">
                      {item.readCount}
                    </td>
                    {showAction && (
                      <td className="hidden px-4 py-3 sm:table-cell">
                        <ActionBadge action={item.action} />
                      </td>
                    )}
                    <td className="whitespace-nowrap px-4 py-3 text-right text-xs text-drac-comment/60">
                      {formatTime(item.archivedAt)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
          <Pagination
            page={history.page}
            totalPages={history.totalPages}
            onPageChange={history.goToPage}
          />
        </div>
      )}
    </div>
  )
}

export function HealthQueuePanel() {
  const healthCheck = useHealthCheckQueue()
  const repair = useRepairQueue()
  const healthCheckHistory = useHealthCheckHistory()
  const repairHistory = useRepairHistory()

  if (healthCheck.loading && repair.loading) return <Spinner />

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <h2 className="text-sm font-semibold text-drac-fg">Health Checks</h2>
        {healthCheck.error && (
          <div className="rounded-lg bg-drac-red/10 px-4 py-3 text-sm text-drac-red">{healthCheck.error}</div>
        )}
        <PendingTable
          title="Pending Health Checks"
          icon={<HeartPulse className="h-4 w-4 text-drac-green" />}
          items={healthCheck.status?.pending ?? []}
        />
        <HistoryTable
          title="Health Check History"
          icon={<HeartPulse className="h-4 w-4 text-drac-comment" />}
          history={healthCheckHistory}
          showAction={false}
        />
      </div>

      <div className="space-y-3">
        <h2 className="text-sm font-semibold text-drac-fg">Repairs</h2>
        {repair.error && (
          <div className="rounded-lg bg-drac-red/10 px-4 py-3 text-sm text-drac-red">{repair.error}</div>
        )}
        <PendingTable
          title="Pending Repairs"
          icon={<Wrench className="h-4 w-4 text-drac-orange" />}
          items={repair.status?.pending ?? []}
        />
        <HistoryTable
          title="Repair History"
          icon={<Wrench className="h-4 w-4 text-drac-comment" />}
          history={repairHistory}
          showAction={true}
        />
      </div>
    </div>
  )
}
