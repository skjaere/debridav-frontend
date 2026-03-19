import { useState, useMemo } from 'react'
import {
  ListOrdered,
  Loader,
  Clock,
  CheckCircle,
  ChevronDown,
  ChevronRight,
  ChevronUp,
  ChevronsLeft,
  ChevronsRight,
  ChevronLeft,
  ChevronRight as ChevronRightIcon,
  Search,
  ArrowUpDown,
} from 'lucide-react'
import { Spinner } from '../components/ui/Spinner'
import { ImportDetailModal } from '../components/queue/ImportDetailModal'
import { useUsenetQueue } from '../hooks/useUsenetQueue'
import { useUsenetHistory } from '../hooks/useUsenetHistory'
import type { SortField, SortDir } from '../hooks/useUsenetHistory'
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
  else if (['DOWNLOADING', 'EXTRACTING', 'VERIFYING', 'REPAIRING', 'POST_PROCESSING', 'VALIDATING', 'IMPORTING'].includes(status))
    color = 'bg-drac-orange/15 text-drac-orange'
  else if (['CREATED', 'QUEUED', 'CACHED'].includes(status))
    color = 'bg-drac-purple/15 text-drac-purple'

  return (
    <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ${color}`}>
      {status}
    </span>
  )
}

function SortIcon({ dir }: { dir: SortDir }) {
  return dir === 'asc'
    ? <ChevronUp className="h-3.5 w-3.5" />
    : <ChevronDown className="h-3.5 w-3.5" />
}

function getDateValue(item: QueueItem): number {
  const iso = item.updatedAt ?? item.createdAt
  return iso ? new Date(iso).getTime() : 0
}

function QueueTable({
  title,
  icon,
  items,
  defaultOpen,
  nameFilter,
  onNameFilterChange,
  dateSortDir,
  onDateSortToggle,
  onItemClick,
}: {
  title: string
  icon: React.ReactNode
  items: QueueItem[]
  defaultOpen: boolean
  nameFilter: string
  onNameFilterChange: (v: string) => void
  dateSortDir: SortDir
  onDateSortToggle: () => void
  onItemClick: (item: QueueItem) => void
}) {
  const [open, setOpen] = useState(defaultOpen)

  const filtered = useMemo(() => {
    let result = items
    if (nameFilter) {
      const lower = nameFilter.toLowerCase()
      result = result.filter(i => i.name.toLowerCase().includes(lower))
    }
    return [...result].sort((a, b) => {
      const diff = getDateValue(a) - getDateValue(b)
      return dateSortDir === 'asc' ? diff : -diff
    })
  }, [items, nameFilter, dateSortDir])

  const count = nameFilter ? `${filtered.length}/${items.length}` : `${items.length}`

  return (
    <div className="overflow-hidden rounded-lg border border-drac-current bg-drac-darker">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-drac-current/30 transition-colors"
      >
        {open ? <ChevronDown className="h-4 w-4 text-drac-comment" /> : <ChevronRight className="h-4 w-4 text-drac-comment" />}
        {icon}
        <span className="text-sm font-semibold text-drac-fg">{title}</span>
        <span className="ml-auto text-xs text-drac-comment">{count}</span>
      </button>
      {open && (
        <div className="overflow-x-auto border-t border-drac-current">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-drac-current bg-drac-current/30">
                <th className="px-4 py-2 text-left font-medium text-drac-comment">
                  <div className="flex items-center gap-2">
                    <span>Name</span>
                    <div className="relative flex-1 max-w-48">
                      <Search className="pointer-events-none absolute left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-drac-comment/50" />
                      <input
                        type="text"
                        value={nameFilter}
                        onChange={(e) => onNameFilterChange(e.target.value)}
                        placeholder="Filter..."
                        className="w-full rounded border border-drac-current bg-drac-darker py-1 pl-7 pr-2 text-xs text-drac-fg placeholder-drac-comment/40 outline-none focus:border-drac-cyan transition-colors"
                      />
                    </div>
                  </div>
                </th>
                <th className="px-4 py-2 text-left font-medium text-drac-comment">Status</th>
                <th className="hidden px-4 py-2 text-left font-medium text-drac-comment sm:table-cell">Archive Type</th>
                <th className="hidden px-4 py-2 text-right font-medium text-drac-comment sm:table-cell">Size</th>
                <th className="px-4 py-2 text-right font-medium text-drac-comment">
                  <button
                    onClick={onDateSortToggle}
                    className="inline-flex items-center gap-1 hover:text-drac-fg transition-colors cursor-pointer"
                  >
                    Date
                    <SortIcon dir={dateSortDir} />
                  </button>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-drac-current">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-6 text-center text-sm text-drac-comment">
                    {nameFilter ? 'No matching items' : 'No items'}
                  </td>
                </tr>
              ) : (
                filtered.map(item => (
                  <tr
                    key={item.id}
                    onClick={() => onItemClick(item)}
                    className="hover:bg-drac-current/20 transition-colors cursor-pointer"
                  >
                    <td className="max-w-xs px-4 py-3">
                      <p className="truncate text-drac-fg">{item.name}</p>
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={item.status} />
                    </td>
                    <td className="hidden px-4 py-3 text-left text-xs text-drac-comment/60 sm:table-cell">
                      {item.archiveType ?? '—'}
                    </td>
                    <td className="hidden px-4 py-3 text-right text-xs text-drac-comment/60 sm:table-cell">
                      {formatSize(item.size)}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-right text-xs text-drac-comment/60">
                      {formatTime(item.updatedAt ?? item.createdAt)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

function SortableHeader({
  label,
  field,
  activeField,
  activeDir,
  onToggle,
  align = 'left',
}: {
  label: string
  field: SortField
  activeField: SortField
  activeDir: SortDir
  onToggle: (f: SortField) => void
  align?: 'left' | 'right'
}) {
  const active = field === activeField
  return (
    <button
      onClick={() => onToggle(field)}
      className={`inline-flex items-center gap-1 hover:text-drac-fg transition-colors cursor-pointer ${align === 'right' ? 'ml-auto' : ''}`}
    >
      {label}
      {active
        ? <SortIcon dir={activeDir} />
        : <ArrowUpDown className="h-3 w-3 opacity-30" />
      }
    </button>
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
      <button
        onClick={() => onPageChange(0)}
        disabled={page === 0}
        className={`${btnBase} ${page === 0 ? btnDisabled : btnEnabled}`}
      >
        <ChevronsLeft className="h-3.5 w-3.5" />
      </button>
      <button
        onClick={() => onPageChange(page - 1)}
        disabled={page === 0}
        className={`${btnBase} ${page === 0 ? btnDisabled : btnEnabled}`}
      >
        <ChevronLeft className="h-3.5 w-3.5" />
      </button>
      {withEllipsis.map((item, idx) =>
        item === 'ellipsis' ? (
          <span key={`e${idx}`} className="px-1 text-xs text-drac-comment/40">...</span>
        ) : (
          <button
            key={item}
            onClick={() => onPageChange(item)}
            className={`${btnBase} px-1.5 ${
              item === page
                ? 'bg-drac-cyan/20 text-drac-cyan font-semibold'
                : btnEnabled
            }`}
          >
            {item + 1}
          </button>
        )
      )}
      <button
        onClick={() => onPageChange(page + 1)}
        disabled={page >= totalPages - 1}
        className={`${btnBase} ${page >= totalPages - 1 ? btnDisabled : btnEnabled}`}
      >
        <ChevronRightIcon className="h-3.5 w-3.5" />
      </button>
      <button
        onClick={() => onPageChange(totalPages - 1)}
        disabled={page >= totalPages - 1}
        className={`${btnBase} ${page >= totalPages - 1 ? btnDisabled : btnEnabled}`}
      >
        <ChevronsRight className="h-3.5 w-3.5" />
      </button>
    </div>
  )
}

function HistoryTable({
  history,
  onItemClick,
}: {
  history: ReturnType<typeof useUsenetHistory>
  onItemClick: (item: QueueItem) => void
}) {
  const [open, setOpen] = useState(false)

  return (
    <div className="overflow-hidden rounded-lg border border-drac-current bg-drac-darker">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-drac-current/30 transition-colors"
      >
        {open ? <ChevronDown className="h-4 w-4 text-drac-comment" /> : <ChevronRight className="h-4 w-4 text-drac-comment" />}
        <CheckCircle className="h-4 w-4 text-drac-green" />
        <span className="text-sm font-semibold text-drac-fg">History</span>
        <span className="ml-auto text-xs text-drac-comment">{history.totalElements}</span>
      </button>
      {open && (
        <div className="overflow-x-auto border-t border-drac-current">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-drac-current bg-drac-current/30">
                <th className="px-4 py-2 text-left font-medium text-drac-comment">
                  <div className="flex items-center gap-2">
                    <SortableHeader
                      label="Name"
                      field="name"
                      activeField={history.sortField}
                      activeDir={history.sortDir}
                      onToggle={history.toggleSort}
                    />
                    <div className="relative flex-1 max-w-48">
                      <Search className="pointer-events-none absolute left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-drac-comment/50" />
                      <input
                        type="text"
                        value={history.search}
                        onChange={(e) => history.setSearch(e.target.value)}
                        placeholder="Search..."
                        className="w-full rounded border border-drac-current bg-drac-darker py-1 pl-7 pr-2 text-xs text-drac-fg placeholder-drac-comment/40 outline-none focus:border-drac-cyan transition-colors"
                      />
                    </div>
                  </div>
                </th>
                <th className="px-4 py-2 text-left font-medium text-drac-comment">Status</th>
                <th className="hidden px-4 py-2 text-left font-medium text-drac-comment sm:table-cell">Archive Type</th>
                <th className="hidden px-4 py-2 text-right font-medium text-drac-comment sm:table-cell">Size</th>
                <th className="px-4 py-2 text-right font-medium text-drac-comment">
                  <SortableHeader
                    label="Date"
                    field="updatedAt"
                    activeField={history.sortField}
                    activeDir={history.sortDir}
                    onToggle={history.toggleSort}
                    align="right"
                  />
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-drac-current">
              {history.loading ? (
                <tr>
                  <td colSpan={5} className="px-4 py-6 text-center">
                    <Spinner />
                  </td>
                </tr>
              ) : history.items.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-6 text-center text-sm text-drac-comment">
                    {history.search ? 'No matching items' : 'No items'}
                  </td>
                </tr>
              ) : (
                history.items.map(item => (
                  <tr
                    key={item.id}
                    onClick={() => onItemClick(item)}
                    className="hover:bg-drac-current/20 transition-colors cursor-pointer"
                  >
                    <td className="max-w-xs px-4 py-3">
                      <p className="truncate text-drac-fg">{item.name}</p>
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={item.status} />
                    </td>
                    <td className="hidden px-4 py-3 text-left text-xs text-drac-comment/60 sm:table-cell">
                      {item.archiveType ?? '—'}
                    </td>
                    <td className="hidden px-4 py-3 text-right text-xs text-drac-comment/60 sm:table-cell">
                      {formatSize(item.size)}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-right text-xs text-drac-comment/60">
                      {formatTime(item.updatedAt ?? item.createdAt)}
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

export function QueuePanel() {
  const { queue, loading, error } = useUsenetQueue()
  const history = useUsenetHistory()
  const [nameFilter, setNameFilter] = useState('')
  const [dateSortDir, setDateSortDir] = useState<SortDir>('desc')
  const [selectedItem, setSelectedItem] = useState<QueueItem | null>(null)
  const toggleSort = () => setDateSortDir(d => d === 'asc' ? 'desc' : 'asc')

  if (loading) return <Spinner />
  if (error) return <div className="rounded-lg bg-drac-red/10 px-4 py-3 text-sm text-drac-red">{error}</div>
  if (!queue) return null

  return (
    <div className="space-y-4">
      <QueueTable
        title="Processing"
        icon={<Loader className="h-4 w-4 text-drac-orange" />}
        items={queue.processing}
        defaultOpen={true}
        nameFilter={nameFilter}
        onNameFilterChange={setNameFilter}
        dateSortDir={dateSortDir}
        onDateSortToggle={toggleSort}
        onItemClick={setSelectedItem}
      />
      <QueueTable
        title="Pending"
        icon={<Clock className="h-4 w-4 text-drac-purple" />}
        items={queue.pending}
        defaultOpen={true}
        nameFilter={nameFilter}
        onNameFilterChange={setNameFilter}
        dateSortDir={dateSortDir}
        onDateSortToggle={toggleSort}
        onItemClick={setSelectedItem}
      />
      <HistoryTable
        history={history}
        onItemClick={setSelectedItem}
      />
      {selectedItem && (
        <ImportDetailModal
          item={selectedItem}
          onClose={() => setSelectedItem(null)}
        />
      )}
    </div>
  )
}

export function QueuePage() {
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
      <QueuePanel />
    </div>
  )
}
