import apiClient from '../api/client'

export const memberService = {
  getProfile: () => apiClient.get('/member/profile'),
  updateProfile: (data) => apiClient.put('/member/profile', data),
  updatePassword: (data) => apiClient.put('/member/password', data),
  getStorageSettings: () => apiClient.get('/member/storage-settings'),
  uploadAvatar: (formData) =>
    apiClient.post('/member/avatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  submitApplication: (data) => apiClient.post('/applications', data),

  // Notifications
  getNotifications: (params) => apiClient.get('/member/notifications', { params }),
  getUnreadCount: () => apiClient.get('/member/notifications/unread-count'),
  markNotificationRead: (id) => apiClient.put(`/member/notifications/${id}/read`),
  markAllNotificationsRead: () => apiClient.put('/member/notifications/read-all'),
  deleteNotification: (id) => apiClient.delete(`/member/notifications/${id}`),
}

export default memberService
