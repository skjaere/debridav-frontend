import { useState, useEffect, useMemo } from 'react'
import { useSearchParams } from 'react-router'
import { Folder, File, FolderOpen, ChevronRight, CornerLeftUp, ArrowUp, ArrowDown, Search } from 'lucide-react'
import { Spinner } from '../components/ui/Spinner'
import { FileDetailModal } from '../components/files/FileDetailModal'
import { apiFetch } from '../lib/api'
import type { FileEntry } from '../types/config'

function formatSize(bytes: number | null): string {
  if (bytes == null) return '—'
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`
}

function formatDate(ts: number | null): string {
  if (ts == null) return '—'
  const d = new Date(ts)
  return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
    + ' ' + d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })
}

type SortField = 'name' | 'size' | 'lastModified'
type SortDir = 'asc' | 'desc'

function sortEntries(entries: FileEntry[], field: SortField, dir: SortDir): FileEntry[] {
  const sorted = [...entries].sort((a, b) => {
    // Directories always first
    if (a.isDirectory !== b.isDirectory) return a.isDirectory ? -1 : 1

    let cmp = 0
    switch (field) {
      case 'name':
        cmp = a.name.localeCompare(b.name, undefined, { sensitivity: 'base' })
        break
      case 'size':
        cmp = (a.size ?? 0) - (b.size ?? 0)
        break
      case 'lastModified':
        cmp = (a.lastModified ?? 0) - (b.lastModified ?? 0)
        break
    }
    return dir === 'asc' ? cmp : -cmp
  })
  return sorted
}

function SortIcon({ field, activeField, dir }: { field: SortField; activeField: SortField; dir: SortDir }) {
  if (field !== activeField) return null
  return dir === 'asc'
    ? <ArrowUp className="h-3 w-3" />
    : <ArrowDown className="h-3 w-3" />
}

export function FileBrowser() {
  const [searchParams] = useSearchParams()
  const [currentPath, setCurrentPath] = useState(searchParams.get('path') || '/')
  const [entries, setEntries] = useState<FileEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [detailPath, setDetailPath] = useState<string | null>(null)
  const [sortField, setSortField] = useState<SortField>('name')
  const [sortDir, setSortDir] = useState<SortDir>('asc')
  const [nameFilter, setNameFilter] = useState('')

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)
    setNameFilter('')

    apiFetch<FileEntry[]>(`/api/v1/files?path=${encodeURIComponent(currentPath)}`)
      .then(data => {
        if (!cancelled) setEntries(data)
      })
      .catch(err => {
        if (!cancelled) setError(err.message)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => { cancelled = true }
  }, [currentPath])

  const sortedEntries = useMemo(() => {
    const filtered = nameFilter
      ? entries.filter(e => e.name.toLowerCase().includes(nameFilter.toLowerCase()))
      : entries
    return sortEntries(filtered, sortField, sortDir)
  }, [entries, sortField, sortDir, nameFilter])

  function toggleSort(field: SortField) {
    if (sortField === field) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDir(field === 'name' ? 'asc' : 'desc')
    }
  }

  const breadcrumbSegments = currentPath === '/'
    ? [{ label: '/', path: '/' }]
    : [
        { label: '/', path: '/' },
        ...currentPath.split('/').filter(Boolean).map((seg, i, arr) => ({
          label: seg,
          path: '/' + arr.slice(0, i + 1).join('/'),
        })),
      ]

  const headerClass = 'flex items-center gap-1 text-xs font-medium text-drac-comment cursor-pointer select-none hover:text-drac-fg transition-colors'

  return (
    <div className="max-w-5xl space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-drac-cyan/15">
          <FolderOpen className="h-5 w-5 text-drac-cyan" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-drac-fg">Files</h1>
          <p className="text-sm text-drac-comment">Browse the virtual filesystem</p>
        </div>
      </div>

      {/* Breadcrumb */}
      <div className="flex items-center gap-1 rounded-lg bg-drac-darker px-4 py-2.5 text-sm overflow-hidden min-w-0">
        {breadcrumbSegments.map((seg, i) => {
          const isLast = i === breadcrumbSegments.length - 1
          return (
            <span key={seg.path} className={`flex items-center gap-1 min-w-0 ${isLast ? 'shrink-[0.5]' : 'shrink'}`}>
              {i > 0 && <ChevronRight className="h-3.5 w-3.5 shrink-0 text-drac-comment/50" />}
              {!isLast ? (
                <button
                  onClick={() => setCurrentPath(seg.path)}
                  className="truncate text-drac-cyan hover:underline"
                >
                  {seg.label}
                </button>
              ) : (
                <span className="truncate text-drac-fg font-medium" title={seg.label}>{seg.label}</span>
              )}
            </span>
          )
        })}
      </div>

      {/* Content */}
      {loading ? (
        <Spinner />
      ) : error ? (
        <div className="rounded-lg bg-drac-red/10 px-4 py-3 text-sm text-drac-red">
          {error}
        </div>
      ) : entries.length === 0 && currentPath === '/' ? (
        <div className="py-12 text-center text-sm text-drac-comment">
          This directory is empty
        </div>
      ) : (
        <div className="rounded-lg border border-drac-current bg-drac-darker">
          {/* Column headers */}
          <div className="flex items-center gap-3 border-b border-drac-current px-4 py-2">
            <div className="w-5" /> {/* icon spacer */}
            <div className="flex-1 flex items-center gap-2">
              <span className={headerClass} onClick={() => toggleSort('name')}>
                Name <SortIcon field="name" activeField={sortField} dir={sortDir} />
              </span>
              <div className="relative flex-1 max-w-48">
                <Search className="pointer-events-none absolute left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-drac-comment/50" />
                <input
                  type="text"
                  value={nameFilter}
                  onChange={(e) => setNameFilter(e.target.value)}
                  placeholder="Filter..."
                  className="w-full rounded border border-drac-current bg-drac-darker py-1 pl-7 pr-2 text-xs text-drac-fg placeholder-drac-comment/40 outline-none focus:border-drac-cyan transition-colors"
                />
              </div>
            </div>
            <div className="hidden sm:block w-24 text-right" onClick={() => toggleSort('size')}>
              <span className={`${headerClass} justify-end`}>
                Size <SortIcon field="size" activeField={sortField} dir={sortDir} />
              </span>
            </div>
            <div className="hidden md:block w-40 text-right" onClick={() => toggleSort('lastModified')}>
              <span className={`${headerClass} justify-end`}>
                Modified <SortIcon field="lastModified" activeField={sortField} dir={sortDir} />
              </span>
            </div>
          </div>

          {/* Rows */}
          <div className="divide-y divide-drac-current">
            {currentPath !== '/' && (
              <div
                className="flex items-center gap-3 px-4 py-2.5 cursor-pointer hover:bg-drac-current/50"
                onClick={() => {
                  const parent = currentPath.replace(/\/[^/]+\/?$/, '') || '/'
                  setCurrentPath(parent)
                }}
              >
                <CornerLeftUp className="h-4.5 w-4.5 shrink-0 text-drac-comment" />
                <span className="flex-1 text-sm text-drac-comment">..</span>
                <span className="hidden sm:block w-24" />
                <span className="hidden md:block w-40" />
              </div>
            )}
            {sortedEntries.map((entry, i) => (
              <div
                key={`${entry.path}/${entry.name}-${i}`}
                className="flex items-center gap-3 px-4 py-2.5 cursor-pointer hover:bg-drac-current/50"
                onClick={() => {
                  if (entry.isDirectory) {
                    setCurrentPath(entry.path)
                  } else {
                    setDetailPath(entry.path)
                  }
                }}
              >
                {entry.isDirectory ? (
                  <Folder className="h-4.5 w-4.5 shrink-0 text-drac-cyan" />
                ) : (
                  <File className="h-4.5 w-4.5 shrink-0 text-drac-comment" />
                )}
                <span className={`flex-1 truncate text-sm ${
                  entry.isDirectory ? 'text-drac-fg font-medium' : 'text-drac-fg/70'
                }`}>
                  {entry.name}
                </span>
                <span className="hidden sm:block w-24 shrink-0 text-right text-xs text-drac-comment/60">
                  {!entry.isDirectory ? formatSize(entry.size) : ''}
                </span>
                <span className="hidden md:block w-40 shrink-0 text-right text-xs text-drac-comment/60">
                  {formatDate(entry.lastModified)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {detailPath && (
        <FileDetailModal path={detailPath} onClose={() => setDetailPath(null)} />
      )}
    </div>
  )
}
