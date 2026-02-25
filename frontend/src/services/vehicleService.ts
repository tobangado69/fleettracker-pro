import api from './api'
import type { PaginatedResponse, ApiResponse } from '@/types/api'
import type { Vehicle } from '@/types/models'

export const vehicleService = {
  async list(params?: { page?: number; limit?: number; status?: string; search?: string }): Promise<PaginatedResponse<Vehicle>> {
    const response = await api.get<PaginatedResponse<Vehicle>>('/vehicles', { params })
    return response.data
  },

  async getById(id: string): Promise<ApiResponse<Vehicle>> {
    const response = await api.get<ApiResponse<Vehicle>>(`/vehicles/${id}`)
    return response.data
  },

  async create(data: Partial<Vehicle>): Promise<ApiResponse<Vehicle>> {
    const response = await api.post<ApiResponse<Vehicle>>('/vehicles', data)
    return response.data
  },

  async update(id: string, data: Partial<Vehicle>): Promise<ApiResponse<Vehicle>> {
    const response = await api.put<ApiResponse<Vehicle>>(`/vehicles/${id}`, data)
    return response.data
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/vehicles/${id}`)
  },
}
