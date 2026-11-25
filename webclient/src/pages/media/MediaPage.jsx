import React, { useState, useEffect, useMemo } from 'react'
import { useTranslation, Trans } from 'react-i18next'
import { adminApi, memberApi } from '@/services'
import { useAuth } from '@/contexts/AuthContext'
import { useUi } from '@/contexts/UiContext'
import Pagination from '@/components/common/Pagination'
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty'
import DeleteConfirmDialog from '@/components/ui/delete-confirm-dialog'
import { Image } from 'lucide-react'

export default function MediaView() {
  const { t, i18n } = useTranslation('management')
  const { canDo } = useAuth()
  const { showToast } = useUi()

  const [media, setMedia] = useState([])
  const [loading, setLoading] = useState(true)
  const [meta, setMeta] = useState({ current_page: 1, last_page: 1, per_page: 24, total: 0 })
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const [storageProvider, setStorageProvider] = useState('supabase')
  const [allowedProviders, setAllowedProviders] = useState('both')
  const [uploading, setUploading] = useState(false)
  const [selectedIds, setSelectedIds] = useState([])
  const [selectedMedia, setSelectedMedia] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleting, setDeleting] = useState(false)

  async function loadStorageSettings() {
    try {
      const { data } = await memberApi.getStorageSettings()
      const allowed = data?.data?.allowed_storage_providers || 'both'
      setAllowedProviders(allowed)
      if (allowed !== 'both') setStorageProvider(allowed)
    } catch {
      // ignore
    }
  }

  async function fetchMedia(page = 1) {
    setLoading(true)
    setSelectedIds([])
    try {
      const params = {
        page,
        per_page: 24,
        search: search || undefined,
        type: typeFilter || undefined,
      }
      const { data } = await adminApi.getMedia(params)
      setMedia(data.data || [])
      setMeta(data.meta || { current_page: 1, last_page: 1, per_page: 24, total: 0 })
    } catch {
      setMedia([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadStorageSettings()
  }, [])

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchMedia(1)
    }, 300)
    return () => clearTimeout(timer)
  }, [search, typeFilter])

  async function handleUploadFiles(e) {
    const files = Array.from(e.target.files || [])
    if (!files.length) return

    setUploading(true)
    let uploadedCount = 0

    for (const file of files) {
      const fd = new FormData()
      fd.append('file', file)
      fd.append('storage_provider', storageProvider)
      try {
        await adminApi.uploadMedia(fd)
        uploadedCount++
      } catch (err) {
        showToast(t('media.toasts.uploadError', { name: file.name }), 'error')
      }
    }

    setUploading(false)
    if (uploadedCount > 0) {
      showToast(t('media.toasts.uploadSuccess', { count: uploadedCount }))
      fetchMedia(1)
    }
    e.target.value = ''
  }

  function copyUrl(url) {
    navigator.clipboard.writeText(url)
    showToast(t('media.toasts.urlCopied'))
  }

  async function handleDelete() {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      await adminApi.deleteMedia(deleteTarget.id)
      showToast(t('media.toasts.deleteSuccess'))
      setDeleteTarget(null)
      if (selectedMedia?.id === deleteTarget.id) setSelectedMedia(null)
      fetchMedia(meta.current_page)
    } catch {
      showToast(t('media.toasts.deleteError'), 'error')
    } finally {
      setDeleting(false)
    }
  }

  async function bulkDelete() {
    if (!window.confirm(t('media.confirmBulkDelete', { count: selectedIds.length }))) return
    try {
      await Promise.all(selectedIds.map((id) => adminApi.deleteMedia(id)))
      showToast(t('media.toasts.bulkDeleteSuccess', { count: selectedIds.length }))
      setSelectedIds([])
      fetchMedia(meta.current_page)
    } catch {
      showToast(t('media.toasts.bulkDeletePartialError'), 'error')
    }
  }

  function formatBytes(bytes) {
    if (!bytes) return `0 ${t('media.units.b')}`
    const k = 1024
    const sizes = [t('media.units.b'), t('media.units.kb'), t('media.units.mb'), t('media.units.gb')]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
  }

  function getProviderLabel(provider) {
    const key = `media.providers.${provider}`
    return i18n.exists(key, { ns: 'management' }) ? t(key) : provider
  }

  const filterTypes = [
    { value: '', label: t('media.filters.all') },
    { value: 'image', label: t('media.filters.image') },
    { value: 'document', label: t('media.filters.document') },
  ]

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-display font-bold text-gray-900 dark:text-white">{t('media.title')}</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {t('media.subtitle')}
          </p>
        </div>

        <div className="flex items-center gap-3">
          {selectedIds.length > 0 && canDo('media', 'delete') && (
            <button
              onClick={bulkDelete}
              className="px-3 py-2 text-xs font-semibold rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500/20"
            >
              {t('media.actions.deleteSelected', { count: selectedIds.length })}
            </button>
          )}

          {/* Storage provider toggle */}
          {allowedProviders === 'both' ? (
            <div className="flex items-center border border-gray-200 dark:border-white/10 rounded-full overflow-hidden text-xs font-medium">
              <button
                type="button"
                onClick={() => setStorageProvider('supabase')}
                className={`px-3 py-2 transition-colors ${
                  storageProvider === 'supabase'
                    ? 'bg-emerald-500/10 text-emerald-500 font-semibold'
                    : 'text-gray-500 hover:bg-gray-50 dark:hover:bg-white/5'
                }`}
              >
                {t('media.providers.supabase')}
              </button>
              <button
                type="button"
                onClick={() => setStorageProvider('cloudinary')}
                className={`px-3 py-2 border-l border-gray-200 dark:border-white/10 transition-colors ${
                  storageProvider === 'cloudinary'
                    ? 'bg-blue-500/10 text-blue-500 font-semibold'
                    : 'text-gray-500 hover:bg-gray-50 dark:hover:bg-white/5'
                }`}
              >
                {t('media.providers.cloudinary')}
              </button>
            </div>
          ) : (
            <div className="px-3 py-1.5 rounded-full border bg-gray-50 dark:bg-dark-700 text-xs text-gray-500">
              {getProviderLabel(allowedProviders)}
            </div>
          )}

          {canDo('media', 'create') && (
            <label className="btn-primary text-sm flex items-center gap-2 cursor-pointer">
              {uploading ? (
                <>
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  {t('media.actions.uploading')}
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                  </svg>
                  {t('media.actions.uploadFiles')}
                </>
              )}
              <input
                type="file"
                multiple
                accept="image/*,.pdf"
                onChange={handleUploadFiles}
                className="hidden"
                disabled={uploading}
              />
            </label>
          )}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="surface-panel !p-4 mb-6">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <svg className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t('media.searchPlaceholder')}
              className="input-field pl-10 text-sm w-full"
            />
          </div>

          <div className="flex items-center gap-2">
            {filterTypes.map((filterOption) => (
              <button
                key={filterOption.value}
                type="button"
                onClick={() => setTypeFilter(filterOption.value)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
 typeFilter === filterOption.value
 ? 'bg-brand-violet text-white'
 : 'bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
 }`}
              >
                {filterOption.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Media Grid */}
      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-10 h-10 border-4 border-brand-violet/30 border-t-brand-violet rounded-full animate-spin" />
        </div>
      ) : media.length === 0 ? (
        <Empty className="surface-panel">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <Image className="size-5" strokeWidth={1.75} />
            </EmptyMedia>
            <EmptyTitle>{t('media.empty')}</EmptyTitle>
          </EmptyHeader>
        </Empty>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {media.map((item) => (
            <div
              key={item.id}
              onClick={() => setSelectedMedia(item)}
              className="surface-panel !p-2 flex flex-col group cursor-pointer hover:ring-2 hover:ring-brand-violet transition-all relative overflow-hidden"
            >
              <div className="w-full h-32 rounded-lg bg-gray-100 dark:bg-white/5 overflow-hidden flex items-center justify-center">
                {item.type === 'image' || item.mime_type?.startsWith('image/') ? (
                  <img
                    src={item.url}
                    alt={item.original_name || item.name || item.filename}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center text-gray-400 p-2 text-center">
                    <svg className="w-8 h-8 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                    <span className="text-[10px] uppercase font-bold">
                      {item.format || item.mime_type?.split('/')[1] || t('media.fallbackDoc')}
                    </span>
                  </div>
                )}
              </div>

              <div className="p-2">
                <p className="text-xs font-medium text-gray-900 dark:text-white truncate">
                  {item.name || item.original_name || t('media.fallbackFile')}
                </p>
                <p className="text-[10px] text-gray-400 mt-0.5">
                  {formatBytes(item.size)}
                </p>
              </div>

              <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 bg-black/60 rounded-full p-1">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    copyUrl(item.url)
                  }}
                  className="p-1 text-white hover:text-brand-cyan transition-colors"
                  title={t('media.actions.copyUrl')}
                  aria-label={t('media.actions.copyUrl')}
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.25 7.5V6.108c0-1.135.845-2.098 1.976-2.192.836-.068 1.68-.108 2.524-.108 2.524 0 5.048.36 7.572 1.08m-12.072 1.22v12.568c0 1.135.845 2.098 1.976 2.192 1.68.136 3.36.204 5.04.204s3.36-.068 5.04-.204c1.131-.094 1.976-1.057 1.976-2.192V7.5" />
                  </svg>
                </button>
                {canDo('media', 'delete') && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      setDeleteTarget(item)
                    }}
                    className="p-1 text-white hover:text-red-400 transition-colors"
                    title={t('common.delete')}
                    aria-label={t('common.delete')}
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {meta.last_page > 1 && (
        <div className="mt-8 flex justify-center">
          <Pagination
            currentPage={meta.current_page}
            lastPage={meta.last_page}
            onPageChange={(p) => fetchMedia(p)}
          />
        </div>
      )}

      {/* Media Detail Modal */}
      {selectedMedia && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="surface-panel w-full max-w-xl p-6 shadow-2xl relative space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-white/5 pb-3">
              <h3 className="font-display text-base font-bold text-gray-900 dark:text-white truncate max-w-md">
                {selectedMedia.original_name || selectedMedia.name || selectedMedia.filename}
              </h3>
              <button
                type="button"
                onClick={() => setSelectedMedia(null)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-white"
                title={t('common.close')}
                aria-label={t('common.close')}
              >
                ✕
              </button>
            </div>

            <div className="w-full max-h-72 rounded-xl bg-gray-100 dark:bg-white/5 overflow-hidden flex items-center justify-center">
              {selectedMedia.type === 'image' || selectedMedia.mime_type?.startsWith('image/') ? (
                <img src={selectedMedia.url} alt={selectedMedia.original_name || selectedMedia.name} className="max-h-72 object-contain" />
              ) : (
                <div className="p-8 text-center text-gray-400">
                  <p className="text-sm font-semibold uppercase">
                    {selectedMedia.format || selectedMedia.mime_type?.split('/')[1] || t('media.filters.document')}
                  </p>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs text-gray-600 dark:text-gray-400">
              <div>
                <span className="text-gray-400">{t('media.detail.size')}</span> {formatBytes(selectedMedia.size)}
              </div>
              <div>
                <span className="text-gray-400">{t('media.detail.provider')}</span>{' '}
                <span>{getProviderLabel(selectedMedia.disk || selectedMedia.storage_provider || 'supabase')}</span>
              </div>
              <div className="col-span-2">
                <span className="text-gray-400">{t('media.detail.url')}</span>
                <input
                  type="text"
                  readOnly
                  value={selectedMedia.url}
                  className="input-field text-xs font-mono mt-1"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-white/5">
              <button
                type="button"
                onClick={() => copyUrl(selectedMedia.url)}
                className="btn-primary text-xs"
              >
                {t('media.actions.copyUrl')}
              </button>
              <div className="flex gap-2">
                {canDo('media', 'delete') && (
                  <button
                    type="button"
                    onClick={() => setDeleteTarget(selectedMedia)}
                    className="px-3 py-1.5 rounded-lg text-xs text-red-500 hover:bg-red-500/10"
                  >
                    {t('common.delete')}
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setSelectedMedia(null)}
                  className="btn-secondary text-xs"
                >
                  {t('common.close')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <DeleteConfirmDialog
        open={Boolean(deleteTarget)}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        loading={deleting}
        title={t('media.deleteModal.title')}
        description={
          deleteTarget ? (
            <Trans
              t={t}
              i18nKey="media.deleteModal.message"
              values={{ name: deleteTarget.original_name || deleteTarget.name || deleteTarget.filename }}
              components={{ strong: <strong /> }}
            />
          ) : null
        }
        cancelLabel={t('common.cancel')}
        confirmLabel={t('common.delete')}
        loadingLabel={t('common.deleting')}
      />
    </div>
  )
}
