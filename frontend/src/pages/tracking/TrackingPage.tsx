import { MapPin, Radio } from 'lucide-react'

export function TrackingPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Pelacakan GPS</h1>
          <p className="text-sm text-gray-500">Pantau lokasi armada secara real-time</p>
        </div>
        <div className="flex items-center gap-2 rounded-lg bg-green-50 px-3 py-1.5 text-sm text-green-700">
          <Radio className="h-4 w-4 animate-pulse" />
          <span>Live</span>
        </div>
      </div>

      <div className="rounded-xl border bg-white shadow-sm overflow-hidden">
        <div className="flex h-[600px] items-center justify-center bg-gray-100 text-gray-500">
          <div className="text-center">
            <MapPin className="mx-auto h-16 w-16 text-gray-300" />
            <p className="mt-4 text-lg font-medium">Peta Pelacakan Real-Time</p>
            <p className="mt-1 text-sm text-gray-400">Tambahkan kendaraan dengan GPS untuk memulai pelacakan</p>
          </div>
        </div>
      </div>
    </div>
  )
}
