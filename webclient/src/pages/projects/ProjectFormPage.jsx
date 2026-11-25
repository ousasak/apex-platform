import React, { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { adminApi, memberApi } from '@/services'
import { useUi } from '@/contexts/UiContext'
import ContentEditor from '@/components/common/ContentEditor'
import CustomSelect from '@/components/common/CustomSelect'
import BackButton from '@/components/ui/back-button'
import slugify from 'slugify'

export default function ProjectFormView() {
  const { t, i18n } = useTranslation('projects')
  const { id } = useParams()
  const navigate = useNavigate()
  const { showToast } = useUi()
  const isEdit = Boolean(id)

  const [form, setForm] = useState({
    title: '',
    slug: '',
    description: '',
    long_description: '',
    demo_url: '',
    repo_url: '',
    status: 'active',
    is_featured: false,
    is_open_source: false,
    collection_id: '',
    storage_provider: 'supabase',
  })

  const [selectedTags, setSelectedTags] = useState([])
  const [availableTags, setAvailableTags] = useState([])
  const [collections, setCollections] = useState([])
  const [allowedProviders, setAllowedProviders] = useState('both')

  // Cover image
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState('')
  const [existingImage, setExistingImage] = useState('')

  // State flags
  const [loading, setLoading] = useState(isEdit)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  // Collection modal
  const [collectionModalOpen, setCollectionModalOpen] = useState(false)
  const [newCollection, setNewCollection] = useState({ name: '', slug: '' })
  const [collectionSaving, setCollectionSaving] = useState(false)
  const [collectionModalError, setCollectionModalError] = useState('')

  useEffect(() => {
    async function loadMeta() {
      try {
        const [tagsRes, colRes, storageRes] = await Promise.all([
          adminApi.getTags(),
          adminApi.getAssignableCollections(),
          memberApi.getStorageSettings().catch(() => ({ data: {} })),
        ])
        setAvailableTags(tagsRes.data?.data || [])
        setCollections(colRes.data?.data || [])
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
    async function loadProject() {
      try {
        setLoading(true)
        const { data } = await adminApi.getProject(id)
        const p = data.data
        setForm({
          title: p.title || '',
          slug: p.slug || '',
          description: p.description || '',
          long_description: p.long_description || '',
          demo_url: p.demo_url || '',
          repo_url: p.repo_url || '',
          status: p.status || 'active',
          is_featured: Boolean(p.is_featured),
          is_open_source: Boolean(p.is_open_source),
          collection_id: p.collection_id || p.collection?.id ? String(p.collection_id || p.collection?.id) : '',
          storage_provider: p.storage_provider || 'supabase',
        })
        setExistingImage(p.cover_image || p.image || '')
        setSelectedTags((p.tags || []).map((t) => t.id))
      } catch {
        showToast(t('form.toasts.loadFailed'), 'error')
      } finally {
        setLoading(false)
      }
    }
    loadProject()
  }, [id, isEdit])

  function autoSlug(e) {
    if (!isEdit) {
      setForm((prev) => ({
        ...prev,
        title: e.target.value,
        slug: slugify(e.target.value, { lower: true, strict: true }),
      }))
    } else {
      setForm((prev) => ({ ...prev, title: e.target.value }))
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

  async function handleCreateCollectionInline() {
    if (!newCollection.name) return
    setCollectionSaving(true)
    setCollectionModalError('')
    try {
      const { data } = await adminApi.createCollection(newCollection)
      const created = data.data
      setCollections((prev) => [created, ...prev])
      setForm((f) => ({ ...f, collection_id: String(created.id) }))
      setCollectionModalOpen(false)
      setNewCollection({ name: '', slug: '' })
      showToast(t('form.toasts.collectionCreated'))
    } catch (err) {
      setCollectionModalError(err.response?.data?.message || t('form.toasts.collectionCreateFailed'))
    } finally {
      setCollectionSaving(false)
    }
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setSaving(true)
    setError('')

    const formData = new FormData()
    formData.append('title', form.title)
    formData.append('slug', form.slug)
    formData.append('description', form.description)
    formData.append('long_description', form.long_description || '')
    formData.append('demo_url', form.demo_url || '')
    formData.append('repo_url', form.repo_url || '')
    formData.append('status', form.status)
    formData.append('is_featured', form.is_featured ? '1' : '0')
    formData.append('is_open_source', form.is_open_source ? '1' : '0')
    formData.append('collection_id', form.collection_id || '')
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
        await adminApi.updateProject(id, formData)
        showToast(t('form.toasts.updated'))
      } else {
        await adminApi.createProject(formData)
        showToast(t('form.toasts.created'))
      }
      navigate('/admin/projects')
    } catch (err) {
      if (err.response?.status === 202 && err.response?.data?.intercepted) {
        showToast(err.response.data.message || err.message, 'info')
        navigate('/admin/projects')
        return
      }
      setError(err.response?.data?.message || t('form.toasts.saveFailed'))
    } finally {
      setSaving(false)
    }
  }

  function getProviderLabel(provider) {
    if (provider === 'supabase') return t('form.storage.supabase')
    if (provider === 'cloudinary') return t('form.storage.cloudinary')
    return provider
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
          to="/admin/projects"
          className="text-gray-500 hover:text-brand-violet dark:hover:text-brand-cyan transition-colors"
        >
          {t('admin.title')}
        </Link>
        <span className="text-gray-400">/</span>
        <span className="text-gray-900 dark:text-white font-medium">
          {isEdit ? t('form.breadcrumb.edit') : t('form.breadcrumb.new')}
        </span>
      </nav>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-display font-bold text-gray-900 dark:text-white">
            {isEdit ? t('form.header.editTitle') : t('form.header.createTitle')}
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {isEdit ? t('form.header.editSubtitle') : t('form.header.createSubtitle')}
          </p>
        </div>
        <BackButton to="/admin/projects" className="self-start sm:self-auto" />
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            <div className="surface-panel !p-6 space-y-5">
              <h2 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                {t('form.sections.basicInfo')}
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

              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  {t('form.fields.slug')} <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs text-gray-400">
                    /projects/
                  </span>
                  <input
                    type="text"
                    required
                    value={form.slug}
                    onChange={(e) => setForm({ ...form, slug: e.target.value })}
                    className="input-field pl-20"
                    placeholder={t('form.placeholders.slug')}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  {t('form.fields.shortDescription')} <span className="text-red-400">*</span>
                </label>
                <textarea
                  required
                  rows={2}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder={t('form.placeholders.shortDescription')}
                  className="input-field resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  {t('form.fields.longDescription')}
                </label>
                <ContentEditor
                  value={form.long_description}
                  onChange={(val) => setForm({ ...form, long_description: val })}
                />
              </div>
            </div>

            {/* Links */}
            <div className="surface-panel !p-6 space-y-5">
              <h2 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                {t('form.sections.links')}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    {t('form.fields.demoUrl')}
                  </label>
                  <input
                    type="url"
                    value={form.demo_url}
                    onChange={(e) => setForm({ ...form, demo_url: e.target.value })}
                    placeholder={t('form.placeholders.demoUrl')}
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    {t('form.fields.repoUrl')}
                  </label>
                  <input
                    type="url"
                    value={form.repo_url}
                    onChange={(e) => setForm({ ...form, repo_url: e.target.value })}
                    placeholder={t('form.placeholders.repoUrl')}
                    className="input-field"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Settings & Sidebar */}
          <div className="space-y-6">
            {/* Cover Image */}
            <div className="surface-panel !p-6 space-y-4">
              <h2 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                {t('form.sections.coverImage')}
              </h2>

              {/* Storage Provider Selector */}
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
                    {getProviderLabel(allowedProviders)}
                  </div>
                )}
              </div>

              {/* Image Preview / Input */}
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
                      {t('form.coverImage.remove')}
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

            {/* Settings */}
            <div className="surface-panel !p-6 space-y-4">
              <h2 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                {t('form.sections.settings')}
              </h2>

              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  {t('form.fields.status')}
                </label>
                <CustomSelect
                  value={form.status}
                  onChange={(val) => setForm({ ...form, status: val })}
                  options={[
                    { label: t('status.active'), value: 'active' },
                    { label: t('status.workInProgress'), value: 'wip' },
                    { label: t('status.archived'), value: 'archived' },
                  ]}
                  placeholder={t('status.active')}
                />
              </div>

              <div className="flex items-center justify-between py-2">
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{t('common.featured')}</p>
                  <p className="text-[10px] text-gray-400">{t('form.fields.featuredHint')}</p>
                </div>
                <button
                  type="button"
                  aria-label={t('common.featured')}
                  onClick={() => setForm({ ...form, is_featured: !form.is_featured })}
                  className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                    form.is_featured ? 'bg-brand-violet dark:bg-brand-cyan' : 'bg-gray-300 dark:bg-dark-600'
                  }`}
                >
                  <span
                    className={`inline-block h-3 w-3 rounded-full bg-white transition-transform ${
                      form.is_featured ? 'translate-x-5' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between py-2">
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{t('common.openSource')}</p>
                  <p className="text-[10px] text-gray-400">{t('form.fields.openSourceHint')}</p>
                </div>
                <button
                  type="button"
                  aria-label={t('common.openSource')}
                  onClick={() => setForm({ ...form, is_open_source: !form.is_open_source })}
                  className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                    form.is_open_source ? 'bg-brand-violet dark:bg-brand-cyan' : 'bg-gray-300 dark:bg-dark-600'
                  }`}
                >
                  <span
                    className={`inline-block h-3 w-3 rounded-full bg-white transition-transform ${
                      form.is_open_source ? 'translate-x-5' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* Collection */}
            <div className="surface-panel !p-6 space-y-4">
              <h2 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                {t('form.sections.collection')}
              </h2>
              <div className="flex gap-2">
                <CustomSelect
                  value={form.collection_id}
                  onChange={(val) => setForm({ ...form, collection_id: val })}
                  options={[
                    { label: t('form.fields.none'), value: '' },
                    ...collections.map((c) => ({ label: c.name, value: String(c.id) })),
                  ]}
                  placeholder={t('form.fields.none')}
                />
                <button
                  type="button"
                  onClick={() => setCollectionModalOpen(true)}
                  className="px-3 py-2 rounded-lg border border-gray-200 dark:border-white/10 text-xs font-medium text-brand-violet dark:text-brand-cyan"
                >
                  {t('form.actions.newCollection')}
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
                <p className="text-xs text-gray-400">{t('form.empty.noTags')}</p>
              )}
            </div>

            {/* Actions Card */}
            <div className="surface-panel !p-6 space-y-3">
              <button
                type="submit"
                disabled={saving}
                className="btn-primary w-full flex items-center justify-center gap-2 text-sm"
              >
                {saving ? t('common.saving') : isEdit ? t('form.actions.updateProject') : t('form.actions.createProject')}
              </button>
              <Link
                to="/admin/projects"
                className="btn-secondary w-full flex items-center justify-center gap-2 text-sm"
              >
                {t('common.cancel')}
              </Link>
              {error && <p className="text-xs text-red-500 text-center">{error}</p>}
            </div>
          </div>
        </div>
      </form>

      {/* New Collection Inline Modal */}
      {collectionModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="surface-panel w-full max-w-sm p-6 shadow-2xl space-y-3">
            <h3 className="font-display text-lg font-bold text-gray-900 dark:text-white">
              {t('collections.modal.newTitle')}
            </h3>
            <input
              type="text"
              value={newCollection.name}
              onChange={(e) =>
                setNewCollection({
                  name: e.target.value,
                  slug: slugify(e.target.value, { lower: true, strict: true }),
                })
              }
              placeholder={t('collections.placeholders.nameInline')}
              className="input-field text-sm"
            />
            <input
              type="text"
              value={newCollection.slug}
              onChange={(e) => setNewCollection({ ...newCollection, slug: e.target.value })}
              placeholder={t('collections.fields.slug')}
              className="input-field text-sm font-mono"
            />
            {collectionModalError && (
              <p className="text-xs text-red-500">{collectionModalError}</p>
            )}
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setCollectionModalOpen(false)}
                className="btn-secondary text-xs"
              >
                {t('common.cancel')}
              </button>
              <button
                type="button"
                disabled={collectionSaving}
                onClick={handleCreateCollectionInline}
                className="btn-primary text-xs"
              >
                {collectionSaving ? t('common.creating') : t('common.create')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
