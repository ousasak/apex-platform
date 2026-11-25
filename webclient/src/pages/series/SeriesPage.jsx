import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation, Trans } from 'react-i18next'
import { adminApi } from '@/services'
import { useUi } from '@/contexts/UiContext'
import Pagination from '@/components/common/Pagination'
import { TableEmpty } from '@/components/ui/empty'
import DeleteConfirmDialog from '@/components/ui/delete-confirm-dialog'
import { BookOpen } from 'lucide-react'
import slugify from 'slugify'

export default function SeriesView() {
  const { t, i18n } = useTranslation('blog')
  const dateLocale = i18n.language?.startsWith('km') ? 'km-KH' : 'en-US'
  const { showToast } = useUi()

  const [loading, setLoading] = useState(true)
  const [rows, setRows] = useState([])
  const [meta, setMeta] = useState({ current_page: 1, last_page: 1, per_page: 15, total: 0 })
  const [search, setSearch] = useState('')

  // Modal
  const [modalOpen, setModalOpen] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState({ name: '', slug: '', description: '' })
  const [modalError, setModalError] = useState('')
  const [saving, setSaving] = useState(false)
  const [slugTouched, setSlugTouched] = useState(false)

  // Delete
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleting, setDeleting] = useState(false)

  function onNameInput(e) {
    const val = e.target.value
    if (!editingId && !slugTouched) {
      setForm({
        ...form,
        name: val,
        slug: slugify(val, { lower: true, strict: true }),
      })
    } else {
      setForm({ ...form, name: val })
    }
  }

  async function fetchList(page = 1) {
    setLoading(true)
    try {
      const { data } = await adminApi.getSeries({ page, search: search || undefined })
      setRows(data.data || [])
      setMeta(data.meta || { current_page: 1, last_page: 1, per_page: 15, total: 0 })
    } catch {
      setRows([])
      showToast(t('series.toast.loadFailed'), 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchList(1)
    }, 300)
    return () => clearTimeout(timer)
  }, [search])

  function openCreate() {
    setEditingId(null)
    setForm({ name: '', slug: '', description: '' })
    setSlugTouched(false)
    setModalError('')
    setModalOpen(true)
  }

  function openEdit(row) {
    setEditingId(row.id)
    setForm({
      name: row.name || row.title || '',
      slug: row.slug || '',
      description: row.description || '',
    })
    setSlugTouched(true)
    setModalError('')
    setModalOpen(true)
  }

  async function saveModal(e) {
    e.preventDefault()
    setModalError('')
    setSaving(true)
    const payload = {
      title: form.name,
      name: form.name,
      slug: form.slug,
      description: form.description,
    }
    try {
      if (editingId) {
        await adminApi.updateSeries(editingId, payload)
        showToast(t('series.toast.updated'))
      } else {
        await adminApi.createSeries(payload)
        showToast(t('series.toast.created'))
      }
      setModalOpen(false)
      fetchList(meta.current_page)
    } catch (err) {
      const msg = err.response?.data?.message
      const errs = err.response?.data?.errors
      setModalError(errs ? Object.values(errs).flat().join(' ') : msg || t('series.toast.saveFailed'))
    } finally {
      setSaving(false)
    }
  }

  async function doDelete() {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      await adminApi.deleteSeries(deleteTarget.id)
      showToast(t('series.toast.deleted'))
      setDeleteTarget(null)
      fetchList(meta.current_page)
    } catch (err) {
      showToast(err.response?.data?.message || t('series.toast.deleteFailed'), 'error')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-display font-bold text-gray-900 dark:text-white">{t('series.title')}</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{t('series.subtitle')}</p>
        </div>
        <button
          type="button"
          onClick={openCreate}
          className="btn-primary flex items-center gap-2 text-sm"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
          </svg>
          {t('series.newSeries')}
        </button>
      </div>

      <div className="surface-panel !p-4 mb-6">
        <div className="relative max-w-md">
          <svg className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t('series.searchPlaceholder')}
            className="input-field pl-10 text-sm w-full"
          />
        </div>
      </div>

      <div className="surface-panel overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50/50 dark:bg-white/[0.02] border-b border-gray-100 dark:border-white/5 text-xs text-gray-400 uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4 font-medium">{t('series.table.name')}</th>
                <th className="py-3 px-4 font-medium hidden sm:table-cell">{t('series.table.slug')}</th>
                <th className="py-3 px-4 font-medium hidden md:table-cell">{t('series.table.description')}</th>
                <th className="py-3 px-4 font-medium">{t('series.table.posts')}</th>
                <th className="py-3 px-4 font-medium hidden lg:table-cell">{t('series.table.created')}</th>
                <th className="py-3 px-4 font-medium text-right">{t('series.table.actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan="6" className="text-center py-12 text-gray-400">
                    {t('series.table.loading')}
                  </td>
                </tr>
              ) : rows.length === 0 ? (
                <TableEmpty colSpan={6} icon={BookOpen} title={t('series.table.empty')} />
              ) : (
                rows.map((row) => (
                  <tr key={row.id} className="hover:bg-gray-50/50 dark:hover:bg-white/[0.02] transition-colors">
                    <td className="py-3 px-4">
                      <span className="font-semibold text-gray-900 dark:text-white">
                        {row.name || row.title}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono text-xs text-gray-500 hidden sm:table-cell">
                      {row.slug}
                    </td>
                    <td className="py-3 px-4 text-gray-500 dark:text-gray-400 max-w-xs truncate hidden md:table-cell">
                      {row.description || '—'}
                    </td>
                    <td className="py-3 px-4">
                      <Link
                        to={`/admin/blog?series_id=${row.id}`}
                        className="text-brand-violet dark:text-brand-cyan hover:underline font-medium"
                      >
                        {row.posts_count ?? 0}
                      </Link>
                    </td>
                    <td className="py-3 px-4 text-xs text-gray-500 hidden lg:table-cell">
                      {new Date(row.created_at).toLocaleDateString(dateLocale)}
                    </td>
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => openEdit(row)}
                          title={t('common.edit')}
                          aria-label={t('common.edit')}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-brand-violet dark:hover:text-brand-cyan transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                          </svg>
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteTarget(row)}
                          title={t('common.delete')}
                          aria-label={t('common.delete')}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {meta.last_page > 1 && (
          <div className="p-4 border-t border-gray-100 dark:border-white/5">
            <Pagination
              currentPage={meta.current_page}
              lastPage={meta.last_page}
              onPageChange={(p) => fetchList(p)}
            />
          </div>
        )}
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="surface-panel w-full max-w-md p-6 shadow-2xl relative">
            <h3 className="font-display text-lg font-bold text-gray-900 dark:text-white mb-4">
              {editingId ? t('series.editSeries') : t('series.newSeries')}
            </h3>
            <form onSubmit={saveModal} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t('series.fields.title')}
                </label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={onNameInput}
                  className="input-field text-sm"
                  placeholder={t('series.placeholders.title')}
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t('series.fields.slug')}
                </label>
                <input
                  type="text"
                  required
                  value={form.slug}
                  onChange={(e) => {
                    setSlugTouched(true)
                    setForm({ ...form, slug: e.target.value })
                  }}
                  className="input-field text-sm font-mono"
                  placeholder={t('series.placeholders.slug')}
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t('series.fields.description')}
                </label>
                <textarea
                  rows={3}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="input-field text-sm resize-none"
                  placeholder={t('series.placeholders.description')}
                />
              </div>

              {modalError && <p className="text-xs text-red-500">{modalError}</p>}

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="btn-secondary text-xs"
                >
                  {t('common.cancel')}
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="btn-primary text-xs"
                >
                  {saving ? t('common.saving') : t('common.save')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Target Modal */}
      <DeleteConfirmDialog
        open={Boolean(deleteTarget)}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={doDelete}
        loading={deleting}
        title={t('series.deleteModal.title')}
        description={
          deleteTarget ? (
            <Trans
              t={t}
              i18nKey="series.deleteModal.message"
              values={{ name: deleteTarget.name || deleteTarget.title }}
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
