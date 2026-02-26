import api from './api'
import type { LoginRequest, LoginResponse } from '@/types/api'
import type { User } from '@/types/models'

export const authService = {
  async login(data: LoginRequest): Promise<LoginResponse> {
    const response = await api.post<LoginResponse>('/auth/login', data)
    return response.data
  },

  async getProfile(): Promise<{ user: User }> {
    const response = await api.get<{ user: User }>('/auth/profile')
    return response.data
  },

  async changePassword(data: { current_password: string; new_password: string }): Promise<void> {
    await api.put('/auth/change-password', data)
  },

  async logout(): Promise<void> {
    try {
      await api.post('/auth/logout')
    } finally {
      localStorage.removeItem('access_token')
      localStorage.removeItem('refresh_token')
    }
  },
}
