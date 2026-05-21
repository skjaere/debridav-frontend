import { createBrowserRouter } from 'react-router'
import { DashboardLayout } from '../components/layout/DashboardLayout'
import { ProtectedRoute } from './ProtectedRoute'
import { LoginPage } from '../pages/LoginPage'
import { DashboardHome } from '../pages/DashboardHome'
import { CoreConfigPage } from '../pages/config/CoreConfigPage'
import { WebdavConfigPage } from '../pages/config/WebdavConfigPage'
import { ProvidersConfigPage } from '../pages/config/ProvidersConfigPage'
import { ArrsConfigPage } from '../pages/config/ArrsConfigPage'
import { NntpConfigPage } from '../pages/config/NntpConfigPage'
import { RcloneConfigPage } from '../pages/config/RcloneConfigPage'
import { FileBrowser } from '../pages/FileBrowser'
import { UsenetPage } from '../pages/UsenetPage'
import { TorrentsPage } from '../pages/TorrentsPage'
import { HealthPage } from '../pages/HealthPage'
import { LogsPage } from '../pages/LogsPage'

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    element: (
      <ProtectedRoute>
        <DashboardLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <DashboardHome /> },
      { path: 'files', element: <FileBrowser /> },
      { path: 'usenet', element: <UsenetPage /> },
      { path: 'torrents', element: <TorrentsPage /> },
      { path: 'health', element: <HealthPage /> },
      { path: 'logs', element: <LogsPage /> },
      { path: 'config/core', element: <CoreConfigPage /> },
      { path: 'config/webdav', element: <WebdavConfigPage /> },
      { path: 'config/providers', element: <ProvidersConfigPage /> },
      { path: 'config/arrs', element: <ArrsConfigPage /> },
      { path: 'config/nntp', element: <NntpConfigPage /> },
      { path: 'config/rclone', element: <RcloneConfigPage /> },
    ],
  },
])
