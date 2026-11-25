import React, { useState } from 'react'
import { Link, useNavigate, useLocation, useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '@/contexts/AuthContext'
import { resolveBackendOrigin } from '@/config/appUrls'

export default function LoginView() {
  const { t } = useTranslation('auth')
  const { login, loading } = useAuth()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const location = useLocation()

  const [form, setForm] = useState({ email: '', password: '', remember: false })
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')

  const handleLogin = async (e) => {
    e.preventDefault()
    setError('')
    try {
      const data = await login(form)
      const user = data?.data?.user
      const roleName = user?.role?.name || ''
      const isAdmin = ['admin', 'superadmin'].includes(roleName)
      const redirect = searchParams.get('redirect') || location.state?.from?.pathname || (isAdmin ? '/admin' : '/')
      navigate(redirect, { replace: true })
    } catch (err) {
      if (!err.response) {
        setError(t('login.errors.network'))
      } else if (err.response.status === 502) {
        setError(t('login.errors.serverStarting'))
      } else {
        setError(err.response?.data?.message || t('login.errors.invalidCredentials'))
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
        <h2 className="text-3xl font-sans font-bold text-white mb-2">{t('login.title')}</h2>
        <p className="text-gray-400">{t('login.subtitle')}</p>
      </div>

      <form onSubmit={handleLogin} className="space-y-5">
        {/* Email */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">{t('login.email')}</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-500">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1.5"
                  d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75"
                />
              </svg>
            </div>
            <input
              type="email"
              required
              value={form.email}
              onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
              className="w-full pl-12 pr-4 py-3.5 bg-dark-800/80 border border-dark-600 rounded-full text-white placeholder-gray-500 focus:outline-none focus:border-brand-violet focus:ring-1 focus:ring-brand-violet/50 transition-all"
              placeholder={t('login.emailPlaceholder')}
            />
          </div>
        </div>

        {/* Password */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">{t('login.password')}</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-500">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1.5"
                  d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"
                />
              </svg>
            </div>
            <input
              type={showPassword ? 'text' : 'password'}
              required
              value={form.password}
              onChange={(e) => setForm((prev) => ({ ...prev, password: e.target.value }))}
              className="w-full pl-12 pr-12 py-3.5 bg-dark-800/80 border border-dark-600 rounded-full text-white placeholder-gray-500 focus:outline-none focus:border-brand-violet focus:ring-1 focus:ring-brand-violet/50 transition-all"
              placeholder="••••••••"
            />
            <button
              type="button"
              onClick={() => setShowPassword((p) => !p)}
              className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-500 hover:text-gray-300 transition-colors"
            >
              {showPassword ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="1.5"
                    d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88"
                  />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="1.5"
                    d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"
                  />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Remember me + Forgot password */}
        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2.5 cursor-pointer group">
            <input
              type="checkbox"
              checked={form.remember}
              onChange={(e) => setForm((prev) => ({ ...prev, remember: e.target.checked }))}
              className="rounded bg-dark-800 border-dark-500 text-brand-violet focus:ring-brand-violet"
            />
            <span className="text-sm text-gray-400 group-hover:text-gray-300 transition-colors">{t('login.rememberMe')}</span>
          </label>
          <Link to="/auth/forgot-password" className="text-sm text-brand-cyan hover:text-brand-violet transition-colors">
            {t('login.forgotPassword')}
          </Link>
        </div>

        {/* Error */}
        {error && (
          <div className="flex items-center gap-3 px-4 py-3 rounded-full bg-red-500/10 border border-red-500/20">
            <svg className="w-5 h-5 text-red-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
            </svg>
            <p className="text-sm text-red-400">{error}</p>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="relative w-full py-3.5 rounded-lg font-semibold text-white overflow-hidden group disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-brand-violet to-brand-cyan group-hover:opacity-90 transition-opacity" />
          <span className="relative flex items-center justify-center gap-2">
            {loading && (
              <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
            )}
            {loading ? t('login.submitting') : t('login.submit')}
          </span>
        </button>
      </form>

      {/* Divider */}
      <div className="relative my-8">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-dark-600" />
        </div>
        <div className="relative flex justify-center">
          <span className="px-4 text-xs text-gray-500 bg-dark-900 uppercase tracking-wider">{t('login.orContinueWith')}</span>
        </div>
      </div>

      {/* Social Logins */}
      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={loginWithGithub}
          className="flex items-center justify-center gap-2.5 px-4 py-3 rounded-lg bg-dark-800/60 border border-dark-600 text-gray-300 hover:bg-dark-700 hover:border-dark-500 transition-all group"
        >
          <svg className="w-5 h-5 group-hover:text-white transition-colors" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
          </svg>
          <span className="text-sm font-medium">GitHub</span>
        </button>
        <button
          type="button"
          onClick={loginWithGoogle}
          className="flex items-center justify-center gap-2.5 px-4 py-3 rounded-lg bg-dark-800/60 border border-dark-600 text-gray-300 hover:bg-dark-700 hover:border-dark-500 transition-all group"
        >
          <svg className="w-5 h-5 group-hover:text-white transition-colors" viewBox="0 0 24 24" fill="currentColor">
            <path
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
              fill="#4285F4"
            />
            <path
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              fill="#34A853"
            />
            <path
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              fill="#FBBC05"
            />
            <path
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              fill="#EA4335"
            />
          </svg>
          <span className="text-sm font-medium">Google</span>
        </button>
      </div>

      {/* Register link */}
      <p className="text-center text-sm text-gray-500 mt-8">
        {t('login.noAccount')}{' '}
        <Link to="/auth/register" className="text-brand-cyan hover:text-brand-violet font-semibold transition-colors">
          {t('login.registerLink')}
        </Link>
      </p>
    </div>
  )
}
