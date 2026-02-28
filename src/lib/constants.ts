import {
  Settings,
  Globe,
  Cloud,
  Tv,
  Newspaper,
  type LucideIcon,
} from 'lucide-react'

export interface GroupMeta {
  key: string
  label: string
  path: string
  icon: LucideIcon
  description: string
  subgroups?: { key: string; label: string; prefixes: string[] }[]
}

export const CONFIG_GROUPS: GroupMeta[] = [
  {
    key: 'debridav',
    label: 'Core',
    path: '/config/core',
    icon: Settings,
    description: 'Core application settings and database configuration',
    subgroups: [
      {
        key: 'core',
        label: 'Application',
        prefixes: [
          'debridav.root-path',
          'debridav.download-path',
          'debridav.mount-path',
          'debridav.debrid-clients',
          'debridav.delay-between-retries',
          'debridav.retries-on-provider-error',
          'debridav.wait-after-',
          'debridav.should-delete-non-working-files',
          'debridav.connect-timeout',
          'debridav.read-timeout',
          'debridav.enable-file-import',
          'debridav.local-entity-max-size',
          'debridav.default-categories',
          'debridav.torrent-lifetime',
        ],
      },
      {
        key: 'database',
        label: 'Database',
        prefixes: ['debridav.db.'],
      },
    ],
  },
  {
    key: 'webdav',
    label: 'WebDAV',
    path: '/config/webdav',
    icon: Globe,
    description: 'WebDAV authentication credentials',
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
      { key: 'easynews', label: 'Easynews', prefixes: ['easynews.'] },
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
]
