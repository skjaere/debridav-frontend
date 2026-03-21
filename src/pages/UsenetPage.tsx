import { useState } from 'react'
import { Newspaper } from 'lucide-react'
import { QueuePanel } from './QueuePage'
import { NzbUploadForm } from '../components/usenet/NzbUploadForm'

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
        <NzbUploadForm onSuccess={() => setActiveTab('queue')} />
      )}
    </div>
  )
}
