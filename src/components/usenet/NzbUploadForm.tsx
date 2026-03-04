import { useState, useRef, useCallback } from 'react'
import { Upload, FileText, X, CheckCircle, AlertTriangle } from 'lucide-react'
import { getToken } from '../../lib/api'

interface NzbUploadFormProps {
  onSuccess: () => void
}

export function NzbUploadForm({ onSuccess }: NzbUploadFormProps) {
  const [file, setFile] = useState<File | null>(null)
  const [category, setCategory] = useState('')
  const [dragging, setDragging] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFile = (f: File | undefined) => {
    if (f && f.name.endsWith('.nzb')) {
      setFile(f)
      setError(null)
      setSuccess(false)
    } else if (f) {
      setError('Please select an .nzb file')
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!file) return

    setSubmitting(true)
    setError(null)
    setSuccess(false)

    try {
      const form = new FormData()
      form.append('mode', 'addfile')
      form.append('name', file)
      if (category.trim()) {
        form.append('cat', category.trim())
      }

      const token = getToken()
      const res = await fetch('/api', {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: form,
      })

      if (!res.ok) {
        throw new Error(`Upload failed: ${res.status}`)
      }

      const data = await res.json()
      if (data.status === true || data.status === 'true') {
        setSuccess(true)
        setFile(null)
        setCategory('')
        if (inputRef.current) inputRef.current.value = ''
        setTimeout(onSuccess, 1200)
      } else {
        throw new Error(data.error || 'Upload failed')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Drop zone */}
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
          accept=".nzb"
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
                Drop an NZB file here or <span className="text-drac-cyan">browse</span>
              </p>
              <p className="mt-1 text-xs text-drac-comment">.nzb files only</p>
            </div>
          </>
        )}
      </div>

      {/* Category */}
      <div>
        <label htmlFor="nzb-category" className="mb-1.5 block text-sm font-medium text-drac-fg">
          Category
        </label>
        <input
          id="nzb-category"
          type="text"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          placeholder="e.g. movies, tv, software"
          className="w-full rounded-lg border border-drac-current bg-drac-darker px-3 py-2 text-sm text-drac-fg placeholder-drac-comment/50 outline-none focus:border-drac-cyan transition-colors"
        />
        <p className="mt-1 text-xs text-drac-comment">Optional. Categories are created automatically if they don't exist.</p>
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
          NZB uploaded successfully. Switching to queue...
        </div>
      )}

      {/* Submit */}
      <button
        type="submit"
        disabled={!file || submitting}
        className="flex items-center gap-2 rounded-lg bg-drac-cyan px-5 py-2.5 text-sm font-semibold text-drac-bg transition-opacity hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
      >
        <Upload className="h-4 w-4" />
        {submitting ? 'Uploading...' : 'Upload NZB'}
      </button>
    </form>
  )
}
