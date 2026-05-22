import { useState } from 'react'
import { useSearchParams } from 'react-router'
import { ConfigGroupPage } from '../../components/config/ConfigGroupPage'
import { DebridClientsEditor } from '../../components/config/DebridClientsEditor'
import { NntpPoolEditor } from '../../components/config/NntpPoolEditor'
import { VerifyButton } from '../../components/config/VerifyButton'
import { Spinner } from '../../components/ui/Spinner'
import { Toggle } from '../../components/ui/Toggle'
import { useConfig } from '../../hooks/useConfig'
import { useConfigTest } from '../../hooks/useConfigTest'
import { useNntpPools } from '../../hooks/useNntpPools'
import { CONFIG_GROUPS, type GroupMeta } from '../../lib/constants'

interface ConfigPageWrapperProps {
  groupKey: string
}

type NntpTab = 'general' | 'pools' | 'cache'

const NNTP_CACHE_KEY_PREFIX = 'nntp.cache.'

function TabbedHeader({ group }: { group: GroupMeta }) {
  const Icon = group.icon
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-drac-cyan/15">
        <Icon className="h-5 w-5 text-drac-cyan" />
      </div>
      <div>
        <h1 className="text-xl font-bold text-drac-fg">{group.label} Configuration</h1>
        <p className="text-sm text-drac-comment">{group.description}</p>
      </div>
    </div>
  )
}

function TabBar<T extends string>({ tabs, active, onChange, trailing }: {
  tabs: { key: T; label: string }[]
  active: T
  onChange: (key: T) => void
  trailing?: React.ReactNode
}) {
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
      {trailing && <div className="ml-auto">{trailing}</div>}
    </div>
  )
}

function AdvancedToggle({ show, onChange }: { show: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center gap-2">
      <Toggle checked={show} onChange={onChange} />
      <span className="text-sm text-drac-comment">Show advanced</span>
    </div>
  )
}

export function ConfigPageWrapper({ groupKey }: ConfigPageWrapperProps) {
  const { properties: allProperties, getByGroup, loading, updateProperty, resetProperty } = useConfig()
  const { isTestable, testingPrefix, testPrefix } = useConfigTest()
  const { pools, saving: poolsSaving, savePools, testPool } = useNntpPools()
  const [searchParams] = useSearchParams()
  const tabParam = searchParams.get('tab')
  const initialNntpTab: NntpTab =
    tabParam === 'pools' ? 'pools' :
    tabParam === 'cache' ? 'cache' :
    'general'
  const [nntpTab, setNntpTab] = useState<NntpTab>(initialNntpTab)
  const [subgroupTab, setSubgroupTab] = useState<string | null>(null)
  const [showAdvanced, setShowAdvanced] = useState(false)
  const group = CONFIG_GROUPS.find(g => g.key === groupKey)!
  const properties = getByGroup(groupKey)

  if (groupKey === 'nntp') {
    if (loading) return <Spinner />
    // Cache properties (nntp.cache.*) share the `nntp` server-side group but render on
    // their own tab. The General tab shows everything that isn't a cache property.
    const cacheProperties = properties.filter(p => p.key.startsWith(NNTP_CACHE_KEY_PREFIX))
    const generalProperties = properties.filter(p => !p.key.startsWith(NNTP_CACHE_KEY_PREFIX))
    const hasAdvancedGeneral = generalProperties.some(p => p.advanced)

    return (
      <div className="max-w-4xl space-y-6">
        <TabbedHeader group={group} />
        <TabBar
          tabs={[
            { key: 'general' as NntpTab, label: 'General' },
            { key: 'pools' as NntpTab, label: 'Server Pools' },
            { key: 'cache' as NntpTab, label: 'Cache' },
          ]}
          active={nntpTab}
          onChange={setNntpTab}
          trailing={nntpTab === 'general' && hasAdvancedGeneral
            ? <AdvancedToggle show={showAdvanced} onChange={setShowAdvanced} />
            : undefined}
        />
        {nntpTab === 'general' && (
          <ConfigGroupPage
            group={group}
            properties={generalProperties}
            loading={false}
            onSave={updateProperty}
            onReset={resetProperty}
            isTestable={isTestable}
            testingPrefix={testingPrefix}
            onTest={testPrefix}
            hideHeader
            showAdvanced={showAdvanced}
            onShowAdvancedChange={setShowAdvanced}
          />
        )}
        {nntpTab === 'pools' && (
          <NntpPoolEditor pools={pools} saving={poolsSaving} onSave={savePools} onTestPool={testPool} />
        )}
        {nntpTab === 'cache' && (
          <ConfigGroupPage
            group={group}
            properties={cacheProperties}
            loading={false}
            onSave={updateProperty}
            onReset={resetProperty}
            hideHeader
          />
        )}
      </div>
    )
  }

  if (group.subgroups && group.subgroups.length > 0) {
    if (loading) return <Spinner />

    const DEBRID_CLIENTS_KEY = 'debridav.debrid-clients'
    const isProviders = groupKey === 'providers'
    const debridClientsProp = isProviders
      ? allProperties.find(p => p.key === DEBRID_CLIENTS_KEY)
      : undefined

    const CLIENTS_TAB = 'clients'
    const tabs = [
      ...(isProviders ? [{ key: CLIENTS_TAB, label: 'Clients' }] : []),
      ...group.subgroups.map(s => ({ key: s.key, label: s.label })),
    ]
    const activeKey = subgroupTab ?? tabs[0].key
    const isClientsTab = activeKey === CLIENTS_TAB

    const activeSub = group.subgroups.find(s => s.key === activeKey) ?? group.subgroups[0]
    const subProps = isClientsTab
      ? []
      : properties.filter(p => activeSub.prefixes.some(pfx => p.key.startsWith(pfx)))
          .filter(p => p.key !== DEBRID_CLIENTS_KEY)

    const subGroup: GroupMeta = { ...group, subgroups: undefined, credentialPairs: isClientsTab ? undefined : activeSub.credentialPairs }
    const hasAdvanced = subProps.some(p => p.advanced)

    return (
      <div className="max-w-4xl space-y-6">
        <TabbedHeader group={group} />
        <TabBar
          tabs={tabs}
          active={activeKey}
          onChange={setSubgroupTab}
          trailing={!isClientsTab ? (
            <div className="flex items-center gap-3">
              {isTestable(activeSub.key) && (
                <VerifyButton
                  prefix={activeSub.key}
                  label={activeSub.label}
                  testing={testingPrefix === activeSub.key}
                  onTest={testPrefix}
                />
              )}
              {hasAdvanced && <AdvancedToggle show={showAdvanced} onChange={setShowAdvanced} />}
            </div>
          ) : undefined}
        />
        {isClientsTab && debridClientsProp ? (
          <DebridClientsEditor
            property={debridClientsProp}
            onSave={updateProperty}
            onReset={resetProperty}
          />
        ) : (
          <ConfigGroupPage
            key={activeKey}
            group={subGroup}
            properties={subProps}
            loading={false}
            onSave={updateProperty}
            onReset={resetProperty}
            hideHeader
            showAdvanced={showAdvanced}
            onShowAdvancedChange={setShowAdvanced}
          />
        )}
      </div>
    )
  }

  const DEBRID_CLIENTS_KEY = 'debridav.debrid-clients'
  const filteredProperties = groupKey === 'debridav'
    ? properties.filter(p => p.key !== DEBRID_CLIENTS_KEY)
    : properties

  return (
    <ConfigGroupPage
      group={group}
      properties={filteredProperties}
      loading={loading}
      onSave={updateProperty}
      onReset={resetProperty}
      isTestable={isTestable}
      testingPrefix={testingPrefix}
      onTest={testPrefix}
    />
  )
}
