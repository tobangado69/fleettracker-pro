import { useQuery } from '@tanstack/react-query'
import { Truck, Users, Fuel, AlertTriangle, MapPin } from 'lucide-react'
import { KPICard } from '@/components/ui/KPICard'
import { vehicleService } from '@/services/vehicleService'
import { driverService } from '@/services/driverService'
import { formatNumber } from '@/utils/format'

export function DashboardPage() {
  const { data: vehiclesData } = useQuery({
    queryKey: ['vehicles'],
    queryFn: () => vehicleService.list({ limit: 1 }),
  })

  const { data: driversData } = useQuery({
    queryKey: ['drivers'],
    queryFn: () => driverService.list({ limit: 1 }),
  })

  const totalVehicles = vehiclesData?.meta?.total ?? 0
  const totalDrivers = driversData?.meta?.total ?? 0

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-500">Selamat datang di FleetTracker Pro</p>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <KPICard
          title="Total Kendaraan"
          value={formatNumber(totalVehicles)}
          subtitle="Armada terdaftar"
          icon={Truck}
          color="bg-blue-600"
        />
        <KPICard
          title="Pengemudi Aktif"
          value={formatNumber(totalDrivers)}
          subtitle="Pengemudi terdaftar"
          icon={Users}
          color="bg-green-600"
        />
        <KPICard
          title="Konsumsi BBM Hari Ini"
          value="0 L"
          subtitle="Rp 0"
          icon={Fuel}
          color="bg-orange-500"
        />
        <KPICard
          title="Pelanggaran"
          value="0"
          subtitle="Hari ini"
          icon={AlertTriangle}
          color="bg-red-500"
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="col-span-2 rounded-xl border bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">Peta Armada</h2>
          <div className="flex h-96 items-center justify-center rounded-lg bg-gray-100 text-gray-500">
            <div className="text-center">
              <MapPin className="mx-auto h-12 w-12 text-gray-300" />
              <p className="mt-2 text-sm">Peta pelacakan real-time</p>
              <p className="text-xs text-gray-400">Tambahkan kendaraan untuk memulai pelacakan</p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">Aktivitas Terbaru</h2>
          <div className="space-y-3">
            <div className="flex items-center gap-3 rounded-lg bg-gray-50 p-3">
              <div className="h-2 w-2 rounded-full bg-green-500" />
              <div>
                <p className="text-sm font-medium text-gray-900">Sistem aktif</p>
                <p className="text-xs text-gray-500">Semua layanan berjalan normal</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
