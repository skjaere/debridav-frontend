import { useState, useRef, useCallback } from 'react'
import { Magnet, Upload, FileText, X, CheckCircle, AlertTriangle, Link } from 'lucide-react'
import { getToken } from '../lib/api'

type InputMode = 'file' | 'magnet'

export function TorrentsPage() {
  const [mode, setMode] = useState<InputMode>('file')
  const [file, setFile] = useState<File | null>(null)
  const [magnetUrl, setMagnetUrl] = useState('')
  const [category, setCategory] = useState('')
  const [dragging, setDragging] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFile = (f: File | undefined) => {
    if (f && f.name.endsWith('.torrent')) {
      setFile(f)
      setError(null)
      setSuccess(false)
    } else if (f) {
      setError('Please select a .torrent file')
    }
  }

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragging(false)
    handleFile(e.dataTransfer.files[0])
  }, [])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragging(false)
  }, [])

  const reset = () => {
    setFile(null)
    setMagnetUrl('')
    setCategory('')
    setError(null)
    if (inputRef.current) inputRef.current.value = ''
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (mode === 'file' && !file) return
    if (mode === 'magnet' && !magnetUrl.trim()) return

    setSubmitting(true)
    setError(null)
    setSuccess(false)

    try {
      const form = new FormData()
      if (mode === 'file') {
        form.append('torrents', file!)
      } else {
        form.append('urls', magnetUrl.trim())
      }
      if (category.trim()) {
        form.append('category', category.trim())
      }

      const token = getToken()
      const res = await fetch('/api/v2/torrents/add', {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: form,
      })

      if (!res.ok) {
        throw new Error(`Upload failed: ${res.status}`)
      }

      setSuccess(true)
      reset()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed')
    } finally {
      setSubmitting(false)
    }
  }

  const canSubmit = mode === 'file' ? !!file : !!magnetUrl.trim()

  return (
    <div className="max-w-5xl space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-drac-cyan/15">
          <Magnet className="h-5 w-5 text-drac-cyan" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-drac-fg">Torrents</h1>
          <p className="text-sm text-drac-comment">Add torrents via file upload or magnet link</p>
        </div>
      </div>

      {/* Mode toggle */}
      <div className="flex items-center border-b border-drac-current/50">
        <div className="flex gap-1">
          <button
            onClick={() => { setMode('file'); setError(null); setSuccess(false) }}
            className={`px-4 py-2 text-sm font-medium transition-colors cursor-pointer
              ${mode === 'file'
                ? 'text-drac-cyan border-b-2 border-drac-cyan -mb-px'
                : 'text-drac-comment hover:text-drac-fg'
              }`}
          >
            File Upload
          </button>
          <button
            onClick={() => { setMode('magnet'); setError(null); setSuccess(false) }}
            className={`px-4 py-2 text-sm font-medium transition-colors cursor-pointer
              ${mode === 'magnet'
                ? 'text-drac-cyan border-b-2 border-drac-cyan -mb-px'
                : 'text-drac-comment hover:text-drac-fg'
              }`}
          >
            Magnet Link
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {mode === 'file' ? (
          /* Drop zone */
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={() => inputRef.current?.click()}
            className={`flex cursor-pointer flex-col items-center gap-3 rounded-lg border-2 border-dashed px-6 py-10 transition-colors
              ${dragging
                ? 'border-drac-cyan bg-drac-cyan/5'
                : file
                  ? 'border-drac-green/40 bg-drac-green/5'
                  : 'border-drac-current hover:border-drac-comment'
              }`}
          >
            <input
              ref={inputRef}
              type="file"
              accept=".torrent"
              className="hidden"
              onChange={(e) => handleFile(e.target.files?.[0])}
            />
            {file ? (
              <>
                <FileText className="h-8 w-8 text-drac-green" />
                <div className="text-center">
                  <p className="text-sm font-medium text-drac-fg">{file.name}</p>
                  <p className="mt-1 text-xs text-drac-comment">
                    {(file.size / 1024).toFixed(1)} KB
                  </p>
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    setFile(null)
                    if (inputRef.current) inputRef.current.value = ''
                  }}
                  className="flex items-center gap-1 text-xs text-drac-comment hover:text-drac-red transition-colors"
                >
                  <X className="h-3 w-3" />
                  Remove
                </button>
              </>
            ) : (
              <>
                <Upload className="h-8 w-8 text-drac-comment" />
                <div className="text-center">
                  <p className="text-sm text-drac-fg">
                    Drop a torrent file here or <span className="text-drac-cyan">browse</span>
                  </p>
                  <p className="mt-1 text-xs text-drac-comment">.torrent files only</p>
                </div>
              </>
            )}
          </div>
        ) : (
          /* Magnet link input */
          <div>
            <label htmlFor="magnet-url" className="mb-1.5 flex items-center gap-2 text-sm font-medium text-drac-fg">
              <Link className="h-4 w-4" />
              Magnet URI
            </label>
            <input
              id="magnet-url"
              type="text"
              value={magnetUrl}
              onChange={(e) => setMagnetUrl(e.target.value)}
              placeholder="magnet:?xt=urn:btih:..."
              className="w-full rounded-lg border border-drac-current bg-drac-darker px-3 py-2 text-sm text-drac-fg placeholder-drac-comment/50 outline-none focus:border-drac-cyan transition-colors font-mono"
            />
          </div>
        )}

        {/* Category */}
        <div>
          <label htmlFor="torrent-category" className="mb-1.5 block text-sm font-medium text-drac-fg">
            Category
          </label>
          <input
            id="torrent-category"
            type="text"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            placeholder="e.g. movies, tv, software"
            className="w-full rounded-lg border border-drac-current bg-drac-darker px-3 py-2 text-sm text-drac-fg placeholder-drac-comment/50 outline-none focus:border-drac-cyan transition-colors"
          />
          <p className="mt-1 text-xs text-drac-comment">Optional. Used for organizing downloads.</p>
        </div>

        {/* Status messages */}
        {error && (
          <div className="flex items-center gap-2 rounded-lg bg-drac-red/10 px-4 py-3 text-sm text-drac-red">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            {error}
          </div>
        )}
        {success && (
          <div className="flex items-center gap-2 rounded-lg bg-drac-green/10 px-4 py-3 text-sm text-drac-green">
            <CheckCircle className="h-4 w-4 shrink-0" />
            Torrent added successfully.
          </div>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={!canSubmit || submitting}
          className="flex items-center gap-2 rounded-lg bg-drac-cyan px-5 py-2.5 text-sm font-semibold text-drac-bg transition-opacity hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {mode === 'file' ? <Upload className="h-4 w-4" /> : <Magnet className="h-4 w-4" />}
          {submitting ? 'Adding...' : mode === 'file' ? 'Upload Torrent' : 'Add Magnet'}
        </button>
      </form>
    </div>
  )
}
