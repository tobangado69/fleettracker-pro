import { Menu, Bell } from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'
import { useUIStore } from '@/stores/uiStore'
import { ROLE_LABELS } from '@/utils/constants'

export function Header() {
  const { user } = useAuthStore()
  const { toggleSidebar } = useUIStore()

  return (
    <header className="sticky top-0 z-40 flex h-16 items-center gap-4 border-b bg-white px-6 shadow-sm">
      <button onClick={toggleSidebar} className="lg:hidden p-2 rounded hover:bg-gray-100">
        <Menu className="h-5 w-5" />
      </button>

      <div className="flex-1" />

      <button className="relative p-2 rounded-full hover:bg-gray-100">
        <Bell className="h-5 w-5 text-gray-600" />
        <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-red-500" />
      </button>

      <div className="flex items-center gap-3 border-l pl-4">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-white text-sm font-medium">
          {user?.first_name?.[0]}{user?.last_name?.[0]}
        </div>
        <div className="hidden sm:block">
          <p className="text-sm font-medium text-gray-900">{user?.first_name} {user?.last_name}</p>
          <p className="text-xs text-gray-500">{user?.role ? ROLE_LABELS[user.role] || user.role : ''}</p>
        </div>
      </div>
    </header>
  )
}
