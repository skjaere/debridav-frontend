export interface ConfigProperty {
  key: string
  name: string | null
  effectiveValue: string | null
  defaultValue: string | null
  hasOverride: boolean
  sensitive: boolean
  group: string
  description: string
  type: string
}

export interface ConfigUpdateRequest {
  value: string | null
}
