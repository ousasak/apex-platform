import React from 'react'
import { useTranslation } from 'react-i18next'
import { useUi } from '@/contexts/UiContext'

export default function ToastNotification() {
  const { toasts, removeToast } = useUi()
  const { t } = useTranslation('common')

  const toastClasses = (type) => {
    switch (type) {
      case 'success':
        return 'border-l-4 border-l-green-500'
      case 'error':
        return 'border-l-4 border-l-red-500'
      case 'warning':
        return 'border-l-4 border-l-yellow-500'
      default:
        return 'border-l-4 border-l-blue-500'
    }
  }

  if (!toasts.length) return null

  return (
    <div className="fixed top-4 right-4 z-[100] space-y-3 pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`pointer-events-auto glass px-5 py-3 flex items-center gap-3 min-w-[280px] max-w-sm rounded-xl shadow-lg transition-all animate-slide-up bg-white/90 dark:bg-dark-800/95 text-gray-900 dark:text-white ${toastClasses(
            toast.type
          )}`}
        >
          {toast.type === 'success' && (
            <svg className="w-5 h-5 text-green-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
          )}
          {toast.type === 'error' && (
            <svg className="w-5 h-5 text-red-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          )}
          {toast.type !== 'success' && toast.type !== 'error' && (
            <svg className="w-5 h-5 text-blue-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          )}
          <p className="text-sm font-medium flex-1">{toast.message}</p>
          <button
            type="button"
            onClick={() => removeToast(toast.id)}
            aria-label={t('actions.close')}
            className="shrink-0 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      ))}
    </div>
  )
}
