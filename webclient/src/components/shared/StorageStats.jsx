import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { adminApi } from '@/services'

export default function StorageStats() {
  const { t } = useTranslation('common')
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const fetchStats = async () => {
    setLoading(true)
    setError(null)
    try {
      const { data } = await adminApi.getStorageStats()
      setStats(data?.data || null)
    } catch (err) {
      setError(err?.response?.data?.message || t('storage.loadError'))
    } finally {
      setLoading(false)
    }
  }

  const refresh = async () => {
    setLoading(true)
    setError(null)
    try {
      const { data } = await adminApi.refreshStorageStats()
      setStats(data?.data || null)
    } catch (err) {
      setError(err?.response?.data?.message || t('storage.refreshError'))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStats()
  }, [])

  const cloudinary = stats?.cloudinary || {}
  const supabase = stats?.supabase || {}

  const getBarColor = (pct) => {
    if (pct >= 90) return 'bg-red-500'
    if (pct >= 70) return 'bg-yellow-500'
    return 'bg-gradient-brand'
  }

  return (
    <div className="glass-card rounded-2xl p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-sans font-bold text-gray-900 dark:text-white">{t('storage.title')}</h3>
        <button
          type="button"
          onClick={refresh}
          disabled={loading}
          className="px-3 py-1.5 text-sm rounded-lg bg-brand-violet/10 dark:bg-brand-cyan/10 text-brand-violet dark:text-brand-cyan hover:bg-brand-violet/20 dark:hover:bg-brand-cyan/20 transition-colors disabled:opacity-50"
        >
          {loading ? t('actions.refreshing') : `↻ ${t('actions.refresh')}`}
        </button>
      </div>

      {error && <div className="text-sm text-red-500 mb-4">{error}</div>}

      <div className="grid sm:grid-cols-2 gap-6">
        {/* Cloudinary */}
        <div className="rounded-xl border border-slate-200/90 dark:border-white/10 p-5 bg-white dark:bg-white/5 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-lg">
              ☁️
            </div>
            <div>
              <p className="font-semibold text-gray-900 dark:text-white">Cloudinary</p>
              <p className="text-xs text-gray-400">{cloudinary.plan || t('storage.cloudinaryFallback')}</p>
            </div>
          </div>

          {cloudinary.configured ? (
            <div>
              <div className="mb-3">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-500 dark:text-gray-400">{t('storage.storageLabel')}</span>
                  <span className="text-gray-900 dark:text-gray-300 font-medium">
                    {cloudinary.storage?.used_formatted || '0 MB'} / {cloudinary.storage?.limit_formatted || t('storage.na')}
                  </span>
                </div>
                <div className="w-full h-2.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${getBarColor(
                      cloudinary.storage?.percentage || 0
                    )}`}
                    style={{ width: `${Math.min(100, cloudinary.storage?.percentage || 0)}%` }}
                  />
                </div>
              </div>
            </div>
          ) : (
            <p className="text-xs text-gray-400">{t('storage.notConfigured')}</p>
          )}
        </div>

        {/* Supabase */}
        <div className="rounded-xl border border-slate-200/90 dark:border-white/10 p-5 bg-white dark:bg-white/5 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-lg">
              ⚡
            </div>
            <div>
              <p className="font-semibold text-gray-900 dark:text-white">Supabase</p>
              <p className="text-xs text-gray-400">{supabase.bucket || t('storage.supabaseFallback')}</p>
            </div>
          </div>

          {supabase.configured ? (
            <div>
              <div className="mb-3">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-500 dark:text-gray-400">{t('storage.storageLabel')}</span>
                  <span className="text-gray-900 dark:text-gray-300 font-medium">
                    {supabase.storage?.used_formatted || '0 MB'} / {supabase.storage?.limit_formatted || '1 GB'}
                  </span>
                </div>
                <div className="w-full h-2.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${getBarColor(
                      supabase.storage?.percentage || 0
                    )}`}
                    style={{ width: `${Math.min(100, supabase.storage?.percentage || 0)}%` }}
                  />
                </div>
              </div>
            </div>
          ) : (
            <p className="text-xs text-gray-400">{t('storage.notConfigured')}</p>
          )}
        </div>
      </div>
    </div>
  )
}
