import React, { useState, useEffect, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { adminApi } from '@/services'
import { useUi } from '@/contexts/UiContext'
import DeleteConfirmDialog from '@/components/ui/delete-confirm-dialog'

const ROLE_NAME_KEYS = {
  superadmin: 'roles.names.super_admin',
  admin: 'roles.names.admin',
  super_admin: 'roles.names.super_admin',
  member: 'roles.names.member',
  guest: 'roles.names.guest',
  moderator: 'roles.names.moderator',
  editor: 'roles.names.editor',
}

const DEFAULT_ROLE_DISPLAY_NAMES = {
  superadmin: ['super_admin', 'super admin', 'superadmin'],
  admin: ['admin', 'administrator'],
  super_admin: ['super_admin', 'super admin', 'superadmin'],
  member: ['member'],
  guest: ['guest'],
  moderator: ['moderator'],
  editor: ['editor'],
}

export default function RolesView() {
  const { t, i18n } = useTranslation('operations')
  const { showToast } = useUi()

  function getRoleDisplayName(role) {
    if (!role) return ''
    const key = ROLE_NAME_KEYS[role.name]
    if (key) {
      const defaults = DEFAULT_ROLE_DISPLAY_NAMES[role.name] || []
      if (!role.display_name || defaults.includes(role.display_name.trim().toLowerCase())) {
        return t(key)
      }
    }
    return role.display_name || role.name
  }
  const [roles, setRoles] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingRole, setEditingRole] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [formError, setFormError] = useState('')
  const [deleteError, setDeleteError] = useState('')
  const [form, setForm] = useState({ name: '', display_name: '', description: '' })

  const totalUsers = useMemo(() => roles.reduce((sum, r) => sum + (r.users_count || 0), 0), [roles])
  const systemRoles = useMemo(() => roles.filter(r => isSystemRole(r)).length, [roles])
  const customRoles = useMemo(() => roles.filter(r => !isSystemRole(r)).length, [roles])

  function isSystemRole(role) {
    return role?.is_system || ['superadmin', 'admin', 'member', 'guest'].includes(role?.name)
  }

  function roleColor(name) {
    const map = {
      superadmin: { bg: 'bg-purple-500/15', icon: 'text-purple-500', stripe: 'bg-gradient-to-r from-brand-violet to-brand-cyan' },
      admin: { bg: 'bg-red-500/10', icon: 'text-red-500', stripe: 'bg-gradient-to-r from-red-500 to-red-400' },
      member: { bg: 'bg-blue-500/10', icon: 'text-blue-500', stripe: 'bg-gradient-to-r from-blue-500 to-blue-400' },
      guest: { bg: 'bg-gray-200 dark:bg-gray-700/50', icon: 'text-gray-500', stripe: 'bg-gradient-to-r from-gray-400 to-gray-300' },
    }
    return map[name] || { bg: 'bg-brand-violet/10 dark:bg-brand-cyan/10', icon: 'text-brand-violet dark:text-brand-cyan', stripe: 'bg-gradient-to-r from-brand-violet to-brand-cyan' }
  }

  function openModal(role = null) {
    setEditingRole(role)
    setFormError('')
    if (role) {
      setForm({ name: role.name, display_name: role.display_name || '', description: role.description || '' })
    } else {
      setForm({ name: '', display_name: '', description: '' })
    }
    setShowModal(true)
  }

  async function fetchRoles() {
    try {
      const { data } = await adminApi.getRoles()
      setRoles(data.data || data || [])
    } catch {
      setRoles([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchRoles()
  }, [])

  async function saveRole(e) {
    if (e) e.preventDefault()
    if (!form.display_name || !form.name) {
      setFormError(t('roles.validation.nameAndSlugRequired'))
      return
    }
    setSaving(true)
    setFormError('')
    try {
      if (editingRole) {
        const { data } = await adminApi.updateRole(editingRole.id, form)
        setRoles(prev => prev.map(r => r.id === editingRole.id ? (data.data || data) : r))
        showToast(t('roles.toast.updated'))
      } else {
        const { data } = await adminApi.createRole(form)
        setRoles(prev => [...prev, data.data || data])
        showToast(t('roles.toast.created'))
      }
      setShowModal(false)
    } catch (err) {
      setFormError(err.response?.data?.message || Object.values(err.response?.data?.errors || {}).flat()[0] || t('roles.toast.saveFailed'))
    } finally {
      setSaving(false)
    }
  }

  async function confirmDelete() {
    if (!deleteTarget) return
    setDeleting(true)
    setDeleteError('')
    try {
      await adminApi.deleteRole(deleteTarget.id)
      setRoles(prev => prev.filter(r => r.id !== deleteTarget.id))
      showToast(t('roles.toast.deleted'))
      setDeleteTarget(null)
    } catch (err) {
      setDeleteError(err.response?.data?.message || t('roles.toast.deleteFailed'))
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-sans font-bold dark:text-white">{t('roles.title')}</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{t('roles.subtitle')}</p>
        </div>
        <button onClick={() => openModal()} className="btn-primary flex items-center gap-2 text-sm">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/></svg>
          {t('roles.actions.addRole')}
        </button>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="glass-card !p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-brand-violet/10 dark:bg-brand-violet/20 flex items-center justify-center">
            <svg className="w-5 h-5 text-brand-violet" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg>
          </div>
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400">{t('roles.stats.totalRoles')}</p>
            <p className="text-lg font-bold dark:text-white">{roles.length}</p>
          </div>
        </div>
        <div className="glass-card !p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center">
            <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"/></svg>
          </div>
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400">{t('roles.stats.totalUsers')}</p>
            <p className="text-lg font-bold text-blue-500">{totalUsers}</p>
          </div>
        </div>
        <div className="glass-card !p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center">
            <svg className="w-5 h-5 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
          </div>
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400">{t('roles.stats.systemRoles')}</p>
            <p className="text-lg font-bold text-amber-500">{systemRoles}</p>
          </div>
        </div>
        <div className="glass-card !p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center">
            <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"/></svg>
          </div>
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400">{t('roles.stats.customRoles')}</p>
            <p className="text-lg font-bold text-green-500">{customRoles}</p>
          </div>
        </div>
      </div>

      {/* Loading */}
      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-10 h-10 border-4 border-brand-violet/30 border-t-brand-violet rounded-full animate-spin" />
        </div>
      ) : roles.length > 0 ? (
        /* Roles Grid */
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {roles.map(role => {
            const colors = roleColor(role.name)
            return (
              <div key={role.id} className="glass-card group relative overflow-hidden transition-all hover:shadow-lg hover:scale-[1.01]">
                {/* Role Color Stripe */}
                <div className={`absolute top-0 left-0 w-full h-1 ${colors.stripe}`} />

                {/* Header */}
                <div className="flex items-start justify-between mb-4 pt-2">
                  <div className="flex items-center gap-3">
                    <div className={`w-11 h-11 rounded-full flex items-center justify-center ${colors.bg}`}>
                      {role.name === 'admin' ? (
                        <svg className={`w-5 h-5 ${colors.icon}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg>
                      ) : role.name === 'member' ? (
                        <svg className={`w-5 h-5 ${colors.icon}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>
                      ) : role.name === 'guest' ? (
                        <svg className={`w-5 h-5 ${colors.icon}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
                      ) : (
                        <svg className={`w-5 h-5 ${colors.icon}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"/></svg>
                      )}
                    </div>
                    <div>
                      <h2 className="font-bold text-gray-900 dark:text-white">{getRoleDisplayName(role)}</h2>
                      <span className="text-[10px] font-mono text-gray-400 bg-gray-100 dark:bg-dark-600 px-1.5 py-0.5 rounded">{role.name}</span>
                    </div>
                  </div>
                  {/* Actions */}
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => openModal(role)} className="p-1.5 rounded-lg text-gray-400 hover:text-brand-violet dark:hover:text-brand-cyan hover:bg-brand-violet/10 dark:hover:bg-brand-cyan/10 transition-colors" title={t('common.edit')} aria-label={t('common.edit')}>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
                    </button>
                    {!isSystemRole(role) && (
                      <button onClick={() => setDeleteTarget(role)} className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-500/10 transition-colors" title={t('common.delete')} aria-label={t('common.delete')}>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                      </button>
                    )}
                  </div>
                </div>

                {/* Description */}
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-5">{role.description || t('roles.noDescription')}</p>

                {/* Footer */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-dark-600">
                  <div className="flex items-center gap-2">
                    <div className="flex -space-x-2">
                      {(role.sample_users || []).slice(0, 4).map((sampleUser) => (
                        <div
                          key={sampleUser.id}
                          title={sampleUser.name}
                          className={`w-7 h-7 rounded-full border-2 border-white dark:border-dark-800 overflow-hidden flex items-center justify-center text-[10px] font-bold ${colors.bg} ${colors.icon}`}
                        >
                          {sampleUser.avatar ? (
                            <img src={sampleUser.avatar} alt={sampleUser.name} className="w-full h-full object-cover" />
                          ) : (
                            sampleUser.name?.charAt(0)?.toUpperCase() || '?'
                          )}
                        </div>
                      ))}
                      {(role.users_count || 0) > 4 && (
                        <div className="w-7 h-7 rounded-full border-2 border-white dark:border-dark-800 bg-gray-100 dark:bg-dark-600 flex items-center justify-center text-[10px] font-bold text-gray-500">
                          +{role.users_count - 4}
                        </div>
                      )}
                    </div>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {(role.users_count || 0) === 1
                        ? t('roles.userCountSingular', { count: 1 })
                        : t('roles.userCountPlural', { count: role.users_count || 0 })}
                    </span>
                  </div>
                  {isSystemRole(role) ? (
                    <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-gray-100 dark:bg-dark-600 text-gray-500 dark:text-gray-400">{t('roles.badges.system')}</span>
                  ) : (
                    <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400">{t('roles.badges.custom')}</span>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        /* Empty State */
        <div className="glass-card flex flex-col items-center justify-center py-16">
          <div className="w-16 h-16 rounded-2xl bg-gray-100 dark:bg-dark-700 flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg>
          </div>
          <h3 className="font-semibold text-gray-900 dark:text-white mb-1">{t('roles.empty.title')}</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">{t('roles.empty.subtitle')}</p>
          <button onClick={() => openModal()} className="btn-primary text-sm">{t('roles.actions.createRole')}</button>
        </div>
      )}

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setShowModal(false)}>
          <div className="bg-white dark:bg-dark-800 rounded-2xl shadow-2xl max-w-md w-full border border-gray-200 dark:border-dark-600" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-dark-600">
              <h3 className="font-bold text-gray-900 dark:text-white">{editingRole ? t('roles.modal.editTitle') : t('roles.modal.createTitle')}</h3>
              <button onClick={() => setShowModal(false)} title={t('common.close')} aria-label={t('common.close')} className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:text-gray-300 dark:hover:bg-dark-700 transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/></svg>
              </button>
            </div>
            <form onSubmit={saveRole} className="px-6 py-5 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">{t('roles.form.displayName')} <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  value={form.display_name}
                  onChange={e => setForm(f => ({ ...f, display_name: e.target.value }))}
                  className="input-field"
                  placeholder={t('roles.form.displayNamePlaceholder')}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                  {t('roles.form.slug')} <span className="text-red-500">*</span>
                  <span className="text-xs font-normal text-gray-400 ml-1">— {t('roles.form.slugHint')}</span>
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  className="input-field font-mono text-sm"
                  placeholder={t('roles.form.slugPlaceholder')}
                  required
                  disabled={editingRole && isSystemRole(editingRole)}
                />
                {editingRole && isSystemRole(editingRole) && (
                  <p className="text-[10px] text-amber-500 mt-1">{t('roles.form.systemSlugLocked')}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">{t('roles.form.description')}</label>
                <textarea
                  value={form.description}
                  onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  rows="3"
                  className="input-field resize-y"
                  placeholder={t('roles.form.descriptionPlaceholder')}
                />
              </div>
              {formError && (
                <div className="p-3 rounded-full bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800/30">
                  <p className="text-sm text-red-600 dark:text-red-400">{formError}</p>
                </div>
              )}
            </form>
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200 dark:border-dark-600">
              <button onClick={() => setShowModal(false)} className="px-4 py-2 text-sm font-medium rounded-lg bg-gray-100 dark:bg-dark-600 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-dark-500 transition-colors">{t('common.cancel')}</button>
              <button onClick={saveRole} disabled={saving} className="btn-primary text-sm flex items-center gap-2">
                {saving && (
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                )}
                {saving ? t('common.saving') : editingRole ? t('roles.actions.updateRole') : t('roles.actions.createRole')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm Modal */}
      <DeleteConfirmDialog
        open={Boolean(deleteTarget)}
        onCancel={() => {
          setDeleteTarget(null)
          setDeleteError('')
        }}
        onConfirm={confirmDelete}
        loading={deleting}
        error={deleteError}
        title={t('roles.deleteModal.title')}
        description={t('roles.deleteModal.subtitle')}
        cancelLabel={t('common.cancel')}
        confirmLabel={t('common.delete')}
        loadingLabel={t('common.deleting')}
      >
        {deleteTarget && (
          <div className="space-y-3">
            <div className="flex items-center gap-3 rounded-lg border border-slate-200/80 bg-slate-50 p-3 dark:border-white/10 dark:bg-white/[0.03]">
              <div className={`flex size-9 shrink-0 items-center justify-center rounded-lg ${roleColor(deleteTarget.name).bg}`}>
                <svg className={`size-4 ${roleColor(deleteTarget.name).icon}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">{getRoleDisplayName(deleteTarget)}</p>
                <p className="text-xs text-slate-500 dark:text-gray-400">
                  {(deleteTarget.users_count || 0) === 1
                    ? t('roles.deleteModal.assignedSingular', { count: 1 })
                    : t('roles.deleteModal.assignedPlural', { count: deleteTarget.users_count || 0 })}
                </p>
              </div>
            </div>
            {(deleteTarget.users_count || 0) > 0 && (
              <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-700 dark:border-amber-800/30 dark:bg-amber-900/15 dark:text-amber-400">
                {deleteTarget.users_count === 1
                  ? t('roles.deleteModal.reassignWarningSingular', { count: 1 })
                  : t('roles.deleteModal.reassignWarningPlural', { count: deleteTarget.users_count })}
              </p>
            )}
          </div>
        )}
      </DeleteConfirmDialog>
    </div>
  )
}
