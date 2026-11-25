import React from 'react'
import { useTranslation } from 'react-i18next'

export default function EmptyState({
  title,
  message,
  loading = false,
}) {
  const { t } = useTranslation('common')
  const effectiveTitle = title ?? t('messages.noData')
  const effectiveMessage = message ?? t('messages.noItemsToDisplay')

  return (
    <div className="glass-card text-center py-12 px-6 rounded-2xl">
      {loading ? (
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-brand-violet/30 border-t-brand-violet rounded-full animate-spin" />
          <p className="text-gray-500 dark:text-gray-400">{t('actions.loading')}</p>
        </div>
      ) : (
        <div>
          <svg
            className="w-16 h-16 mx-auto text-gray-300 dark:text-gray-600 mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="1.5"
              d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
            />
          </svg>
          <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-1">{effectiveTitle}</h3>
          <p className="text-gray-500 dark:text-gray-400">{effectiveMessage}</p>
        </div>
      )}
    </div>
  )
}
