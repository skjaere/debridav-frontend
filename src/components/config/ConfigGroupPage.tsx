import { ConfigPropertyRow } from './ConfigPropertyRow'
import { Spinner } from '../ui/Spinner'
import type { ConfigProperty } from '../../types/config'
import type { GroupMeta } from '../../lib/constants'

interface ConfigGroupPageProps {
  group: GroupMeta
  properties: ConfigProperty[]
  loading: boolean
  onSave: (key: string, value: string | null) => Promise<ConfigProperty>
  onReset: (key: string) => Promise<ConfigProperty>
}

function matchesSubgroup(key: string, prefixes: string[]): boolean {
  return prefixes.some(p => key.startsWith(p))
}

export function ConfigGroupPage({ group, properties, loading, onSave, onReset }: ConfigGroupPageProps) {
  if (loading) return <Spinner />

  const Icon = group.icon

  if (group.subgroups) {
    return (
      <div className="max-w-4xl space-y-8">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-drac-cyan/15">
            <Icon className="h-5 w-5 text-drac-cyan" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-drac-fg">{group.label} Configuration</h1>
            <p className="text-sm text-drac-comment">{group.description}</p>
          </div>
        </div>

        {group.subgroups.map(sub => {
          const subProps = properties.filter(p => matchesSubgroup(p.key, sub.prefixes))
          if (subProps.length === 0) return null
          return (
            <section key={sub.key}>
              <h2 className="mb-3 text-base font-semibold text-drac-cyan">{sub.label}</h2>
              <div className="space-y-2">
                {subProps.map(prop => (
                  <ConfigPropertyRow
                    key={prop.key}
                    property={prop}
                    onSave={onSave}
                    onReset={onReset}
                  />
                ))}
              </div>
            </section>
          )
        })}
      </div>
    )
  }

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-drac-cyan/15">
          <Icon className="h-5 w-5 text-drac-cyan" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-drac-fg">{group.label} Configuration</h1>
          <p className="text-sm text-drac-comment">{group.description}</p>
        </div>
      </div>

      <div className="space-y-2">
        {properties.map(prop => (
          <ConfigPropertyRow
            key={prop.key}
            property={prop}
            onSave={onSave}
            onReset={onReset}
          />
        ))}
      </div>
    </div>
  )
}
