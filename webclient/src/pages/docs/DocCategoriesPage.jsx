import React, { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation, Trans } from 'react-i18next'
import { adminApi } from '@/services'
import DeleteConfirmDialog from '@/components/ui/delete-confirm-dialog'

export default function DocCategoriesView() {
  const { t, i18n } = useTranslation('docs')
  const [loading, setLoading] = useState(true)
  const [categories, setCategories] = useState([])
  const modalInputRef = useRef(null)

  const [modal, setModal] = useState({
    open: false,
    mode: 'create', // 'create' | 'edit'
    originalName: '',
    name: '',
    saving: false,
    error: '',
  })

  const [deleteModal, setDeleteModal] = useState({
    open: false,
    name: '',
    docCount: 0,
    moveTo: 'General',
    saving: false,
    error: '',
  })

  const [toast, setToast] = useState({ show: false, type: 'success', message: '' })
  const toastTimer = useRef(null)

  function showToast(type, message) {
    clearTimeout(toastTimer.current)
    setToast({ show: true, type, message })
    toastTimer.current = setTimeout(() => {
      setToast({ show: false, type: 'success', message: '' })
    }, 3500)
  }

  async function fetchCategories() {
    setLoading(true)
    try {
      const { data } = await adminApi.getDocCategories()
      setCategories(data.data || [])
    } catch {
      showToast('error', t('categories.toast.loadFailed'))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCategories()
  }, [])

  function openCreate() {
    setModal({
      open: true,
      mode: 'create',
      originalName: '',
      name: '',
      saving: false,
      error: '',
    })
    setTimeout(() => modalInputRef.current?.focus(), 50)
  }

  function openEdit(cat) {
    setModal({
      open: true,
      mode: 'edit',
      originalName: cat.name,
      name: cat.name,
      saving: false,
      error: '',
    })
    setTimeout(() => modalInputRef.current?.focus(), 50)
  }

  function closeModal() {
    setModal(prev => ({ ...prev, open: false }))
  }

  async function submitModal(e) {
    if (e) e.preventDefault()
    if (!modal.name.trim()) {
      setModal(prev => ({ ...prev, error: t('categories.validation.nameRequired') }))
      return
    }

    setModal(prev => ({ ...prev, saving: true, error: '' }))
    try {
      if (modal.mode === 'create') {
        await adminApi.createDocCategory({ name: modal.name.trim() })
        showToast('success', t('categories.toast.created', { name: modal.name.trim() }))
      } else {
        if (modal.name.trim() === modal.originalName) {
          closeModal()
          return
        }
        await adminApi.renameDocCategory({ old_name: modal.originalName, new_name: modal.name.trim() })
        showToast('success', t('categories.toast.renamed', { name: modal.name.trim() }))
      }
      await fetchCategories()
      closeModal()
    } catch (err) {
      setModal(prev => ({
        ...prev,
        error: err.response?.data?.message || err.response?.data?.errors?.name?.[0] || t('categories.errors.saveFailed')
      }))
    } finally {
      setModal(prev => ({ ...prev, saving: false }))
    }
  }

  function openDelete(cat) {
    const defaultMoveTo = categories.find(c => c.name !== cat.name)?.name ?? 'General'
    setDeleteModal({
      open: true,
      name: cat.name,
      docCount: cat.doc_count || 0,
      moveTo: defaultMoveTo,
      saving: false,
      error: '',
    })
  }

  async function confirmDelete() {
    setDeleteModal(prev => ({ ...prev, saving: true, error: '' }))
    try {
      await adminApi.deleteDocCategory({
        name: deleteModal.name,
        move_to: deleteModal.docCount > 0 ? deleteModal.moveTo : undefined,
      })
      showToast('success', t('categories.toast.deleted', { name: deleteModal.name }))
      await fetchCategories()
      setDeleteModal(prev => ({ ...prev, open: false }))
    } catch (err) {
      setDeleteModal(prev => ({
        ...prev,
        error: err.response?.data?.message || t('categories.errors.deleteFailed')
      }))
    } finally {
      setDeleteModal(prev => ({ ...prev, saving: false }))
    }
  }

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-sans font-bold dark:text-white">{t('categories.title')}</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{t('categories.subtitle')}</p>
        </div>
        <button onClick={openCreate} className="btn-primary flex items-center gap-2 text-sm">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"/></svg>
          {t('categories.actions.newCategory')}
        </button>
      </div>

      {/* Loading */}
      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-10 h-10 border-4 border-brand-violet/30 border-t-brand-violet rounded-full animate-spin" />
        </div>
      ) : !categories.length ? (
        /* Empty */
        <div className="glass-card flex flex-col items-center justify-center py-20 text-center">
          <svg className="w-12 h-12 text-gray-300 dark:text-gray-600 mb-3" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z"/><path strokeLinecap="round" strokeLinejoin="round" d="M6 6h.008v.008H6V6z"/></svg>
          <p className="text-gray-500 dark:text-gray-400 font-medium">{t('categories.empty.title')}</p>
          <p className="text-xs text-gray-400 mt-1">{t('categories.empty.subtitle')}</p>
        </div>
      ) : (
        /* Category list */
        <div className="glass-card overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 dark:border-dark-600">
                <th className="text-left py-3 px-4 font-semibold text-gray-600 dark:text-gray-400">#</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-600 dark:text-gray-400">{t('categories.table.name')}</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-600 dark:text-gray-400">{t('categories.table.docs')}</th>
                <th className="py-3 px-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-dark-700">
              {categories.map((cat, idx) => (
                <tr key={cat.name} className="hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors">
                  <td className="py-3 px-4 text-xs font-mono text-gray-300 dark:text-gray-600">{idx + 1}</td>
                  <td className="py-3 px-4">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-brand-violet/10 dark:bg-brand-cyan/10 text-brand-violet dark:text-brand-cyan">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"/></svg>
                      {{ ...cat }.name}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <Link
                      to={`/admin/docs?category=${encodeURIComponent(cat.name)}`}
                      className="text-xs font-medium text-gray-500 dark:text-gray-400 hover:text-brand-violet dark:hover:text-brand-cyan transition-colors"
                    >
                      {t('categories.counts.docs', { count: cat.doc_count || 0 })}
                    </Link>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => openEdit(cat)}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-brand-violet dark:hover:text-brand-cyan hover:bg-brand-violet/10 dark:hover:bg-brand-cyan/10 transition-colors"
                        title={t('categories.actions.rename')}
                        aria-label={t('categories.actions.rename')}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/></svg>
                      </button>
                      <button
                        onClick={() => openDelete(cat)}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
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
        </div>
      )}

      {/* Create / Rename Modal */}
      {modal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={closeModal} />
          <div className="relative w-full max-w-sm bg-white dark:bg-dark-800 rounded-2xl shadow-2xl p-6">
            <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-4">
              {modal.mode === 'create' ? t('categories.modal.createTitle') : t('categories.modal.renameTitle', { name: modal.originalName })}
            </h2>

            <form onSubmit={submitModal} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">{t('categories.modal.nameLabel')}</label>
                <input
                  ref={modalInputRef}
                  value={modal.name}
                  onChange={e => setModal(prev => ({ ...prev, name: e.target.value }))}
                  type="text"
                  className="input-field"
                  placeholder={t('categories.modal.namePlaceholder')}
                />
              </div>
              {modal.error && <p className="text-xs text-red-500">{modal.error}</p>}

              <div className="flex items-center gap-3 mt-6">
                <button
                  type="submit"
                  disabled={modal.saving}
                  className="btn-primary flex-1 text-sm flex items-center justify-center gap-2"
                >
                  {modal.saving && (
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                  )}
                  {modal.mode === 'create' ? t('common.create') : t('categories.actions.rename')}
                </button>
                <button type="button" onClick={closeModal} className="btn-ghost flex-1 text-sm">{t('common.cancel')}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      <DeleteConfirmDialog
        open={deleteModal.open}
        onCancel={() => setDeleteModal(prev => ({ ...prev, open: false }))}
        onConfirm={confirmDelete}
        loading={deleteModal.saving}
        error={deleteModal.error}
        title={t('categories.deleteModal.title')}
        description={
          <>
            <Trans
              t={t}
              i18nKey="categories.deleteModal.confirmText"
              values={{ name: deleteModal.name }}
              components={{ highlight: <strong /> }}
            />{' '}
            {deleteModal.docCount > 0 && (
              <span>{t('categories.deleteModal.moveNotice', { count: deleteModal.docCount })}</span>
            )}
          </>
        }
        cancelLabel={t('common.cancel')}
        confirmLabel={t('common.delete')}
        loadingLabel={t('common.deleting')}
      >
        {deleteModal.docCount > 0 && (
          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-gray-400 mb-1.5">
              {t('categories.deleteModal.moveToLabel')}
            </label>
            <select
              value={deleteModal.moveTo}
              onChange={e => setDeleteModal(prev => ({ ...prev, moveTo: e.target.value }))}
              className="input-field"
            >
              <option value="General">{t('categories.deleteModal.generalOption')}</option>
              {categories
                .filter(c => c.name !== deleteModal.name)
                .map(cat => (
                  <option key={cat.name} value={cat.name}>
                    {cat.name}
                  </option>
                ))}
            </select>
          </div>
        )}
      </DeleteConfirmDialog>

      {/* Toast */}
      {toast.show && (
        <div
          className={`fixed top-5 right-5 z-[60] flex items-center gap-2.5 px-4 py-3 rounded-full shadow-2xl text-sm font-medium pointer-events-none transition-all ${
            toast.type === 'success' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
          }`}
        >
          {toast.type === 'success' ? (
            <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/></svg>
          ) : (
            <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/></svg>
          )}
          {toast.message}
        </div>
      )}
    </div>
  )
}
