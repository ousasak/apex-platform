import React, { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { Trans, useTranslation } from 'react-i18next'
import { adminApi } from '@/services'
import { useUi } from '@/contexts/UiContext'
import Pagination from '@/components/common/Pagination'
import CustomSelect from '@/components/common/CustomSelect'
import { TableEmpty } from '@/components/ui/empty'
import DeleteConfirmDialog from '@/components/ui/delete-confirm-dialog'
import { Users } from 'lucide-react'

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

export default function UsersView() {
  const { t, i18n } = useTranslation('users')
  const { showToast } = useUi()
  const dateLocale = i18n.language?.startsWith('km') ? 'km-KH' : 'en-US'

  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [meta, setMeta] = useState({ current_page: 1, last_page: 1, per_page: 15, total: 0 })
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [roles, setRoles] = useState([])
  const [selectedIds, setSelectedIds] = useState([])
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleting, setDeleting] = useState(false)

  // Create Modal
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [creating, setCreating] = useState(false)
  const [createError, setCreateError] = useState('')
  const [createForm, setCreateForm] = useState({
    name: '',
    username: '',
    email: '',
    password: '',
    role_id: '',
  })

  const activeCount = useMemo(() => users.filter((u) => u.is_active).length, [users])
  const inactiveCount = useMemo(() => users.filter((u) => !u.is_active).length, [users])
  const newThisMonth = useMemo(() => {
    const now = new Date()
    return users.filter((u) => {
      const d = new Date(u.created_at)
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
    }).length
  }, [users])

  const allSelected = useMemo(
    () => users.length > 0 && selectedIds.length === users.length,
    [users, selectedIds]
  )

  function toggleSelectAll() {
    setSelectedIds(allSelected ? [] : users.map((u) => u.id))
  }

  function toggleSelect(id) {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    )
  }

  async function fetchUsers(page = 1) {
    setLoading(true)
    setSelectedIds([])
    try {
      const params = {
        page,
        search: search || undefined,
        role: roleFilter || undefined,
      }
      if (statusFilter === 'active') params.active = true
      else if (statusFilter === 'inactive') params.active = false
      const { data } = await adminApi.getUsers(params)
      setUsers(data.data || [])
      setMeta(data.meta || { current_page: 1, last_page: 1, per_page: 15, total: 0 })
    } catch {
      setUsers([])
    } finally {
      setLoading(false)
    }
  }

  async function fetchRoles() {
    try {
      const { data } = await adminApi.getRoles()
      setRoles(data.data || [])
    } catch {
      setRoles([])
    }
  }

  useEffect(() => {
    fetchRoles()
  }, [])

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchUsers(1)
    }, 300)
    return () => clearTimeout(timer)
  }, [search, roleFilter, statusFilter])

  async function toggleActive(u) {
    try {
      await adminApi.toggleUserActive(u.id)
      setUsers((prev) =>
        prev.map((item) => (item.id === u.id ? { ...item, is_active: !item.is_active } : item))
      )
      showToast(t(!u.is_active ? 'admin.toasts.userActivated' : 'admin.toasts.userDeactivated'))
    } catch {
      showToast(t('admin.toasts.updateFailed'), 'error')
    }
  }

  async function handleCreate(e) {
    e.preventDefault()
    setCreating(true)
    setCreateError('')
    try {
      await adminApi.createUser(createForm)
      showToast(t('admin.toasts.userCreated'))
      setShowCreateModal(false)
      setCreateForm({ name: '', username: '', email: '', password: '', role_id: '' })
      fetchUsers(1)
    } catch (err) {
      setCreateError(err.response?.data?.message || t('admin.toasts.createFailed'))
    } finally {
      setCreating(false)
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      await adminApi.deleteUser(deleteTarget.id)
      showToast(t('admin.toasts.userDeleted'))
      setDeleteTarget(null)
      fetchUsers(meta.current_page)
    } catch {
      showToast(t('admin.toasts.deleteFailed'), 'error')
    } finally {
      setDeleting(false)
    }
  }

  async function bulkDelete() {
    if (!window.confirm(t('admin.confirm.bulkDelete', { count: selectedIds.length }))) return
    try {
      await Promise.all(selectedIds.map((id) => adminApi.deleteUser(id)))
      showToast(t('admin.toasts.bulkDeleted', { count: selectedIds.length }))
      setSelectedIds([])
      fetchUsers(meta.current_page)
    } catch {
      showToast(t('admin.toasts.bulkDeleteFailed'), 'error')
    }
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
        <button
          onClick={() => setShowCreateModal(true)}
          className="btn-primary flex items-center gap-2 text-sm"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
          </svg>
          {t('admin.addUser')}
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="surface-panel !p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-brand-violet/10 dark:bg-brand-violet/20 flex items-center justify-center">
            <svg className="w-5 h-5 text-brand-violet" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400">{t('admin.stats.totalUsers')}</p>
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
            <p className="text-xs text-gray-500 dark:text-gray-400">{t('status.active')}</p>
            <p className="text-lg font-bold text-green-500">{activeCount}</p>
          </div>
        </div>

        <div className="surface-panel !p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center">
            <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
            </svg>
          </div>
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400">{t('status.inactive')}</p>
            <p className="text-lg font-bold text-red-500">{inactiveCount}</p>
          </div>
        </div>

        <div className="surface-panel !p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-brand-cyan/10 flex items-center justify-center">
            <svg className="w-5 h-5 text-brand-cyan" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400">{t('admin.stats.newThisMonth')}</p>
            <p className="text-lg font-bold text-brand-cyan">{newThisMonth}</p>
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
              value={roleFilter}
              onChange={(val) => setRoleFilter(val)}
              options={[
                { label: t('admin.filters.allRoles'), value: '' },
                ...roles.map((r) => ({ label: getRoleLabel(r, t), value: r.name })),
              ]}
              placeholder={t('admin.filters.allRoles')}
            />

            <CustomSelect
              value={statusFilter}
              onChange={(val) => setStatusFilter(val)}
              options={[
                { label: t('admin.filters.allStatus'), value: '' },
                { label: t('status.active'), value: 'active' },
                { label: t('status.inactive'), value: 'inactive' },
              ]}
              placeholder={t('admin.filters.allStatus')}
            />

            {selectedIds.length > 0 && (
              <button
                onClick={bulkDelete}
                className="px-3 py-2 rounded-xl text-xs font-semibold bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-colors whitespace-nowrap"
              >
                {t('admin.actions.deleteSelected', { count: selectedIds.length })}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Users Table */}
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
                    className="rounded border-gray-300 text-brand-violet focus:ring-brand-violet"
                  />
                </th>
                <th className="p-4">{t('admin.table.user')}</th>
                <th className="p-4">{t('admin.table.role')}</th>
                <th className="p-4">{t('admin.table.status')}</th>
                <th className="p-4">{t('admin.table.joined')}</th>
                <th className="p-4 text-right">{t('admin.table.actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan="6" className="text-center py-12 text-gray-400">
                    {t('admin.table.loading')}
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <TableEmpty colSpan={6} icon={Users} title={t('admin.table.empty')} />
              ) : (
                users.map((u) => (
                  <tr key={u.id} className="hover:bg-gray-50/50 dark:hover:bg-white/[0.02] transition-colors">
                    <td className="p-4">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(u.id)}
                        onChange={() => toggleSelect(u.id)}
                        className="rounded border-gray-300 text-brand-violet focus:ring-brand-violet"
                      />
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-brand flex items-center justify-center text-white font-bold text-sm overflow-hidden shrink-0">
                          {u.avatar ? (
                            <img src={u.avatar} alt={u.name} className="w-full h-full object-cover" />
                          ) : (
                            u.name?.charAt(0)?.toUpperCase()
                          )}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900 dark:text-white">{u.name}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {u.username ? `@${u.username}` : u.email}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-brand-violet/10 text-brand-violet dark:text-brand-cyan">
                        {getRoleLabel(u.role, t) || t('roles.member')}
                      </span>
                    </td>
                    <td className="p-4">
                      <button
                        onClick={() => toggleActive(u)}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
                          u.is_active
                            ? 'bg-green-500/10 text-green-500 hover:bg-green-500/20'
                            : 'bg-red-500/10 text-red-500 hover:bg-red-500/20'
                        }`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${u.is_active ? 'bg-green-500' : 'bg-red-500'}`} />
                        {u.is_active ? t('status.active') : t('status.inactive')}
                      </button>
                    </td>
                    <td className="p-4 text-xs text-gray-500 dark:text-gray-400">
                      {new Date(u.created_at).toLocaleDateString(dateLocale, {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          to={`/admin/users/${u.id}/edit`}
                          title={t('common.edit')}
                          aria-label={t('common.edit')}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-brand-violet dark:hover:text-brand-cyan hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                          </svg>
                        </Link>
                        <button
                          onClick={() => setDeleteTarget(u)}
                          title={t('common.delete')}
                          aria-label={t('common.delete')}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-500/10 transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
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
              onPageChange={(p) => fetchUsers(p)}
            />
          </div>
        )}
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="surface-panel w-full max-w-md p-6 shadow-2xl relative">
            <h3 className="font-display text-lg font-bold text-gray-900 dark:text-white mb-4">
              {t('admin.createModal.title')}
            </h3>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t('admin.createModal.fullName')}
                </label>
                <input
                  type="text"
                  required
                  value={createForm.name}
                  onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                  className="input-field text-sm"
                  placeholder={t('admin.createModal.fullNamePlaceholder')}
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t('admin.createModal.username')}
                </label>
                <input
                  type="text"
                  required
                  value={createForm.username}
                  onChange={(e) => setCreateForm({ ...createForm, username: e.target.value })}
                  className="input-field text-sm"
                  placeholder={t('admin.createModal.usernamePlaceholder')}
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t('admin.createModal.email')}
                </label>
                <input
                  type="email"
                  required
                  value={createForm.email}
                  onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
                  className="input-field text-sm"
                  placeholder={t('admin.createModal.emailPlaceholder')}
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t('admin.createModal.password')}
                </label>
                <input
                  type="password"
                  required
                  value={createForm.password}
                  onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })}
                  className="input-field text-sm"
                  placeholder={t('admin.createModal.passwordPlaceholder')}
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t('admin.createModal.role')}
                </label>
                <CustomSelect
                  value={createForm.role_id}
                  onChange={(val) => setCreateForm({ ...createForm, role_id: val })}
                  options={[
                    { label: t('admin.createModal.selectRole'), value: '' },
                    ...roles.map((r) => ({ label: getRoleLabel(r, t), value: r.id })),
                  ]}
                  placeholder={t('admin.createModal.selectRole')}
                />
              </div>

              {createError && (
                <p className="text-xs text-red-500">{createError}</p>
              )}

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="btn-secondary text-xs"
                >
                  {t('common.cancel')}
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="btn-primary text-xs"
                >
                  {creating ? t('admin.createModal.creating') : t('admin.createModal.submit')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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
              i18nKey="admin.deleteModal.confirmMessage"
              ns="users"
              values={{ name: deleteTarget.name }}
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
