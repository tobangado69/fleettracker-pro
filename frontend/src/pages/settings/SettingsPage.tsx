import { Settings, Building2, Users, Shield } from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'
import { ROLE_LABELS } from '@/utils/constants'

export function SettingsPage() {
  const { user } = useAuthStore()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Pengaturan</h1>
        <p className="text-sm text-gray-500">Kelola pengaturan akun dan perusahaan</p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-xl border bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <Settings className="h-5 w-5 text-gray-400" />
            <h2 className="text-lg font-semibold">Profil Saya</h2>
          </div>
          <div className="space-y-3">
            <div><span className="text-sm text-gray-500">Nama:</span> <span className="text-sm font-medium">{user?.first_name} {user?.last_name}</span></div>
            <div><span className="text-sm text-gray-500">Email:</span> <span className="text-sm font-medium">{user?.email}</span></div>
            <div><span className="text-sm text-gray-500">Peran:</span> <span className="text-sm font-medium">{user?.role ? ROLE_LABELS[user.role] || user.role : '-'}</span></div>
          </div>
        </div>

        <div className="rounded-xl border bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <Building2 className="h-5 w-5 text-gray-400" />
            <h2 className="text-lg font-semibold">Perusahaan</h2>
          </div>
          <p className="text-sm text-gray-500">Pengaturan perusahaan dan langganan</p>
        </div>

        <div className="rounded-xl border bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <Users className="h-5 w-5 text-gray-400" />
            <h2 className="text-lg font-semibold">Manajemen Pengguna</h2>
          </div>
          <p className="text-sm text-gray-500">Kelola pengguna dan undang anggota tim baru</p>
        </div>

        <div className="rounded-xl border bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <Shield className="h-5 w-5 text-gray-400" />
            <h2 className="text-lg font-semibold">Keamanan</h2>
          </div>
          <p className="text-sm text-gray-500">Ubah password dan kelola sesi aktif</p>
        </div>
      </div>
    </div>
  )
}
