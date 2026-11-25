import React, { useState, useEffect, useMemo } from 'react'
import { useTranslation, Trans } from 'react-i18next'
import { adminApi } from '@/services'
import { useAuth } from '@/contexts/AuthContext'
import { useUi } from '@/contexts/UiContext'
import CustomSelect from '@/components/common/CustomSelect'
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty'
import DeleteConfirmDialog from '@/components/ui/delete-confirm-dialog'
import { FolderOpen } from 'lucide-react'
import slugify from 'slugify'

export default function CategoriesView() {
  const { t, i18n } = useTranslation('management')
  const { canDo } = useAuth()
  const { showToast } = useUi()

  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState('name')

  // Create / Edit Modal
  const [showModal, setShowModal] = useState(false)
  const [editingCategory, setEditingCategory] = useState(null)
  const [form, setForm] = useState({ name: '', slug: '', description: '', color: '#7b2fff' })
  const [formError, setFormError] = useState('')
  const [saving, setSaving] = useState(false)

  // Delete Modal
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deletingCategory, setDeletingCategory] = useState(null)
  const [deleting, setDeleting] = useState(false)

  async function fetchCategories() {
    setLoading(true)
    try {
      const res = await adminApi.getBlogCategories()
      setCategories(res.data.data || [])
    } catch {
      showToast(t('categories.toasts.loadError'), 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCategories()
  }, [])

  const usedCategories = useMemo(
    () => categories.filter((c) => (c.posts_count || 0) > 0).length,
    [categories]
  )
  const unusedCategories = useMemo(
    () => categories.filter((c) => (c.posts_count || 0) === 0).length,
    [categories]
  )

  const filteredCategories = useMemo(() => {
    let list = [...categories]
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      list = list.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.slug.toLowerCase().includes(q) ||
          (c.description || '').toLowerCase().includes(q)
      )
    }

    if (sortBy === 'name') list.sort((a, b) => a.name.localeCompare(b.name))
    else if (sortBy === 'name-desc') list.sort((a, b) => b.name.localeCompare(a.name))
    else if (sortBy === 'posts') list.sort((a, b) => (b.posts_count || 0) - (a.posts_count || 0))
    else if (sortBy === 'newest') list.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    else if (sortBy === 'oldest') list.sort((a, b) => new Date(a.created_at) - new Date(b.created_at))

    return list
  }, [categories, searchQuery, sortBy])

  function openCreateModal() {
    setEditingCategory(null)
    setForm({ name: '', slug: '', description: '', color: '#7b2fff' })
    setFormError('')
    setShowModal(true)
  }

  function openEditModal(cat) {
    setEditingCategory(cat)
    setForm({
      name: cat.name,
      slug: cat.slug,
      description: cat.description || '',
      color: cat.color || '#7b2fff',
    })
    setFormError('')
    setShowModal(true)
  }

  function onNameChange(e) {
    const val = e.target.value
    if (!editingCategory) {
      setForm({
        ...form,
        name: val,
        slug: slugify(val, { lower: true, strict: true }),
      })
    } else {
      setForm({ ...form, name: val })
    }
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setSaving(true)
    setFormError('')
    try {
      if (editingCategory) {
        await adminApi.updateBlogCategory(editingCategory.id, form)
        showToast(t('categories.toasts.updateSuccess'))
      } else {
        await adminApi.createBlogCategory(form)
        showToast(t('categories.toasts.createSuccess'))
      }
      setShowModal(false)
      fetchCategories()
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data?.errors
      setFormError(typeof msg === 'object' ? Object.values(msg).flat().join(', ') : msg || t('common.somethingWentWrong'))
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    if (!deletingCategory) return
    setDeleting(true)
    try {
      await adminApi.deleteBlogCategory(deletingCategory.id)
      showToast(t('categories.toasts.deleteSuccess'))
      setShowDeleteModal(false)
      setDeletingCategory(null)
      fetchCategories()
    } catch (err) {
      const msg = err.response?.data?.intercepted
        ? err.response.data.message
        : t('categories.toasts.deleteError')
      showToast(msg, err.response?.data?.intercepted ? 'warning' : 'error')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-display font-bold text-gray-900 dark:text-white">{t('categories.title')}</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{t('categories.subtitle')}</p>
        </div>
        {canDo('categories', 'create') && (
          <button
            onClick={openCreateModal}
            className="btn-primary flex items-center gap-2 text-sm"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
            </svg>
            {t('categories.actions.add')}
          </button>
        )}
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        <div className="surface-panel !p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-brand-violet/10 dark:bg-brand-violet/20 flex items-center justify-center">
            <svg className="w-5 h-5 text-brand-violet" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400">{t('categories.stats.total')}</p>
            <p className="text-lg font-bold text-gray-900 dark:text-white">{categories.length}</p>
          </div>
        </div>

        <div className="surface-panel !p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
            <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400">{t('categories.stats.used')}</p>
            <p className="text-lg font-bold text-blue-500">{usedCategories}</p>
          </div>
        </div>

        <div className="surface-panel !p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
            <svg className="w-5 h-5 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400">{t('categories.stats.unused')}</p>
            <p className="text-lg font-bold text-amber-500">{unusedCategories}</p>
          </div>
        </div>
      </div>

      {/* Search & Sort */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mb-6">
        <div className="relative flex-1">
          <svg className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t('categories.searchPlaceholder')}
            className="input-field pl-10 text-sm w-full"
          />
        </div>
        <div className="w-48">
          <CustomSelect
            value={sortBy}
            onChange={(val) => setSortBy(val)}
            options={[
              { label: t('categories.sort.nameAsc'), value: 'name' },
              { label: t('categories.sort.nameDesc'), value: 'name-desc' },
              { label: t('categories.sort.mostPosts'), value: 'posts' },
              { label: t('categories.sort.newest'), value: 'newest' },
              { label: t('categories.sort.oldest'), value: 'oldest' },
            ]}
            placeholder={t('categories.sort.placeholder')}
          />
        </div>
      </div>

      {/* Categories Grid */}
      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-10 h-10 border-4 border-brand-violet/30 border-t-brand-violet rounded-full animate-spin" />
        </div>
      ) : filteredCategories.length === 0 ? (
        <Empty className="surface-panel">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <FolderOpen className="size-5" strokeWidth={1.75} />
            </EmptyMedia>
            <EmptyTitle>{t('categories.empty')}</EmptyTitle>
          </EmptyHeader>
        </Empty>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCategories.map((cat) => (
            <div
              key={cat.id}
              className="surface-panel p-5 flex flex-col justify-between hover:-translate-y-0.5 transition-all"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: cat.color || '#7b2fff' }}
                    />
                    <h3 className="font-semibold text-gray-900 dark:text-white text-base">
                      {cat.name}
                    </h3>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-400">
                    {t('categories.postsCount', { count: cat.posts_count || 0 })}
                  </span>
                </div>
                <p className="text-xs font-mono text-gray-400 mb-2">/{cat.slug}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2">
                  {cat.description || t('categories.noDescription')}
                </p>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 mt-4 border-t border-gray-100 dark:border-white/5">
                {canDo('categories', 'update') && (
                  <button
                    type="button"
                    onClick={() => openEditModal(cat)}
                    className="p-1.5 rounded-lg text-gray-400 hover:text-brand-violet dark:hover:text-brand-cyan transition-colors"
                    title={t('common.edit')}
                    aria-label={t('common.edit')}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                  </button>
                )}
                {canDo('categories', 'delete') && (
                  <button
                    type="button"
                    onClick={() => {
                      setDeletingCategory(cat)
                      setShowDeleteModal(true)
                    }}
                    className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 transition-colors"
                    title={t('common.delete')}
                    aria-label={t('common.delete')}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="surface-panel w-full max-w-md p-6 shadow-2xl relative">
            <h3 className="font-display text-lg font-bold text-gray-900 dark:text-white mb-4">
              {editingCategory ? t('categories.modal.editTitle') : t('categories.modal.addTitle')}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t('categories.form.name')}
                </label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={onNameChange}
                  className="input-field text-sm"
                  placeholder={t('categories.form.namePlaceholder')}
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t('categories.form.slug')}
                </label>
                <input
                  type="text"
                  required
                  value={form.slug}
                  onChange={(e) => setForm({ ...form, slug: e.target.value })}
                  className="input-field text-sm font-mono"
                  placeholder={t('categories.form.slugPlaceholder')}
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t('categories.form.description')}
                </label>
                <textarea
                  rows={3}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="input-field text-sm resize-none"
                  placeholder={t('categories.form.descriptionPlaceholder')}
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t('categories.form.colorTag')}
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={form.color}
                    onChange={(e) => setForm({ ...form, color: e.target.value })}
                    className="w-10 h-10 rounded-xl cursor-pointer border-0 bg-transparent"
                  />
                  <input
                    type="text"
                    value={form.color}
                    onChange={(e) => setForm({ ...form, color: e.target.value })}
                    className="input-field text-sm font-mono flex-1"
                  />
                </div>
              </div>

              {formError && <p className="text-xs text-red-500">{formError}</p>}

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
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

      {/* Delete Confirmation Modal */}
      <DeleteConfirmDialog
        open={showDeleteModal && Boolean(deletingCategory)}
        onCancel={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
        loading={deleting}
        title={t('categories.deleteModal.title')}
        description={
          deletingCategory ? (
            <Trans
              t={t}
              i18nKey="categories.deleteModal.message"
              values={{ name: deletingCategory.name }}
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
