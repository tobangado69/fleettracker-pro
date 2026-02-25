import api from './api'
import type { PaginatedResponse, ApiResponse } from '@/types/api'
import type { Driver } from '@/types/models'

export const driverService = {
  async list(params?: { page?: number; limit?: number; status?: string; search?: string }): Promise<PaginatedResponse<Driver>> {
    const response = await api.get<PaginatedResponse<Driver>>('/drivers', { params })
    return response.data
  },

  async getById(id: string): Promise<ApiResponse<Driver>> {
    const response = await api.get<ApiResponse<Driver>>(`/drivers/${id}`)
    return response.data
  },

  async create(data: Partial<Driver>): Promise<ApiResponse<Driver>> {
    const response = await api.post<ApiResponse<Driver>>('/drivers', data)
    return response.data
  },

  async update(id: string, data: Partial<Driver>): Promise<ApiResponse<Driver>> {
    const response = await api.put<ApiResponse<Driver>>(`/drivers/${id}`, data)
    return response.data
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/drivers/${id}`)
  },
}
