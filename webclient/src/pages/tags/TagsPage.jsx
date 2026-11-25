import React, { useState, useEffect, useMemo } from 'react'
import { useTranslation, Trans } from 'react-i18next'
import { adminApi } from '@/services'
import { useAuth } from '@/contexts/AuthContext'
import { useUi } from '@/contexts/UiContext'
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty'
import DeleteConfirmDialog from '@/components/ui/delete-confirm-dialog'
import { Tag } from 'lucide-react'
import slugify from 'slugify'

export default function TagsView() {
  const { t, i18n } = useTranslation('management')
  const { canDo } = useAuth()
  const { showToast } = useUi()

  const [tags, setTags] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

  // Create / Edit Modal
  const [showModal, setShowModal] = useState(false)
  const [editingTag, setEditingTag] = useState(null)
  const [form, setForm] = useState({ name: '', slug: '', color: '#7b2fff', logo: '' })
  const [logoMode, setLogoMode] = useState('url')
  const [logoFile, setLogoFile] = useState(null)
  const [logoPreview, setLogoPreview] = useState('')
  const [formError, setFormError] = useState('')
  const [saving, setSaving] = useState(false)

  // Delete Modal
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deletingTag, setDeletingTag] = useState(null)
  const [deleting, setDeleting] = useState(false)

  async function fetchTags() {
    setLoading(true)
    try {
      const res = await adminApi.getTags()
      setTags(res.data.data || [])
    } catch {
      showToast(t('tags.toasts.loadError'), 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTags()
  }, [])

  const usedTags = useMemo(
    () => tags.filter((tag) => (tag.projects_count || 0) > 0).length,
    [tags]
  )
  const unusedTags = useMemo(
    () => tags.filter((tag) => (tag.projects_count || 0) === 0).length,
    [tags]
  )
  const uniqueColors = useMemo(
    () => new Set(tags.map((tag) => tag.color)).size,
    [tags]
  )

  const filteredTags = useMemo(() => {
    if (!searchQuery.trim()) return tags
    const q = searchQuery.toLowerCase()
    return tags.filter(
      (tag) =>
        tag.name.toLowerCase().includes(q) ||
        tag.slug.toLowerCase().includes(q)
    )
  }, [tags, searchQuery])

  function openCreateModal() {
    setEditingTag(null)
    setForm({ name: '', slug: '', color: '#7b2fff', logo: '' })
    setLogoMode('url')
    setLogoFile(null)
    setLogoPreview('')
    setFormError('')
    setShowModal(true)
  }

  function openEditModal(tag) {
    setEditingTag(tag)
    setForm({
      name: tag.name,
      slug: tag.slug,
      color: tag.color || '#7b2fff',
      logo: tag.logo || '',
    })
    setLogoMode('url')
    setLogoFile(null)
    setLogoPreview(tag.logo || '')
    setFormError('')
    setShowModal(true)
  }

  function handleLogoFileChange(e) {
    const file = e.target.files?.[0]
    if (!file) return
    setLogoFile(file)
    setLogoPreview(URL.createObjectURL(file))
  }

  function clearLogo() {
    setLogoFile(null)
    setLogoPreview('')
    setForm((prev) => ({ ...prev, logo: '' }))
  }

  function onNameChange(e) {
    const val = e.target.value
    if (!editingTag) {
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
      let payload = form
      if (logoMode === 'upload' && logoFile) {
        const fd = new FormData()
        fd.append('name', form.name)
        fd.append('slug', form.slug)
        fd.append('color', form.color || '#7b2fff')
        fd.append('logo_file', logoFile)
        if (editingTag) {
          fd.append('_method', 'PUT')
        }
        payload = fd
      }

      if (editingTag) {
        await adminApi.updateTag(editingTag.id, payload)
        showToast(t('tags.toasts.updateSuccess'))
      } else {
        await adminApi.createTag(payload)
        showToast(t('tags.toasts.createSuccess'))
      }
      setShowModal(false)
      fetchTags()
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data?.errors
      setFormError(typeof msg === 'object' ? Object.values(msg).flat().join(', ') : msg || t('common.somethingWentWrong'))
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    if (!deletingTag) return
    setDeleting(true)
    try {
      await adminApi.deleteTag(deletingTag.id)
      showToast(t('tags.toasts.deleteSuccess'))
      setShowDeleteModal(false)
      setDeletingTag(null)
      fetchTags()
    } catch (err) {
      const msg = err.response?.data?.intercepted
        ? err.response.data.message
        : t('tags.toasts.deleteError')
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
          <h1 className="text-2xl font-display font-bold text-gray-900 dark:text-white">{t('tags.title')}</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {t('tags.subtitle')}
          </p>
        </div>
        {canDo('tags', 'create') && (
          <button
            onClick={openCreateModal}
            className="btn-primary flex items-center gap-2 text-sm"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
            </svg>
            {t('tags.actions.add')}
          </button>
        )}
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="surface-panel !p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-brand-violet/10 dark:bg-brand-violet/20 flex items-center justify-center">
            <svg className="w-5 h-5 text-brand-violet" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
            </svg>
          </div>
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400">{t('tags.stats.total')}</p>
            <p className="text-lg font-bold text-gray-900 dark:text-white">{tags.length}</p>
          </div>
        </div>

        <div className="surface-panel !p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
            <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
            </svg>
          </div>
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400">{t('tags.stats.used')}</p>
            <p className="text-lg font-bold text-blue-500">{usedTags}</p>
          </div>
        </div>

        <div className="surface-panel !p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
            <svg className="w-5 h-5 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400">{t('tags.stats.unused')}</p>
            <p className="text-lg font-bold text-amber-500">{unusedTags}</p>
          </div>
        </div>

        <div className="surface-panel !p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center">
            <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
            </svg>
          </div>
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400">{t('tags.stats.uniqueColors')}</p>
            <p className="text-lg font-bold text-green-500">{uniqueColors}</p>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <svg className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t('tags.searchPlaceholder')}
            className="input-field pl-10 text-sm w-full"
          />
        </div>
      </div>

      {/* Tags Grid */}
      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-10 h-10 border-4 border-brand-violet/30 border-t-brand-violet rounded-full animate-spin" />
        </div>
      ) : filteredTags.length === 0 ? (
        <Empty className="surface-panel">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <Tag className="size-5" strokeWidth={1.75} />
            </EmptyMedia>
            <EmptyTitle>{t('tags.empty')}</EmptyTitle>
          </EmptyHeader>
        </Empty>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {filteredTags.map((tag) => (
            <div
              key={tag.id}
              className="surface-panel p-4 flex flex-col justify-between hover:-translate-y-0.5 transition-all group"
            >
              <div className="flex items-center gap-2.5 mb-2">
                {tag.logo ? (
                  <img
                    src={tag.logo}
                    alt={tag.name}
                    className="w-6 h-6 object-contain shrink-0"
                    loading="lazy"
                  />
                ) : (
                  <span
                    className="w-3 h-3 rounded-full shrink-0"
                    style={{ backgroundColor: tag.color || '#7b2fff' }}
                  />
                )}
                <span className="font-semibold text-gray-900 dark:text-white text-sm truncate">
                  {tag.name}
                </span>
                {tag.logo && (
                  <span
                    className="w-2 h-2 rounded-full shrink-0 ml-auto"
                    style={{ backgroundColor: tag.color || '#7b2fff' }}
                  />
                )}
              </div>
              <p className="text-xs text-gray-400 font-mono mb-2">/{tag.slug}</p>
              <div className="flex items-center justify-between text-xs text-gray-500 pt-2 border-t border-gray-100 dark:border-white/5">
                <span>{t('tags.projectsCount', { count: tag.projects_count || 0 })}</span>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  {canDo('tags', 'update') && (
                    <button
                      type="button"
                      onClick={() => openEditModal(tag)}
                      className="p-1 hover:text-brand-violet dark:hover:text-brand-cyan"
                      title={t('common.edit')}
                      aria-label={t('common.edit')}
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                      </svg>
                    </button>
                  )}
                  {canDo('tags', 'delete') && (
                    <button
                      type="button"
                      onClick={() => {
                        setDeletingTag(tag)
                        setShowDeleteModal(true)
                      }}
                      className="p-1 hover:text-red-500"
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
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="surface-panel w-full max-w-md p-6 shadow-2xl relative">
            <h3 className="font-display text-lg font-bold text-gray-900 dark:text-white mb-4">
              {editingTag ? t('tags.modal.editTitle') : t('tags.modal.addTitle')}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t('tags.form.name')}
                </label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={onNameChange}
                  className="input-field text-sm"
                  placeholder={t('tags.form.namePlaceholder')}
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t('tags.form.slug')}
                </label>
                <input
                  type="text"
                  required
                  value={form.slug}
                  onChange={(e) => setForm({ ...form, slug: e.target.value })}
                  className="input-field text-sm font-mono"
                  placeholder={t('tags.form.slugPlaceholder')}
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t('tags.form.color')}
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

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">
                    {t('tags.form.logo')}
                  </label>
                  <div className="inline-flex rounded-lg bg-gray-100 dark:bg-dark-700 p-0.5 text-[11px] font-medium">
                    <button
                      type="button"
                      onClick={() => setLogoMode('url')}
                      className={`px-2.5 py-1 rounded-md transition-colors ${
                        logoMode === 'url'
                          ? 'bg-white dark:bg-dark-800 text-gray-900 dark:text-white shadow-sm'
                          : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                      }`}
                    >
                      {t('tags.form.logoModeUrl')}
                    </button>
                    <button
                      type="button"
                      onClick={() => setLogoMode('upload')}
                      className={`px-2.5 py-1 rounded-md transition-colors ${
                        logoMode === 'upload'
                          ? 'bg-white dark:bg-dark-800 text-gray-900 dark:text-white shadow-sm'
                          : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                      }`}
                    >
                      {t('tags.form.logoModeUpload')}
                    </button>
                  </div>
                </div>

                {logoMode === 'url' ? (
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 flex items-center justify-center shrink-0 overflow-hidden p-1.5">
                      {form.logo ? (
                        <img src={form.logo} alt={form.name || t('tags.form.logo')} className="w-full h-full object-contain" />
                      ) : (
                        <span
                          className="w-3.5 h-3.5 rounded-full"
                          style={{ backgroundColor: form.color || '#7b2fff' }}
                        />
                      )}
                    </div>
                    <input
                      type="url"
                      value={form.logo}
                      onChange={(e) => {
                        setLogoFile(null)
                        setLogoPreview(e.target.value)
                        setForm({ ...form, logo: e.target.value })
                      }}
                      className="input-field text-xs font-mono flex-1"
                      placeholder={t('tags.form.logoPlaceholder')}
                    />
                    {form.logo && (
                      <button
                        type="button"
                        onClick={clearLogo}
                        className="text-xs text-red-500 hover:text-red-600 px-1.5"
                        title={t('tags.form.logoRemove')}
                        aria-label={t('tags.form.logoRemove')}
                      >
                        ✕
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="space-y-2">
                    <label className="flex items-center gap-3 p-3 rounded-xl border border-dashed border-gray-300 dark:border-white/15 bg-gray-50/70 dark:bg-white/[0.02] hover:border-brand-violet/50 cursor-pointer transition-colors">
                      <div className="w-11 h-11 rounded-xl bg-white dark:bg-dark-800 border border-gray-200 dark:border-white/10 flex items-center justify-center shrink-0 overflow-hidden p-1.5">
                        {logoPreview || form.logo ? (
                          <img
                            src={logoPreview || form.logo}
                            alt={form.name || t('tags.form.logoPreviewAlt')}
                            className="w-full h-full object-contain"
                          />
                        ) : (
                          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                          </svg>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-medium text-gray-700 dark:text-gray-200 truncate">
                          {logoFile ? logoFile.name : t('tags.form.logoModeUpload')}
                        </p>
                        <p className="text-[11px] text-gray-400 mt-0.5">
                          {t('tags.form.logoUploadHint')}
                        </p>
                      </div>
                      <input
                        type="file"
                        accept=".svg,.png,.jpg,.jpeg,.webp,.gif,image/*"
                        onChange={handleLogoFileChange}
                        className="hidden"
                      />
                    </label>
                    {(logoFile || form.logo) && (
                      <div className="flex justify-end">
                        <button
                          type="button"
                          onClick={clearLogo}
                          className="text-xs text-red-500 hover:underline"
                        >
                          {t('tags.form.logoRemove')}
                        </button>
                      </div>
                    )}
                  </div>
                )}
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
        open={showDeleteModal && Boolean(deletingTag)}
        onCancel={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
        loading={deleting}
        title={t('tags.deleteModal.title')}
        description={
          deletingTag ? (
            <Trans
              t={t}
              i18nKey="tags.deleteModal.message"
              values={{ name: deletingTag.name }}
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
