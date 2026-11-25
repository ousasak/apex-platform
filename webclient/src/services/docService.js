import apiClient from '../api/client'

export const docService = {
  // Public
  getDocs: () => apiClient.get('/docs'),
  getDoc: (slug) => apiClient.get(`/docs/${slug}`),
  getDocsNav: () => apiClient.get('/docs/nav'),

  // Admin
  getAdminDocs: (params) => apiClient.get('/admin/docs', { params }),
  getAllAdminDocs: () => apiClient.get('/admin/docs/all'),
  getAdminDoc: (id) => apiClient.get(`/admin/docs/${id}`),
  createDoc: (data) => apiClient.post('/admin/docs', data),
  updateDoc: (id, data) => apiClient.put(`/admin/docs/${id}`, data),
  deleteDoc: (id) => apiClient.delete(`/admin/docs/${id}`),
  reorderDocs: (data) => apiClient.post('/admin/docs/reorder', data),

  getDocCategories: () => apiClient.get('/admin/docs/categories'),
  createDocCategory: (data) => apiClient.post('/admin/docs/categories', data),
  renameDocCategory: (data) => apiClient.post('/admin/docs/categories/rename', data),
  deleteDocCategory: (data) => apiClient.post('/admin/docs/categories/delete', data),

  getDocMenus: () => apiClient.get('/admin/doc-menus'),
  getDocMenusFlat: () => apiClient.get('/admin/doc-menus/flat'),
  createDocMenu: (data) => apiClient.post('/admin/doc-menus', data),
  updateDocMenu: (id, data) => apiClient.put(`/admin/doc-menus/${id}`, data),
  deleteDocMenu: (id) => apiClient.delete(`/admin/doc-menus/${id}`),
  reorderDocMenus: (data) => apiClient.post('/admin/doc-menus/reorder', data),
}

export default docService
