import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { authApi } from '@/services'
import { TURNSTILE_SITE_KEY } from '@/config/appUrls'
import TurnstileWidget from '@/components/common/TurnstileWidget'

export default function ForgotPasswordView() {
  const { t } = useTranslation('auth')
  const [email, setEmail] = useState('')
  const [turnstileToken, setTurnstileToken] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      await authApi.forgotPassword({ email, turnstile_token: turnstileToken })
      setSent(true)
    } catch (err) {
      setError(err?.response?.data?.message || t('forgotPassword.errorFailed'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <h2 className="text-2xl font-sans font-bold gradient-text mb-2 text-center">{t('forgotPassword.title')}</h2>
      <p className="text-sm text-gray-500 dark:text-gray-400 text-center mb-6">
        {t('forgotPassword.subtitle')}
      </p>

      {sent ? (
        <div className="text-center py-4">
          <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
            <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <p className="text-sm text-gray-300">{t('forgotPassword.sentMessage')}</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">{t('forgotPassword.email')}</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 bg-dark-800/80 border border-dark-600 rounded-full text-white placeholder-gray-500 focus:outline-none focus:border-brand-violet text-sm"
              placeholder={t('forgotPassword.emailPlaceholder')}
            />
          </div>

          {TURNSTILE_SITE_KEY && (
            <div className="flex justify-center">
              <TurnstileWidget siteKey={TURNSTILE_SITE_KEY} onVerify={setTurnstileToken} />
            </div>
          )}

          {error && <p className="text-sm text-red-500 text-center">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-lg font-semibold text-white bg-gradient-brand disabled:opacity-50 transition-opacity"
          >
            {loading ? t('forgotPassword.submitting') : t('forgotPassword.submit')}
          </button>
        </form>
      )}

      <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-6">
        <Link to="/auth/login" className="text-brand-violet dark:text-brand-cyan hover:underline">
          {t('forgotPassword.backToLogin')}
        </Link>
      </p>
    </div>
  )
}
