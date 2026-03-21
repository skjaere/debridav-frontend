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
  advanced: boolean
}

export interface ConfigUpdateRequest {
  value: string | null
}

export interface ConfigTestResult {
  prefix: string
  label: string
  success: boolean
  message: string
  durationMs: number
}

export interface TestablePrefixInfo {
  prefix: string
  label: string
}

export interface NntpPool {
  host: string
  port: number
  username: string
  password: string
  useTls: boolean
  maxConnections: number
  priority: number
}

export interface FileEntry {
  name: string
  path: string
  isDirectory: boolean
  size: number | null
  lastModified: number | null
  mimeType: string | null
}

export type FileType = 'TORRENT' | 'USENET_RELEASE' | 'NZB' | 'LOCAL'

export type ProviderCacheStatus =
  | 'CACHED'
  | 'MISSING'
  | 'PROVIDER_ERROR'
  | 'CLIENT_ERROR'
  | 'NETWORK_ERROR'
  | 'UNKNOWN_ERROR'

export type DebridProvider = 'REAL_DEBRID' | 'PREMIUMIZE' | 'EASYNEWS' | 'TORBOX'

export interface ProviderStatus {
  provider: DebridProvider
  status: ProviderCacheStatus
  lastChecked: number | null
}

export interface FileDetail {
  name: string
  path: string
  size: number | null
  lastModified: number | null
  mimeType: string | null
  fileType: FileType
  hash: string | null
  providerStatus: ProviderStatus[] | null
}

export interface StreamUrl {
  url: string
  expiresIn: number
}

export interface NzbImportFile {
  path: string
  size: number
}

export interface QueueItem {
  id: number
  name: string
  status: string
  size: number | null
  errorMessage: string | null
  updatedAt: string | null
  createdAt: string | null
  archiveType: string | null
  files: NzbImportFile[] | null
}

export interface QueueStatus {
  processing: QueueItem[]
  pending: QueueItem[]
  history: QueueItem[]
}

export interface HistoryPage {
  content: QueueItem[]
  page: number
  size: number
  totalElements: number
  totalPages: number
  last: boolean
}

export interface HealthQueueItem {
  msgId: number
  documentId: number
  name: string | null
  category: string | null
  type: 'NZB' | 'TORRENT'
  readCount: number
  enqueuedAt: string | null
  lastReadAt: string | null
  archivedAt: string | null
  message: string | null
  action: string | null
}

export interface HealthQueueStatus {
  pending: HealthQueueItem[]
  count: number
}

export interface HealthQueueHistoryPage {
  content: HealthQueueItem[]
  page: number
  size: number
  totalElements: number
  totalPages: number
  last: boolean
}
