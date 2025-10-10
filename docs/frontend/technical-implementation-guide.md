# Frontend Technical Implementation Guide
## FleetTracker Pro - Vite + TypeScript + React

### Document Information
- **Project Name**: FleetTracker Pro Frontend
- **Version**: 1.0
- **Last Updated**: October 10, 2025
- **Technology Stack**: Vite 5 + TypeScript 5 + React 18 + TanStack Query + Tailwind CSS
- **Architecture**: Single Page Application (SPA) with server state management
- **Target Platform**: Modern Browsers (Chrome, Firefox, Safari, Edge)
- **Status**: 🚧 **IN PLANNING** (Ready to Start Development)
- **Related Documents**: [Frontend PRD](PRD.md) | [Backend Tech Guide](../backend/technical-implementation-guide.md)

---

## Table of Contents
1. [System Architecture](#1-system-architecture)
2. [Project Setup](#2-project-setup)
3. [Frontend Implementation](#3-frontend-implementation)
4. [Component Design](#4-component-design)
5. [State Management](#5-state-management)
6. [API Integration](#6-api-integration)
7. [Real-Time Features](#7-real-time-features)
8. [Indonesian Localization](#8-indonesian-localization)
9. [Testing Strategy](#9-testing-strategy)
10. [Deployment](#10-deployment)
11. [Implementation Plan](#11-implementation-plan)

---

## 1. System Architecture

### 1.1 High-Level Frontend Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      Browser (Client)                        │
├─────────────────────────────────────────────────────────────┤
│                   React 18 Application                       │
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │   Pages/     │  │  Components/ │  │   Hooks/     │     │
│  │   Routes     │◄─┤   UI Parts   │◄─┤   Logic      │     │
│  └──────┬───────┘  └──────────────┘  └──────┬───────┘     │
│         │                                     │              │
│  ┌──────▼────────────────────────────────────▼───────────┐ │
│  │         TanStack Query (Server State)                  │ │
│  │         + Zustand (Client State)                       │ │
│  └──────┬────────────────────────────────────────────────┘ │
│         │                                                    │
│  ┌──────▼────────────────────────────────────────────────┐ │
│  │         API Service Layer (Axios)                      │ │
│  │         + WebSocket Client                             │ │
│  └──────┬────────────────────────────────────────────────┘ │
│         │                                                    │
└─────────┼────────────────────────────────────────────────────┘
          │
          │ HTTP/HTTPS + WebSocket
          │
┌─────────▼────────────────────────────────────────────────────┐
│              Backend API (Go + PostgreSQL)                    │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  REST API Endpoints (80+)                            │   │
│  │  + WebSocket for Real-Time Updates                   │   │
│  └──────────────────────────────────────────────────────┘   │
└───────────────────────────────────────────────────────────────┘
```

### 1.2 Technology Stack

**Core Technologies:**
- **Build Tool**: Vite 5.x (fast HMR, optimized builds)
- **Language**: TypeScript 5.x (type safety)
- **Framework**: React 18.x (UI library)
- **Server State**: TanStack Query (data fetching, caching)
- **Client State**: Zustand (lightweight state management)
- **Routing**: React Router v6 (navigation)
- **Styling**: Tailwind CSS 3.x (utility-first CSS)

**UI & Components:**
- **UI Library**: shadcn/ui or custom components
- **Forms**: React Hook Form + Zod (validation)
- **Maps**: React Leaflet or Google Maps Platform
- **Charts**: Recharts or Chart.js
- **Icons**: Lucide Icons
- **Notifications**: React Toastify or Sonner

**Utilities:**
- **HTTP Client**: Axios (API requests)
- **WebSocket**: Native WebSocket API
- **Date/Time**: date-fns or Day.js
- **Formatting**: numeral.js (currency, numbers)
- **Authentication**: Better Auth (framework-agnostic)

### 1.3 Project Structure (Planned)

```
frontend/
├── public/
│   ├── icons/                       # Vehicle markers, UI icons
│   ├── locales/                     # Translation files
│   │   ├── id.json                  # Bahasa Indonesia
│   │   └── en.json                  # English
│   └── favicon.ico
├── src/
│   ├── components/                  # Reusable components
│   │   ├── ui/                      # Base UI components (shadcn/ui)
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── table.tsx
│   │   │   ├── modal.tsx
│   │   │   └── ... (20+ base components)
│   │   ├── forms/                   # Form components
│   │   │   ├── VehicleForm.tsx
│   │   │   ├── DriverForm.tsx
│   │   │   ├── TripForm.tsx
│   │   │   └── InvoiceForm.tsx
│   │   ├── maps/                    # Map components
│   │   │   ├── FleetMap.tsx         # Main fleet map
│   │   │   ├── VehicleMarker.tsx    # Vehicle marker
│   │   │   ├── RoutePolyline.tsx    # Route visualization
│   │   │   └── GeofenceLayer.tsx    # Geofence overlay
│   │   ├── charts/                  # Chart components
│   │   │   ├── FuelChart.tsx
│   │   │   ├── PerformanceChart.tsx
│   │   │   ├── UtilizationChart.tsx
│   │   │   └── TrendChart.tsx
│   │   └── layout/                  # Layout components
│   │       ├── Header.tsx
│   │       ├── Sidebar.tsx
│   │       ├── Footer.tsx
│   │       └── PageLayout.tsx
│   ├── pages/                       # Page components
│   │   ├── auth/
│   │   │   ├── LoginPage.tsx
│   │   │   ├── ChangePasswordPage.tsx
│   │   │   └── SessionsPage.tsx
│   │   ├── dashboard/
│   │   │   └── DashboardPage.tsx    # Main dashboard
│   │   ├── vehicles/
│   │   │   ├── VehicleListPage.tsx
│   │   │   ├── VehicleDetailPage.tsx
│   │   │   └── VehicleFormPage.tsx
│   │   ├── drivers/
│   │   │   ├── DriverListPage.tsx
│   │   │   ├── DriverDetailPage.tsx
│   │   │   └── DriverFormPage.tsx
│   │   ├── trips/
│   │   │   ├── TripListPage.tsx
│   │   │   └── TripDetailPage.tsx
│   │   ├── analytics/
│   │   │   ├── FuelAnalyticsPage.tsx
│   │   │   ├── DriverAnalyticsPage.tsx
│   │   │   └── VehicleAnalyticsPage.tsx
│   │   ├── payments/
│   │   │   ├── InvoiceListPage.tsx
│   │   │   └── InvoiceDetailPage.tsx
│   │   └── settings/
│   │       ├── CompanySettingsPage.tsx
│   │       └── UserManagementPage.tsx
│   ├── hooks/                       # Custom React hooks
│   │   ├── useAuth.ts               # Authentication hook
│   │   ├── useWebSocket.ts          # WebSocket hook
│   │   ├── useLocalStorage.ts       # LocalStorage hook
│   │   ├── useDebounce.ts           # Debounce hook
│   │   ├── useInfiniteScroll.ts     # Infinite scroll hook
│   │   └── useIndonesianFormat.ts   # Indonesian formatting hook
│   ├── services/                    # API service layer
│   │   ├── api.ts                   # Axios instance
│   │   ├── authService.ts           # Auth endpoints
│   │   ├── vehicleService.ts        # Vehicle endpoints
│   │   ├── driverService.ts         # Driver endpoints
│   │   ├── trackingService.ts       # GPS tracking endpoints
│   │   ├── paymentService.ts        # Payment endpoints
│   │   ├── analyticsService.ts      # Analytics endpoints
│   │   └── websocketService.ts      # WebSocket client
│   ├── stores/                      # Client state stores (Zustand)
│   │   ├── authStore.ts             # Auth state
│   │   ├── uiStore.ts               # UI state (sidebar, modals)
│   │   └── mapStore.ts              # Map state (filters, selected vehicle)
│   ├── types/                       # TypeScript types
│   │   ├── api.ts                   # API request/response types
│   │   ├── models.ts                # Data models
│   │   ├── auth.ts                  # Auth types
│   │   └── common.ts                # Common types
│   ├── utils/                       # Utility functions
│   │   ├── format.ts                # Formatting (IDR, dates)
│   │   ├── validation.ts            # Validation helpers
│   │   ├── constants.ts             # Constants
│   │   └── helpers.ts               # Helper functions
│   ├── styles/                      # Global styles
│   │   ├── globals.css              # Tailwind base + custom styles
│   │   └── variables.css            # CSS variables
│   ├── App.tsx                      # Main app component
│   ├── main.tsx                     # App entry point
│   ├── router.tsx                   # Route configuration
│   └── vite-env.d.ts                # Vite type definitions
├── .env.example                     # Environment variables example
├── .eslintrc.json                   # ESLint configuration
├── .prettierrc                      # Prettier configuration
├── index.html                       # HTML entry point
├── package.json                     # Dependencies
├── postcss.config.js                # PostCSS configuration
├── tailwind.config.js               # Tailwind configuration
├── tsconfig.json                    # TypeScript configuration
├── vite.config.ts                   # Vite configuration
└── README.md                        # Project documentation
```

---

## 2. Project Setup

### 2.1 Initial Setup Commands

```bash
# Create Vite project with React + TypeScript
npm create vite@latest fleettracker-frontend -- --template react-ts

cd fleettracker-frontend

# Install core dependencies
npm install react-router-dom@6 \
  @tanstack/react-query \
  axios \
  zustand \
  react-hook-form \
  zod \
  @hookform/resolvers

# Install UI dependencies
npm install tailwindcss@3 postcss autoprefixer \
  lucide-react \
  react-toastify \
  date-fns \
  numeral

# Install map library (choose one)
npm install react-leaflet leaflet  # OR
npm install @react-google-maps/api

# Install charts library (choose one)
npm install recharts  # OR
npm install chart.js react-chartjs-2

# Install dev dependencies
npm install -D @types/leaflet \
  @types/numeral \
  eslint \
  prettier \
  @typescript-eslint/eslint-plugin \
  @typescript-eslint/parser

# Initialize Tailwind CSS
npx tailwindcss init -p
```

### 2.2 Vite Configuration

```typescript
// vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@components': path.resolve(__dirname, './src/components'),
      '@pages': path.resolve(__dirname, './src/pages'),
      '@hooks': path.resolve(__dirname, './src/hooks'),
      '@services': path.resolve(__dirname, './src/services'),
      '@utils': path.resolve(__dirname, './src/utils'),
      '@types': path.resolve(__dirname, './src/types'),
      '@stores': path.resolve(__dirname, './src/stores'),
    },
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
      '/ws': {
        target: 'ws://localhost:8080',
        ws: true,
      },
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'query-vendor': ['@tanstack/react-query'],
          'ui-vendor': ['lucide-react', 'react-toastify'],
          'map-vendor': ['react-leaflet', 'leaflet'],
          'chart-vendor': ['recharts'],
        },
      },
    },
  },
})
```

### 2.3 Tailwind Configuration

```javascript
// tailwind.config.js
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          // ... (Indonesian-friendly blue palette)
          900: '#1e3a8a',
        },
        success: {
          // ... (green palette)
        },
        warning: {
          // ... (orange palette)
        },
        danger: {
          // ... (red palette)
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
```

---

## 3. Frontend Implementation

### 3.1 Main Application Setup

```typescript
// src/main.tsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { BrowserRouter } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'
import App from './App.tsx'
import './styles/globals.css'
import 'react-toastify/dist/ReactToastify.css'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
      retry: (failureCount, error: any) => {
        // Don't retry on 401 Unauthorized
        if (error?.response?.status === 401) return false
        return failureCount < 3
      },
      refetchOnWindowFocus: false,
    },
  },
})

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <App />
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
        />
      </BrowserRouter>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  </React.StrictMode>,
)
```

```typescript
// src/App.tsx
import { useEffect } from 'react'
import { useRoutes } from 'react-router-dom'
import { useAuthStore } from '@stores/authStore'
import router from './router'

function App() {
  const { initialize } = useAuthStore()
  const routes = useRoutes(router)

  useEffect(() => {
    // Initialize auth state from localStorage
    initialize()
  }, [initialize])

  return <div className="App">{routes}</div>
}

export default App
```

### 3.2 Router Configuration

```typescript
// src/router.tsx
import { RouteObject, Navigate } from 'react-router-dom'
import PageLayout from '@components/layout/PageLayout'
import ProtectedRoute from '@components/auth/ProtectedRoute'

// Auth pages
import LoginPage from '@pages/auth/LoginPage'
import ChangePasswordPage from '@pages/auth/ChangePasswordPage'

// Dashboard
import DashboardPage from '@pages/dashboard/DashboardPage'

// Vehicles
import VehicleListPage from '@pages/vehicles/VehicleListPage'
import VehicleDetailPage from '@pages/vehicles/VehicleDetailPage'
import VehicleFormPage from '@pages/vehicles/VehicleFormPage'

// Drivers
import DriverListPage from '@pages/drivers/DriverListPage'
import DriverDetailPage from '@pages/drivers/DriverDetailPage'
import DriverFormPage from '@pages/drivers/DriverFormPage'

// Trips
import TripListPage from '@pages/trips/TripListPage'
import TripDetailPage from '@pages/trips/TripDetailPage'

// Analytics
import FuelAnalyticsPage from '@pages/analytics/FuelAnalyticsPage'
import DriverAnalyticsPage from '@pages/analytics/DriverAnalyticsPage'
import VehicleAnalyticsPage from '@pages/analytics/VehicleAnalyticsPage'

// Payments
import InvoiceListPage from '@pages/payments/InvoiceListPage'
import InvoiceDetailPage from '@pages/payments/InvoiceDetailPage'

// Settings
import CompanySettingsPage from '@pages/settings/CompanySettingsPage'
import UserManagementPage from '@pages/settings/UserManagementPage'

const router: RouteObject[] = [
  // Public routes
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/change-password',
    element: <ChangePasswordPage />,
  },

  // Protected routes
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <PageLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <Navigate to="/dashboard" replace />,
      },
      {
        path: 'dashboard',
        element: <DashboardPage />,
      },
      {
        path: 'vehicles',
        children: [
          { index: true, element: <VehicleListPage /> },
          { path: 'new', element: <VehicleFormPage /> },
          { path: ':id', element: <VehicleDetailPage /> },
          { path: ':id/edit', element: <VehicleFormPage /> },
        ],
      },
      {
        path: 'drivers',
        children: [
          { index: true, element: <DriverListPage /> },
          { path: 'new', element: <DriverFormPage /> },
          { path: ':id', element: <DriverDetailPage /> },
          { path: ':id/edit', element: <DriverFormPage /> },
        ],
      },
      {
        path: 'trips',
        children: [
          { index: true, element: <TripListPage /> },
          { path: ':id', element: <TripDetailPage /> },
        ],
      },
      {
        path: 'analytics',
        children: [
          { path: 'fuel', element: <FuelAnalyticsPage /> },
          { path: 'drivers', element: <DriverAnalyticsPage /> },
          { path: 'vehicles', element: <VehicleAnalyticsPage /> },
        ],
      },
      {
        path: 'payments',
        children: [
          { index: true, element: <InvoiceListPage /> },
          { path: ':id', element: <InvoiceDetailPage /> },
        ],
      },
      {
        path: 'settings',
        children: [
          { path: 'company', element: <CompanySettingsPage /> },
          { path: 'users', element: <UserManagementPage /> },
        ],
      },
    ],
  },

  // 404 catch-all
  {
    path: '*',
    element: <Navigate to="/dashboard" replace />,
  },
]

export default router
```

---

## 4. Component Design

### 4.1 Protected Route Component

```typescript
// src/components/auth/ProtectedRoute.tsx
import { Navigate } from 'react-router-dom'
import { useAuthStore } from '@stores/authStore'

interface ProtectedRouteProps {
  children: React.ReactNode
  requireRole?: string[]
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requireRole 
}) => {
  const { isAuthenticated, user } = useAuthStore()

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  if (user?.must_change_password) {
    return <Navigate to="/change-password" replace />
  }

  if (requireRole && !requireRole.includes(user?.role || '')) {
    return <Navigate to="/dashboard" replace />
  }

  return <>{children}</>
}

export default ProtectedRoute
```

### 4.2 Page Layout Component

```typescript
// src/components/layout/PageLayout.tsx
import { Outlet } from 'react-router-dom'
import Header from './Header'
import Sidebar from './Sidebar'
import { useUIStore } from '@stores/uiStore'

const PageLayout: React.FC = () => {
  const { sidebarOpen } = useUIStore()

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="flex">
        <Sidebar open={sidebarOpen} />
        <main className={`flex-1 p-6 transition-all duration-300 ${
          sidebarOpen ? 'ml-64' : 'ml-16'
        }`}>
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default PageLayout
```

### 4.3 Fleet Map Component

```typescript
// src/components/maps/FleetMap.tsx
import { useEffect, useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import { useQuery } from '@tanstack/react-query'
import { vehicleService } from '@services/vehicleService'
import { useWebSocket } from '@hooks/useWebSocket'
import VehicleMarker from './VehicleMarker'
import type { Vehicle } from '@types/models'

const FleetMap: React.FC = () => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([])

  // Fetch initial vehicle positions
  const { data: initialVehicles } = useQuery({
    queryKey: ['vehicles', 'positions'],
    queryFn: vehicleService.getAllWithPositions,
    refetchInterval: 30000, // Fallback polling every 30 seconds
  })

  // WebSocket for real-time updates
  const { lastMessage } = useWebSocket('/ws/tracking', {
    onMessage: (event) => {
      const data = JSON.parse(event.data)
      if (data.type === 'gps_update') {
        updateVehiclePosition(data.vehicle_id, data)
      }
    },
  })

  useEffect(() => {
    if (initialVehicles) {
      setVehicles(initialVehicles)
    }
  }, [initialVehicles])

  const updateVehiclePosition = (vehicleId: string, update: any) => {
    setVehicles(prev => 
      prev.map(vehicle => 
        vehicle.id === vehicleId 
          ? { ...vehicle, ...update }
          : vehicle
      )
    )
  }

  return (
    <MapContainer
      center={[-6.2088, 106.8456]} // Jakarta coordinates
      zoom={11}
      className="h-full w-full rounded-lg"
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
      />
      
      {vehicles.map((vehicle) => (
        <VehicleMarker key={vehicle.id} vehicle={vehicle} />
      ))}
    </MapContainer>
  )
}

export default FleetMap
```

---

## 5. State Management

### 5.1 Auth Store (Zustand)

```typescript
// src/stores/authStore.ts
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { User } from '@types/models'

interface AuthState {
  user: User | null
  accessToken: string | null
  refreshToken: string | null
  isAuthenticated: boolean
  login: (user: User, accessToken: string, refreshToken: string) => void
  logout: () => void
  updateUser: (user: User) => void
  initialize: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,

      login: (user, accessToken, refreshToken) => {
        set({
          user,
          accessToken,
          refreshToken,
          isAuthenticated: true,
        })
      },

      logout: () => {
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
        })
      },

      updateUser: (user) => {
        set({ user })
      },

      initialize: () => {
        const { accessToken } = get()
        if (accessToken) {
          set({ isAuthenticated: true })
        }
      },
    }),
    {
      name: 'auth-storage',
    }
  )
)
```

### 5.2 UI Store (Zustand)

```typescript
// src/stores/uiStore.ts
import { create } from 'zustand'

interface UIState {
  sidebarOpen: boolean
  toggleSidebar: () => void
  setSidebarOpen: (open: boolean) => void
}

export const useUIStore = create<UIState>()((set) => ({
  sidebarOpen: true,

  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),

  setSidebarOpen: (open) => set({ sidebarOpen: open }),
}))
```

---

## 6. API Integration

### 6.1 Axios Instance

```typescript
// src/services/api.ts
import axios from 'axios'
import { useAuthStore } from '@stores/authStore'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8080/api/v1',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const { accessToken } = useAuthStore.getState()
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      const { logout } = useAuthStore.getState()
      logout()
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default api
```

### 6.2 Vehicle Service

```typescript
// src/services/vehicleService.ts
import api from './api'
import type { Vehicle, CreateVehicleRequest } from '@types/models'

export const vehicleService = {
  getAll: async (params?: { page?: number; limit?: number; status?: string }) => {
    const { data } = await api.get('/vehicles', { params })
    return data.data
  },

  getAllWithPositions: async () => {
    const { data } = await api.get('/tracking/vehicles/positions')
    return data.data
  },

  getById: async (id: string) => {
    const { data } = await api.get(`/vehicles/${id}`)
    return data.data
  },

  create: async (vehicle: CreateVehicleRequest) => {
    const { data } = await api.post('/vehicles', vehicle)
    return data.data
  },

  update: async (id: string, vehicle: Partial<Vehicle>) => {
    const { data } = await api.put(`/vehicles/${id}`, vehicle)
    return data.data
  },

  delete: async (id: string) => {
    await api.delete(`/vehicles/${id}`)
  },

  assignDriver: async (vehicleId: string, driverId: string) => {
    const { data } = await api.post(`/vehicles/${vehicleId}/assign`, { driver_id: driverId })
    return data.data
  },

  unassignDriver: async (vehicleId: string) => {
    const { data} = await api.post(`/vehicles/${vehicleId}/unassign`)
    return data.data
  },
}
```

---

## 7. Real-Time Features

### 7.1 WebSocket Hook

```typescript
// src/hooks/useWebSocket.ts
import { useEffect, useRef, useState } from 'react'

interface UseWebSocketOptions {
  onMessage?: (event: MessageEvent) => void
  onOpen?: (event: Event) => void
  onClose?: (event: CloseEvent) => void
  onError?: (event: Event) => void
  shouldReconnect?: boolean
  reconnectAttempts?: number
  reconnectInterval?: number
}

export const useWebSocket = (url: string, options: UseWebSocketOptions = {}) => {
  const [socket, setSocket] = useState<WebSocket | null>(null)
  const [lastMessage, setLastMessage] = useState<MessageEvent | null>(null)
  const [readyState, setReadyState] = useState<number>(WebSocket.CONNECTING)
  const reconnectAttemptsRef = useRef(0)
  const maxReconnectAttempts = options.reconnectAttempts || 5
  const reconnectInterval = options.reconnectInterval || 3000

  const connect = () => {
    try {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
      const wsUrl = `${protocol}//${window.location.host}${url}`
      const ws = new WebSocket(wsUrl)

      ws.onopen = (event) => {
        setReadyState(WebSocket.OPEN)
        reconnectAttemptsRef.current = 0
        options.onOpen?.(event)
      }

      ws.onmessage = (event) => {
        setLastMessage(event)
        options.onMessage?.(event)
      }

      ws.onclose = (event) => {
        setReadyState(WebSocket.CLOSED)
        options.onClose?.(event)

        // Attempt to reconnect
        if (options.shouldReconnect !== false && reconnectAttemptsRef.current < maxReconnectAttempts) {
          setTimeout(() => {
            reconnectAttemptsRef.current++
            connect()
          }, reconnectInterval)
        }
      }

      ws.onerror = (event) => {
        setReadyState(WebSocket.CLOSED)
        options.onError?.(event)
      }

      setSocket(ws)
    } catch (error) {
      console.error('WebSocket connection failed:', error)
    }
  }

  useEffect(() => {
    connect()

    return () => {
      socket?.close()
    }
  }, [url])

  const sendMessage = (message: string | object) => {
    if (socket && readyState === WebSocket.OPEN) {
      const data = typeof message === 'string' ? message : JSON.stringify(message)
      socket.send(data)
    }
  }

  return {
    socket,
    lastMessage,
    readyState,
    sendMessage,
  }
}
```

---

## 8. Indonesian Localization

### 8.1 Currency Formatting

```typescript
// src/utils/format.ts
import numeral from 'numeral'

export const formatIDR = (amount: number): string => {
  // Indonesian Rupiah format: Rp 1.000.000,00
  return `Rp ${numeral(amount).format('0,0.00').replace(/,/g, '.')}`
}

export const formatIDRShort = (amount: number): string => {
  // Short format: Rp 1,5 juta (1.5 million)
  if (amount >= 1000000) {
    return `Rp ${(amount / 1000000).toFixed(1)} juta`
  }
  if (amount >= 1000) {
    return `Rp ${(amount / 1000).toFixed(1)} ribu`
  }
  return `Rp ${amount}`
}

export const formatDate = (date: string | Date): string => {
  // Indonesian date format: DD/MM/YYYY
  const d = new Date(date)
  const day = String(d.getDate()).padStart(2, '0')
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const year = d.getFullYear()
  return `${day}/${month}/${year}`
}

export const formatDateTime = (date: string | Date): string => {
  // Indonesian datetime format: DD/MM/YYYY HH:mm WIB
  const d = new Date(date)
  return `${formatDate(d)} ${d.getHours()}:${String(d.getMinutes()).padStart(2, '0')} WIB`
}

export const formatRelativeTime = (date: string | Date): string => {
  // Relative time in Bahasa Indonesia
  const d = new Date(date)
  const now = new Date()
  const diff = now.getTime() - d.getTime()
  const seconds = Math.floor(diff / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)

  if (seconds < 60) return `${seconds} detik yang lalu`
  if (minutes < 60) return `${minutes} menit yang lalu`
  if (hours < 24) return `${hours} jam yang lalu`
  if (days < 7) return `${days} hari yang lalu`
  return formatDate(date)
}
```

---

## 9. Testing Strategy

### 9.1 Unit Testing

```typescript
// src/components/__tests__/VehicleCard.test.tsx
import { render, screen } from '@testing-library/react'
import { vi } from 'vitest'
import VehicleCard from '../VehicleCard'

describe('VehicleCard', () => {
  const mockVehicle = {
    id: '1',
    license_plate: 'B 1234 ABC',
    brand: 'Toyota',
    model: 'Avanza',
    status: 'active',
    current_speed: 45,
    driver_name: 'John Doe',
  }

  it('renders vehicle information correctly', () => {
    render(<VehicleCard vehicle={mockVehicle} />)
    
    expect(screen.getByText('B 1234 ABC')).toBeInTheDocument()
    expect(screen.getByText('Toyota Avanza')).toBeInTheDocument()
    expect(screen.getByText('John Doe')).toBeInTheDocument()
    expect(screen.getByText('45 km/h')).toBeInTheDocument()
  })

  it('displays correct status badge', () => {
    render(<VehicleCard vehicle={mockVehicle} />)
    
    const statusBadge = screen.getByText('Aktif')
    expect(statusBadge).toHaveClass('bg-green-100')
  })
})
```

---

## 10. Deployment

### 10.1 Build for Production

```bash
# Build production bundle
npm run build

# Preview production build
npm run preview
```

### 10.2 Nginx Configuration

```nginx
server {
    listen 80;
    server_name fleettracker.id;
    root /var/www/fleettracker-frontend/dist;
    index index.html;

    # Gzip compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # SPA fallback
    location / {
        try_files $uri $uri/ /index.html;
    }

    # API proxy
    location /api {
        proxy_pass http://localhost:8080;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # WebSocket proxy
    location /ws {
        proxy_pass http://localhost:8080;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
    }
}
```

---

## 11. Implementation Plan

### 11.1 Phase 1: Core Setup (Weeks 1-2)
- ✅ Project setup (Vite, TypeScript, dependencies)
- 🚧 Authentication UI (login, password change)
- 🚧 Layout components (header, sidebar, footer)
- 🚧 API service layer setup
- 🚧 Auth store implementation
- 🚧 Protected route implementation

### 11.2 Phase 2: Dashboard & Map (Weeks 3-4)
- 🚧 Main dashboard with KPI cards
- 🚧 Live fleet map with Leaflet/Google Maps
- 🚧 WebSocket integration for real-time updates
- 🚧 Vehicle markers with status colors
- 🚧 Map filters and search

### 11.3 Phase 3: Fleet Management (Weeks 5-6)
- 🚧 Vehicle list page (table view)
- 🚧 Vehicle create/edit forms
- 🚧 Indonesian validation (STNK, BPKB)
- 🚧 Driver list page
- 🚧 Driver create/edit forms
- 🚧 Indonesian validation (NIK, SIM)

### 11.4 Phase 4: Analytics & Reports (Weeks 7-8)
- 🚧 Fuel analytics dashboard
- 🚧 Driver performance charts
- 🚧 Vehicle utilization reports
- 🚧 Export functionality (PDF, CSV)
- 🚧 Custom report builder

### 11.5 Phase 5: Payments & Admin (Weeks 9-10)
- 🚧 Invoice list and detail pages
- 🚧 Payment confirmation workflow
- 🚧 Admin panel (user management)
- 🚧 Company settings
- 🚧 Notification center

### 11.6 Phase 6: Polish & Testing (Weeks 11-12)
- 🚧 Mobile responsive optimization
- 🚧 Accessibility testing (WCAG 2.1 AA)
- 🚧 Performance optimization
- 🚧 Cross-browser testing
- 🚧 User acceptance testing
- 🚧 Bug fixes and polish

**Total Timeline**: 12 weeks (3 months)

---

## Conclusion

The FleetTracker Pro frontend is **ready to start development**. All core technologies have been selected, architecture has been planned, and a detailed implementation roadmap has been created.

**Key Planning Achievements:**
- ✅ Technology stack finalized (Vite, React, TypeScript, TanStack Query)
- ✅ Project structure defined with clear separation of concerns
- ✅ API integration strategy planned
- ✅ Indonesian localization requirements documented
- ✅ 12-week implementation timeline created

**Next Steps**:
1. Initialize Vite project with React + TypeScript
2. Setup Tailwind CSS and UI component library
3. Implement authentication flow
4. Build main dashboard and fleet map
5. Develop CRUD interfaces for vehicles and drivers
6. Create analytics and reporting dashboards
7. Implement payment interface
8. Polish, test, and deploy

---

**Document Approval:**
- Frontend Lead: [Name]
- UX/UI Designer: [Name]
- Product Manager: [Name]

**Last Updated**: October 10, 2025  
**Next Review**: November 2025  
**Status**: 🚧 **IN PLANNING - READY TO START DEVELOPMENT**

