import apiClient from '../api/client'

export const portfolioService = {
  // Public
  getSkills: (params) => apiClient.get('/skills', { params }),
  getExperiences: (params) => apiClient.get('/experiences', { params }),
  getServices: (params) => apiClient.get('/services', { params }),
  getResumeDownloadUrl: () => '/api/resume/download',

  // Admin - Skills
  getAdminSkills: (params) => apiClient.get('/admin/skills', { params }),
  createSkill: (data) => apiClient.post('/admin/skills', data),
  updateSkill: (id, data) => apiClient.put(`/admin/skills/${id}`, data),
  deleteSkill: (id) => apiClient.delete(`/admin/skills/${id}`),
  reorderSkills: (data) => apiClient.post('/admin/skills/reorder', data),

  // Admin - Experiences
  getAdminExperiences: (params) => apiClient.get('/admin/experiences', { params }),
  createExperience: (data) => apiClient.post('/admin/experiences', data),
  updateExperience: (id, data) => apiClient.put(`/admin/experiences/${id}`, data),
  deleteExperience: (id) => apiClient.delete(`/admin/experiences/${id}`),

  // Admin - Services
  getAdminServices: (params) => apiClient.get('/admin/services', { params }),
  createService: (data) => apiClient.post('/admin/services', data),
  updateService: (id, data) => apiClient.put(`/admin/services/${id}`, data),
  deleteService: (id) => apiClient.delete(`/admin/services/${id}`),

  // Admin - Resume
  getResumeStatus: () => apiClient.get('/admin/resume/status'),
  uploadResume: (formData) =>
    apiClient.post('/admin/resume/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
}

export default portfolioService
