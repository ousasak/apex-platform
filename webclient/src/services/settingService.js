import apiClient from '../api/client'

export const settingService = {
  getPublicSettings: () => apiClient.get('/settings/public'),
  getAdminSettings: () => apiClient.get('/admin/settings'),
  updateSettings: (data) => apiClient.put('/admin/settings', data),
  getStorageSettings: () => apiClient.get('/admin/settings/storage'),
  getStorageStats: () => apiClient.get('/admin/storage-stats'),
  refreshStorageStats: () => apiClient.post('/admin/storage-stats/refresh'),
  getMyPermissions: () => apiClient.get('/admin/my-permissions'),
  getDashboardStats: () => apiClient.get('/admin/dashboard/stats'),
  getDashboardActivity: () => apiClient.get('/admin/dashboard/activity'),
}

export default settingService
