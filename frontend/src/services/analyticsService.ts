import api from './api'

export const analyticsService = {
  async getDashboard(): Promise<unknown> {
    const response = await api.get('/analytics/dashboard')
    return response.data
  },

  async getFuelConsumption(params?: { start_date?: string; end_date?: string }): Promise<unknown> {
    const response = await api.get('/analytics/fuel/consumption', { params })
    return response.data
  },

  async getDriverPerformance(): Promise<unknown> {
    const response = await api.get('/analytics/drivers/performance')
    return response.data
  },

  async getFleetUtilization(): Promise<unknown> {
    const response = await api.get('/analytics/fleet/utilization')
    return response.data
  },
}
