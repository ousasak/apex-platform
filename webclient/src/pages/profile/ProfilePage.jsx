import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useAuth } from '@/contexts/AuthContext'
import { useUi } from '@/contexts/UiContext'
import { memberApi } from '@/services'
import dayjs from 'dayjs'

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

export default function ProfileView() {
  const { t, i18n } = useTranslation('users')
  const { user, updateProfile, updatePassword, uploadAvatar } = useAuth()
  const { showToast } = useUi()

  const [activeTab, setActiveTab] = useState('profile')
  const [profileForm, setProfileForm] = useState({
    name: user?.name || '',
    username: user?.username || '',
    bio: user?.bio || '',
    github_url: user?.github_url || '',
    linkedin_url: user?.linkedin_url || '',
  })
  const [passwordForm, setPasswordForm] = useState({
    current_password: '',
    password: '',
    password_confirmation: '',
  })
  const [savingProfile, setSavingProfile] = useState(false)
  const [savingPassword, setSavingPassword] = useState(false)
  const [avatarUploading, setAvatarUploading] = useState(false)

  useEffect(() => {
    if (user) {
      setProfileForm({
        name: user.name || '',
        username: user.username || '',
        bio: user.bio || '',
        github_url: user.github_url || '',
        linkedin_url: user.linkedin_url || '',
      })
    }
  }, [user])

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setAvatarUploading(true)
    try {
      const formData = new FormData()
      formData.append('avatar', file)
      await uploadAvatar(formData)
      showToast(t('profile.toasts.avatarUpdated'))
    } catch {
      showToast(t('profile.toasts.avatarUploadFailed'), 'error')
    } finally {
      setAvatarUploading(false)
    }
  }

  const handleSaveProfile = async (e) => {
    e.preventDefault()
    setSavingProfile(true)
    try {
      await updateProfile(profileForm)
      showToast(t('profile.toasts.profileUpdated'))
    } catch (err) {
      showToast(err?.response?.data?.message || t('profile.toasts.profileUpdateFailed'), 'error')
    } finally {
      setSavingProfile(false)
    }
  }

  const handleSavePassword = async (e) => {
    e.preventDefault()
    if (passwordForm.password !== passwordForm.password_confirmation) {
      showToast(t('profile.toasts.passwordMismatch'), 'error')
      return
    }
    setSavingPassword(true)
    try {
      await updatePassword(passwordForm)
      showToast(t('profile.toasts.passwordChanged'))
      setPasswordForm({ current_password: '', password: '', password_confirmation: '' })
    } catch (err) {
      showToast(err?.response?.data?.message || t('profile.toasts.passwordChangeFailed'), 'error')
    } finally {
      setSavingPassword(false)
    }
  }

  return (
    <div className="min-h-screen">
      {/* Header Banner */}
      <section className="relative overflow-hidden pt-12 pb-24 bg-gradient-to-br from-dark-900 via-dark-800 to-dark-900">
        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-end gap-6">
            {/* Avatar */}
            <div className="relative group">
              <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-2xl bg-gradient-to-br from-brand-violet to-brand-cyan p-[3px] shadow-lg shadow-brand-violet/25">
                <div className="w-full h-full rounded-[13px] bg-dark-800 overflow-hidden flex items-center justify-center">
                  {user?.avatar ? (
                    <img src={user.avatar} className="w-full h-full object-cover" alt={user.name || t('profile.avatarAlt')} />
                  ) : (
                    <span className="text-4xl font-bold text-white">{user?.name?.[0] || t('profile.avatarFallbackInitial')}</span>
                  )}
                </div>
              </div>
              <label className="absolute inset-0 rounded-2xl bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer flex flex-col items-center justify-center text-white text-xs">
                <span>{t('profile.avatar.change')}</span>
                <input type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
              </label>
              {avatarUploading && (
                <div className="absolute inset-0 rounded-2xl bg-black/70 flex items-center justify-center text-xs text-white">
                  {t('profile.avatar.uploading')}
                </div>
              )}
            </div>

            {/* User Title */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-1">
                <h1 className="text-2xl sm:text-3xl font-bold text-white truncate">{user?.name}</h1>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider bg-brand-violet/20 text-brand-cyan border border-brand-violet/30">
                  {getRoleLabel(user?.role, t) || t('roles.member')}
                </span>
              </div>
              {user?.username && <p className="text-brand-cyan/90 text-sm font-medium mb-1">@{user.username}</p>}
              <p className="text-gray-400 text-sm">{user?.email}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 -mt-10 relative z-20 pb-20">
        {/* Tab Buttons */}
        <div className="flex gap-1 p-1 rounded-full bg-white/80 dark:bg-dark-800/80 backdrop-blur-md border border-gray-200 dark:border-white/10 mb-8 w-fit shadow-lg">
          <button
            type="button"
            onClick={() => setActiveTab('profile')}
            className={`px-5 py-2.5 rounded-lg text-sm font-semibold transition-all ${
 activeTab === 'profile'
 ? 'bg-gradient-brand text-white shadow-md'
 : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
 }`}
          >
            {t('profile.tabs.editProfile')}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('password')}
            className={`px-5 py-2.5 rounded-lg text-sm font-semibold transition-all ${
 activeTab === 'password'
 ? 'bg-gradient-brand text-white shadow-md'
 : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
 }`}
          >
            {t('profile.tabs.passwordSecurity')}
          </button>
        </div>

        {activeTab === 'profile' && (
          <form
            onSubmit={handleSaveProfile}
            className="glass-card rounded-2xl p-6 sm:p-8 space-y-6 max-w-2xl bg-white/70 dark:bg-dark-800/70 border border-gray-200/80 dark:border-white/10 backdrop-blur-xl shadow-xl"
          >
            <div>
              <label className="block text-xs font-semibold uppercase text-gray-500 mb-2">{t('profile.fields.fullName')}</label>
              <input
                type="text"
                required
                value={profileForm.name}
                onChange={(e) => setProfileForm((p) => ({ ...p, name: e.target.value }))}
                className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-dark-900/50 border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white outline-none focus:border-brand-violet text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-gray-500 mb-2">{t('profile.fields.username')}</label>
              <input
                type="text"
                required
                value={profileForm.username}
                onChange={(e) => setProfileForm((p) => ({ ...p, username: e.target.value }))}
                className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-dark-900/50 border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white outline-none focus:border-brand-violet text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-gray-500 mb-2">{t('profile.fields.bio')}</label>
              <textarea
                rows={3}
                value={profileForm.bio}
                onChange={(e) => setProfileForm((p) => ({ ...p, bio: e.target.value }))}
                className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-dark-900/50 border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white outline-none focus:border-brand-violet text-sm"
                placeholder={t('profile.fields.bioPlaceholder')}
              />
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-gray-500 mb-2">{t('profile.fields.githubUrl')}</label>
                <input
                  type="url"
                  value={profileForm.github_url}
                  onChange={(e) => setProfileForm((p) => ({ ...p, github_url: e.target.value }))}
                  className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-dark-900/50 border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white outline-none focus:border-brand-violet text-sm"
                  placeholder={t('profile.fields.githubPlaceholder')}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase text-gray-500 mb-2">{t('profile.fields.linkedinUrl')}</label>
                <input
                  type="url"
                  value={profileForm.linkedin_url}
                  onChange={(e) => setProfileForm((p) => ({ ...p, linkedin_url: e.target.value }))}
                  className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-dark-900/50 border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white outline-none focus:border-brand-violet text-sm"
                  placeholder={t('profile.fields.linkedinPlaceholder')}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={savingProfile}
              className="px-6 py-3 rounded-lg font-semibold text-white bg-gradient-brand disabled:opacity-50 text-sm shadow-glow"
            >
              {savingProfile ? t('common.saving') : t('profile.actions.saveProfile')}
            </button>
          </form>
        )}

        {activeTab === 'password' && (
          <form
            onSubmit={handleSavePassword}
            className="glass-card rounded-2xl p-6 sm:p-8 space-y-6 max-w-2xl bg-white/70 dark:bg-dark-800/70 border border-gray-200/80 dark:border-white/10 backdrop-blur-xl shadow-xl"
          >
            <div>
              <label className="block text-xs font-semibold uppercase text-gray-500 mb-2">{t('profile.password.current')}</label>
              <input
                type="password"
                required
                value={passwordForm.current_password}
                onChange={(e) => setPasswordForm((p) => ({ ...p, current_password: e.target.value }))}
                className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-dark-900/50 border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white outline-none focus:border-brand-violet text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-gray-500 mb-2">{t('profile.password.new')}</label>
              <input
                type="password"
                required
                minLength={8}
                value={passwordForm.password}
                onChange={(e) => setPasswordForm((p) => ({ ...p, password: e.target.value }))}
                className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-dark-900/50 border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white outline-none focus:border-brand-violet text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-gray-500 mb-2">{t('profile.password.confirm')}</label>
              <input
                type="password"
                required
                value={passwordForm.password_confirmation}
                onChange={(e) => setPasswordForm((p) => ({ ...p, password_confirmation: e.target.value }))}
                className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-dark-900/50 border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white outline-none focus:border-brand-violet text-sm"
              />
            </div>

            <button
              type="submit"
              disabled={savingPassword}
              className="px-6 py-3 rounded-lg font-semibold text-white bg-gradient-brand disabled:opacity-50 text-sm shadow-glow"
            >
              {savingPassword ? t('profile.password.changing') : t('profile.password.submit')}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
