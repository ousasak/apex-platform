import { useEffect } from 'react'
import { useNotificationStore } from '../stores/notificationStore'
import { useAuthStore } from '../stores/authStore'

export function useNotifications() {
  const store = useNotificationStore()
  const isAuthenticated = useAuthStore((state) => !!state.token)

  useEffect(() => {
    if (!isAuthenticated) {
      store.reset()
      return
    }

    store.fetchUnreadCount()
    const interval = setInterval(() => {
      store.fetchUnreadCount()
    }, 30000)

    return () => clearInterval(interval)
  }, [isAuthenticated])

  return {
    notifications: store.notifications,
    unreadCount: store.unreadCount,
    loading: store.loading,
    meta: store.meta,
    fetchNotifications: store.fetchNotifications,
    fetchUnreadCount: store.fetchUnreadCount,
    markAsRead: store.markAsRead,
    markAllRead: store.markAllRead,
    deleteNotification: store.deleteNotification,
  }
}

export default useNotifications
