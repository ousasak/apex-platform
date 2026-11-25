import apiClient from '../api/client'

export const approvalService = {
  getApprovalRequests: (params) => apiClient.get('/admin/approval-requests', { params }),
  approveRequest: (id, data) => apiClient.post(`/admin/approval-requests/${id}/approve`, data),
  rejectRequest: (id, data) => apiClient.post(`/admin/approval-requests/${id}/reject`, data),
}

export default approvalService
