import React, { useState, useEffect, useMemo } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useTranslation, Trans } from 'react-i18next'
import { adminApi } from '@/services'
import { useAuth } from '@/contexts/AuthContext'
import { useUi } from '@/contexts/UiContext'
import Pagination from '@/components/common/Pagination'
import CustomSelect from '@/components/common/CustomSelect'
import { TableEmpty } from '@/components/ui/empty'
import DeleteConfirmDialog from '@/components/ui/delete-confirm-dialog'
import { FolderKanban } from 'lucide-react'

const knownStatuses = ['completed', 'active', 'in_progress', 'wip', 'planned', 'archived', 'draft', 'published']

export default function ProjectsView() {
  const { t, i18n } = useTranslation('projects')
  const [searchParams] = useSearchParams()
  const { canDo, isSuperAdmin } = useAuth()
  const { showToast } = useUi()
  const dateLocale = i18n.language === 'km' ? 'km-KH' : 'en-US'

  function getStatusLabel(status) {
    if (knownStatuses.includes(status)) {
      return t(`status.${status}`)
    }
    return t('status.archived')
  }

  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [meta, setMeta] = useState({ current_page: 1, last_page: 1, per_page: 15, total: 0 })
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [featuredFilter, setFeaturedFilter] = useState('')
  const [collectionFilter, setCollectionFilter] = useState(searchParams.get('collection_id') || '')
  const [collectionOptions, setCollectionOptions] = useState([])
  const [selectedIds, setSelectedIds] = useState([])
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleting, setDeleting] = useState(false)

  const activeCount = useMemo(() => projects.filter((p) => p.status === 'active').length, [projects])
  const wipCount = useMemo(() => projects.filter((p) => p.status === 'wip').length, [projects])
  const featuredCount = useMemo(() => projects.filter((p) => p.is_featured).length, [projects])

  const allSelected = useMemo(
    () => projects.length > 0 && selectedIds.length === projects.length,
    [projects, selectedIds]
  )

  function toggleSelectAll() {
    setSelectedIds(allSelected ? [] : projects.map((p) => p.id))
  }

  function toggleSelect(id) {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    )
  }

  async function fetchProjects(page = 1) {
    setLoading(true)
    setSelectedIds([])
    try {
      const params = {
        page,
        search: search || undefined,
        status: statusFilter || undefined,
      }
      if (featuredFilter === 'featured') params.is_featured = true
      if (collectionFilter) params.collection_id = collectionFilter
      const { data } = await adminApi.getProjects(params)
      setProjects(data.data || [])
      setMeta(data.meta || { current_page: 1, last_page: 1, per_page: 15, total: 0 })
    } catch {
      setProjects([])
    } finally {
      setLoading(false)
    }
  }

  async function loadCollections() {
    try {
      const { data } = await adminApi.getCollections({ per_page: 100 })
      setCollectionOptions(data.data || [])
    } catch {
      setCollectionOptions([])
    }
  }

  useEffect(() => {
    loadCollections()
  }, [])

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchProjects(1)
    }, 300)
    return () => clearTimeout(timer)
  }, [search, statusFilter, featuredFilter, collectionFilter])

  async function toggleFeatured(project) {
    const formData = new FormData()
    formData.append('title', project.title)
    formData.append('slug', project.slug)
    formData.append('description', project.description)
    formData.append('status', project.status)
    formData.append('is_featured', !project.is_featured)
    formData.append('_method', 'PUT')
    try {
      await adminApi.updateProject(project.id, formData)
      setProjects((prev) =>
        prev.map((p) => (p.id === project.id ? { ...p, is_featured: !p.is_featured } : p))
      )
      showToast(project.is_featured ? t('admin.toasts.unfeatured') : t('admin.toasts.featured'))
    } catch {
      showToast(t('admin.toasts.updateFailed'), 'error')
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      await adminApi.deleteProject(deleteTarget.id)
      setProjects((prev) => prev.filter((p) => p.id !== deleteTarget.id))
      showToast(t('admin.toasts.deleted'))
      setDeleteTarget(null)
    } catch (err) {
      const msg = err.response?.data?.intercepted
        ? err.response.data.message
        : t('admin.toasts.deleteFailed')
      showToast(msg, err.response?.data?.intercepted ? 'warning' : 'error')
    } finally {
      setDeleting(false)
    }
  }

  async function bulkDelete() {
    if (!window.confirm(t('admin.confirmBulkDelete', { count: selectedIds.length }))) return
    try {
      await Promise.all(selectedIds.map((id) => adminApi.deleteProject(id)))
      showToast(t('admin.toasts.bulkDeleted', { count: selectedIds.length }))
      setSelectedIds([])
      fetchProjects(meta.current_page)
    } catch {
      showToast(t('admin.toasts.bulkDeleteFailed'), 'error')
    }
  }

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-display font-bold text-gray-900 dark:text-white">{t('admin.title')}</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {t('admin.subtitle')}
          </p>
        </div>
        {canDo('projects', 'create') && (
          <Link
            to="/admin/projects/create"
            className="btn-primary flex items-center gap-2 text-sm"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
            </svg>
            {t('admin.newProject')}
          </Link>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="surface-panel !p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-brand-violet/10 dark:bg-brand-violet/20 flex items-center justify-center">
            <svg className="w-5 h-5 text-brand-violet" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
            </svg>
          </div>
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400">{t('admin.stats.total')}</p>
            <p className="text-lg font-bold text-gray-900 dark:text-white">{meta.total || 0}</p>
          </div>
        </div>

        <div className="surface-panel !p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center">
            <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400">{t('status.active')}</p>
            <p className="text-lg font-bold text-green-500">{activeCount}</p>
          </div>
        </div>

        <div className="surface-panel !p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-yellow-500/10 flex items-center justify-center">
            <svg className="w-5 h-5 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400">{t('status.wip')}</p>
            <p className="text-lg font-bold text-yellow-500">{wipCount}</p>
          </div>
        </div>

        <div className="surface-panel !p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-brand-cyan/10 flex items-center justify-center">
            <svg className="w-5 h-5 text-brand-cyan" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
            </svg>
          </div>
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400">{t('common.featured')}</p>
            <p className="text-lg font-bold text-brand-cyan">{featuredCount}</p>
          </div>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="surface-panel !p-4 mb-6">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-3">
          <div className="relative flex-1 w-full">
            <svg className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t('admin.filters.searchPlaceholder')}
              aria-label={t('admin.filters.searchPlaceholder')}
              className="input-field pl-10 text-sm w-full"
            />
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <CustomSelect
              value={statusFilter}
              onChange={(val) => setStatusFilter(val)}
              options={[
                { label: t('admin.filters.allStatus'), value: '' },
                { label: t('status.active'), value: 'active' },
                { label: t('status.wip'), value: 'wip' },
                { label: t('status.archived'), value: 'archived' },
              ]}
              placeholder={t('admin.filters.allStatus')}
            />

            <CustomSelect
              value={featuredFilter}
              onChange={(val) => setFeaturedFilter(val)}
              options={[
                { label: t('admin.filters.allProjects'), value: '' },
                { label: t('admin.filters.featuredOnly'), value: 'featured' },
              ]}
              placeholder={t('admin.filters.allProjects')}
            />

            {collectionOptions.length > 0 && (
              <CustomSelect
                value={collectionFilter}
                onChange={(val) => setCollectionFilter(val)}
                options={[
                  { label: t('admin.filters.allCollections'), value: '' },
                  ...collectionOptions.map((c) => ({ label: c.name, value: String(c.id) })),
                ]}
                placeholder={t('admin.filters.allCollections')}
              />
            )}

            {selectedIds.length > 0 && (
              <button
                onClick={bulkDelete}
                className="px-3 py-2 rounded-xl text-xs font-semibold bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-colors whitespace-nowrap"
              >
                {t('admin.bulkDelete', { count: selectedIds.length })}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Projects Table */}
      <div className="surface-panel overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50/50 dark:bg-white/[0.02] border-b border-gray-100 dark:border-white/5 text-xs text-gray-400 uppercase tracking-wider">
              <tr>
                <th className="p-4 w-10">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    onChange={toggleSelectAll}
                    aria-label={t('admin.table.selectAll')}
                    className="rounded border-gray-300 text-brand-violet focus:ring-brand-violet"
                  />
                </th>
                <th className="p-4">{t('admin.table.project')}</th>
                <th className="p-4">{t('admin.table.status')}</th>
                <th className="p-4">{t('admin.table.featured')}</th>
                <th className="p-4">{t('admin.table.created')}</th>
                <th className="p-4 text-right">{t('admin.table.actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan="6" className="text-center py-12 text-gray-400">
                    {t('admin.loading')}
                  </td>
                </tr>
              ) : projects.length === 0 ? (
                <TableEmpty colSpan={6} icon={FolderKanban} title={t('admin.empty')} />
              ) : (
                projects.map((p) => (
                  <tr key={p.id} className="hover:bg-gray-50/50 dark:hover:bg-white/[0.02] transition-colors">
                    <td className="p-4">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(p.id)}
                        onChange={() => toggleSelect(p.id)}
                        aria-label={t('admin.table.selectProject', { title: p.title })}
                        className="rounded border-gray-300 text-brand-violet focus:ring-brand-violet"
                      />
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-10 rounded-lg bg-gray-100 dark:bg-white/5 overflow-hidden shrink-0">
                          {p.cover_image || p.image ? (
                            <img src={p.cover_image || p.image} alt={p.title} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-xs text-gray-400 font-bold">
                              {p.title?.charAt(0)}
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900 dark:text-white">{p.title}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-xs">
                            {p.description}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                          p.status === 'active'
                            ? 'bg-green-500/10 text-green-500'
                            : p.status === 'wip'
                            ? 'bg-yellow-500/10 text-yellow-500'
                            : 'bg-gray-500/10 text-gray-400'
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            p.status === 'active'
                              ? 'bg-green-500'
                              : p.status === 'wip'
                              ? 'bg-yellow-500'
                              : 'bg-gray-400'
                          }`}
                        />
                        {getStatusLabel(p.status)}
                      </span>
                    </td>
                    <td className="p-4">
                      <button
                        type="button"
                        onClick={() => toggleFeatured(p)}
                        title={p.is_featured ? t('admin.actions.unfeature') : t('admin.actions.feature')}
                        aria-label={p.is_featured ? t('admin.actions.unfeature') : t('admin.actions.feature')}
                        className={`p-1 rounded-lg transition-colors ${
 p.is_featured ? 'text-amber-400' : 'text-gray-300 dark:text-gray-600'
 }`}
                      >
                        <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                          <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                        </svg>
                      </button>
                    </td>
                    <td className="p-4 text-xs text-gray-500 dark:text-gray-400">
                      {new Date(p.created_at).toLocaleDateString(dateLocale)}
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {canDo('projects', 'update') && (
                          <Link
                            to={`/admin/projects/${p.id}/edit`}
                            title={t('common.edit')}
                            aria-label={t('common.edit')}
                            className="p-1.5 rounded-lg text-gray-400 hover:text-brand-violet dark:hover:text-brand-cyan transition-colors"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                            </svg>
                          </Link>
                        )}
                        {canDo('projects', 'delete') && (
                          <button
                            onClick={() => setDeleteTarget(p)}
                            title={t('common.delete')}
                            aria-label={t('common.delete')}
                            className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 transition-colors"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        )}
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
              onPageChange={(p) => fetchProjects(p)}
            />
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmDialog
        open={Boolean(deleteTarget)}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        loading={deleting}
        title={t('admin.deleteModal.title')}
        description={
          deleteTarget ? (
            <Trans
              i18nKey="admin.deleteModal.message"
              ns="projects"
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
