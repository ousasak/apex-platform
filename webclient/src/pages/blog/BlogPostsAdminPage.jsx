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
import { FileText } from 'lucide-react'

export default function BlogPostsView() {
  const { t, i18n } = useTranslation('blog')
  const dateLocale = i18n.language?.startsWith('km') ? 'km-KH' : 'en-US'
  const [searchParams] = useSearchParams()
  const { user, isSuperAdmin, canDo } = useAuth()
  const { showToast } = useUi()

  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [meta, setMeta] = useState({ current_page: 1, last_page: 1, per_page: 15, total: 0 })
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [seriesFilter, setSeriesFilter] = useState(searchParams.get('series_id') || '')
  const [categories, setCategories] = useState([])
  const [seriesOptions, setSeriesOptions] = useState([])
  const [selectedIds, setSelectedIds] = useState([])
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleting, setDeleting] = useState(false)

  const publishedCount = useMemo(() => posts.filter((p) => p.status === 'published').length, [posts])
  const draftCount = useMemo(() => posts.filter((p) => p.status === 'draft').length, [posts])
  const totalViews = useMemo(() => posts.reduce((sum, p) => sum + (p.views_count || 0), 0), [posts])

  const allSelected = useMemo(
    () => posts.length > 0 && selectedIds.length === posts.length,
    [posts, selectedIds]
  )

  function toggleSelectAll() {
    setSelectedIds(allSelected ? [] : posts.map((p) => p.id))
  }

  function toggleSelect(id) {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    )
  }

  const canEdit = (post) => isSuperAdmin || post.author?.id === user?.id
  const canEditPerm = (post) => canEdit(post) && canDo('blog_posts', 'update')
  const canDeletePerm = (post) => canEdit(post) && canDo('blog_posts', 'delete')

  async function fetchPosts(page = 1) {
    setLoading(true)
    setSelectedIds([])
    try {
      const params = {
        page,
        search: search || undefined,
        status: statusFilter || undefined,
        category_id: categoryFilter || undefined,
        series_id: seriesFilter || undefined,
      }
      const { data } = await adminApi.getBlogPosts(params)
      setPosts(data.data || [])
      setMeta(data.meta || { current_page: 1, last_page: 1, per_page: 15, total: 0 })
    } catch {
      setPosts([])
    } finally {
      setLoading(false)
    }
  }

  async function loadMeta() {
    try {
      const [catsRes, seriesRes] = await Promise.all([
        adminApi.getBlogCategories(),
        adminApi.getSeries({ per_page: 100 }),
      ])
      setCategories(catsRes.data?.data || [])
      setSeriesOptions(seriesRes.data?.data || [])
    } catch {
      // ignore
    }
  }

  useEffect(() => {
    loadMeta()
  }, [])

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchPosts(1)
    }, 300)
    return () => clearTimeout(timer)
  }, [search, statusFilter, categoryFilter, seriesFilter])

  async function handleDelete() {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      await adminApi.deleteBlogPost(deleteTarget.id)
      setPosts((prev) => prev.filter((p) => p.id !== deleteTarget.id))
      showToast(t('admin.toast.deleted'))
      setDeleteTarget(null)
    } catch (e) {
      if (e.response?.data?.intercepted) {
        showToast(e.response.data.message || t('admin.toast.queuedForApproval'), 'warning')
        setDeleteTarget(null)
      } else {
        showToast(t('admin.toast.deleteFailed'), 'error')
      }
    } finally {
      setDeleting(false)
    }
  }

  async function bulkDelete() {
    if (!window.confirm(t('admin.bulkDeleteConfirm', { count: selectedIds.length }))) return
    try {
      await Promise.all(selectedIds.map((id) => adminApi.deleteBlogPost(id)))
      showToast(t('admin.toast.bulkDeleted', { count: selectedIds.length }))
      setSelectedIds([])
      fetchPosts(meta.current_page)
    } catch {
      showToast(t('admin.toast.bulkDeleteFailed'), 'error')
    }
  }

  const getStatusLabel = (status) => {
    const statusKeyMap = {
      published: 'status.published',
      draft: 'status.draft',
      archived: 'status.archived',
      pending: 'status.pending',
    }
    return t(statusKeyMap[status] || 'status.draft')
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
        {canDo('blog_posts', 'create') && (
          <Link
            to="/admin/blog/create"
            className="btn-primary flex items-center gap-2 text-sm"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
            </svg>
            {t('admin.newPost')}
          </Link>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="surface-panel !p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-brand-violet/10 dark:bg-brand-violet/20 flex items-center justify-center">
            <svg className="w-5 h-5 text-brand-violet" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
            </svg>
          </div>
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400">{t('admin.stats.totalPosts')}</p>
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
            <p className="text-xs text-gray-500 dark:text-gray-400">{t('status.published')}</p>
            <p className="text-lg font-bold text-green-500">{publishedCount}</p>
          </div>
        </div>

        <div className="surface-panel !p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-yellow-500/10 flex items-center justify-center">
            <svg className="w-5 h-5 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </div>
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400">{t('admin.stats.drafts')}</p>
            <p className="text-lg font-bold text-yellow-500">{draftCount}</p>
          </div>
        </div>

        <div className="surface-panel !p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-brand-cyan/10 flex items-center justify-center">
            <svg className="w-5 h-5 text-brand-cyan" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          </div>
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400">{t('admin.stats.totalViews')}</p>
            <p className="text-lg font-bold text-brand-cyan">{totalViews}</p>
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
              className="input-field pl-10 text-sm w-full"
            />
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <CustomSelect
              value={statusFilter}
              onChange={(val) => setStatusFilter(val)}
              options={[
                { label: t('admin.filters.allStatus'), value: '' },
                { label: t('status.published'), value: 'published' },
                { label: t('status.draft'), value: 'draft' },
              ]}
              placeholder={t('admin.filters.allStatus')}
            />

            {categories.length > 0 && (
              <CustomSelect
                value={categoryFilter}
                onChange={(val) => setCategoryFilter(val)}
                options={[
                  { label: t('admin.filters.allCategories'), value: '' },
                  ...categories.map((c) => ({ label: c.name, value: String(c.id) })),
                ]}
                placeholder={t('admin.filters.allCategories')}
              />
            )}

            {seriesOptions.length > 0 && (
              <CustomSelect
                value={seriesFilter}
                onChange={(val) => setSeriesFilter(val)}
                options={[
                  { label: t('admin.filters.allSeries'), value: '' },
                  ...seriesOptions.map((s) => ({ label: s.name || s.title, value: String(s.id) })),
                ]}
                placeholder={t('admin.filters.allSeries')}
              />
            )}

            {selectedIds.length > 0 && (
              <button
                onClick={bulkDelete}
                className="px-3 py-2 rounded-xl text-xs font-semibold bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-colors whitespace-nowrap"
              >
                {t('admin.deleteSelected', { count: selectedIds.length })}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Posts Table */}
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
                <th className="p-4">{t('admin.table.post')}</th>
                <th className="p-4">{t('admin.table.category')}</th>
                <th className="p-4">{t('admin.table.status')}</th>
                <th className="p-4">{t('admin.table.views')}</th>
                <th className="p-4">{t('admin.table.date')}</th>
                <th className="p-4 text-right">{t('admin.table.actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan="7" className="text-center py-12 text-gray-400">
                    {t('admin.table.loading')}
                  </td>
                </tr>
              ) : posts.length === 0 ? (
                <TableEmpty colSpan={7} icon={FileText} title={t('admin.table.empty')} />
              ) : (
                posts.map((p) => (
                  <tr key={p.id} className="hover:bg-gray-50/50 dark:hover:bg-white/[0.02] transition-colors">
                    <td className="p-4">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(p.id)}
                        onChange={() => toggleSelect(p.id)}
                        aria-label={t('admin.table.selectPost', { title: p.title })}
                        className="rounded border-gray-300 text-brand-violet focus:ring-brand-violet"
                      />
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-10 rounded-lg bg-gray-100 dark:bg-white/5 overflow-hidden shrink-0">
                          {p.cover_image ? (
                            <img src={p.cover_image} alt={p.title} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-xs text-gray-400 font-bold">
                              {p.title?.charAt(0)}
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900 dark:text-white">{p.title}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-xs">
                            {p.excerpt || p.slug}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-brand-violet/10 text-brand-violet dark:text-brand-cyan">
                        {p.category?.name || t('common.uncategorized')}
                      </span>
                    </td>
                    <td className="p-4">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                          p.status === 'published'
                            ? 'bg-green-500/10 text-green-500'
                            : 'bg-yellow-500/10 text-yellow-500'
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            p.status === 'published' ? 'bg-green-500' : 'bg-yellow-500'
                          }`}
                        />
                        {getStatusLabel(p.status)}
                      </span>
                    </td>
                    <td className="p-4 text-xs text-gray-500 dark:text-gray-400">
                      {p.views_count || 0}
                    </td>
                    <td className="p-4 text-xs text-gray-500 dark:text-gray-400">
                      {new Date(p.created_at).toLocaleDateString(dateLocale)}
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {canEditPerm(p) && (
                          <Link
                            to={`/admin/blog/${p.id}/edit`}
                            title={t('common.edit')}
                            aria-label={t('common.edit')}
                            className="p-1.5 rounded-lg text-gray-400 hover:text-brand-violet dark:hover:text-brand-cyan transition-colors"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                            </svg>
                          </Link>
                        )}
                        {canDeletePerm(p) && (
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
              onPageChange={(p) => fetchPosts(p)}
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
              t={t}
              i18nKey="admin.deleteModal.message"
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
