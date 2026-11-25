import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '@/contexts/AuthContext'
import { resolveBackendOrigin } from '@/config/appUrls'

export default function RegisterView() {
  const { t } = useTranslation(['auth', 'common'])
  const { register, loading } = useAuth()
  const navigate = useNavigate()

  const [form, setForm] = useState({
    name: '',
    username: '',
    email: '',
    password: '',
    password_confirmation: '',
    terms: false,
  })
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')

  const handleRegister = async (e) => {
    e.preventDefault()
    setError('')
    if (form.password !== form.password_confirmation) {
      setError(t('auth:register.errors.passwordMismatch'))
      return
    }
    if (!form.terms) {
      setError(t('auth:register.errors.termsRequired'))
      return
    }

    try {
      await register(form)
      navigate('/member/profile')
    } catch (err) {
      if (err.response?.data?.errors) {
        const firstError = Object.values(err.response.data.errors)[0]
        setError(Array.isArray(firstError) ? firstError[0] : firstError)
      } else {
        setError(err.response?.data?.message || t('auth:register.errors.failed'))
      }
    }
  }

  const loginWithGoogle = () => {
    window.location.href = `${resolveBackendOrigin()}/auth/google/redirect`
  }

  const loginWithGithub = () => {
    window.location.href = `${resolveBackendOrigin()}/auth/github/redirect`
  }

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-3xl font-sans font-bold text-white mb-2">{t('auth:register.title')}</h2>
        <p className="text-gray-400">{t('auth:register.subtitle')}</p>
      </div>

      <form onSubmit={handleRegister} className="space-y-4">
        {/* Full Name */}
        <div>
          <label className="block text-xs font-medium text-gray-300 mb-1.5">{t('auth:register.name')}</label>
          <input
            type="text"
            required
            value={form.name}
            onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
            className="w-full px-4 py-3 bg-dark-800/80 border border-dark-600 rounded-full text-white placeholder-gray-500 focus:outline-none focus:border-brand-violet text-sm"
            placeholder={t('auth:register.namePlaceholder')}
          />
        </div>

        {/* Username */}
        <div>
          <label className="block text-xs font-medium text-gray-300 mb-1.5">{t('auth:register.username')}</label>
          <div className="relative">
            <span className="absolute left-4 top-3 text-gray-500 text-sm">@</span>
            <input
              type="text"
              required
              minLength={3}
              maxLength={30}
              value={form.username}
              onChange={(e) => setForm((p) => ({ ...p, username: e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '') }))}
              className="w-full pl-9 pr-4 py-3 bg-dark-800/80 border border-dark-600 rounded-full text-white placeholder-gray-500 focus:outline-none focus:border-brand-violet text-sm"
              placeholder={t('auth:register.usernamePlaceholder')}
            />
          </div>
        </div>

        {/* Email */}
        <div>
          <label className="block text-xs font-medium text-gray-300 mb-1.5">{t('auth:register.email')}</label>
          <input
            type="email"
            required
            value={form.email}
            onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
            className="w-full px-4 py-3 bg-dark-800/80 border border-dark-600 rounded-full text-white placeholder-gray-500 focus:outline-none focus:border-brand-violet text-sm"
            placeholder={t('auth:register.emailPlaceholder')}
          />
        </div>

        {/* Password */}
        <div>
          <label className="block text-xs font-medium text-gray-300 mb-1.5">{t('auth:register.password')}</label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              required
              minLength={8}
              value={form.password}
              onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
              className="w-full px-4 pr-12 py-3 bg-dark-800/80 border border-dark-600 rounded-full text-white placeholder-gray-500 focus:outline-none focus:border-brand-violet text-sm"
              placeholder={t('auth:register.passwordPlaceholder')}
            />
            <button
              type="button"
              onClick={() => setShowPassword((p) => !p)}
              className="absolute right-4 top-3 text-gray-500 hover:text-gray-300 text-xs"
            >
              {showPassword ? t('common:actions.hide') : t('common:actions.show')}
            </button>
          </div>
        </div>

        {/* Confirm Password */}
        <div>
          <label className="block text-xs font-medium text-gray-300 mb-1.5">{t('auth:register.confirmPassword')}</label>
          <input
            type="password"
            required
            value={form.password_confirmation}
            onChange={(e) => setForm((p) => ({ ...p, password_confirmation: e.target.value }))}
            className="w-full px-4 py-3 bg-dark-800/80 border border-dark-600 rounded-full text-white placeholder-gray-500 focus:outline-none focus:border-brand-violet text-sm"
            placeholder={t('auth:register.confirmPasswordPlaceholder')}
          />
        </div>

        {/* Terms */}
        <div className="flex items-center gap-2 pt-1">
          <input
            type="checkbox"
            id="terms"
            checked={form.terms}
            onChange={(e) => setForm((p) => ({ ...p, terms: e.target.checked }))}
            className="rounded bg-dark-800 border-dark-500 text-brand-violet focus:ring-brand-violet"
          />
          <label htmlFor="terms" className="text-xs text-gray-400">
            {t('auth:register.agreePrefix')}{' '}
            <Link to="/terms" className="text-brand-cyan hover:underline">
              {t('auth:register.termsLink')}
            </Link>{' '}
            {t('auth:register.and')}{' '}
            <Link to="/privacy" className="text-brand-cyan hover:underline">
              {t('auth:register.privacyLink')}
            </Link>
          </label>
        </div>

        {/* Error */}
        {error && (
          <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
            {error}
          </div>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="relative w-full py-3.5 rounded-lg font-semibold text-white overflow-hidden group disabled:opacity-50 transition-all mt-2"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-brand-violet to-brand-cyan group-hover:opacity-90" />
          <span className="relative flex items-center justify-center gap-2">
            {loading ? t('auth:register.submitting') : t('auth:register.submit')}
          </span>
        </button>
      </form>

      {/* Social Logins */}
      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-dark-600" />
        </div>
        <div className="relative flex justify-center">
          <span className="px-4 text-xs text-gray-500 bg-dark-900 uppercase">{t('auth:register.orJoinWith')}</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={loginWithGithub}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-dark-800/60 border border-dark-600 text-gray-300 text-xs font-medium hover:bg-dark-700 transition-colors"
        >
          GitHub
        </button>
        <button
          type="button"
          onClick={loginWithGoogle}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-dark-800/60 border border-dark-600 text-gray-300 text-xs font-medium hover:bg-dark-700 transition-colors"
        >
          Google
        </button>
      </div>

      <p className="text-center text-sm text-gray-500 mt-6">
        {t('auth:register.hasAccount')}{' '}
        <Link to="/auth/login" className="text-brand-cyan hover:text-brand-violet font-semibold">
          {t('auth:register.loginLink')}
        </Link>
      </p>
    </div>
  )
}
