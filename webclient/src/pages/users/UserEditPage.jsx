import React, { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { Trans, useTranslation } from 'react-i18next'
import { adminApi } from '@/services'
import { useAuth } from '@/contexts/AuthContext'
import { useUi } from '@/contexts/UiContext'
import CustomSelect from '@/components/common/CustomSelect'
import DeleteConfirmDialog from '@/components/ui/delete-confirm-dialog'
import BackButton from '@/components/ui/back-button'

const RESOURCE_KEYS = [
  'projects',
  'categories',
  'tags',
  'team_members',
  'blog_posts',
  'media',
]

const ROLE_KEY_MAP = {
  superadmin: 'roles.superadmin',
  super_admin: 'roles.superadmin',
  'super-admin': 'roles.superadmin',
  'super admin': 'roles.superadmin',
  admin: 'roles.admin',
  editor: 'roles.editor',
  moderator: 'roles.moderator',
  author: 'roles.author',
  member: 'roles.member',
  user: 'roles.user',
  viewer: 'roles.viewer',
  guest: 'roles.guest',
}

function getRoleLabel(role, t) {
  if (!role) return ''
  const rawName = String(role.name || role.display_name || '').trim().toLowerCase()
  const key = ROLE_KEY_MAP[rawName]
  if (key) return t(key)
  return role.display_name || role.name || ''
}

export default function UserEditView() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { t, i18n } = useTranslation('users')
  const { isSuperAdmin } = useAuth()
  const { showToast } = useUi()
  const dateLocale = i18n.language?.startsWith('km') ? 'km-KH' : 'en-US'

  const [user, setUser] = useState(null)
  const [roles, setRoles] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const [form, setForm] = useState({
    name: '',
    username: '',
    email: '',
    role_id: '',
  })

  // Resource permissions
  const [permissions, setPermissions] = useState({})
  const [permissionsLoading, setPermissionsLoading] = useState(false)
  const [permissionsSaving, setPermissionsSaving] = useState(false)

  // Delete modal
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deletingUser, setDeletingUser] = useState(false)

  const isAdminUser = user?.role?.name?.toLowerCase() === 'admin'

  useEffect(() => {
    async function loadUser() {
      try {
        setLoading(true)
        const [userRes, rolesRes] = await Promise.all([
          adminApi.getUser(id),
          adminApi.getRoles(),
        ])
        const u = userRes.data.data
        setUser(u)
        setForm({
          name: u.name,
          username: u.username || '',
          email: u.email,
          role_id: u.role?.id || '',
        })
        setRoles(rolesRes.data.data || [])

        if (isSuperAdmin && u.role?.name?.toLowerCase() === 'admin') {
          loadPermissions(u.id)
        }
      } catch {
        setUser(null)
      } finally {
        setLoading(false)
      }
    }
    loadUser()
  }, [id, isSuperAdmin])

  async function loadPermissions(userId) {
    try {
      setPermissionsLoading(true)
      const { data } = await adminApi.getUserPermissions(userId)
      setPermissions(data.data || {})
    } catch {
      setPermissions({})
    } finally {
      setPermissionsLoading(false)
    }
  }

  function togglePerm(resource, field) {
    setPermissions((prev) => ({
      ...prev,
      [resource]: {
        ...prev[resource],
        [field]: !prev[resource]?.[field],
      },
    }))
  }

  async function savePermissions() {
    setPermissionsSaving(true)
    try {
      const payload = Object.entries(permissions).map(([resource, perms]) => ({
        resource,
        ...perms,
      }))
      await adminApi.updateUserPermissions(id, { permissions: payload })
      showToast(t('edit.toasts.permissionsSaved'))
    } catch {
      showToast(t('edit.toasts.permissionsSaveFailed'), 'error')
    } finally {
      setPermissionsSaving(false)
    }
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      await adminApi.updateUser(id, form)
      showToast(t('edit.toasts.userUpdated'))
      navigate('/admin/users')
    } catch (err) {
      setError(err.response?.data?.message || t('edit.toasts.updateFailed'))
    } finally {
      setSaving(false)
    }
  }

  async function toggleActive() {
    try {
      await adminApi.toggleUserActive(user.id)
      setUser((prev) => ({ ...prev, is_active: !prev.is_active }))
      showToast(t(!user.is_active ? 'edit.toasts.userActivated' : 'edit.toasts.userDeactivated'))
    } catch {
      showToast(t('edit.toasts.updateUserFailed'), 'error')
    }
  }

  async function handleDelete() {
    setDeletingUser(true)
    try {
      await adminApi.deleteUser(user.id)
      showToast(t('edit.toasts.userDeleted'))
      navigate('/admin/users')
    } catch {
      showToast(t('edit.toasts.deleteFailed'), 'error')
    } finally {
      setDeletingUser(false)
      setShowDeleteModal(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="w-10 h-10 border-4 border-brand-violet/30 border-t-brand-violet rounded-full animate-spin" />
      </div>
    )
  }

  if (!user) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-400">{t('edit.notFound')}</p>
        <Link to="/admin/users" className="btn-secondary mt-4 inline-block">
          {t('edit.backToUsers')}
        </Link>
      </div>
    )
  }

  return (
    <div>
      {/* Back & Breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
          <Link
            to="/admin/users"
            className="hover:text-brand-violet dark:hover:text-brand-cyan transition-colors"
          >
            {t('edit.breadcrumbUsers')}
          </Link>
          <span>/</span>
          <span className="text-gray-700 dark:text-gray-200 font-medium">{t('edit.breadcrumbEdit')}</span>
        </div>
        <BackButton to="/admin/users" className="self-start sm:self-auto" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* User Profile Card */}
        <div className="lg:col-span-1">
          <div className="surface-panel !p-6 text-center">
            <div className="relative inline-block mb-4">
              {user.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-24 h-24 rounded-full object-cover ring-4 ring-brand-violet/20 dark:ring-brand-cyan/20 mx-auto"
                />
              ) : (
                <div className="w-24 h-24 rounded-full bg-gradient-brand flex items-center justify-center text-white text-3xl font-bold mx-auto">
                  {user.name?.charAt(0)?.toUpperCase()}
                </div>
              )}
              <span
                className={`absolute bottom-1 right-1 w-5 h-5 rounded-full border-2 border-white dark:border-dark-800 ${
                  user.is_active ? 'bg-green-400' : 'bg-gray-300'
                }`}
              />
            </div>

            <h2 className="text-lg font-bold text-gray-900 dark:text-white">{user.name}</h2>
            {user.username && (
              <p className="text-sm text-brand-violet dark:text-brand-cyan font-medium">
                @{user.username}
              </p>
            )}
            <p className="text-sm text-gray-500 dark:text-gray-400">{user.email}</p>
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium mt-3 bg-brand-violet/10 text-brand-violet dark:text-brand-cyan">
              {getRoleLabel(user.role, t) || t('roles.member')}
            </span>

            <div className="mt-5 pt-5 border-t border-gray-100 dark:border-white/5 space-y-3 text-left">
              <div className="flex items-center gap-3 text-sm">
                <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <div>
                  <p className="text-gray-400 text-xs">{t('edit.card.joined')}</p>
                  <p className="text-gray-700 dark:text-gray-300">
                    {new Date(user.created_at).toLocaleDateString(dateLocale)}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 text-sm">
                <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <p className="text-gray-400 text-xs">{t('edit.card.status')}</p>
                  <p className={user.is_active ? 'text-green-500 font-medium' : 'text-red-500 font-medium'}>
                    {user.is_active ? t('status.active') : t('status.inactive')}
                  </p>
                </div>
              </div>

              {user.bio && (
                <div className="flex items-start gap-3 text-sm">
                  <svg className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h7" />
                  </svg>
                  <div>
                    <p className="text-gray-400 text-xs">{t('edit.card.bio')}</p>
                    <p className="text-gray-700 dark:text-gray-300">{user.bio}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Quick Actions */}
            <div className="mt-5 pt-5 border-t border-gray-100 dark:border-white/5 space-y-2">
              <button
                type="button"
                onClick={toggleActive}
                className={`w-full py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
 user.is_active
 ? 'bg-orange-50 text-orange-600 hover:bg-orange-100 dark:bg-orange-500/10 dark:text-orange-400'
 : 'bg-green-50 text-green-600 hover:bg-green-100 dark:bg-green-500/10 dark:text-green-400'
 }`}
              >
                {user.is_active ? t('edit.actions.deactivateUser') : t('edit.actions.activateUser')}
              </button>
              <button
                type="button"
                onClick={() => setShowDeleteModal(true)}
                className="w-full py-2 px-4 rounded-lg text-sm font-medium bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-500/10 dark:text-red-400 transition-colors"
              >
                {t('edit.actions.deleteUser')}
              </button>
            </div>
          </div>
        </div>

        {/* Edit Form */}
        <div className="lg:col-span-2 space-y-6">
          <form onSubmit={handleSubmit} className="surface-panel !p-6">
            <h3 className="text-lg font-display font-bold text-gray-900 dark:text-white mb-5 flex items-center gap-2">
              {t('edit.form.title')}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  {t('edit.form.fullName')}
                </label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="input-field w-full"
                  placeholder={t('edit.form.fullNamePlaceholder')}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  {t('edit.form.username')}
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">@</span>
                  <input
                    type="text"
                    required
                    value={form.username}
                    onChange={(e) => setForm({ ...form, username: e.target.value })}
                    className="input-field w-full pl-8"
                    placeholder={t('edit.form.usernamePlaceholder')}
                  />
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  {t('edit.form.email')}
                </label>
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="input-field w-full"
                  placeholder={t('edit.form.emailPlaceholder')}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  {t('edit.form.role')}
                </label>
                <CustomSelect
                  value={form.role_id}
                  onChange={(val) => setForm({ ...form, role_id: val })}
                  options={[
                    { label: t('edit.form.selectRole'), value: '' },
                    ...roles.map((r) => ({ label: getRoleLabel(r, t), value: r.id })),
                  ]}
                  placeholder={t('edit.form.selectRole')}
                />
              </div>
            </div>

            {error && <p className="text-sm text-red-500 mt-3">{error}</p>}

            <div className="flex items-center justify-end gap-3 mt-6 pt-5 border-t border-gray-100 dark:border-white/5">
              <Link to="/admin/users" className="btn-secondary text-xs">
                {t('common.cancel')}
              </Link>
              <button
                type="submit"
                disabled={saving}
                className="btn-primary text-xs"
              >
                {saving ? t('common.saving') : t('edit.form.saveChanges')}
              </button>
            </div>
          </form>

          {/* Permissions Panel (superadmin only, for admin users) */}
          {isSuperAdmin && isAdminUser && (
            <div className="surface-panel !p-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-display font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  {t('permissions.title')}
                </h3>
                <button
                  type="button"
                  onClick={savePermissions}
                  disabled={permissionsSaving}
                  className="btn-primary text-xs"
                >
                  {permissionsSaving ? t('common.saving') : t('permissions.save')}
                </button>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-5">
                <Trans
                  i18nKey="permissions.subtitle"
                  ns="users"
                  values={{ name: user.name }}
                  components={{ strong: <strong /> }}
                />
              </p>

              {permissionsLoading ? (
                <div className="flex justify-center py-8">
                  <div className="w-8 h-8 border-4 border-brand-violet/30 border-t-brand-violet rounded-full animate-spin" />
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-200 dark:border-white/10 text-xs text-gray-400">
                        <th className="text-left pb-3 pr-4 font-semibold">{t('permissions.table.resource')}</th>
                        <th className="pb-3 px-4 font-semibold text-center">{t('permissions.actions.create')}</th>
                        <th className="pb-3 px-4 font-semibold text-center">{t('permissions.actions.update')}</th>
                        <th className="pb-3 px-4 font-semibold text-center">{t('permissions.actions.delete')}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                      {RESOURCE_KEYS.map((resourceKey) => {
                        const perm = permissions[resourceKey] || {}
                        return (
                          <tr key={resourceKey}>
                            <td className="py-3 pr-4 font-medium text-gray-900 dark:text-white">
                              {t(`permissions.resources.${resourceKey}`)}
                            </td>
                            <td className="py-3 px-4 text-center">
                              <input
                                type="checkbox"
                                checked={!!perm.can_create}
                                onChange={() => togglePerm(resourceKey, 'can_create')}
                                className="rounded text-brand-violet focus:ring-brand-violet"
                              />
                            </td>
                            <td className="py-3 px-4 text-center">
                              <input
                                type="checkbox"
                                checked={!!perm.can_update}
                                onChange={() => togglePerm(resourceKey, 'can_update')}
                                className="rounded text-brand-violet focus:ring-brand-violet"
                              />
                            </td>
                            <td className="py-3 px-4 text-center">
                              <input
                                type="checkbox"
                                checked={!!perm.can_delete}
                                onChange={() => togglePerm(resourceKey, 'can_delete')}
                                className="rounded text-brand-violet focus:ring-brand-violet"
                              />
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmDialog
        open={showDeleteModal}
        onCancel={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
        loading={deletingUser}
        title={t('edit.deleteModal.title')}
        description={
          <Trans
            i18nKey="edit.deleteModal.confirmMessage"
            ns="users"
            values={{ name: user.name }}
            components={{ strong: <strong /> }}
          />
        }
        cancelLabel={t('common.cancel')}
        confirmLabel={t('common.delete')}
        loadingLabel={t('common.deleting')}
      />
    </div>
  )
}
