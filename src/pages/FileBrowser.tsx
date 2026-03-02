import { useState, useEffect } from 'react'
import { Folder, File, FolderOpen, ChevronRight } from 'lucide-react'
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

export function FileBrowser() {
  const [currentPath, setCurrentPath] = useState('/')
  const [entries, setEntries] = useState<FileEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [detailPath, setDetailPath] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)

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

  const breadcrumbSegments = currentPath === '/'
    ? [{ label: '/', path: '/' }]
    : [
        { label: '/', path: '/' },
        ...currentPath.split('/').filter(Boolean).map((seg, i, arr) => ({
          label: seg,
          path: '/' + arr.slice(0, i + 1).join('/'),
        })),
      ]

  return (
    <div className="max-w-4xl space-y-6">
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
      <div className="flex items-center gap-1 rounded-lg bg-drac-darker px-4 py-2.5 text-sm">
        {breadcrumbSegments.map((seg, i) => (
          <span key={seg.path} className="flex items-center gap-1">
            {i > 0 && <ChevronRight className="h-3.5 w-3.5 text-drac-comment/50" />}
            {i < breadcrumbSegments.length - 1 ? (
              <button
                onClick={() => setCurrentPath(seg.path)}
                className="text-drac-cyan hover:underline"
              >
                {seg.label}
              </button>
            ) : (
              <span className="text-drac-fg font-medium">{seg.label}</span>
            )}
          </span>
        ))}
      </div>

      {/* Content */}
      {loading ? (
        <Spinner />
      ) : error ? (
        <div className="rounded-lg bg-drac-red/10 px-4 py-3 text-sm text-drac-red">
          {error}
        </div>
      ) : entries.length === 0 ? (
        <div className="py-12 text-center text-sm text-drac-comment">
          This directory is empty
        </div>
      ) : (
        <div className="divide-y divide-drac-current rounded-lg border border-drac-current bg-drac-darker">
          {entries.map((entry, i) => (
            <div
              key={`${entry.path}/${entry.name}-${i}`}
              className="flex items-center gap-3 px-4 py-2.5 cursor-pointer hover:bg-drac-current/50"
              onDoubleClick={() => {
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
                entry.isDirectory ? 'text-drac-fg font-medium' : 'text-drac-comment'
              }`}>
                {entry.name}
              </span>
              {!entry.isDirectory && (
                <span className="shrink-0 text-xs text-drac-comment/60">
                  {formatSize(entry.size)}
                </span>
              )}
            </div>
          ))}
        </div>
      )}

      {detailPath && (
        <FileDetailModal path={detailPath} onClose={() => setDetailPath(null)} />
      )}
    </div>
  )
}
