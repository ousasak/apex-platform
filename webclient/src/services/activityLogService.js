import apiClient from '../api/client'

export const activityLogService = {
  getActivityLogs: (params) => apiClient.get('/admin/activity-logs', { params }),
}

export default activityLogService
