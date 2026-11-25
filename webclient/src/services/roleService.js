import apiClient from '../api/client'

export const roleService = {
  getRoles: () => apiClient.get('/admin/roles'),
  createRole: (data) => apiClient.post('/admin/roles', data),
  updateRole: (id, data) => apiClient.put(`/admin/roles/${id}`, data),
  deleteRole: (id) => apiClient.delete(`/admin/roles/${id}`),
}

export default roleService
