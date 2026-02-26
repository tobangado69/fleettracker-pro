import { CreditCard, FileText } from 'lucide-react'

export function PaymentListPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Pembayaran</h1>
          <p className="text-sm text-gray-500">Kelola invoice dan pembayaran</p>
        </div>
        <button className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
          <FileText className="h-4 w-4" /> Buat Invoice
        </button>
      </div>

      <div className="rounded-xl border bg-white p-12 shadow-sm text-center">
        <CreditCard className="mx-auto h-12 w-12 text-gray-300" />
        <p className="mt-4 text-gray-500">Belum ada invoice</p>
        <p className="text-sm text-gray-400">Buat invoice pertama Anda untuk mulai mengelola pembayaran</p>
      </div>
    </div>
  )
}
