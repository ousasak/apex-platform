import React, { useState, useEffect, useMemo } from 'react'
import { useTranslation, Trans } from 'react-i18next'
import { adminApi } from '@/services'
import { useAuth } from '@/contexts/AuthContext'
import { useUi } from '@/contexts/UiContext'
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty'
import DeleteConfirmDialog from '@/components/ui/delete-confirm-dialog'
import { Users } from 'lucide-react'

const defaultForm = {
  name: '',
  title: '',
  bio: '',
  email: '',
  github_url: '',
  linkedin_url: '',
  telegram_url: '',
  display_order: 0,
  is_founder: false,
  is_visible: true,
}

export default function TeamView() {
  const { t, i18n } = useTranslation('management')
  const { canDo } = useAuth()
  const { showToast } = useUi()

  const [members, setMembers] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  // Form modal
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState({ ...defaultForm })
  const [avatar, setAvatar] = useState(null)
  const [avatarPreview, setAvatarPreview] = useState(null)
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState('')

  // Delete modal
  const [deleteTarget, setDeleteTarget] = useState(null)

  const founderCount = useMemo(() => members.filter((m) => m.is_founder).length, [members])
  const visibleCount = useMemo(() => members.filter((m) => m.is_visible !== false).length, [members])
  const hiddenCount = useMemo(() => members.filter((m) => m.is_visible === false).length, [members])

  const filteredMembers = useMemo(() => {
    if (!search.trim()) return members
    const q = search.toLowerCase()
    return members.filter(
      (m) =>
        (m.name || '').toLowerCase().includes(q) ||
        (m.title || '').toLowerCase().includes(q) ||
        (m.email || '').toLowerCase().includes(q)
    )
  }, [members, search])

  async function fetchMembers() {
    setLoading(true)
    try {
      const { data } = await adminApi.getTeamMembers()
      setMembers(data.data || [])
    } catch {
      setMembers([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMembers()
  }, [])

  function openAddForm() {
    setForm({ ...defaultForm })
    setEditingId(null)
    setAvatar(null)
    setAvatarPreview(null)
    setFormError('')
    setShowForm(true)
  }

  function editMember(m) {
    setForm({
      name: m.name || '',
      title: m.title || '',
      bio: m.bio || '',
      email: m.email || '',
      github_url: m.github_url || '',
      linkedin_url: m.linkedin_url || '',
      telegram_url: m.telegram_url || '',
      display_order: m.display_order || 0,
      is_founder: !!m.is_founder,
      is_visible: m.is_visible !== false,
    })
    setEditingId(m.id)
    setAvatar(null)
    setAvatarPreview(m.avatar || null)
    setFormError('')
    setShowForm(true)
  }

  function onFile(e) {
    const file = e.target.files?.[0]
    if (!file) return
    setAvatar(file)
    const reader = new FileReader()
    reader.onload = (ev) => setAvatarPreview(ev.target.result)
    reader.readAsDataURL(file)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setSaving(true)
    setFormError('')

    const fd = new FormData()
    fd.append('name', form.name)
    fd.append('title', form.title)
    fd.append('bio', form.bio || '')
    fd.append('email', form.email || '')
    fd.append('github_url', form.github_url || '')
    fd.append('linkedin_url', form.linkedin_url || '')
    fd.append('telegram_url', form.telegram_url || '')
    fd.append('display_order', form.display_order || 0)
    fd.append('is_founder', form.is_founder ? '1' : '0')
    fd.append('is_visible', form.is_visible ? '1' : '0')
    if (avatar) fd.append('avatar', avatar)
    if (editingId) fd.append('_method', 'PUT')

    try {
      if (editingId) {
        await adminApi.updateTeamMember(editingId, fd)
      } else {
        await adminApi.createTeamMember(fd)
      }
      showToast(editingId ? t('team.toasts.updateSuccess') : t('team.toasts.createSuccess'))
      setShowForm(false)
      fetchMembers()
    } catch (err) {
      if (err.response?.data?.intercepted) {
        showToast(err.response.data.message || t('common.queuedForApproval'), 'warning')
        setShowForm(false)
      } else {
        const msg = err.response?.data?.message || t('team.toasts.saveError')
        setFormError(msg)
        showToast(msg, 'error')
      }
    } finally {
      setSaving(false)
    }
  }

  async function confirmDelete() {
    if (!deleteTarget) return
    try {
      await adminApi.deleteTeamMember(deleteTarget.id)
      setMembers((prev) => prev.filter((x) => x.id !== deleteTarget.id))
      showToast(t('team.toasts.deleteSuccess'))
    } catch (e) {
      if (e.response?.data?.intercepted) {
        showToast(e.response.data.message || t('common.queuedForApproval'), 'warning')
      } else {
        showToast(t('team.toasts.deleteError'), 'error')
      }
    }
    setDeleteTarget(null)
  }

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-display font-bold text-gray-900 dark:text-white">{t('team.title')}</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {t('team.subtitle')}
          </p>
        </div>
        {canDo('team_members', 'create') && (
          <button
            onClick={openAddForm}
            className="btn-primary flex items-center gap-2 text-sm"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
            </svg>
            {t('team.actions.add')}
          </button>
        )}
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
            <p className="text-xs text-gray-500 dark:text-gray-400">{t('team.stats.total')}</p>
            <p className="text-lg font-bold text-gray-900 dark:text-white">{members.length}</p>
          </div>
        </div>

        <div className="surface-panel !p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
            <svg className="w-5 h-5 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
            </svg>
          </div>
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400">{t('team.stats.founders')}</p>
            <p className="text-lg font-bold text-amber-500">{founderCount}</p>
          </div>
        </div>

        <div className="surface-panel !p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center">
            <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          </div>
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400">{t('team.stats.visible')}</p>
            <p className="text-lg font-bold text-green-500">{visibleCount}</p>
          </div>
        </div>

        <div className="surface-panel !p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gray-500/10 flex items-center justify-center">
            <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878l4.242 4.242L21 21" />
            </svg>
          </div>
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400">{t('team.stats.hidden')}</p>
            <p className="text-lg font-bold text-gray-500">{hiddenCount}</p>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="surface-panel !p-4 mb-6">
        <div className="relative max-w-md">
          <svg className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t('team.searchPlaceholder')}
            className="input-field pl-10 text-sm w-full"
          />
        </div>
      </div>

      {/* Team Grid */}
      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-10 h-10 border-4 border-brand-violet/30 border-t-brand-violet rounded-full animate-spin" />
        </div>
      ) : filteredMembers.length === 0 ? (
        <Empty className="surface-panel">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <Users className="size-5" strokeWidth={1.75} />
            </EmptyMedia>
            <EmptyTitle>{t('team.empty')}</EmptyTitle>
          </EmptyHeader>
        </Empty>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredMembers.map((m) => (
            <div
              key={m.id}
              className="surface-panel p-5 text-center flex flex-col justify-between hover:-translate-y-1 transition-all group"
            >
              <div>
                <div className="relative w-20 h-20 mx-auto mb-3">
                  {m.avatar ? (
                    <img
                      src={m.avatar}
                      alt={m.name}
                      className="w-full h-full rounded-2xl object-cover ring-2 ring-brand-violet/20"
                    />
                  ) : (
                    <div className="w-full h-full rounded-2xl bg-gradient-brand flex items-center justify-center text-white font-bold text-xl">
                      {m.name?.charAt(0)}
                    </div>
                  )}
                  {m.is_founder && (
                    <span className="absolute -bottom-1 -right-1 px-1.5 py-0.5 rounded-md text-[9px] font-bold bg-amber-400 text-dark-900">
                      {t('team.badges.founder')}
                    </span>
                  )}
                </div>

                <h3 className="font-semibold text-gray-900 dark:text-white text-base">
                  {m.name}
                </h3>
                <p className="text-xs text-brand-violet dark:text-brand-cyan font-medium mb-2">
                  {m.title}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2">
                  {m.bio || '—'}
                </p>
              </div>

              <div className="flex items-center justify-between pt-4 mt-4 border-t border-gray-100 dark:border-white/5 text-xs text-gray-400">
                <span>{t('team.orderLabel', { order: m.display_order || 0 })}</span>
                <div className="flex items-center gap-1">
                  {canDo('team_members', 'update') && (
                    <button
                      type="button"
                      onClick={() => editMember(m)}
                      className="p-1 hover:text-brand-violet dark:hover:text-brand-cyan"
                      title={t('common.edit')}
                      aria-label={t('common.edit')}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                      </svg>
                    </button>
                  )}
                  {canDo('team_members', 'delete') && (
                    <button
                      type="button"
                      onClick={() => setDeleteTarget(m)}
                      className="p-1 hover:text-red-500"
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
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="surface-panel w-full max-w-lg p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto space-y-4">
            <h3 className="font-display text-lg font-bold text-gray-900 dark:text-white">
              {editingId ? t('team.modal.editTitle') : t('team.modal.addTitle')}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Avatar input */}
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-gray-100 dark:bg-white/5 overflow-hidden flex items-center justify-center">
                  {avatarPreview ? (
                    <img src={avatarPreview} alt={t('team.form.avatarPreviewAlt')} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-xl font-bold text-gray-400">?</span>
                  )}
                </div>
                <label className="btn-secondary text-xs cursor-pointer">
                  {t('team.form.uploadPhoto')}
                  <input type="file" accept="image/*" onChange={onFile} className="hidden" />
                </label>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('team.form.name')} <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="input-field text-sm"
                    placeholder={t('team.form.namePlaceholder')}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('team.form.titleRole')} <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    className="input-field text-sm"
                    placeholder={t('team.form.titlePlaceholder')}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t('team.form.email')}
                </label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="input-field text-sm"
                  placeholder={t('team.form.emailPlaceholder')}
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t('team.form.bio')}
                </label>
                <textarea
                  rows={2}
                  value={form.bio}
                  onChange={(e) => setForm({ ...form, bio: e.target.value })}
                  className="input-field text-sm resize-none"
                  placeholder={t('team.form.bioPlaceholder')}
                />
              </div>

              <div className="grid sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('team.form.githubUrl')}
                  </label>
                  <input
                    type="url"
                    value={form.github_url}
                    onChange={(e) => setForm({ ...form, github_url: e.target.value })}
                    className="input-field text-xs"
                    placeholder={t('team.form.githubPlaceholder')}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('team.form.linkedinUrl')}
                  </label>
                  <input
                    type="url"
                    value={form.linkedin_url}
                    onChange={(e) => setForm({ ...form, linkedin_url: e.target.value })}
                    className="input-field text-xs"
                    placeholder={t('team.form.linkedinPlaceholder')}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('team.form.telegramUrl')}
                  </label>
                  <input
                    type="url"
                    value={form.telegram_url}
                    onChange={(e) => setForm({ ...form, telegram_url: e.target.value })}
                    className="input-field text-xs"
                    placeholder={t('team.form.telegramPlaceholder')}
                  />
                </div>
              </div>

              <div className="flex items-center gap-6 pt-2">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-gray-700 dark:text-gray-300">
                  <input
                    type="checkbox"
                    checked={form.is_founder}
                    onChange={(e) => setForm({ ...form, is_founder: e.target.checked })}
                    className="rounded text-brand-violet focus:ring-brand-violet"
                  />
                  {t('team.form.founder')}
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-gray-700 dark:text-gray-300">
                  <input
                    type="checkbox"
                    checked={form.is_visible}
                    onChange={(e) => setForm({ ...form, is_visible: e.target.checked })}
                    className="rounded text-brand-violet focus:ring-brand-violet"
                  />
                  {t('team.form.visibleOnSite')}
                </label>

                <div className="flex items-center gap-2 ml-auto">
                  <span className="text-xs text-gray-400">{t('team.form.order')}</span>
                  <input
                    type="number"
                    value={form.display_order}
                    onChange={(e) => setForm({ ...form, display_order: parseInt(e.target.value) || 0 })}
                    className="input-field w-16 text-center text-xs py-1"
                  />
                </div>
              </div>

              {formError && <p className="text-xs text-red-500">{formError}</p>}

              <div className="flex justify-end gap-2 pt-3 border-t border-gray-100 dark:border-white/5">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="btn-secondary text-xs"
                >
                  {t('common.cancel')}
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="btn-primary text-xs"
                >
                  {saving ? t('common.saving') : t('team.form.saveMember')}
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
        onConfirm={confirmDelete}
        title={t('team.deleteModal.title')}
        description={
          deleteTarget ? (
            <Trans
              t={t}
              i18nKey="team.deleteModal.message"
              values={{ name: deleteTarget.name }}
              components={{ strong: <strong /> }}
            />
          ) : null
        }
        cancelLabel={t('common.cancel')}
        confirmLabel={t('common.delete')}
      />
    </div>
  )
}
