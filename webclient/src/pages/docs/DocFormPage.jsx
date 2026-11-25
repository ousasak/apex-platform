import React, { useState, useEffect, useMemo, useRef } from 'react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { adminApi } from '@/services'
import ContentEditor from '@/components/common/ContentEditor'
import BackButton from '@/components/ui/back-button'

function slugify(text) {
  return (text || '')
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '')
    .replace(/--+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export default function DocFormView() {
  const { t, i18n } = useTranslation('docs')
  const navigate = useNavigate()
  const { id } = useParams()
  const [searchParams] = useSearchParams()

  const isEdit = Boolean(id)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [slugEditing, setSlugEditing] = useState(false)
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false)
  const [menus, setMenus] = useState([])
  const [allParentDocs, setAllParentDocs] = useState([])
  const [categories, setCategories] = useState([])
  const [catOpen, setCatOpen] = useState(false)
  const [newCatInput, setNewCatInput] = useState('')
  const catDropdownRef = useRef(null)

  const [form, setForm] = useState({
    title: '',
    slug: '',
    categories: ['General'],
    doc_menu_id: null,
    parent_id: null,
    order_num: 0,
    status: 'draft',
    sections: [],
  })

  // Docs grouped by menu for parent-page selector
  const groupedParentDocs = useMemo(() => {
    const groups = {}
    for (const doc of allParentDocs) {
      if (isEdit && doc.id === parseInt(id)) continue
      const menuEntry = menus.find(m => m.id === doc.doc_menu_id)
      const cat = menuEntry?.name || t('form.settings.parentPage.generalGroup')
      if (!groups[cat]) groups[cat] = []
      groups[cat].push(doc)
    }
    return groups
  }, [allParentDocs, menus, isEdit, id, t])

  function autoSlug(val) {
    if (!slugManuallyEdited) {
      setForm(prev => ({ ...prev, slug: slugify(val) }))
    }
  }

  function resetSlug() {
    setForm(prev => ({ ...prev, slug: slugify(prev.title) }))
    setSlugManuallyEdited(false)
  }

  // Section helpers
  function addSection() {
    setForm(prev => ({
      ...prev,
      sections: [
        ...prev.sections,
        {
          _key: Date.now() + Math.random(),
          heading: '',
          content: '',
        }
      ]
    }))
  }

  function removeSection(idx) {
    setForm(prev => ({
      ...prev,
      sections: prev.sections.filter((_, i) => i !== idx)
    }))
  }

  function moveSectionUp(idx) {
    if (idx === 0) return
    setForm(prev => {
      const arr = [...prev.sections]
      const temp = arr[idx - 1]
      arr[idx - 1] = arr[idx]
      arr[idx] = temp
      return { ...prev, sections: arr }
    })
  }

  function moveSectionDown(idx) {
    setForm(prev => {
      if (idx >= prev.sections.length - 1) return prev
      const arr = [...prev.sections]
      const temp = arr[idx + 1]
      arr[idx + 1] = arr[idx]
      arr[idx] = temp
      return { ...prev, sections: arr }
    })
  }

  function updateSectionHeading(idx, val) {
    setForm(prev => {
      const arr = [...prev.sections]
      arr[idx] = { ...arr[idx], heading: val }
      return { ...prev, sections: arr }
    })
  }

  function updateSectionContent(idx, val) {
    setForm(prev => {
      const arr = [...prev.sections]
      arr[idx] = { ...arr[idx], content: val }
      return { ...prev, sections: arr }
    })
  }

  // Category helpers
  function toggleCategory(name) {
    setForm(prev => {
      const exists = prev.categories.includes(name)
      return {
        ...prev,
        categories: exists ? prev.categories.filter(c => c !== name) : [...prev.categories, name]
      }
    })
  }

  function removeCategory(name) {
    setForm(prev => ({
      ...prev,
      categories: prev.categories.filter(c => c !== name)
    }))
  }

  async function addNewCategory() {
    const name = newCatInput.trim()
    if (!name) return
    if (!categories.find(c => c.name === name)) {
      try {
        await adminApi.createDocCategory({ name })
        fetchCategories()
      } catch {
        // already exists
      }
    }
    setForm(prev => ({
      ...prev,
      categories: prev.categories.includes(name) ? prev.categories : [...prev.categories, name]
    }))
    setNewCatInput('')
  }

  async function fetchMenus() {
    try {
      const { data } = await adminApi.getDocMenusFlat()
      setMenus(data.data || [])
    } catch {
      setMenus([])
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

  async function fetchAllDocs() {
    try {
      const { data } = await adminApi.getAllDocs()
      setAllParentDocs(data.data || [])
    } catch {
      setAllParentDocs([])
    }
  }

  useEffect(() => {
    async function init() {
      await Promise.all([fetchMenus(), fetchAllDocs(), fetchCategories()])
      if (isEdit) {
        try {
          const { data } = await adminApi.getDoc(id)
          const doc = data.data
          setForm({
            title: doc.title,
            slug: doc.slug,
            categories: Array.isArray(doc.categories) && doc.categories.length ? doc.categories : (doc.category ? [doc.category] : ['General']),
            doc_menu_id: doc.doc_menu_id ?? null,
            parent_id: doc.parent_id ?? null,
            order_num: doc.order_num ?? 0,
            status: doc.status,
            sections: (doc.sections || []).map((s, i) => ({
              _key: i + 1,
              heading: s.heading,
              content: s.content || '',
            })),
          })
          setSlugManuallyEdited(true)
        } catch {
          setError(t('form.errors.loadFailed'))
        }
      } else if (searchParams.get('menu_id')) {
        setForm(prev => ({ ...prev, doc_menu_id: parseInt(searchParams.get('menu_id')) }))
      }
    }
    init()

    function handleClickOutside(e) {
      if (catDropdownRef.current && !catDropdownRef.current.contains(e.target)) {
        setCatOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [id, isEdit])

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setSaving(true)
    try {
      const payload = {
        title: form.title,
        slug: form.slug || slugify(form.title),
        categories: form.categories?.length ? form.categories : ['General'],
        doc_menu_id: form.doc_menu_id || null,
        parent_id: form.parent_id || null,
        order_num: form.order_num,
        status: form.status,
        sections: form.sections.map(s => ({
          heading: s.heading,
          content: s.content,
        })),
      }

      if (isEdit) {
        await adminApi.updateDoc(id, payload)
      } else {
        await adminApi.createDoc(payload)
      }
      navigate('/admin/docs')
    } catch (err) {
      setError(err.response?.data?.message || t('form.errors.saveFailed'))
    } finally {
      setSaving(false)
    }
  }

  return (
    <div>
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm mb-6">
        <Link to="/admin/docs" className="text-gray-500 hover:text-brand-violet dark:hover:text-brand-cyan transition-colors">{t('form.breadcrumb.docs')}</Link>
        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"/></svg>
        <span className="text-gray-900 dark:text-white font-medium">{isEdit ? t('form.breadcrumb.editDoc') : t('form.breadcrumb.newDoc')}</span>
      </nav>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-sans font-bold dark:text-white">{isEdit ? t('form.header.editTitle') : t('form.header.createTitle')}</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{isEdit ? t('form.header.editSubtitle') : t('form.header.createSubtitle')}</p>
        </div>
        <BackButton to="/admin/docs" className="self-start sm:self-auto" />
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* ══ Left Column: Content ══ */}
          <div className="lg:col-span-2 space-y-6">

            {/* Title & Slug */}
            <div className="glass-card space-y-5">
              <h2 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <svg className="w-4 h-4 text-brand-violet dark:text-brand-cyan" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
                {t('form.details.heading')}
              </h2>

              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">{t('form.details.titleLabel')} <span className="text-red-400">*</span></label>
                <input
                  type="text"
                  required
                  value={form.title}
                  onChange={e => {
                    const val = e.target.value
                    setForm(prev => ({ ...prev, title: val }))
                    autoSlug(val)
                  }}
                  className="input-field"
                  placeholder={t('form.details.titlePlaceholder')}
                />
              </div>

              {/* Permalink */}
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">{t('form.details.permalinkLabel')}</label>
                {!slugEditing ? (
                  <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 dark:bg-dark-700/40 border border-gray-200 dark:border-dark-600 rounded-full">
                    <svg className="w-3.5 h-3.5 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"/></svg>
                    <span className="text-xs text-gray-500 dark:text-gray-400 truncate">www.apex-team.space/docs?page=<span className="text-brand-violet dark:text-brand-cyan font-medium">{form.slug || slugify(form.title || 'doc-title')}</span></span>
                    <button type="button" onClick={() => setSlugEditing(true)} className="ml-auto shrink-0 text-[10px] font-semibold text-brand-violet dark:text-brand-cyan hover:underline">{t('common.edit')}</button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <span className="inline-flex items-center px-3 h-[38px] text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-dark-600 border border-r-0 border-gray-200 dark:border-dark-500 rounded-l-lg">/docs?page=</span>
                      <input
                        type="text"
                        required
                        value={form.slug}
                        onChange={e => {
                          setForm(prev => ({ ...prev, slug: e.target.value }))
                          setSlugManuallyEdited(true)
                        }}
                        className="input-field !rounded-l-none"
                        placeholder={t('form.details.slugPlaceholder')}
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <button type="button" onClick={() => setSlugEditing(false)} className="text-[10px] font-semibold text-brand-violet dark:text-brand-cyan hover:underline">{t('form.details.done')}</button>
                      <span className="text-gray-300 dark:text-dark-500">|</span>
                      <button type="button" onClick={resetSlug} className="text-[10px] font-semibold text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:underline">{t('form.details.resetFromTitle')}</button>
                      {slugManuallyEdited && (
                        <span className="ml-auto text-[10px] text-amber-500 dark:text-amber-400 flex items-center gap-1">
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/></svg>
                          {t('form.details.manuallyEdited')}
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* ══ Sections ("On This Page") ══ */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <svg className="w-4 h-4 text-brand-violet dark:text-brand-cyan" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 10h16M4 14h10"/></svg>
                  {t('form.sections.heading')}
                  <span className="text-[10px] font-normal text-gray-400 dark:text-gray-500">{t('form.sections.helper')}</span>
                </h2>
                <button
                  type="button"
                  onClick={addSection}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-brand-violet/10 dark:bg-brand-cyan/10 text-brand-violet dark:text-brand-cyan hover:bg-brand-violet/20 dark:hover:bg-brand-cyan/20 transition-colors"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4"/></svg>
                  {t('form.sections.addSection')}
                </button>
              </div>

              {/* Empty state */}
              {form.sections.length === 0 ? (
                <div className="glass-card flex flex-col items-center justify-center py-10 text-center border-2 border-dashed border-gray-200 dark:border-white/[0.08]">
                  <svg className="w-10 h-10 text-gray-300 dark:text-gray-600 mb-3" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">{t('form.sections.emptyTitle')}</p>
                  <p className="text-xs text-gray-400 dark:text-gray-500">{t('form.sections.emptySubtitle')}</p>
                </div>
              ) : (
                /* Section cards */
                form.sections.map((section, idx) => (
                  <div key={section._key} className="glass-card space-y-4">
                    {/* Section header */}
                    <div className="flex items-center justify-between -mb-1">
                      <span className="text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">
                        {t('form.sections.sectionNumber', { number: idx + 1 })}
                      </span>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => moveSectionUp(idx)}
                          disabled={idx === 0}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-brand-violet dark:hover:text-brand-cyan disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                          title={t('form.sections.moveUp')}
                          aria-label={t('form.sections.moveUp')}
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 15l7-7 7 7"/></svg>
                        </button>
                        <button
                          type="button"
                          onClick={() => moveSectionDown(idx)}
                          disabled={idx === form.sections.length - 1}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-brand-violet dark:hover:text-brand-cyan disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                          title={t('form.sections.moveDown')}
                          aria-label={t('form.sections.moveDown')}
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"/></svg>
                        </button>
                        <button
                          type="button"
                          onClick={() => removeSection(idx)}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors ml-1"
                          title={t('form.sections.removeSection')}
                          aria-label={t('form.sections.removeSection')}
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                        </button>
                      </div>
                    </div>

                    {/* Section heading */}
                    <div>
                      <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">
                        {t('form.sections.headingLabel')} <span className="text-red-400">*</span>
                        <span className="ml-1 text-[10px] font-normal text-gray-400">{t('form.sections.headingHelper')}</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={section.heading}
                        onChange={e => updateSectionHeading(idx, e.target.value)}
                        className="input-field"
                        placeholder={t('form.sections.headingPlaceholder')}
                      />
                    </div>

                    {/* Content editor */}
                    <div>
                      <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">{t('form.sections.contentLabel')}</label>
                      <ContentEditor
                        value={section.content}
                        onChange={val => updateSectionContent(idx, val)}
                      />
                    </div>
                  </div>
                ))
              )}

              {/* Add another section shortcut (bottom) */}
              {form.sections.length > 0 && (
                <button
                  type="button"
                  onClick={addSection}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-lg border-2 border-dashed border-gray-200 dark:border-white/[0.08] text-sm text-gray-400 hover:text-brand-violet dark:hover:text-brand-cyan hover:border-black/[0.16] dark:hover:border-white/20 transition-all"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4"/></svg>
                  {t('form.sections.addAnotherSection')}
                </button>
              )}
            </div>

          </div>

          {/* ══ Right Column: Settings Sidebar ══ */}
          <div className="space-y-6">

            {/* Publish Settings */}
            <div className="glass-card space-y-4">
              <h2 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <svg className="w-4 h-4 text-brand-violet dark:text-brand-cyan" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                {t('form.settings.heading')}
              </h2>

              {/* Status */}
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">{t('form.settings.statusLabel')}</label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setForm(f => ({ ...f, status: 'draft' }))}
                    className={`flex-1 px-3 py-2 rounded-lg border text-xs font-medium transition-all text-center ${
 form.status === 'draft'
 ? 'bg-yellow-50 text-yellow-700 border-yellow-300 dark:bg-yellow-500/10 dark:text-yellow-400 dark:border-yellow-500/30'
 : 'bg-white dark:bg-dark-700 text-gray-500 border-gray-200 dark:border-dark-600 hover:border-gray-300'
 }`}
                  >
                    {t('status.draft')}
                  </button>
                  <button
                    type="button"
                    onClick={() => setForm(f => ({ ...f, status: 'published' }))}
                    className={`flex-1 px-3 py-2 rounded-lg border text-xs font-medium transition-all text-center ${
 form.status === 'published'
 ? 'bg-green-50 text-green-700 border-green-300 dark:bg-green-500/10 dark:text-green-400 dark:border-green-500/30'
 : 'bg-white dark:bg-dark-700 text-gray-500 border-gray-200 dark:border-dark-600 hover:border-gray-300'
 }`}
                  >
                    {t('status.published')}
                  </button>
                </div>
              </div>

              {/* Category (multi-select chips) */}
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">{t('form.settings.category.label')}</label>

                {form.categories.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    {form.categories.map(cat => (
                      <span
                        key={cat}
                        className="inline-flex items-center gap-1 pl-2.5 pr-1.5 py-0.5 rounded-full text-xs font-semibold bg-brand-violet/15 dark:bg-brand-cyan/15 text-brand-violet dark:text-brand-cyan"
                      >
                        {cat}
                        <button
                          type="button"
                          onClick={() => removeCategory(cat)}
                          title={t('form.settings.category.removeAria', { name: cat })}
                          aria-label={t('form.settings.category.removeAria', { name: cat })}
                          className="w-4 h-4 rounded-lg flex items-center justify-center hover:bg-brand-violet/20 dark:hover:bg-brand-cyan/20 transition-colors"
                        >
                          <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12"/></svg>
                        </button>
                      </span>
                    ))}
                  </div>
                )}

                {/* Dropdown */}
                <div className="relative" ref={catDropdownRef}>
                  <div
                    className="input-field flex items-center gap-2 cursor-pointer select-none"
                    onClick={() => setCatOpen(!catOpen)}
                  >
                    <span className={`flex-1 text-sm ${form.categories.length ? 'text-gray-400 dark:text-gray-500' : 'text-gray-400'}`}>
                      {form.categories.length ? t('form.settings.category.addMore') : t('form.settings.category.selectPlaceholder')}
                    </span>
                    <svg className={`w-4 h-4 text-gray-400 shrink-0 transition-transform ${catOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"/></svg>
                  </div>

                  {catOpen && (
                    <div className="absolute z-20 w-full mt-1 bg-white dark:bg-dark-800 border border-gray-200 dark:border-dark-600 rounded-full shadow-xl overflow-hidden">
                      <div className="max-h-40 overflow-y-auto">
                        {categories.map(cat => {
                          const isSelected = form.categories.includes(cat.name)
                          return (
                            <button
                              key={cat.name}
                              type="button"
                              onClick={() => toggleCategory(cat.name)}
                              className={`w-full flex items-center gap-2 px-3 py-2 text-sm text-left hover:bg-gray-50 dark:hover:bg-white/[0.04] transition-colors ${
                                isSelected ? 'text-brand-violet dark:text-brand-cyan font-semibold' : 'text-gray-700 dark:text-gray-300'
                              }`}
                            >
                              {isSelected ? (
                                <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7"/></svg>
                              ) : (
                                <span className="w-3.5 h-3.5 shrink-0" />
                              )}
                              {cat.name}
                            </button>
                          )
                        })}
                        {!categories.length && (
                          <p className="px-3 py-2 text-xs text-gray-400">{t('form.settings.category.empty')}</p>
                        )}
                      </div>
                      <div className="border-t border-gray-100 dark:border-dark-700 p-2">
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={newCatInput}
                            onChange={e => setNewCatInput(e.target.value)}
                            onKeyDown={e => {
                              if (e.key === 'Enter') {
                                e.preventDefault()
                                addNewCategory()
                              }
                            }}
                            placeholder={t('form.settings.category.newPlaceholder')}
                            className="flex-1 text-xs px-2.5 py-1.5 rounded-full border border-gray-200 dark:border-dark-600 bg-transparent outline-none focus:border-brand-violet dark:focus:border-brand-cyan text-gray-800 dark:text-gray-200"
                          />
                          <button
                            type="button"
                            onClick={addNewCategory}
                            className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-brand-violet/10 dark:bg-brand-cyan/10 text-brand-violet dark:text-brand-cyan hover:bg-brand-violet/20 dark:hover:bg-brand-cyan/20 transition-colors"
                          >
                            {t('form.settings.category.addButton')}
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                <p className="text-[10px] text-gray-400 mt-1">{t('form.settings.category.helper')}</p>
              </div>

              {/* Menu */}
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">
                  {t('form.settings.menu.label')} <span className="text-red-400">*</span>
                </label>
                <select
                  required
                  value={form.doc_menu_id ?? ''}
                  onChange={e => setForm(f => ({ ...f, doc_menu_id: e.target.value ? parseInt(e.target.value) : null }))}
                  className="input-field"
                >
                  <option value="" disabled>{t('form.settings.menu.placeholder')}</option>
                  {menus.map(menu => (
                    <option key={menu.id} value={menu.id}>
                      {menu.parent_id ? `\u00a0\u00a0\u2514 ${menu.name}` : menu.name}
                    </option>
                  ))}
                </select>
                <div className="flex items-center justify-between mt-1">
                  <p className="text-[10px] text-gray-400">{t('form.settings.menu.helper')}</p>
                  <Link to="/admin/docs/menus" className="text-[10px] text-brand-violet dark:text-brand-cyan hover:underline">{t('form.settings.menu.manageLink')}</Link>
                </div>
              </div>

              {/* Parent Page */}
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">
                  {t('form.settings.parentPage.label')}
                  <span className="ml-1 font-normal text-gray-400">{t('form.settings.parentPage.optionalHint')}</span>
                </label>
                <select
                  value={form.parent_id ?? ''}
                  onChange={e => setForm(f => ({ ...f, parent_id: e.target.value ? parseInt(e.target.value) : null }))}
                  className="input-field"
                >
                  <option value="">{t('form.settings.parentPage.noneOption')}</option>
                  {Object.entries(groupedParentDocs).map(([cat, group]) => (
                    <optgroup key={cat} label={cat}>
                      {group.map(doc => (
                        <option
                          key={doc.id}
                          value={doc.id}
                          disabled={isEdit && doc.id === parseInt(id)}
                        >
                          {doc.title}
                        </option>
                      ))}
                    </optgroup>
                  ))}
                </select>
                <p className="text-[10px] text-gray-400 mt-1">{t('form.settings.parentPage.helper')}</p>
              </div>

              {/* Order */}
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">{t('form.settings.order.label')}</label>
                <input
                  type="number"
                  min="0"
                  value={form.order_num}
                  onChange={e => setForm(f => ({ ...f, order_num: parseInt(e.target.value) || 0 }))}
                  className="input-field"
                  placeholder="0"
                />
                <p className="text-[10px] text-gray-400 mt-1">{t('form.settings.order.helper')}</p>
              </div>
            </div>

            {/* Actions */}
            <div className="glass-card space-y-3">
              <button
                type="submit"
                disabled={saving}
                className="btn-primary w-full flex items-center justify-center gap-2 text-sm"
              >
                {saving ? (
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                ) : (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/></svg>
                )}
                {saving
                  ? t('common.saving')
                  : isEdit
                    ? t('form.actions.updateDoc')
                    : form.status === 'published'
                      ? t('form.actions.publishDoc')
                      : t('form.actions.saveDraft')}
              </button>
              <Link to="/admin/docs" className="btn-ghost w-full flex items-center justify-center gap-2 text-sm">
                {t('common.cancel')}
              </Link>
              {error && <p className="text-sm text-red-500 text-center">{error}</p>}
            </div>

            {/* Preview link */}
            {isEdit && form.status === 'published' && form.slug && (
              <div className="glass-card">
                <a
                  href={`/docs?page=${form.slug}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2 text-sm text-brand-violet dark:text-brand-cyan hover:underline"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/></svg>
                  {t('form.actions.viewPublicDoc')}
                </a>
              </div>
            )}
          </div>
        </div>
      </form>
    </div>
  )
}
