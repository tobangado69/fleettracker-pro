import { createBrowserRouter, Navigate } from 'react-router-dom'
import { PageLayout } from '@/components/layout/PageLayout'
import { LoginPage } from '@/pages/auth/LoginPage'
import { DashboardPage } from '@/pages/dashboard/DashboardPage'
import { VehicleListPage } from '@/pages/vehicles/VehicleListPage'
import { DriverListPage } from '@/pages/drivers/DriverListPage'
import { TrackingPage } from '@/pages/tracking/TrackingPage'
import { AnalyticsPage } from '@/pages/analytics/AnalyticsPage'
import { PaymentListPage } from '@/pages/payments/PaymentListPage'
import { SettingsPage } from '@/pages/settings/SettingsPage'

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/',
    element: <PageLayout />,
    children: [
      { index: true, element: <DashboardPage /> },
      { path: 'vehicles', element: <VehicleListPage /> },
      { path: 'drivers', element: <DriverListPage /> },
      { path: 'tracking', element: <TrackingPage /> },
      { path: 'analytics', element: <AnalyticsPage /> },
      { path: 'payments', element: <PaymentListPage /> },
      { path: 'settings', element: <SettingsPage /> },
    ],
  },
  { path: '*', element: <Navigate to="/" replace /> },
])
