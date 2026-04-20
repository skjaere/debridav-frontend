import { useEffect, useRef, useState } from 'react'
import { ScrollText, Pause, Play, Download } from 'lucide-react'
import { getToken } from '../lib/api'

const POLL_INTERVAL_MS = 2000
const LOGFILE_PATH = '/actuator/logfile'

export function LogsPage() {
  const [text, setText] = useState('')
  const [paused, setPaused] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [autoScroll, setAutoScroll] = useState(true)
  const offsetRef = useRef(0)
  const preRef = useRef<HTMLPreElement>(null)

  useEffect(() => {
    let cancelled = false

    const authHeaders = (): HeadersInit => {
      const token = getToken()
      return token ? { Authorization: `Bearer ${token}` } : {}
    }

    const fetchFull = async () => {
      const res = await fetch(LOGFILE_PATH, { headers: authHeaders() })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const body = await res.text()
      if (cancelled) return
      offsetRef.current = body.length
      setText(body)
      setError(null)
    }

    const fetchDelta = async () => {
      const offset = offsetRef.current
      const res = await fetch(LOGFILE_PATH, {
        headers: { ...authHeaders(), Range: `bytes=${offset}-` },
      })
      // 416 = no new bytes yet (or file shrunk from rotation). Re-sync on rotation.
      if (res.status === 416) {
        const head = await fetch(LOGFILE_PATH, {
          method: 'HEAD',
          headers: authHeaders(),
        })
        const len = Number(head.headers.get('Content-Length') ?? '0')
        if (len < offset) await fetchFull()
        return
      }
      if (!res.ok && res.status !== 206 && res.status !== 200) {
        throw new Error(`HTTP ${res.status}`)
      }
      const body = await res.text()
      if (cancelled || body.length === 0) return
      offsetRef.current = offset + body.length
      setText(prev => prev + body)
    }

    fetchFull().catch(e => !cancelled && setError((e as Error).message))

    const id = window.setInterval(() => {
      if (paused) return
      fetchDelta().catch(e => !cancelled && setError((e as Error).message))
    }, POLL_INTERVAL_MS)

    return () => {
      cancelled = true
      window.clearInterval(id)
    }
  }, [paused])

  useEffect(() => {
    if (!autoScroll || !preRef.current) return
    preRef.current.scrollTop = preRef.current.scrollHeight
  }, [text, autoScroll])

  const onScroll = () => {
    const el = preRef.current
    if (!el) return
    const nearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 50
    setAutoScroll(nearBottom)
  }

  const download = () => {
    const blob = new Blob([text], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `debridav-${new Date().toISOString().replace(/[:.]/g, '-')}.log`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="flex h-full flex-col gap-4 p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <ScrollText className="h-5 w-5 text-drac-cyan" />
          <h1 className="text-xl font-semibold text-drac-fg">Logs</h1>
          <span className="text-xs text-drac-comment">
            {paused ? 'paused' : `tailing every ${POLL_INTERVAL_MS / 1000}s`}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setPaused(p => !p)}
            className="flex items-center gap-2 rounded-lg border border-drac-current bg-drac-darker px-3 py-1.5 text-sm text-drac-fg hover:bg-drac-current"
          >
            {paused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
            {paused ? 'Resume' : 'Pause'}
          </button>
          <button
            onClick={download}
            className="flex items-center gap-2 rounded-lg border border-drac-current bg-drac-darker px-3 py-1.5 text-sm text-drac-fg hover:bg-drac-current"
          >
            <Download className="h-4 w-4" />
            Download
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-drac-red/40 bg-drac-red/10 px-3 py-2 text-sm text-drac-red">
          {error}
        </div>
      )}

      <pre
        ref={preRef}
        onScroll={onScroll}
        className="flex-1 overflow-auto rounded-lg border border-drac-current bg-drac-darker p-4 font-mono text-xs leading-relaxed text-drac-fg whitespace-pre-wrap break-all"
      >
        {text}
      </pre>
    </div>
  )
}
