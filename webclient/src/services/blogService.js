import apiClient from '../api/client'
import i18n from '../lib/i18n'

export const blogService = {
  // Public
  getPosts: (params) => apiClient.get('/blog/posts', { params }),
  getPost: (slug) => {
    if (!slug || slug === 'undefined' || slug === 'null') {
      return Promise.reject(new Error(i18n.t('api.missingBlogSlug', { ns: 'common' })))
    }
    return apiClient.get(`/blog/posts/${encodeURIComponent(slug)}`)
  },
  getCategories: () => apiClient.get('/blog/categories'),

  // Admin
  getAdminPosts: (params) => apiClient.get('/admin/blog/posts', { params }),
  getAdminPost: (id) => apiClient.get(`/admin/blog/posts/${id}`),
  createPost: (data) =>
    apiClient.post('/admin/blog/posts', data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  updatePost: (id, data) =>
    apiClient.post(`/admin/blog/posts/${id}`, data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  deletePost: (id) => apiClient.delete(`/admin/blog/posts/${id}`),

  getAdminCategories: () => apiClient.get('/admin/blog/categories'),
  createCategory: (data) => apiClient.post('/admin/blog/categories', data),
  updateCategory: (id, data) => apiClient.put(`/admin/blog/categories/${id}`, data),
  deleteCategory: (id) => apiClient.delete(`/admin/blog/categories/${id}`),
}

export default blogService
