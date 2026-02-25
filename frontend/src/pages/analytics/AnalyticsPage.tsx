import { BarChart3, Fuel, Users, TrendingUp } from 'lucide-react'

export function AnalyticsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Analitik</h1>
        <p className="text-sm text-gray-500">Laporan dan analisis armada</p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <a href="/analytics/fuel" className="group rounded-xl border bg-white p-6 shadow-sm hover:border-blue-300 hover:shadow-md transition-all">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-orange-100">
              <Fuel className="h-6 w-6 text-orange-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 group-hover:text-blue-600">Konsumsi BBM</h3>
              <p className="text-sm text-gray-500">Analisis penggunaan bahan bakar dan biaya</p>
            </div>
          </div>
        </a>

        <a href="/analytics/drivers" className="group rounded-xl border bg-white p-6 shadow-sm hover:border-blue-300 hover:shadow-md transition-all">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 group-hover:text-blue-600">Performa Pengemudi</h3>
              <p className="text-sm text-gray-500">Skor dan peringkat pengemudi</p>
            </div>
          </div>
        </a>

        <a href="/analytics/fleet" className="group rounded-xl border bg-white p-6 shadow-sm hover:border-blue-300 hover:shadow-md transition-all">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-100">
              <TrendingUp className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 group-hover:text-blue-600">Utilisasi Armada</h3>
              <p className="text-sm text-gray-500">Efisiensi dan penggunaan kendaraan</p>
            </div>
          </div>
        </a>

        <a href="/analytics/reports" className="group rounded-xl border bg-white p-6 shadow-sm hover:border-blue-300 hover:shadow-md transition-all">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-purple-100">
              <BarChart3 className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 group-hover:text-blue-600">Laporan</h3>
              <p className="text-sm text-gray-500">Buat dan ekspor laporan kepatuhan</p>
            </div>
          </div>
        </a>
      </div>
    </div>
  )
}
