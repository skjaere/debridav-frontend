import { ConfigGroupPage } from '../../components/config/ConfigGroupPage'
import { useConfig } from '../../hooks/useConfig'
import { useConfigTest } from '../../hooks/useConfigTest'
import { CONFIG_GROUPS } from '../../lib/constants'

interface ConfigPageWrapperProps {
  groupKey: string
}

export function ConfigPageWrapper({ groupKey }: ConfigPageWrapperProps) {
  const { getByGroup, loading, updateProperty, resetProperty } = useConfig()
  const { isTestable, testingPrefix, testPrefix } = useConfigTest()
  const group = CONFIG_GROUPS.find(g => g.key === groupKey)!
  const properties = getByGroup(groupKey)

  return (
    <ConfigGroupPage
      group={group}
      properties={properties}
      loading={loading}
      onSave={updateProperty}
      onReset={resetProperty}
      isTestable={isTestable}
      testingPrefix={testingPrefix}
      onTest={testPrefix}
    />
  )
}
