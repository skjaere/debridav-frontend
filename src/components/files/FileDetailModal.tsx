import { useState, useEffect, useCallback } from 'react'
import { X, Copy, Check, Download } from 'lucide-react'
import { apiFetch } from '../../lib/api'
import { useToast } from '../../hooks/useToast'
import { Spinner } from '../ui/Spinner'
import { Button } from '../ui/Button'
import { Badge } from '../ui/Badge'
import type { FileDetail, ProviderCacheStatus, DebridProvider } from '../../types/config'

interface FileDetailModalProps {
  path: string
  onClose: () => void
}

function formatSize(bytes: number | null): string {
  if (bytes == null) return '—'
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`
}

function formatTimestamp(ts: number | null): string {
  if (ts == null) return '—'
  return new Date(ts).toLocaleString()
}

function fileTypeLabel(ft: string): string {
  switch (ft) {
    case 'TORRENT': return 'Torrent'
    case 'USENET_RELEASE': return 'Usenet'
    case 'NZB': return 'NZB'
    case 'LOCAL': return 'Local'
    default: return ft
  }
}

function fileTypeVariant(ft: string): 'default' | 'override' | 'sensitive' | 'success' {
  switch (ft) {
    case 'TORRENT': return 'override'
    case 'USENET_RELEASE': return 'sensitive'
    case 'NZB': return 'default'
    case 'LOCAL': return 'success'
    default: return 'default'
  }
}

function providerLabel(p: DebridProvider): string {
  switch (p) {
    case 'REAL_DEBRID': return 'Real-Debrid'
    case 'PREMIUMIZE': return 'Premiumize'
    case 'EASYNEWS': return 'Easynews'
    case 'TORBOX': return 'TorBox'
    default: return p
  }
}

function statusColor(s: ProviderCacheStatus): string {
  switch (s) {
    case 'CACHED': return 'text-drac-green'
    case 'MISSING': return 'text-drac-comment'
    case 'PROVIDER_ERROR': return 'text-drac-orange'
    case 'CLIENT_ERROR': return 'text-drac-red'
    case 'NETWORK_ERROR': return 'text-drac-red'
    case 'UNKNOWN_ERROR': return 'text-drac-orange'
    default: return 'text-drac-comment'
  }
}

function statusLabel(s: ProviderCacheStatus): string {
  switch (s) {
    case 'CACHED': return 'Cached'
    case 'MISSING': return 'Missing'
    case 'PROVIDER_ERROR': return 'Provider Error'
    case 'CLIENT_ERROR': return 'Client Error'
    case 'NETWORK_ERROR': return 'Network Error'
    case 'UNKNOWN_ERROR': return 'Unknown Error'
    default: return s
  }
}

export function FileDetailModal({ path, onClose }: FileDetailModalProps) {
  const [detail, setDetail] = useState<FileDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const { addToast } = useToast()

  useEffect(() => {
    apiFetch<FileDetail>(`/api/v1/files/detail?path=${encodeURIComponent(path)}`)
      .then(setDetail)
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }, [path])

  const handleEscape = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') onClose()
  }, [onClose])

  useEffect(() => {
    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [handleEscape])

  const encodedPath = path.split('/').map(seg => encodeURIComponent(seg)).join('/')
  const streamingUrl = `${window.location.origin}/stream${encodedPath}`

  const handleCopy = async () => {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(streamingUrl)
      } else {
        const textarea = document.createElement('textarea')
        textarea.value = streamingUrl
        textarea.style.position = 'fixed'
        textarea.style.opacity = '0'
        document.body.appendChild(textarea)
        textarea.select()
        document.execCommand('copy')
        document.body.removeChild(textarea)
      }
      setCopied(true)
      addToast('Streaming URL copied to clipboard', 'success')
      setTimeout(() => setCopied(false), 2000)
    } catch {
      addToast('Failed to copy URL', 'error')
    }
  }

  const handleDownload = () => {
    const a = document.createElement('a')
    a.href = streamingUrl
    a.download = detail?.name ?? ''
    a.click()
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
      onClick={onClose}
    >
      <div
        className="relative mx-4 w-full max-w-lg rounded-xl border border-drac-current bg-drac-bg shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-drac-current px-5 py-4">
          <h2 className="truncate pr-4 text-lg font-semibold text-drac-fg">
            {detail?.name ?? 'File Details'}
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
          {loading ? (
            <div className="flex justify-center py-8">
              <Spinner />
            </div>
          ) : error ? (
            <div className="rounded-lg bg-drac-red/10 px-4 py-3 text-sm text-drac-red">
              {error}
            </div>
          ) : detail ? (
            <>
              {/* File Information */}
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-drac-fg">File Information</h3>
                <div className="rounded-lg bg-drac-darker p-3 space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-drac-comment">Type</span>
                    <Badge variant={fileTypeVariant(detail.fileType)}>
                      {fileTypeLabel(detail.fileType)}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-drac-comment">Size</span>
                    <span className="text-drac-fg">{formatSize(detail.size)}</span>
                  </div>
                  {detail.mimeType && (
                    <div className="flex items-center justify-between">
                      <span className="text-drac-comment">MIME Type</span>
                      <span className="text-drac-fg font-mono text-xs">{detail.mimeType}</span>
                    </div>
                  )}
                  {detail.lastModified != null && (
                    <div className="flex items-center justify-between">
                      <span className="text-drac-comment">Last Modified</span>
                      <span className="text-drac-fg">{formatTimestamp(detail.lastModified)}</span>
                    </div>
                  )}
                  {detail.hash && (
                    <div className="flex items-center justify-between">
                      <span className="text-drac-comment">Hash</span>
                      <span className="text-drac-fg font-mono text-xs truncate max-w-48" title={detail.hash}>
                        {detail.hash}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Provider Cache Status */}
              {detail.providerStatus && detail.providerStatus.length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-drac-fg">Provider Cache Status</h3>
                  <div className="rounded-lg bg-drac-darker p-3 space-y-2 text-sm">
                    {detail.providerStatus.map(ps => (
                      <div key={ps.provider} className="flex items-center justify-between">
                        <span className="text-drac-comment">{providerLabel(ps.provider)}</span>
                        <div className="flex items-center gap-3">
                          <span className={`font-medium ${statusColor(ps.status)}`}>
                            {statusLabel(ps.status)}
                          </span>
                          {ps.lastChecked != null && (
                            <span className="text-xs text-drac-comment/60">
                              {formatTimestamp(ps.lastChecked)}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Streaming URL */}
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-drac-fg">Streaming URL</h3>
                <div className="rounded-lg bg-drac-darker p-3 space-y-2">
                  <div className="rounded bg-drac-bg px-3 py-2 font-mono text-xs text-drac-comment break-all">
                    {streamingUrl}
                  </div>
                  <div className="flex gap-2">
                    <Button variant="secondary" size="sm" onClick={handleCopy}>
                      {copied ? (
                        <Check className="h-3.5 w-3.5" />
                      ) : (
                        <Copy className="h-3.5 w-3.5" />
                      )}
                      {copied ? 'Copied!' : 'Copy URL'}
                    </Button>
                    <Button variant="secondary" size="sm" onClick={handleDownload}>
                      <Download className="h-3.5 w-3.5" />
                      Download
                    </Button>
                  </div>
                </div>
              </div>
            </>
          ) : null}
        </div>
      </div>
    </div>
  )
}
