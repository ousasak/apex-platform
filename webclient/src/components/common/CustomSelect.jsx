import React, { useState, useRef, useEffect, useMemo } from 'react'
import { useTranslation } from 'react-i18next'

export default function CustomSelect({
  value,
  onChange,
  options = [],
  placeholder,
  size = 'md',
  searchable = false,
  searchPlaceholder,
  className = '',
}) {
  const { t } = useTranslation('common')
  const [isOpen, setIsOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const containerRef = useRef(null)

  const effectivePlaceholder = placeholder ?? t('select.placeholder')
  const effectiveSearchPlaceholder = searchPlaceholder ?? t('select.searchPlaceholder')

  const sizeClass = {
    sm: 'px-2.5 py-1.5 text-xs',
    md: 'px-3.5 py-2.5 text-sm',
    lg: 'px-4 py-3 text-base',
  }[size] || 'px-3.5 py-2.5 text-sm'

  const normalizedOptions = useMemo(() => {
    return options.map((opt) => {
      if (typeof opt === 'object' && opt !== null) {
        return { value: opt.value ?? opt.id, label: opt.label ?? opt.name ?? String(opt.value ?? opt.id) }
      }
      return { value: opt, label: String(opt) }
    })
  }, [options])

  const selectedOption = normalizedOptions.find((opt) => String(opt.value) === String(value))
  const selectedLabel = selectedOption ? selectedOption.label : effectivePlaceholder

  const filteredOptions = useMemo(() => {
    if (!searchable || !searchQuery.trim()) return normalizedOptions
    const q = searchQuery.toLowerCase()
    return normalizedOptions.filter((opt) => String(opt.label).toLowerCase().includes(q))
  }, [normalizedOptions, searchable, searchQuery])

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className={`flex items-center justify-between gap-2 w-full text-left rounded-xl border transition-all duration-200 cursor-pointer backdrop-blur-sm ${
          isOpen
            ? 'border-brand-violet dark:border-brand-cyan ring-2 ring-brand-violet/20 dark:ring-brand-cyan/20 bg-white dark:bg-white/[0.08]'
            : 'border-gray-200 dark:border-white/[0.08] hover:border-gray-300 dark:hover:border-white/[0.15] bg-gray-50 dark:bg-white/[0.04]'
        } text-gray-900 dark:text-white ${sizeClass}`}
      >
        <span className={value !== undefined && value !== null && value !== '' ? 'text-gray-900 dark:text-white truncate' : 'text-gray-400 dark:text-gray-500 truncate'}>
          {selectedLabel}
        </span>
        <svg
          className={`w-4 h-4 flex-shrink-0 transition-transform duration-200 ${
            isOpen ? 'text-brand-violet dark:text-brand-cyan rotate-180' : 'text-gray-400 dark:text-gray-500'
          }`}
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 z-50 rounded-xl border border-gray-200/80 dark:border-white/[0.08] bg-white dark:bg-dark-800 shadow-2xl backdrop-blur-xl overflow-hidden animate-slide-down">
          {searchable && (
            <div className="p-2 border-b border-gray-100 dark:border-white/[0.06]">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={effectiveSearchPlaceholder}
                className="w-full px-3 py-1.5 rounded-lg bg-gray-50 dark:bg-white/[0.05] border border-gray-200 dark:border-white/[0.08] text-xs text-gray-900 dark:text-white placeholder-gray-400 outline-none focus:border-brand-violet dark:focus:border-brand-cyan"
              />
            </div>
          )}

          <div className="max-h-56 overflow-y-auto py-1">
            {filteredOptions.length === 0 ? (
              <div className="px-3 py-2 text-xs text-gray-400 text-center">{t('select.noOptions')}</div>
            ) : (
              filteredOptions.map((opt) => {
                const isSelected = String(opt.value) === String(value)
                return (
                  <button
                    key={String(opt.value)}
                    type="button"
                    onClick={() => {
                      onChange?.(opt.value)
                      setIsOpen(false)
                      setSearchQuery('')
                    }}
                    className={`flex items-center justify-between w-full px-3.5 py-2 text-xs sm:text-sm text-left transition-colors ${
                      isSelected
                        ? 'bg-brand-violet/10 dark:bg-brand-cyan/10 text-brand-violet dark:text-brand-cyan font-medium'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/[0.05]'
                    }`}
                  >
                    <span className="truncate">{opt.label}</span>
                    {isSelected && (
                      <svg className="w-4 h-4 text-brand-violet dark:text-brand-cyan flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                      </svg>
                    )}
                  </button>
                )
              })
            )}
          </div>
        </div>
      )}
    </div>
  )
}
