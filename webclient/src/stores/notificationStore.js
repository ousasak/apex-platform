import { create } from 'zustand'
import apiClient from '../api/client'

export const useNotificationStore = create((set, get) => ({
  notifications: [],
  unreadCount: 0,
  loading: false,
  meta: { current_page: 1, last_page: 1, total: 0 },

  fetchNotifications: async (page = 1) => {
    set({ loading: true })
    try {
      const { data } = await apiClient.get('/member/notifications', { params: { page } })
      set({
        notifications: data.data || [],
        unreadCount: data.unread_count || 0,
        meta: data.meta || get().meta,
      })
      return data
    } catch (err) {
      return null
    } finally {
      set({ loading: false })
    }
  },

  fetchUnreadCount: async () => {
    try {
      const { data } = await apiClient.get('/member/notifications/unread-count')
      const count = data.unread_count || 0
      set({ unreadCount: count })
      return count
    } catch (err) {
      return 0
    }
  },

  markAsRead: async (id) => {
    try {
      await apiClient.put(`/member/notifications/${id}/read`)
      set((state) => ({
        notifications: state.notifications.map((n) =>
          n.id === id ? { ...n, read_at: new Date().toISOString() } : n
        ),
        unreadCount: Math.max(0, state.unreadCount - 1),
      }))
    } catch (err) {
      /* ignore */
    }
  },

  markAllRead: async () => {
    try {
      await apiClient.put('/member/notifications/read-all')
      set((state) => ({
        notifications: state.notifications.map((n) => ({
          ...n,
          read_at: n.read_at || new Date().toISOString(),
        })),
        unreadCount: 0,
      }))
    } catch (err) {
      /* ignore */
    }
  },

  deleteNotification: async (id) => {
    try {
      await apiClient.delete(`/member/notifications/${id}`)
      set((state) => {
        const item = state.notifications.find((n) => n.id === id)
        const unreadDecrement = item && !item.read_at ? 1 : 0
        return {
          notifications: state.notifications.filter((n) => n.id !== id),
          unreadCount: Math.max(0, state.unreadCount - unreadDecrement),
        }
      })
    } catch (err) {
      /* ignore */
    }
  },

  reset: () => {
    set({
      notifications: [],
      unreadCount: 0,
      loading: false,
      meta: { current_page: 1, last_page: 1, total: 0 },
    })
  },
}))

export default useNotificationStore
