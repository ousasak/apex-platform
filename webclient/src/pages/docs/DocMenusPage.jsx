import React, { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation, Trans } from 'react-i18next'
import { adminApi } from '@/services'
import { useUi } from '@/contexts/UiContext'
import DeleteConfirmDialog from '@/components/ui/delete-confirm-dialog'

export default function DocMenusView() {
  const { t, i18n } = useTranslation('docs')
  const { showToast } = useUi()
  const [loading, setLoading] = useState(false)
  const [menus, setMenus] = useState([])
  const [expanded, setExpanded] = useState(new Set())

  // Modal state
  const [modalOpen, setModalOpen] = useState(false)
  const [editingMenu, setEditingMenu] = useState(null)
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState('')
  const [form, setForm] = useState({ name: '', description: '', order_num: 0, parent_id: null })

  // Delete state
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleting, setDeleting] = useState(false)

  const slugPreview = useMemo(() => {
    return (form.name || '')
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
  }, [form.name])

  const parentMenuName = useMemo(() => {
    if (!form.parent_id) return ''
    const found = menus.find(m => m.id === form.parent_id)
    return found?.name ?? ''
  }, [form.parent_id, menus])

  function toggleExpand(id) {
    setExpanded(prev => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  async function fetchMenus() {
    setLoading(true)
    try {
      const { data } = await adminApi.getDocMenus()
      const list = data.data || []
      setMenus(list)
      setExpanded(new Set(list.map(m => m.id)))
    } catch {
      showToast(t('menus.toast.loadFailed'), 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMenus()
  }, [])

  function openCreate(parentId) {
    setEditingMenu(null)
    setForm({ name: '', description: '', order_num: 0, parent_id: parentId })
    setFormError('')
    setModalOpen(true)
  }

  function openEdit(menu) {
    setEditingMenu(menu)
    setForm({
      name: menu.name,
      description: menu.description || '',
      order_num: menu.order_num ?? 0,
      parent_id: menu.parent_id ?? null,
    })
    setFormError('')
    setModalOpen(true)
  }

  function closeModal() {
    setModalOpen(false)
    setEditingMenu(null)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setFormError('')
    setSaving(true)
    try {
      if (editingMenu) {
        await adminApi.updateDocMenu(editingMenu.id, form)
        showToast(t('menus.toast.updated'), 'success')
      } else {
        await adminApi.createDocMenu(form)
        showToast(t('menus.toast.created'), 'success')
      }
      closeModal()
      await fetchMenus()
    } catch (err) {
      const msg = err.response?.data?.message
        || Object.values(err.response?.data?.errors || {})[0]?.[0]
        || t('menus.errors.generic')
      setFormError(msg)
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      await adminApi.deleteDocMenu(deleteTarget.id)
      showToast(t('menus.toast.deleted'), 'success')
      setDeleteTarget(null)
      await fetchMenus()
    } catch {
      showToast(t('menus.toast.deleteFailed'), 'error')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-sans font-bold dark:text-white">{t('menus.title')}</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            <Trans
              t={t}
              i18nKey="menus.subtitle"
              components={{ highlight: <span className="text-brand-violet dark:text-brand-cyan font-medium" /> }}
            />
          </p>
        </div>
        <button onClick={() => openCreate(null)} className="btn-primary flex items-center gap-2 text-sm">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"/></svg>
          {t('menus.actions.newMainMenu')}
        </button>
      </div>

      {/* Loading */}
      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-10 h-10 border-4 border-brand-violet/30 border-t-brand-violet rounded-full animate-spin" />
        </div>
      ) : menus.length === 0 ? (
        /* Empty state */
        <div className="glass-card flex flex-col items-center justify-center py-20 text-center">
          <svg className="w-14 h-14 text-gray-300 dark:text-gray-600 mb-4" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM3.75 12h.007v.008H3.75V12zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm-.375 5.25h.007v.008H3.75v-.008zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"/></svg>
          <p className="text-gray-500 dark:text-gray-400 font-medium mb-1">{t('menus.empty.title')}</p>
          <p className="text-sm text-gray-400 dark:text-gray-500 mb-5">{t('menus.empty.subtitle')}</p>
          <button onClick={() => openCreate(null)} className="btn-primary text-sm">{t('menus.empty.cta')}</button>
        </div>
      ) : (
        /* Hierarchical tree */
        <div className="space-y-4">
          {menus.map(mainMenu => (
            <div key={mainMenu.id} className="glass-card overflow-hidden">
              {/* Main Menu Row */}
              <div className="flex items-center gap-3 p-4">
                {/* Expand toggle */}
                <button
                  type="button"
                  onClick={() => toggleExpand(mainMenu.id)}
                  title={expanded.has(mainMenu.id) ? t('menus.actions.collapse') : t('menus.actions.expand')}
                  aria-label={expanded.has(mainMenu.id) ? t('menus.actions.collapse') : t('menus.actions.expand')}
                  className="flex-shrink-0 w-6 h-6 flex items-center justify-center rounded text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-white/[0.06] transition-colors"
                >
                  <svg
                    className={`w-4 h-4 transition-transform duration-200 ${expanded.has(mainMenu.id) ? 'rotate-90' : ''}`}
                    fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7"/>
                  </svg>
                </button>

                {/* Icon */}
                <div className="w-9 h-9 rounded-full bg-brand-violet/10 dark:bg-brand-cyan/10 flex items-center justify-center flex-shrink-0">
                  <svg className="w-4.5 h-4.5 text-brand-violet dark:text-brand-cyan" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5M3.75 17.25h16.5"/></svg>
                </div>

                {/* Name + slug */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-gray-900 dark:text-white">{mainMenu.name}</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-brand-violet/10 dark:bg-brand-cyan/10 text-brand-violet dark:text-brand-cyan font-semibold uppercase tracking-wide">{t('menus.badges.main')}</span>
                  </div>
                  <p className="text-xs text-gray-400 font-mono">/{mainMenu.slug}</p>
                </div>

                {/* Stats */}
                <div className="hidden sm:flex items-center gap-3 text-xs text-gray-400 mr-2">
                  <span className="flex items-center gap-1">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 12h16.5m-16.5 3.75h16.5M3.75 19.5h16.5M5.625 4.5h12.75a1.875 1.875 0 010 3.75H5.625a1.875 1.875 0 010-3.75z"/></svg>
                    {t('menus.counts.subMenus', { count: mainMenu.children?.length ?? 0 })}
                  </span>
                  <span className="flex items-center gap-1">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"/></svg>
                    {t('menus.counts.pages', { count: mainMenu.doc_count || 0 })}
                  </span>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => openCreate(mainMenu.id)}
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-brand-violet dark:text-brand-cyan hover:bg-brand-violet/10 dark:hover:bg-brand-cyan/10 transition-colors border border-brand-violet/20 dark:border-brand-cyan/20"
                    title={t('menus.actions.addSubMenuTitle')}
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4"/></svg>
                    {t('menus.actions.subMenu')}
                  </button>
                  <Link
                    to={`/admin/docs/create?menu_id=${mainMenu.id}`}
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-gray-600 dark:text-gray-400 hover:text-brand-violet dark:hover:text-brand-cyan hover:bg-brand-violet/5 dark:hover:bg-brand-cyan/5 transition-colors border border-gray-200 dark:border-white/[0.08]"
                    title={t('menus.actions.addPageTitle')}
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4"/></svg>
                    {t('menus.actions.page')}
                  </Link>
                  <button
                    type="button"
                    onClick={() => openEdit(mainMenu)}
                    className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-white/[0.06] transition-colors"
                    title={t('common.edit')}
                    aria-label={t('common.edit')}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z"/></svg>
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeleteTarget(mainMenu)}
                    className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                    title={t('common.delete')}
                    aria-label={t('common.delete')}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"/></svg>
                  </button>
                </div>
              </div>

              {/* Sub-Menus (expanded) */}
              {expanded.has(mainMenu.id) && mainMenu.children?.length > 0 && (
                <div className="border-t border-gray-100 dark:border-white/[0.06]">
                  {mainMenu.children.map(sub => (
                    <div
                      key={sub.id}
                      className="flex items-center gap-3 px-4 py-3 pl-12 border-b border-gray-100 dark:border-white/[0.04] last:border-0 hover:bg-gray-50/50 dark:hover:bg-white/[0.02] transition-colors"
                    >
                      <div className="flex-shrink-0 flex items-center">
                        <div className="w-px h-4 bg-gray-200 dark:bg-white/[0.1] mr-3" />
                        <div className="w-7 h-7 rounded-full bg-gray-100 dark:bg-white/[0.06] flex items-center justify-center">
                          <svg className="w-3.5 h-3.5 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM3.75 12h.007v.008H3.75V12zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm-.375 5.25h.007v.008H3.75v-.008zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"/></svg>
                        </div>
                      </div>

                      <div className="flex-1 min-w-0">
                        <span className="text-sm font-medium text-gray-800 dark:text-gray-200">{sub.name}</span>
                        <p className="text-[11px] text-gray-400 font-mono">/{sub.slug}</p>
                      </div>

                      <span className="text-xs text-gray-400 mr-1">{t('menus.counts.pages', { count: sub.doc_count || 0 })}</span>

                      <div className="flex items-center gap-1">
                        <Link
                          to={`/admin/docs/create?menu_id=${sub.id}`}
                          className="flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-medium text-gray-500 dark:text-gray-400 hover:text-brand-violet dark:hover:text-brand-cyan hover:bg-brand-violet/5 dark:hover:bg-brand-cyan/5 transition-colors border border-gray-200 dark:border-white/[0.08]"
                          title={t('menus.actions.addPageTitle')}
                        >
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4"/></svg>
                          {t('menus.actions.page')}
                        </Link>
                        <button
                          type="button"
                          onClick={() => openEdit(sub)}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-white/[0.06] transition-colors"
                          title={t('common.edit')}
                          aria-label={t('common.edit')}
                        >
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z"/></svg>
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteTarget(sub)}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                          title={t('common.delete')}
                          aria-label={t('common.delete')}
                        >
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"/></svg>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Expanded but empty hint */}
              {expanded.has(mainMenu.id) && (!mainMenu.children || mainMenu.children.length === 0) && (
                <div className="border-t border-gray-100 dark:border-white/[0.06] px-12 py-3 text-xs text-gray-400 dark:text-gray-500 italic">
                  {t('menus.emptySubMenus')}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Create / Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={closeModal}>
          <div className="w-full max-w-md bg-white dark:bg-dark-800 rounded-2xl shadow-2xl ring-1 ring-gray-200/80 dark:ring-white/[0.08] overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-white/[0.06]">
              <h2 className="text-base font-bold text-gray-900 dark:text-white">
                {editingMenu ? t('menus.modal.editTitle') : (form.parent_id ? t('menus.modal.newSubMenuTitle') : t('menus.modal.newMainMenuTitle'))}
              </h2>
              <button
                onClick={closeModal}
                title={t('common.close')}
                aria-label={t('common.close')}
                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-white/[0.06] transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {form.parent_id && !editingMenu && (
                <div className="flex items-center gap-2 px-3 py-2 rounded-full bg-brand-violet/5 dark:bg-brand-cyan/5 border border-brand-violet/20 dark:border-brand-cyan/20">
                  <svg className="w-3.5 h-3.5 text-brand-violet dark:text-brand-cyan flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 12h16.5m-16.5 3.75h16.5M3.75 19.5h16.5M5.625 4.5h12.75a1.875 1.875 0 010 3.75H5.625a1.875 1.875 0 010-3.75z"/></svg>
                  <span className="text-xs text-brand-violet dark:text-brand-cyan">
                    <Trans
                      t={t}
                      i18nKey="menus.modal.addingUnder"
                      values={{ parent: parentMenuName }}
                      components={{ strong: <strong /> }}
                    />
                  </span>
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">
                  {form.parent_id ? t('menus.modal.subMenuNameLabel') : t('menus.modal.mainMenuNameLabel')} <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  className="input-field"
                  placeholder={form.parent_id ? t('menus.modal.subMenuNamePlaceholder') : t('menus.modal.mainMenuNamePlaceholder')}
                />
              </div>

              <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 dark:bg-dark-700/40 border border-gray-200 dark:border-dark-600 rounded-full">
                <svg className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"/></svg>
                <span className="text-xs text-gray-500 dark:text-gray-400">{t('menus.modal.slugLabel')} <span className="text-brand-violet dark:text-brand-cyan font-mono font-medium">{slugPreview || t('menus.modal.slugFallback')}</span></span>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">{t('menus.modal.descriptionLabel')} <span className="text-gray-400 font-normal">{t('menus.modal.optional')}</span></label>
                <textarea
                  value={form.description}
                  onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  rows="2"
                  className="input-field resize-none"
                  placeholder={t('menus.modal.descriptionPlaceholder')}
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">{t('menus.modal.displayOrderLabel')}</label>
                <input
                  type="number"
                  min="0"
                  value={form.order_num}
                  onChange={e => setForm(f => ({ ...f, order_num: parseInt(e.target.value) || 0 }))}
                  className="input-field"
                  placeholder="0"
                />
                <p className="text-[10px] text-gray-400 mt-1">{t('menus.modal.displayOrderHelper')}</p>
              </div>

              {formError && <p className="text-sm text-red-500">{formError}</p>}

              <div className="flex items-center gap-3 pt-2">
                <button type="button" onClick={closeModal} className="btn-ghost flex-1 text-sm">{t('common.cancel')}</button>
                <button type="submit" disabled={saving} className="btn-primary flex-1 flex items-center justify-center gap-2 text-sm">
                  {saving && (
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                  )}
                  {saving ? t('common.saving') : (editingMenu ? t('common.update') : t('common.create'))}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirm Modal */}
      <DeleteConfirmDialog
        open={Boolean(deleteTarget)}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        loading={deleting}
        title={deleteTarget ? t('menus.deleteModal.title', { name: deleteTarget.name }) : ''}
        description={
          deleteTarget
            ? deleteTarget.parent_id
              ? t('menus.deleteModal.subMenuDescription')
              : t('menus.deleteModal.mainMenuDescription')
            : ''
        }
        cancelLabel={t('common.cancel')}
        confirmLabel={t('common.delete')}
        loadingLabel={t('common.deleting')}
      />
    </div>
  )
}
