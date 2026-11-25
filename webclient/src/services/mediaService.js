import apiClient from '../api/client'

export const mediaService = {
  getMedia: (params) => apiClient.get('/admin/media', { params }),
  uploadMedia: (formData) =>
    apiClient.post('/admin/media/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  deleteMedia: (id) => apiClient.delete(`/admin/media/${id}`),
}

export default mediaService
