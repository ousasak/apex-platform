import apiClient from '../api/client'

export const userService = {
  getUsers: (params) => apiClient.get('/admin/users', { params }),
  getUser: (id) => apiClient.get(`/admin/users/${id}`),
  createUser: (data) => apiClient.post('/admin/users', data),
  updateUser: (id, data) => apiClient.put(`/admin/users/${id}`, data),
  deleteUser: (id) => apiClient.delete(`/admin/users/${id}`),
  toggleUserActive: (id) => apiClient.put(`/admin/users/${id}/toggle-active`),
  getUserPermissions: (userId) => apiClient.get(`/admin/users/${userId}/permissions`),
  updateUserPermissions: (userId, data) => apiClient.put(`/admin/users/${userId}/permissions`, data),

  // Public Profile
  getPublicProfile: (username) => apiClient.get(`/users/${encodeURIComponent(username)}`),
  getProfileBlogPosts: (username, params) =>
    apiClient.get(`/users/${encodeURIComponent(username)}/blog-posts`, { params }),
  getProfileProjects: (username, params) =>
    apiClient.get(`/users/${encodeURIComponent(username)}/projects`, { params }),
}

export default userService
