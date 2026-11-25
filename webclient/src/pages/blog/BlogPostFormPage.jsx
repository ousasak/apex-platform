import React, { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { adminApi, memberApi } from '@/services'
import { useUi } from '@/contexts/UiContext'
import ContentEditor from '@/components/common/ContentEditor'
import CustomSelect from '@/components/common/CustomSelect'
import BackButton from '@/components/ui/back-button'
import slugify from 'slugify'

export default function BlogPostFormView() {
  const { t } = useTranslation('blog')
  const { id } = useParams()
  const navigate = useNavigate()
  const { showToast } = useUi()
  const isEdit = Boolean(id)

  const [form, setForm] = useState({
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    category_id: '',
    series_id: '',
    status: 'draft',
    storage_provider: 'supabase',
  })

  const [selectedTags, setSelectedTags] = useState([])
  const [categories, setCategories] = useState([])
  const [availableTags, setAvailableTags] = useState([])
  const [seriesList, setSeriesList] = useState([])
  const [allowedProviders, setAllowedProviders] = useState('both')

  // Cover image
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState('')
  const [existingImage, setExistingImage] = useState('')

  // State flags
  const [loading, setLoading] = useState(isEdit)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [slugEditing, setSlugEditing] = useState(false)
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false)

  // Series modal
  const [seriesModalOpen, setSeriesModalOpen] = useState(false)
  const [newSeries, setNewSeries] = useState({ name: '', slug: '', description: '' })
  const [seriesSaving, setSeriesSaving] = useState(false)
  const [seriesModalError, setSeriesModalError] = useState('')

  useEffect(() => {
    async function loadMeta() {
      try {
        const [catsRes, tagsRes, seriesRes, storageRes] = await Promise.all([
          adminApi.getBlogCategories(),
          adminApi.getTags(),
          adminApi.getAssignableSeries(),
          memberApi.getStorageSettings().catch(() => ({ data: {} })),
        ])
        setCategories(catsRes.data?.data || [])
        setAvailableTags(tagsRes.data?.data || [])
        setSeriesList(seriesRes.data?.data || [])
        const allowed = storageRes.data?.data?.allowed_storage_providers || 'both'
        setAllowedProviders(allowed)
        if (allowed !== 'both') {
          setForm((f) => ({ ...f, storage_provider: allowed }))
        }
      } catch {
        // ignore
      }
    }
    loadMeta()
  }, [])

  useEffect(() => {
    if (!isEdit) return
    async function loadPost() {
      try {
        setLoading(true)
        const { data } = await adminApi.getBlogPost(id)
        const p = data.data
        setForm({
          title: p.title || '',
          slug: p.slug || '',
          excerpt: p.excerpt || '',
          content: p.content || '',
          category_id: p.category_id ? String(p.category_id) : '',
          series_id: p.series_id ? String(p.series_id) : '',
          status: p.status || 'draft',
          storage_provider: 'supabase',
        })
        setExistingImage(p.cover_image || '')
        setSelectedTags((p.tags || []).map((t) => t.id))
      } catch {
        showToast(t('form.toast.loadFailed'), 'error')
      } finally {
        setLoading(false)
      }
    }
    loadPost()
  }, [id, isEdit])

  function autoSlug(e) {
    const val = e.target.value
    if (!isEdit && !slugManuallyEdited) {
      setForm((prev) => ({
        ...prev,
        title: val,
        slug: slugify(val, { lower: true, strict: true }),
      }))
    } else {
      setForm((prev) => ({ ...prev, title: val }))
    }
  }

  function handleFileChange(e) {
    const file = e.target.files?.[0]
    if (!file) return
    setImageFile(file)
    setImagePreview(URL.createObjectURL(file))
  }

  function removeImage() {
    setImageFile(null)
    setImagePreview('')
    setExistingImage('')
  }

  function toggleTag(tagId) {
    setSelectedTags((prev) =>
      prev.includes(tagId) ? prev.filter((i) => i !== tagId) : [...prev, tagId]
    )
  }

  async function handleCreateSeriesInline() {
    if (!newSeries.name) return
    setSeriesSaving(true)
    setSeriesModalError('')
    try {
      const { data } = await adminApi.createSeries(newSeries)
      const created = data.data
      setSeriesList((prev) => [created, ...prev])
      setForm((f) => ({ ...f, series_id: String(created.id) }))
      setSeriesModalOpen(false)
      setNewSeries({ name: '', slug: '', description: '' })
      showToast(t('form.toast.seriesCreated'))
    } catch (err) {
      setSeriesModalError(err.response?.data?.message || t('form.toast.seriesCreateFailed'))
    } finally {
      setSeriesSaving(false)
    }
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setSaving(true)
    setError('')

    const formData = new FormData()
    formData.append('title', form.title)
    formData.append('slug', form.slug)
    formData.append('excerpt', form.excerpt)
    formData.append('content', form.content)
    formData.append('status', form.status)
    formData.append('category_id', form.category_id || '')
    formData.append('series_id', form.series_id || '')
    formData.append('storage_provider', form.storage_provider)

    selectedTags.forEach((tId, idx) => {
      formData.append(`tags[${idx}]`, tId)
    })

    if (imageFile) {
      formData.append('cover_image', imageFile)
    }

    try {
      if (isEdit) {
        formData.append('_method', 'PUT')
        await adminApi.updateBlogPost(id, formData)
        showToast(t('form.toast.updated'))
      } else {
        await adminApi.createBlogPost(formData)
        showToast(t('form.toast.created'))
      }
      navigate('/admin/blog')
    } catch (err) {
      if (err.response?.status === 202 && err.response?.data?.intercepted) {
        showToast(err.response.data.message || err.message, 'info')
        navigate('/admin/blog')
        return
      }
      setError(err.response?.data?.message || t('form.toast.saveFailed'))
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="w-10 h-10 border-4 border-brand-violet/30 border-t-brand-violet rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div>
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm mb-6">
        <Link
          to="/admin/blog"
          className="text-gray-500 hover:text-brand-violet dark:hover:text-brand-cyan transition-colors"
        >
          {t('admin.title')}
        </Link>
        <span className="text-gray-400">/</span>
        <span className="text-gray-900 dark:text-white font-medium">
          {isEdit ? t('form.editPost') : t('form.newPost')}
        </span>
      </nav>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-display font-bold text-gray-900 dark:text-white">
            {isEdit ? t('form.editPost') : t('form.createPost')}
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {isEdit ? t('form.editSubtitle') : t('form.createSubtitle')}
          </p>
        </div>
        <BackButton to="/admin/blog" className="self-start sm:self-auto" />
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Content */}
          <div className="lg:col-span-2 space-y-6">
            <div className="surface-panel !p-6 space-y-5">
              <h2 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                {t('form.sections.postDetails')}
              </h2>

              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  {t('form.fields.title')} <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={form.title}
                  onChange={autoSlug}
                  placeholder={t('form.placeholders.title')}
                  className="input-field"
                />
              </div>

              {/* Permalink */}
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  {t('form.fields.permalink')}
                </label>
                {!slugEditing ? (
                  <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 dark:bg-white/[0.03] border border-gray-200 dark:border-white/10 rounded-full">
                    <span className="text-xs text-gray-500 dark:text-gray-400 truncate">
                      /blog/<span className="text-brand-violet dark:text-brand-cyan font-medium">{form.slug || t('form.placeholders.slugFallback')}</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => setSlugEditing(true)}
                      className="ml-auto text-[10px] font-semibold text-brand-violet dark:text-brand-cyan hover:underline"
                    >
                      {t('common.edit')}
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <span className="inline-flex items-center px-3 h-[42px] text-xs text-gray-500 bg-gray-100 dark:bg-white/5 border border-r-0 border-gray-200 dark:border-white/10 rounded-l-xl">
                        /blog/
                      </span>
                      <input
                        type="text"
                        required
                        value={form.slug}
                        onChange={(e) => {
                          setSlugManuallyEdited(true)
                          setForm({ ...form, slug: e.target.value })
                        }}
                        className="input-field !rounded-l-none"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setSlugEditing(false)}
                        className="text-[10px] font-semibold text-brand-violet dark:text-brand-cyan hover:underline"
                      >
                        {t('common.done')}
                      </button>
                      <span className="text-gray-300">|</span>
                      <button
                        type="button"
                        onClick={() => {
                          setForm({
                            ...form,
                            slug: slugify(form.title || 'post-title', { lower: true, strict: true }),
                          })
                          setSlugManuallyEdited(false)
                        }}
                        className="text-[10px] font-semibold text-gray-400 hover:underline"
                      >
                        {t('form.actions.resetFromTitle')}
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  {t('form.fields.excerpt')} <span className="text-red-400">*</span>
                </label>
                <textarea
                  required
                  rows={2}
                  value={form.excerpt}
                  onChange={(e) => setForm({ ...form, excerpt: e.target.value })}
                  placeholder={t('form.placeholders.excerpt')}
                  className="input-field resize-none"
                />
              </div>
            </div>

            {/* Content Editor */}
            <div className="surface-panel !p-6 space-y-4">
              <h2 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                {t('form.sections.content')} <span className="text-red-400">*</span>
              </h2>
              <ContentEditor
                value={form.content}
                onChange={(val) => setForm({ ...form, content: val })}
              />
            </div>
          </div>

          {/* Right Column: Settings & Sidebar */}
          <div className="space-y-6">
            {/* Cover Image */}
            <div className="surface-panel !p-6 space-y-4">
              <h2 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                {t('form.sections.coverImage')}
              </h2>

              {/* Storage Provider */}
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('form.fields.uploadTo')}
                </label>
                {allowedProviders === 'both' ? (
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setForm({ ...form, storage_provider: 'supabase' })}
                      className={`flex-1 px-3 py-2 rounded-lg border text-xs font-medium transition-all text-center ${
 form.storage_provider === 'supabase'
 ? 'bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-500/10 dark:text-emerald-400'
 : 'bg-white dark:bg-dark-700 text-gray-500 border-gray-200 dark:border-white/10'
 }`}
                    >
                      {t('form.storage.supabase')}
                    </button>
                    <button
                      type="button"
                      onClick={() => setForm({ ...form, storage_provider: 'cloudinary' })}
                      className={`flex-1 px-3 py-2 rounded-lg border text-xs font-medium transition-all text-center ${
 form.storage_provider === 'cloudinary'
 ? 'bg-blue-50 text-blue-700 border-blue-300 dark:bg-blue-500/10 dark:text-blue-400'
 : 'bg-white dark:bg-dark-700 text-gray-500 border-gray-200 dark:border-white/10'
 }`}
                    >
                      {t('form.storage.cloudinary')}
                    </button>
                  </div>
                ) : (
                  <div className="px-3 py-2 rounded-full border bg-gray-50 dark:bg-dark-700 text-xs text-gray-500">
                    {allowedProviders === 'supabase'
                      ? t('form.storage.supabase')
                      : allowedProviders === 'cloudinary'
                        ? t('form.storage.cloudinary')
                        : allowedProviders}
                  </div>
                )}
              </div>

              {imagePreview || existingImage ? (
                <div className="relative rounded-xl overflow-hidden group">
                  <img
                    src={imagePreview || existingImage}
                    alt={t('form.coverImage.previewAlt')}
                    className="w-full h-40 object-cover"
                  />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <button
                      type="button"
                      onClick={removeImage}
                      className="px-3 py-1.5 bg-white text-gray-900 text-xs rounded-lg font-medium"
                    >
                      {t('common.remove')}
                    </button>
                  </div>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-gray-300 dark:border-white/10 rounded-xl cursor-pointer hover:border-brand-violet transition-colors bg-gray-50/50 dark:bg-white/[0.02]">
                  <span className="text-xs text-gray-500">{t('form.coverImage.uploadPrompt')}</span>
                  <span className="text-[10px] text-gray-400 mt-1">{t('form.coverImage.uploadHint')}</span>
                  <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                </label>
              )}
            </div>

            {/* Publish Settings */}
            <div className="surface-panel !p-6 space-y-4">
              <h2 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                {t('form.sections.publishSettings')}
              </h2>
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  {t('form.fields.status')}
                </label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, status: 'draft' })}
                    className={`flex-1 px-3 py-2 rounded-lg border text-xs font-medium transition-all text-center ${
 form.status === 'draft'
 ? 'bg-yellow-50 text-yellow-700 border-yellow-300 dark:bg-yellow-500/10 dark:text-yellow-400'
 : 'bg-white dark:bg-dark-700 text-gray-500 border-gray-200 dark:border-white/10'
 }`}
                  >
                    {t('status.draft')}
                  </button>
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, status: 'published' })}
                    className={`flex-1 px-3 py-2 rounded-lg border text-xs font-medium transition-all text-center ${
 form.status === 'published'
 ? 'bg-green-50 text-green-700 border-green-300 dark:bg-green-500/10 dark:text-green-400'
 : 'bg-white dark:bg-dark-700 text-gray-500 border-gray-200 dark:border-white/10'
 }`}
                  >
                    {t('status.published')}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  {t('form.fields.category')}
                </label>
                <CustomSelect
                  value={form.category_id}
                  onChange={(val) => setForm({ ...form, category_id: val })}
                  options={[
                    { label: t('common.uncategorized'), value: '' },
                    ...categories.map((c) => ({ label: c.name, value: String(c.id) })),
                  ]}
                  placeholder={t('form.placeholders.selectCategory')}
                />
              </div>
            </div>

            {/* Series */}
            <div className="surface-panel !p-6 space-y-4">
              <h2 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                {t('form.sections.series')} <span className="text-gray-400 text-xs font-normal">({t('common.optional')})</span>
              </h2>
              <div className="flex gap-2">
                <CustomSelect
                  value={form.series_id}
                  onChange={(val) => setForm({ ...form, series_id: val })}
                  options={[
                    { label: t('common.none'), value: '' },
                    ...seriesList.map((s) => ({ label: s.name || s.title, value: String(s.id) })),
                  ]}
                  placeholder={t('common.none')}
                />
                <button
                  type="button"
                  onClick={() => setSeriesModalOpen(true)}
                  className="px-3 py-2 rounded-lg border border-gray-200 dark:border-white/10 text-xs font-medium text-brand-violet dark:text-brand-cyan"
                >
                  {t('common.new')}
                </button>
              </div>
            </div>

            {/* Tags */}
            <div className="surface-panel !p-6 space-y-4">
              <h2 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                {t('form.sections.tags')}
              </h2>
              {availableTags.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {availableTags.map((tag) => (
                    <button
                      key={tag.id}
                      type="button"
                      onClick={() => toggleTag(tag.id)}
                      className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
 selectedTags.includes(tag.id)
 ? 'ring-2 ring-brand-violet text-white bg-brand-violet'
 : 'bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-400'
 }`}
                    >
                      {tag.name}
                    </button>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-gray-400">{t('form.tags.empty')}</p>
              )}
            </div>

            {/* Actions Card */}
            <div className="surface-panel !p-6 space-y-3">
              <button
                type="submit"
                disabled={saving}
                className="btn-primary w-full flex items-center justify-center gap-2 text-sm"
              >
                {saving ? t('common.saving') : isEdit ? t('form.actions.updatePost') : t('form.actions.createPost')}
              </button>
              <Link
                to="/admin/blog"
                className="btn-secondary w-full flex items-center justify-center gap-2 text-sm"
              >
                {t('common.cancel')}
              </Link>
              {error && <p className="text-xs text-red-500 text-center">{error}</p>}
            </div>
          </div>
        </div>
      </form>

      {/* New Series Modal */}
      {seriesModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="surface-panel w-full max-w-sm p-6 shadow-2xl space-y-3">
            <h3 className="font-display text-lg font-bold text-gray-900 dark:text-white">
              {t('series.newSeries')}
            </h3>
            <input
              type="text"
              value={newSeries.name}
              onChange={(e) =>
                setNewSeries({
                  name: e.target.value,
                  slug: slugify(e.target.value, { lower: true, strict: true }),
                  description: newSeries.description,
                })
              }
              placeholder={t('form.seriesModal.titlePlaceholder')}
              className="input-field text-sm"
            />
            <input
              type="text"
              value={newSeries.slug}
              onChange={(e) => setNewSeries({ ...newSeries, slug: e.target.value })}
              placeholder={t('series.fields.slug')}
              className="input-field text-sm font-mono"
            />
            <textarea
              rows={2}
              value={newSeries.description}
              onChange={(e) => setNewSeries({ ...newSeries, description: e.target.value })}
              placeholder={t('form.seriesModal.descriptionPlaceholder')}
              className="input-field text-sm resize-none"
            />
            {seriesModalError && (
              <p className="text-xs text-red-500">{seriesModalError}</p>
            )}
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setSeriesModalOpen(false)}
                className="btn-secondary text-xs"
              >
                {t('common.cancel')}
              </button>
              <button
                type="button"
                disabled={seriesSaving}
                onClick={handleCreateSeriesInline}
                className="btn-primary text-xs"
              >
                {seriesSaving ? t('common.creating') : t('common.create')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
