import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard, Truck, Users, MapPin, BarChart3, CreditCard,
  Settings, LogOut, ChevronLeft, ChevronRight
} from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'
import { useUIStore } from '@/stores/uiStore'
import { authService } from '@/services/authService'

const navigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Kendaraan', href: '/vehicles', icon: Truck },
  { name: 'Pengemudi', href: '/drivers', icon: Users },
  { name: 'Pelacakan', href: '/tracking', icon: MapPin },
  { name: 'Analitik', href: '/analytics', icon: BarChart3 },
  { name: 'Pembayaran', href: '/payments', icon: CreditCard },
  { name: 'Pengaturan', href: '/settings', icon: Settings },
]

export function Sidebar() {
  const { logout } = useAuthStore()
  const { sidebarCollapsed, toggleSidebarCollapse } = useUIStore()

  const handleLogout = async () => {
    await authService.logout()
    logout()
  }

  return (
    <aside className={`fixed inset-y-0 left-0 z-50 flex flex-col bg-gray-900 text-white transition-all duration-300 ${sidebarCollapsed ? 'w-16' : 'w-64'}`}>
      <div className="flex h-16 items-center justify-between px-4 border-b border-gray-800">
        {!sidebarCollapsed && (
          <div className="flex items-center gap-2">
            <Truck className="h-8 w-8 text-blue-400" />
            <span className="text-lg font-bold">FleetTracker</span>
          </div>
        )}
        <button onClick={toggleSidebarCollapse} className="p-1 rounded hover:bg-gray-800">
          {sidebarCollapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto py-4">
        {navigation.map((item) => (
          <NavLink
            key={item.name}
            to={item.href}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors ${
                isActive ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-800 hover:text-white'
              }`
            }
          >
            <item.icon className="h-5 w-5 shrink-0" />
            {!sidebarCollapsed && <span>{item.name}</span>}
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-gray-800 p-4">
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 px-4 py-2 text-sm text-gray-300 hover:bg-gray-800 hover:text-white rounded"
        >
          <LogOut className="h-5 w-5" />
          {!sidebarCollapsed && <span>Keluar</span>}
        </button>
      </div>
    </aside>
  )
}
