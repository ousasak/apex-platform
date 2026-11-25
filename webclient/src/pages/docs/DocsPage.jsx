import React, { useState, useEffect, useMemo, useRef } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation, Trans } from 'react-i18next'
import { adminApi } from '@/services'
import { useUi } from '@/contexts/UiContext'
import DeleteConfirmDialog from '@/components/ui/delete-confirm-dialog'

export default function DocsView() {
  const { t, i18n } = useTranslation('docs')
  const { showToast } = useUi()
  const [docs, setDocs] = useState([])
  const [meta, setMeta] = useState({ total: 0, current_page: 1, last_page: 1, per_page: 20 })
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleting, setDeleting] = useState(false)
  const debounceTimer = useRef(null)

  const publishedCount = useMemo(() => docs.filter(d => d.status === 'published').length, [docs])
  const draftCount = useMemo(() => docs.filter(d => d.status === 'draft').length, [docs])

  async function fetchDocs(page = 1, searchOverride = search) {
    setLoading(true)
    try {
      const params = { page, per_page: 20 }
      if (searchOverride) params.search = searchOverride
      if (statusFilter) params.status = statusFilter
      if (categoryFilter) params.category = categoryFilter
      const { data } = await adminApi.getDocs(params)
      setDocs(data.data || [])
      setMeta(data.meta || { total: 0, current_page: 1, last_page: 1, per_page: 20 })
    } catch {
      setDocs([])
      showToast(t('admin.toast.loadFailed'), 'error')
    } finally {
      setLoading(false)
    }
  }

  async function fetchCategories() {
    try {
      const { data } = await adminApi.getDocCategories()
      setCategories(data.data || [])
    } catch {
      setCategories([])
    }
  }

  useEffect(() => {
    fetchDocs()
    fetchCategories()
  }, [statusFilter, categoryFilter])

  function handleSearchChange(e) {
    const val = e.target.value
    setSearch(val)
    clearTimeout(debounceTimer.current)
    debounceTimer.current = setTimeout(() => {
      fetchDocs(1, val)
    }, 400)
  }

  async function deleteDoc() {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      await adminApi.deleteDoc(deleteTarget.id)
      setDeleteTarget(null)
      showToast(t('admin.toast.deleted'))
      await fetchDocs(meta.current_page)
    } catch (err) {
      showToast(err.response?.data?.message || t('admin.toast.deleteFailed'), 'error')
    } finally {
      setDeleting(false)
    }
  }

  function formatDate(str) {
    if (!str) return '—'
    const locale = i18n.language === 'km' ? 'km-KH' : 'en-US'
    return new Date(str).toLocaleDateString(locale, { month: 'short', day: 'numeric', year: 'numeric' })
  }

  function getStatusLabel(status) {
    if (status === 'published') return t('status.published')
    if (status === 'draft') return t('status.draft')
    return status
  }

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-sans font-bold dark:text-white">{t('admin.title')}</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{t('admin.subtitle')}</p>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/admin/docs/reorder" className="btn-ghost flex items-center gap-2 text-sm border border-gray-300 dark:border-gray-600 px-3 py-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 10h16M4 14h16M4 18h16"/></svg>
            {t('admin.actions.reorder')}
          </Link>
          <Link to="/admin/docs/create" className="btn-primary flex items-center gap-2 text-sm">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"/></svg>
            {t('admin.actions.newDoc')}
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        <div className="glass-card !p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-brand-violet/10 dark:bg-brand-violet/20 flex items-center justify-center">
            <svg className="w-5 h-5 text-brand-violet" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"/></svg>
          </div>
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400">{t('admin.stats.totalDocs')}</p>
            <p className="text-lg font-bold dark:text-white">{meta.total || 0}</p>
          </div>
        </div>
        <div className="glass-card !p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center">
            <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
          </div>
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400">{t('admin.stats.published')}</p>
            <p className="text-lg font-bold text-green-500">{publishedCount}</p>
          </div>
        </div>
        <div className="glass-card !p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-yellow-500/10 flex items-center justify-center">
            <svg className="w-5 h-5 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
          </div>
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400">{t('admin.stats.drafts')}</p>
            <p className="text-lg font-bold text-yellow-500">{draftCount}</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="glass-card !p-4 mb-6">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-3">
          <div className="relative flex-1 w-full">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
            <input
              value={search}
              onChange={handleSearchChange}
              type="text"
              placeholder={t('admin.filters.searchPlaceholder')}
              className="input-field !pl-10 w-full"
            />
          </div>
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="input-field w-full md:w-40"
          >
            <option value="">{t('admin.filters.allStatus')}</option>
            <option value="published">{t('status.published')}</option>
            <option value="draft">{t('status.draft')}</option>
          </select>
          <select
            value={categoryFilter}
            onChange={e => setCategoryFilter(e.target.value)}
            className="input-field w-full md:w-48"
          >
            <option value="">{t('admin.filters.allCategories')}</option>
            {categories.map(cat => (
              <option key={cat.id ?? cat} value={cat.name ?? cat}>
                {cat.name ?? cat}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Loading */}
      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-10 h-10 border-4 border-brand-violet/30 border-t-brand-violet rounded-full animate-spin" />
        </div>
      ) : docs.length > 0 ? (
        /* Table */
        <div className="glass-card overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 dark:border-dark-600">
                <th className="text-left py-3 px-4 font-semibold text-gray-600 dark:text-gray-400">{t('admin.table.title')}</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-600 dark:text-gray-400 hidden md:table-cell">{t('admin.table.category')}</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-600 dark:text-gray-400 hidden sm:table-cell">{t('admin.table.status')}</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-600 dark:text-gray-400 hidden lg:table-cell">{t('admin.table.author')}</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-600 dark:text-gray-400 hidden lg:table-cell">{t('admin.table.updated')}</th>
                <th className="py-3 px-4 w-24"></th>
              </tr>
            </thead>
            <tbody>
              {docs.map(doc => (
                <tr
                  key={doc.id}
                  className="border-b border-gray-100 dark:border-dark-700 hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors"
                >
                  <td className="py-3 px-4">
                    <p className="font-semibold text-gray-900 dark:text-white line-clamp-1">{doc.title}</p>
                    <p className="text-xs text-gray-400 mt-0.5 font-mono">{doc.slug}</p>
                  </td>
                  <td className="py-3 px-4 hidden md:table-cell">
                    <span className="px-2 py-1 bg-gray-100 dark:bg-white/[0.06] text-gray-600 dark:text-gray-300 rounded-md text-xs">{doc.category}</span>
                  </td>
                  <td className="py-3 px-4 hidden sm:table-cell">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        doc.status === 'published'
                          ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                          : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400'
                      }`}
                    >
                      {getStatusLabel(doc.status)}
                    </span>
                  </td>
                  <td className="py-3 px-4 hidden lg:table-cell text-gray-500 dark:text-gray-400 text-xs">
                    {doc.author?.name || '—'}
                  </td>
                  <td className="py-3 px-4 hidden lg:table-cell text-gray-500 dark:text-gray-400 text-xs">
                    {formatDate(doc.updated_at)}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center justify-end gap-1">
                      <Link
                        to={`/admin/docs/${doc.id}/edit`}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-brand-violet dark:hover:text-brand-cyan hover:bg-gray-100 dark:hover:bg-white/[0.06] transition-colors"
                        title={t('common.edit')}
                        aria-label={t('common.edit')}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
                      </Link>
                      <button
                        onClick={() => setDeleteTarget(doc)}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                        title={t('common.delete')}
                        aria-label={t('common.delete')}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination */}
          {meta.last_page > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200 dark:border-dark-600">
              <p className="text-xs text-gray-500">{t('admin.pagination.showing', { count: docs.length, total: meta.total })}</p>
              <div className="flex items-center gap-1">
                <button
                  disabled={meta.current_page === 1}
                  onClick={() => fetchDocs(meta.current_page - 1)}
                  className="px-3 py-1.5 text-xs rounded-lg border border-gray-200 dark:border-dark-600 disabled:opacity-40 hover:border-brand-violet transition-colors"
                >
                  {t('admin.pagination.prev')}
                </button>
                <span className="text-xs text-gray-500 px-2">{meta.current_page} / {meta.last_page}</span>
                <button
                  disabled={meta.current_page === meta.last_page}
                  onClick={() => fetchDocs(meta.current_page + 1)}
                  className="px-3 py-1.5 text-xs rounded-lg border border-gray-200 dark:border-dark-600 disabled:opacity-40 hover:border-brand-violet transition-colors"
                >
                  {t('admin.pagination.next')}
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Empty */
        <div className="glass-card flex flex-col items-center justify-center py-20 text-center">
          <svg className="w-14 h-14 text-gray-300 dark:text-gray-600 mb-4" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"/></svg>
          <h3 className="font-semibold dark:text-white mb-1">{t('admin.empty.title')}</h3>
          <p className="text-sm text-gray-400 mb-4">{t('admin.empty.subtitle')}</p>
          <Link to="/admin/docs/create" className="btn-primary text-sm">{t('admin.actions.newDoc')}</Link>
        </div>
      )}

      {/* Delete Confirm Modal */}
      <DeleteConfirmDialog
        open={Boolean(deleteTarget)}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={deleteDoc}
        loading={deleting}
        title={t('admin.deleteModal.title')}
        description={
          deleteTarget ? (
            <Trans
              t={t}
              i18nKey="admin.deleteModal.description"
              values={{ title: deleteTarget.title }}
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
