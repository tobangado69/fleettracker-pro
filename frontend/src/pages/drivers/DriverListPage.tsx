import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Plus, Search } from 'lucide-react'
import { driverService } from '@/services/driverService'
import { DataTable } from '@/components/ui/DataTable'
import { Pagination } from '@/components/ui/Pagination'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { DRIVER_STATUS_LABELS, DRIVER_STATUS_COLORS } from '@/utils/constants'
import { formatDate } from '@/utils/format'
import type { Driver } from '@/types/models'

export function DriverListPage() {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')

  const { data, isLoading } = useQuery({
    queryKey: ['drivers', page, search],
    queryFn: () => driverService.list({ page, limit: 20, search: search || undefined }),
  })

  const columns = [
    {
      key: 'name',
      label: 'Nama',
      render: (d: Driver) => <span className="font-medium">{d.name}</span>,
    },
    { key: 'phone', label: 'Telepon' },
    { key: 'sim_number', label: 'No. SIM' },
    { key: 'sim_type', label: 'Tipe SIM' },
    {
      key: 'performance_score',
      label: 'Skor',
      render: (d: Driver) => (
        <span className={`font-medium ${d.performance_score >= 80 ? 'text-green-600' : d.performance_score >= 60 ? 'text-yellow-600' : 'text-red-600'}`}>
          {d.performance_score}
        </span>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (d: Driver) => (
        <StatusBadge status={d.status} colorMap={DRIVER_STATUS_COLORS} labelMap={DRIVER_STATUS_LABELS} />
      ),
    },
    {
      key: 'created_at',
      label: 'Terdaftar',
      render: (d: Driver) => formatDate(d.created_at),
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Pengemudi</h1>
          <p className="text-sm text-gray-500">Kelola pengemudi armada Anda</p>
        </div>
        <button className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
          <Plus className="h-4 w-4" /> Tambah Pengemudi
        </button>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1) }}
            placeholder="Cari nama, telepon, SIM..."
            className="w-full rounded-lg border border-gray-300 py-2 pl-10 pr-4 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
          />
        </div>
      </div>

      <DataTable columns={columns} data={data?.data ?? []} loading={isLoading} emptyMessage="Belum ada pengemudi terdaftar" />
      {data?.meta && <Pagination meta={data.meta} onPageChange={setPage} />}
    </div>
  )
}
