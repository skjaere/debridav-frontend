import { useState } from 'react'
import { HeartPulse } from 'lucide-react'
import { HealthQueuePanel } from './HealthQueuePanel'
import { ConfigGroupPage } from '../components/config/ConfigGroupPage'
import { Spinner } from '../components/ui/Spinner'
import { useConfig } from '../hooks/useConfig'
import type { GroupMeta } from '../lib/constants'

type Tab = 'queue' | 'settings'

const REPAIR_GROUP: GroupMeta = {
  key: 'repair',
  label: 'Repair',
  path: '/health',
  icon: HeartPulse,
  description: 'Repair settings',
}

function TabBar({ active, onChange }: { active: Tab; onChange: (t: Tab) => void }) {
  const tabs: { key: Tab; label: string }[] = [
    { key: 'queue', label: 'Queue' },
    { key: 'settings', label: 'Settings' },
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

function RepairSettings() {
  const { getByGroup, loading, updateProperty, resetProperty } = useConfig()
  const properties = getByGroup('repair')

  if (loading) return <Spinner />

  return (
    <ConfigGroupPage
      group={REPAIR_GROUP}
      properties={properties}
      loading={false}
      onSave={updateProperty}
      onReset={resetProperty}
      hideHeader
    />
  )
}

export function HealthPage() {
  const [activeTab, setActiveTab] = useState<Tab>('queue')

  return (
    <div className="max-w-5xl space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-drac-green/15">
          <HeartPulse className="h-5 w-5 text-drac-green" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-drac-fg">Health</h1>
          <p className="text-sm text-drac-comment">Health checks and repairs for torrents and NZBs</p>
        </div>
      </div>

      <TabBar active={activeTab} onChange={setActiveTab} />

      {activeTab === 'queue' ? (
        <HealthQueuePanel />
      ) : (
        <RepairSettings />
      )}
    </div>
  )
}
