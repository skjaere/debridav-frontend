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
import { FileBrowser } from '../pages/FileBrowser'

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
      { path: 'config/core', element: <CoreConfigPage /> },
      { path: 'config/webdav', element: <WebdavConfigPage /> },
      { path: 'config/providers', element: <ProvidersConfigPage /> },
      { path: 'config/arrs', element: <ArrsConfigPage /> },
      { path: 'config/nntp', element: <NntpConfigPage /> },
    ],
  },
])
