import type { ReactNode } from 'react'
import { Activity, Film, Upload, HeartPulse, Cpu } from 'lucide-react'
import { Card } from './ui/Card'
import { Spinner } from './ui/Spinner'
import { useOverviewSummary, type Summary } from '../hooks/useOverviewSummary'

function formatBitrate(bytesPerSec: number): string {
  if (bytesPerSec < 1024) return `${Math.round(bytesPerSec)} B/s`
  if (bytesPerSec < 1024 * 1024) return `${(bytesPerSec / 1024).toFixed(1)} KB/s`
  if (bytesPerSec < 1024 * 1024 * 1024) return `${(bytesPerSec / (1024 * 1024)).toFixed(1)} MB/s`
  return `${(bytesPerSec / (1024 * 1024 * 1024)).toFixed(2)} GB/s`
}

function formatBytes(bytes: number): string {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(0)} MB`
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`
}

function formatNumber(n: number): string {
  return new Intl.NumberFormat(undefined).format(n)
}

export function OverviewCards() {
  const { summary, loading, error } = useOverviewSummary()

  if (loading && !summary) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <Spinner />
      </div>
    )
  }
  if (error && !summary) {
    return <div className="text-sm text-drac-red">{error}</div>
  }
  if (!summary) return null

  return (
    <div className="grid flex-1 gap-4 content-start auto-rows-min grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
      <StatCard
        icon={<Activity className="h-4 w-4" />}
        label="Active streams"
        primary={summary.activeStreams.count === 0
          ? 'Idle'
          : `${summary.activeStreams.count} stream${summary.activeStreams.count === 1 ? '' : 's'}`}
        secondary={summary.activeStreams.count > 0 ? formatBitrate(summary.activeStreams.bitrateBytesPerSec) : undefined}
        accent={summary.activeStreams.count > 0 ? 'cyan' : 'comment'}
      />

      <LibraryCard summary={summary} />

      <StatCard
        icon={<Upload className="h-4 w-4" />}
        label="Import queue"
        primary={summary.importQueue.pending + summary.importQueue.processing === 0
          ? 'Empty'
          : `${summary.importQueue.processing} processing`}
        secondary={summary.importQueue.pending > 0
          ? `${summary.importQueue.pending} pending`
          : undefined}
        accent={summary.importQueue.processing > 0 ? 'orange' : 'comment'}
      />

      <StatCard
        icon={<HeartPulse className="h-4 w-4" />}
        label="Health queue"
        primary={summary.healthQueue.pending === 0
          ? 'All healthy'
          : `${summary.healthQueue.pending} pending`}
        accent={summary.healthQueue.pending > 0 ? 'orange' : 'green'}
      />

      <StatCard
        icon={<Cpu className="h-4 w-4" />}
        label="System"
        primary={`${Math.round(summary.system.cpuUsage * 100)}% CPU`}
        secondary={`${formatBytes(summary.system.memoryBytes)} RAM`}
        accent="purple"
      />
    </div>
  )
}

function LibraryCard({ summary }: { summary: Summary }) {
  const hasSources = summary.library.bySource.length > 0
  return (
    <Card className="sm:col-span-2">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs uppercase tracking-wide text-drac-comment">
            <Film className="h-4 w-4" />
            <span>Library</span>
          </div>
          <div className="mt-2 text-2xl font-semibold text-drac-fg">
            {formatNumber(summary.library.totalFiles)} files
          </div>
        </div>
        {hasSources && (
          <div className="flex flex-col gap-1 text-right text-xs text-drac-comment">
            {summary.library.bySource.map(s => (
              <div key={s.source}>
                <span className="font-medium text-drac-fg">{formatNumber(s.files)}</span>{' '}
                <span>{s.source}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </Card>
  )
}

interface StatCardProps {
  icon: ReactNode
  label: string
  primary: string
  secondary?: string
  accent: 'cyan' | 'green' | 'orange' | 'purple' | 'comment'
}

function StatCard({ icon, label, primary, secondary, accent }: StatCardProps) {
  const accentClass = {
    cyan: 'text-drac-cyan',
    green: 'text-drac-green',
    orange: 'text-drac-orange',
    purple: 'text-drac-purple',
    comment: 'text-drac-comment',
  }[accent]

  return (
    <Card>
      <div className="flex items-center gap-2 text-xs uppercase tracking-wide text-drac-comment">
        <span className={accentClass}>{icon}</span>
        <span>{label}</span>
      </div>
      <div className={`mt-2 text-2xl font-semibold ${accent === 'comment' ? 'text-drac-comment' : 'text-drac-fg'}`}>
        {primary}
      </div>
      {secondary && <div className="mt-1 text-sm text-drac-comment">{secondary}</div>}
    </Card>
  )
}
