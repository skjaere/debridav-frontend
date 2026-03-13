import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router'
import { X, FolderOpen, Loader2 } from 'lucide-react'
import type { QueueItem, NzbImportFile } from '../../types/config'
import { apiFetch } from '../../lib/api'

function formatSize(bytes: number | null): string {
  if (bytes == null) return '—'
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`
}

function formatTime(iso: string | null): string {
  if (!iso) return '—'
  return new Date(iso).toLocaleString()
}

function statusColor(status: string): string {
  if (status === 'COMPLETED') return 'text-drac-green'
  if (status === 'FAILED') return 'text-drac-red'
  if (status === 'ARTICLES_MISSING') return 'text-drac-orange'
  if (status === 'IMPORTING') return 'text-drac-orange'
  if (status === 'QUEUED') return 'text-drac-purple'
  return 'text-drac-comment'
}

function parentDir(filePath: string): string {
  return filePath.replace(/\/[^/]+$/, '') || '/'
}

function fileName(filePath: string): string {
  return filePath.split('/').pop() || filePath
}

interface ImportDetailModalProps {
  item: QueueItem
  onClose: () => void
}

export function ImportDetailModal({ item, onClose }: ImportDetailModalProps) {
  const navigate = useNavigate()
  const [resolvedFiles, setResolvedFiles] = useState<NzbImportFile[] | null>(null)
  const [filesLoading, setFilesLoading] = useState(false)

  const handleEscape = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') onClose()
  }, [onClose])

  useEffect(() => {
    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [handleEscape])

  useEffect(() => {
    if (item.status === 'COMPLETED') {
      setFilesLoading(true)
      apiFetch<NzbImportFile[]>(`/api/v1/queue/${item.id}/files`)
        .then(setResolvedFiles)
        .catch(() => setResolvedFiles(item.files))
        .finally(() => setFilesLoading(false))
    } else {
      setResolvedFiles(item.files)
    }
  }, [item.id, item.status, item.files])

  const displayFiles = resolvedFiles ?? item.files

  const handleFileClick = (filePath: string) => {
    onClose()
    navigate(`/files?path=${encodeURIComponent(parentDir(filePath))}`)
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
      onClick={onClose}
    >
      <div
        className="relative mx-4 w-full max-w-2xl rounded-xl border border-drac-current bg-drac-bg shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-drac-current px-5 py-4">
          <h2 className="truncate pr-4 text-lg font-semibold text-drac-fg">
            {item.name}
          </h2>
          <button
            onClick={onClose}
            className="shrink-0 rounded-lg p-1 text-drac-comment transition-colors hover:bg-drac-current hover:text-drac-fg cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="max-h-[70vh] overflow-y-auto px-5 py-4 space-y-4">
          {/* Import Information */}
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-drac-fg">Import Information</h3>
            <div className="rounded-lg bg-drac-darker p-3 space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-drac-comment">Status</span>
                <span className={`font-medium ${statusColor(item.status)}`}>
                  {item.status}
                </span>
              </div>
              {item.archiveType && (
                <div className="flex items-center justify-between">
                  <span className="text-drac-comment">Archive Type</span>
                  <span className="text-drac-fg">{item.archiveType}</span>
                </div>
              )}
              <div className="flex items-center justify-between">
                <span className="text-drac-comment">Total Size</span>
                <span className="text-drac-fg">{formatSize(item.size)}</span>
              </div>
              {item.createdAt && (
                <div className="flex items-center justify-between">
                  <span className="text-drac-comment">Created</span>
                  <span className="text-drac-fg">{formatTime(item.createdAt)}</span>
                </div>
              )}
              {item.updatedAt && (
                <div className="flex items-center justify-between">
                  <span className="text-drac-comment">Last Updated</span>
                  <span className="text-drac-fg">{formatTime(item.updatedAt)}</span>
                </div>
              )}
            </div>
          </div>

          {/* Error */}
          {item.errorMessage && (
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-drac-red">Error</h3>
              <pre className="max-h-48 overflow-auto rounded-lg bg-drac-darker p-3 text-xs text-drac-red/80 leading-relaxed">
                {item.errorMessage}
              </pre>
            </div>
          )}

          {/* Files */}
          {filesLoading ? (
            <div className="flex items-center gap-2 text-sm text-drac-comment">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Loading files…</span>
            </div>
          ) : displayFiles && displayFiles.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-drac-fg">
                Files ({displayFiles.length})
              </h3>
              <div className="rounded-lg bg-drac-darker p-3">
                <ul className="space-y-1 text-sm">
                  {displayFiles.map((f, i) => (
                    <li key={i}>
                      <button
                        onClick={() => handleFileClick(f.path)}
                        className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left transition-colors hover:bg-drac-current/40 cursor-pointer"
                      >
                        <FolderOpen className="h-3.5 w-3.5 shrink-0 text-drac-cyan" />
                        <span className="truncate text-drac-fg">{fileName(f.path)}</span>
                        <span className="ml-auto shrink-0 text-xs text-drac-comment/60">
                          {formatSize(f.size)}
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
