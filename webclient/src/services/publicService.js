import apiClient from '../api/client'

export const publicService = {
  getUserProfile: (username) => apiClient.get(`/users/${encodeURIComponent(username)}`),
  getProfileBlogPosts: (username, params) =>
    apiClient.get(`/users/${encodeURIComponent(username)}/blog-posts`, { params }),
  getProfileProjects: (username, params) =>
    apiClient.get(`/users/${encodeURIComponent(username)}/projects`, { params }),
  getPublicSeriesPage: (username, slug, params) =>
    apiClient.get(`/users/${encodeURIComponent(username)}/series/${encodeURIComponent(slug)}`, {
      params,
    }),
  getPublicCollectionPage: (username, slug, params) =>
    apiClient.get(`/users/${encodeURIComponent(username)}/collections/${encodeURIComponent(slug)}`, {
      params,
    }),
  getTeam: () => apiClient.get('/team'),
  getTags: () => apiClient.get('/tags'),
  getSettings: () => apiClient.get('/settings/public'),
  getStats: () => apiClient.get('/stats'),
  sendContact: (data) => apiClient.post('/contact', data),

  // Search
  adminSearch: (params) => apiClient.get('/admin/search', { params }),

  // Series & Collections Admin
  getSeries: (params) => apiClient.get('/admin/series', { params }),
  getAssignableSeries: () => apiClient.get('/admin/series/assignable'),
  createSeries: (data) => apiClient.post('/admin/series', data),
  updateSeries: (id, data) => apiClient.put(`/admin/series/${id}`, data),
  deleteSeries: (id) => apiClient.delete(`/admin/series/${id}`),

  getCollections: (params) => apiClient.get('/admin/collections', { params }),
  getAssignableCollections: () => apiClient.get('/admin/collections/assignable'),
  createCollection: (data) => apiClient.post('/admin/collections', data),
  updateCollection: (id, data) => apiClient.put(`/admin/collections/${id}`, data),
  deleteCollection: (id) => apiClient.delete(`/admin/collections/${id}`),

  // Applications & Messages
  getApplications: (params) => apiClient.get('/admin/applications', { params }),
  getApplication: (id) => apiClient.get(`/admin/applications/${id}`),
  updateApplicationStatus: (id, data) => apiClient.put(`/admin/applications/${id}/status`, data),

  getMessages: (params) => apiClient.get('/admin/messages', { params }),
  getMessage: (id) => apiClient.get(`/admin/messages/${id}`),
  markMessageRead: (id) => apiClient.put(`/admin/messages/${id}/read`),
  deleteMessage: (id) => apiClient.delete(`/admin/messages/${id}`),

  // Team Admin
  getTeamMembers: (params) => apiClient.get('/admin/team', { params }),
  createTeamMember: (formData) =>
    apiClient.post('/admin/team', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  updateTeamMember: (id, formData) =>
    apiClient.post(`/admin/team/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  deleteTeamMember: (id) => apiClient.delete(`/admin/team/${id}`),

  // Tags Admin
  getAdminTags: () => apiClient.get('/admin/tags'),
  createTag: (data) =>
    data instanceof FormData
      ? apiClient.post('/admin/tags', data, { headers: { 'Content-Type': 'multipart/form-data' } })
      : apiClient.post('/admin/tags', data),
  updateTag: (id, data) =>
    data instanceof FormData
      ? apiClient.post(`/admin/tags/${id}`, data, { headers: { 'Content-Type': 'multipart/form-data' } })
      : apiClient.put(`/admin/tags/${id}`, data),
  deleteTag: (id) => apiClient.delete(`/admin/tags/${id}`),
}

export default publicService
