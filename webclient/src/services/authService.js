import apiClient from '../api/client'

export const authService = {
  login: (credentials) => apiClient.post('/auth/login', credentials),
  register: (formData) => apiClient.post('/auth/register', formData),
  logout: () => apiClient.post('/auth/logout', {}, { _skip401Handler: true }),
  me: () => apiClient.get('/auth/me'),
  forgotPassword: (data) => apiClient.post('/auth/forgot-password', data),
  resetPassword: (data) => apiClient.post('/auth/reset-password', data),
}

export default authService
