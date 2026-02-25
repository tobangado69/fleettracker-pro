import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Plus, Search } from 'lucide-react'
import { vehicleService } from '@/services/vehicleService'
import { DataTable } from '@/components/ui/DataTable'
import { Pagination } from '@/components/ui/Pagination'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { VEHICLE_STATUS_LABELS, VEHICLE_STATUS_COLORS } from '@/utils/constants'
import { formatDate, formatLicensePlate } from '@/utils/format'
import type { Vehicle } from '@/types/models'

export function VehicleListPage() {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')

  const { data, isLoading } = useQuery({
    queryKey: ['vehicles', page, search],
    queryFn: () => vehicleService.list({ page, limit: 20, search: search || undefined }),
  })

  const columns = [
    {
      key: 'license_plate',
      label: 'Plat Nomor',
      render: (v: Vehicle) => (
        <span className="font-medium text-blue-600">{formatLicensePlate(v.license_plate)}</span>
      ),
    },
    { key: 'make', label: 'Merek' },
    { key: 'model', label: 'Model' },
    { key: 'year', label: 'Tahun' },
    { key: 'fuel_type', label: 'BBM' },
    {
      key: 'status',
      label: 'Status',
      render: (v: Vehicle) => (
        <StatusBadge status={v.status} colorMap={VEHICLE_STATUS_COLORS} labelMap={VEHICLE_STATUS_LABELS} />
      ),
    },
    {
      key: 'created_at',
      label: 'Terdaftar',
      render: (v: Vehicle) => formatDate(v.created_at),
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Kendaraan</h1>
          <p className="text-sm text-gray-500">Kelola armada kendaraan Anda</p>
        </div>
        <button className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
          <Plus className="h-4 w-4" /> Tambah Kendaraan
        </button>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1) }}
            placeholder="Cari plat nomor, merek, model..."
            className="w-full rounded-lg border border-gray-300 py-2 pl-10 pr-4 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
          />
        </div>
      </div>

      <DataTable columns={columns} data={data?.data ?? []} loading={isLoading} emptyMessage="Belum ada kendaraan terdaftar" />
      {data?.meta && <Pagination meta={data.meta} onPageChange={setPage} />}
    </div>
  )
}
