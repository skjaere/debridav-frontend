import { useState } from 'react'
import { Link } from 'react-router'
import { Newspaper, Settings2 } from 'lucide-react'
import { QueuePanel } from './QueuePage'
import { NzbUploadForm } from '../components/usenet/NzbUploadForm'
import { Spinner } from '../components/ui/Spinner'
import { useNntpPools } from '../hooks/useNntpPools'

type Tab = 'queue' | 'upload'

function TabBar({ active, onChange }: { active: Tab; onChange: (t: Tab) => void }) {
  const tabs: { key: Tab; label: string }[] = [
    { key: 'upload', label: 'Upload' },
    { key: 'queue', label: 'Queue' },
  ]

  return (
    <div className="flex items-center border-b border-drac-current/50">
      <div className="flex gap-1">
        {tabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => onChange(tab.key)}
            className={`px-4 py-2 text-sm font-medium transition-colors cursor-pointer
              ${active === tab.key
                ? 'text-drac-cyan border-b-2 border-drac-cyan -mb-px'
                : 'text-drac-comment hover:text-drac-fg'
              }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </div>
  )
}

export function UsenetPage() {
  const [activeTab, setActiveTab] = useState<Tab>('upload')

  return (
    <div className="max-w-5xl space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-drac-cyan/15">
          <Newspaper className="h-5 w-5 text-drac-cyan" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-drac-fg">Usenet</h1>
          <p className="text-sm text-drac-comment">NZB import queue and file upload</p>
        </div>
      </div>

      <TabBar active={activeTab} onChange={setActiveTab} />

      {activeTab === 'queue' ? (
        <QueuePanel />
      ) : (
        <UploadTab onUploaded={() => setActiveTab('queue')} />
      )}
    </div>
  )
}

function UploadTab({ onUploaded }: { onUploaded: () => void }) {
  const { pools, loading, error } = useNntpPools()

  if (loading) {
    return (
      <div className="flex justify-center p-10">
        <Spinner />
      </div>
    )
  }
  if (error) {
    return <div className="text-sm text-drac-red">{error}</div>
  }
  if (pools.length === 0) {
    return <NoPoolConfigured />
  }
  return <NzbUploadForm onSuccess={onUploaded} />
}

function NoPoolConfigured() {
  return (
    <div className="mx-auto max-w-md rounded-lg border border-drac-current bg-drac-bg/40 p-6 text-center">
      <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-drac-cyan/15">
        <Settings2 className="h-5 w-5 text-drac-cyan" />
      </div>
      <h2 className="text-lg font-semibold text-drac-fg">No NNTP pool configured</h2>
      <p className="mt-2 text-sm text-drac-comment">
        NZB uploads need a Usenet server to fetch articles from. Add at least one pool to enable this feature.
      </p>
      <Link
        to="/config/nntp"
        className="mt-4 inline-flex items-center gap-2 rounded-md bg-drac-cyan/15 px-4 py-2 text-sm font-medium text-drac-cyan hover:bg-drac-cyan/25 transition-colors"
      >
        Configure a pool →
      </Link>
    </div>
  )
}
