import React, { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Bell, Check, Trash2, ExternalLink } from 'lucide-react'
import { useNotifications } from '../../hooks/useNotifications'

export default function NotificationsPage() {
  const { t, i18n } = useTranslation('users')
  const {
    notifications,
    loading,
    unreadCount,
    fetchNotifications,
    markAsRead,
    markAllRead,
    deleteNotification,
  } = useNotifications()
  const dateLocale = i18n.language?.startsWith('km') ? 'km-KH' : 'en-US'

  useEffect(() => {
    fetchNotifications()
  }, [fetchNotifications])

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2.5">
            <Bell className="w-6 h-6 text-brand-violet dark:text-brand-cyan" />
            {t('notifications.title')}
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {t('notifications.subtitle')}
          </p>
        </div>
        {unreadCount > 0 && (
          <button
            type="button"
            onClick={markAllRead}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg text-brand-violet dark:text-brand-cyan hover:bg-brand-violet/10 transition-colors"
          >
            <Check className="w-4 h-4" />
            {t('notifications.markAllRead')}
          </button>
        )}
      </div>

      {loading && notifications.length === 0 ? (
        <div className="flex justify-center py-16">
          <div className="w-8 h-8 rounded-full border-2 border-brand-violet border-t-transparent animate-spin" />
        </div>
      ) : notifications.length === 0 ? (
        <div className="text-center py-16 rounded-2xl border border-dashed border-gray-200 dark:border-dark-700 bg-white/50 dark:bg-dark-800/30">
          <Bell className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-gray-700 dark:text-gray-300">
            {t('notifications.empty.title')}
          </h3>
          <p className="text-xs text-gray-400 mt-1">
            {t('notifications.empty.message')}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((notif) => {
            const isUnread = !notif.read_at
            return (
              <div
                key={notif.id}
                className={`flex items-start justify-between gap-4 p-4 rounded-xl border transition-all ${
                  isUnread
                    ? 'bg-brand-violet/5 dark:bg-brand-violet/10 border-brand-violet/20 shadow-sm'
                    : 'bg-white dark:bg-dark-800/60 border-gray-100 dark:border-dark-700'
                }`}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-gray-900 dark:text-white">
                      {notif.title || notif.data?.title || t('notifications.defaultTitle')}
                    </span>
                    {isUnread && (
                      <span className="inline-block w-2 h-2 rounded-full bg-brand-violet dark:bg-brand-cyan" />
                    )}
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-300 mt-1">
                    {notif.message || notif.data?.message}
                  </p>
                  <span className="inline-block text-[10px] text-gray-400 mt-2">
                    {new Date(notif.created_at).toLocaleString(dateLocale)}
                  </span>
                </div>

                <div className="flex items-center gap-1">
                  {isUnread && (
                    <button
                      type="button"
                      onClick={() => markAsRead(notif.id)}
                      title={t('notifications.actions.markAsRead')}
                      aria-label={t('notifications.actions.markAsRead')}
                      className="p-1.5 rounded-lg text-gray-400 hover:text-brand-violet dark:hover:text-brand-cyan hover:bg-gray-100 dark:hover:bg-dark-700 transition-colors"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => deleteNotification(notif.id)}
                    title={t('common.delete')}
                    aria-label={t('common.delete')}
                    className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
