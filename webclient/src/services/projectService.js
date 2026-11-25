import apiClient from '../api/client'

export const projectService = {
  // Public
  getProjects: (params) => apiClient.get('/projects', { params }),
  getProject: (slug) => apiClient.get(`/projects/${slug}`),

  // Admin
  getAdminProjects: (params) => apiClient.get('/admin/projects', { params }),
  getAdminProject: (id) => apiClient.get(`/admin/projects/${id}`),
  createProject: (formData) =>
    apiClient.post('/admin/projects', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  updateProject: (id, formData) =>
    apiClient.post(`/admin/projects/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  deleteProject: (id) => apiClient.delete(`/admin/projects/${id}`),
}

export default projectService
