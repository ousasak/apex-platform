import React, { useMemo } from 'react'
import { useTranslation } from 'react-i18next'

export default function Pagination({ currentPage = 1, lastPage, totalPages, onPageChange }) {
  const effectiveLastPage = Number(lastPage ?? totalPages ?? 1)
  const { t } = useTranslation('common')

  const displayedPages = useMemo(() => {
    const pages = []
    const total = effectiveLastPage
    const current = currentPage

    if (total <= 7) {
      for (let i = 1; i <= total; i++) pages.push(i)
    } else {
      pages.push(1)
      if (current > 3) pages.push('...')
      for (let i = Math.max(2, current - 1); i <= Math.min(total - 1, current + 1); i++) {
        pages.push(i)
      }
      if (current < total - 2) pages.push('...')
      pages.push(total)
    }
    return pages
  }, [currentPage, effectiveLastPage])

  if (effectiveLastPage <= 1) return null

  return (
    <div className="flex items-center justify-center gap-2 mt-8">
      <button
        type="button"
        disabled={currentPage <= 1}
        onClick={() => onPageChange?.(currentPage - 1)}
        className="px-3 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-100 dark:hover:bg-dark-700 text-gray-700 dark:text-gray-300"
      >
        {t('pagination.previous')}
      </button>

      {displayedPages.map((page, index) => {
        if (page === '...') {
          return (
            <span key={`ellipsis-${index}`} className="px-2 text-gray-400">
              ...
            </span>
          )
        }
        return (
          <button
            key={page}
            type="button"
            onClick={() => onPageChange?.(page)}
            className={`w-10 h-10 rounded-lg text-sm font-medium transition-all duration-200 ${
 page === currentPage
 ? 'bg-gradient-brand text-white shadow-glow'
 : 'hover:bg-gray-100 dark:hover:bg-dark-700 text-gray-600 dark:text-gray-400'
 }`}
          >
            {page}
          </button>
        )
      })}

      <button
        type="button"
        disabled={currentPage >= lastPage}
        onClick={() => onPageChange?.(currentPage + 1)}
        className="px-3 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-100 dark:hover:bg-dark-700 text-gray-700 dark:text-gray-300"
      >
        {t('pagination.next')}
      </button>
    </div>
  )
}
