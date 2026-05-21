import {
  Settings,
  Globe,
  Cloud,
  Tv,
  Newspaper,
  RefreshCw,
  type LucideIcon,
} from 'lucide-react'

export interface CredentialPair {
  label: string
  usernameKey: string
  passwordKey: string
}

export interface GroupMeta {
  key: string
  label: string
  path: string
  icon: LucideIcon
  description: string
  subgroups?: { key: string; label: string; prefixes: string[]; credentialPairs?: CredentialPair[] }[]
  credentialPairs?: CredentialPair[]
}

export const CONFIG_GROUPS: GroupMeta[] = [
  {
    key: 'debridav',
    label: 'Core',
    path: '/config/core',
    icon: Settings,
    description: 'Core application settings',
  },
  {
    key: 'webdav',
    label: 'WebDAV',
    path: '/config/webdav',
    icon: Globe,
    description: 'WebDAV authentication credentials',
    credentialPairs: [
      { label: 'Credentials', usernameKey: 'debridav.webdav-username', passwordKey: 'debridav.webdav-password' },
    ],
  },
  {
    key: 'providers',
    label: 'Providers',
    path: '/config/providers',
    icon: Cloud,
    description: 'Debrid service provider configuration',
    subgroups: [
      { key: 'premiumize', label: 'Premiumize', prefixes: ['premiumize.'] },
      { key: 'real-debrid', label: 'Real-Debrid', prefixes: ['real-debrid.'] },
      { key: 'torbox', label: 'TorBox', prefixes: ['torbox.'] },
      {
        key: 'easynews',
        label: 'Easynews',
        prefixes: ['easynews.'],
        credentialPairs: [
          { label: 'Credentials', usernameKey: 'easynews.username', passwordKey: 'easynews.password' },
        ],
      },
    ],
  },
  {
    key: 'arrs',
    label: 'Arrs',
    path: '/config/arrs',
    icon: Tv,
    description: 'Sonarr and Radarr integration settings',
    subgroups: [
      { key: 'sonarr', label: 'Sonarr', prefixes: ['sonarr.'] },
      { key: 'radarr', label: 'Radarr', prefixes: ['radarr.'] },
    ],
  },
  {
    key: 'nntp',
    label: 'NNTP',
    path: '/config/nntp',
    icon: Newspaper,
    description: 'Usenet/NNTP server configuration',
  },
  {
    key: 'rclone',
    label: 'Rclone',
    path: '/config/rclone',
    icon: RefreshCw,
    description: 'Rclone remote-control endpoint used to invalidate its directory cache when files change',
  },
]
