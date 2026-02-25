export interface Company {
  id: string
  name: string
  email: string
  phone?: string
  npwp?: string
  city?: string
  province?: string
  country: string
  subscription_plan: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface User {
  id: string
  email: string
  username: string
  first_name: string
  last_name: string
  phone?: string
  role: UserRole
  company_id: string
  is_active: boolean
  is_verified: boolean
  must_change_password: boolean
  last_login_at?: string
  created_at: string
}

export type UserRole = 'super-admin' | 'owner' | 'admin' | 'operator' | 'driver'

export interface Vehicle {
  id: string
  company_id: string
  license_plate: string
  vin: string
  make?: string
  model?: string
  year?: number
  color: string
  fuel_type: string
  status: VehicleStatus
  is_active: boolean
  driver_id?: string
  odometer_reading: number
  stnk_number: string
  bpkb_number: string
  insurance_policy_number: string
  created_at: string
  updated_at: string
}

export type VehicleStatus = 'active' | 'inactive' | 'maintenance' | 'retired'

export interface Driver {
  id: string
  company_id: string
  name: string
  email: string
  phone: string
  nik: string
  sim_number: string
  sim_type: string
  sim_expiry: string
  status: DriverStatus
  is_active: boolean
  vehicle_id?: string
  performance_score: number
  total_trips: number
  total_distance: number
  created_at: string
  updated_at: string
}

export type DriverStatus = 'available' | 'on_duty' | 'off_duty' | 'suspended'

export interface GPSTrack {
  id: string
  vehicle_id: string
  latitude: number
  longitude: number
  speed: number
  heading: number
  timestamp: string
}

export interface Trip {
  id: string
  vehicle_id: string
  driver_id: string
  start_time: string
  end_time?: string
  start_location: string
  end_location?: string
  distance: number
  status: 'in_progress' | 'completed' | 'cancelled'
}

export interface Invoice {
  id: string
  company_id: string
  invoice_number: string
  amount: number
  tax_amount: number
  total_amount: number
  status: 'pending' | 'paid' | 'overdue' | 'cancelled'
  due_date: string
  created_at: string
}
