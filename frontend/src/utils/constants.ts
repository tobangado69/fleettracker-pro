export const API_BASE_URL = '/api/v1'

export const ROLES = {
  SUPER_ADMIN: 'super-admin',
  OWNER: 'owner',
  ADMIN: 'admin',
  OPERATOR: 'operator',
  DRIVER: 'driver',
} as const

export const ROLE_LABELS: Record<string, string> = {
  'super-admin': 'Super Admin',
  owner: 'Pemilik',
  admin: 'Administrator',
  operator: 'Operator',
  driver: 'Pengemudi',
}

export const VEHICLE_STATUS_LABELS: Record<string, string> = {
  active: 'Aktif',
  inactive: 'Tidak Aktif',
  maintenance: 'Perawatan',
  retired: 'Pensiun',
}

export const VEHICLE_STATUS_COLORS: Record<string, string> = {
  active: 'bg-green-100 text-green-800',
  inactive: 'bg-gray-100 text-gray-800',
  maintenance: 'bg-yellow-100 text-yellow-800',
  retired: 'bg-red-100 text-red-800',
}

export const DRIVER_STATUS_LABELS: Record<string, string> = {
  available: 'Tersedia',
  on_duty: 'Bertugas',
  off_duty: 'Istirahat',
  suspended: 'Ditangguhkan',
}

export const DRIVER_STATUS_COLORS: Record<string, string> = {
  available: 'bg-green-100 text-green-800',
  on_duty: 'bg-blue-100 text-blue-800',
  off_duty: 'bg-gray-100 text-gray-800',
  suspended: 'bg-red-100 text-red-800',
}

export const FUEL_TYPES: Record<string, string> = {
  pertalite: 'Pertalite (RON 90)',
  pertamax: 'Pertamax (RON 92)',
  pertamax_turbo: 'Pertamax Turbo (RON 98)',
  solar: 'Solar',
  biosolar: 'Biosolar',
  dexlite: 'Dexlite',
  pertamina_dex: 'Pertamina Dex',
}
