import { ChevronLeft, ChevronRight } from 'lucide-react'
import type { PaginationMeta } from '@/types/api'

interface PaginationProps {
  meta: PaginationMeta
  onPageChange: (page: number) => void
}

export function Pagination({ meta, onPageChange }: PaginationProps) {
  return (
    <div className="flex items-center justify-between border-t bg-white px-6 py-3">
      <p className="text-sm text-gray-500">
        Menampilkan {((meta.page - 1) * meta.limit) + 1} - {Math.min(meta.page * meta.limit, meta.total)} dari {meta.total}
      </p>
      <div className="flex gap-2">
        <button
          onClick={() => onPageChange(meta.page - 1)}
          disabled={!meta.has_previous}
          className="inline-flex items-center rounded border px-3 py-1 text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
        >
          <ChevronLeft className="h-4 w-4" /> Sebelumnya
        </button>
        <button
          onClick={() => onPageChange(meta.page + 1)}
          disabled={!meta.has_next}
          className="inline-flex items-center rounded border px-3 py-1 text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
        >
          Berikutnya <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}
