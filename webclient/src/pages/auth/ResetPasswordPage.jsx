import React, { useState, useEffect } from 'react'
import { useParams, useSearchParams, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { authApi } from '@/services'

export default function ResetPasswordView() {
  const { t } = useTranslation('auth')
  const { token: paramToken } = useParams()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()

  const [form, setForm] = useState({
    email: '',
    password: '',
    password_confirmation: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    const qEmail = searchParams.get('email')
    if (qEmail) {
      setForm((prev) => ({ ...prev, email: qEmail }))
    }
  }, [searchParams])

  const handleSubmit = async (e) => {
    e.preventDefault()
    const token = paramToken || searchParams.get('token')
    if (!token) {
      setError(t('resetPassword.errors.invalidToken'))
      return
    }

    if (form.password !== form.password_confirmation) {
      setError(t('resetPassword.errors.passwordMismatch'))
      return
    }

    setLoading(true)
    setError('')
    setSuccess('')
    try {
      const { data } = await authApi.resetPassword({
        ...form,
        token,
      })

      if (!data?.success) {
        throw new Error(data?.message || t('resetPassword.errors.unable'))
      }

      setSuccess(t('resetPassword.success'))
      setTimeout(() => navigate('/auth/login'), 2000)
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || t('resetPassword.errors.failed'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <h2 className="text-2xl font-sans font-bold gradient-text mb-6 text-center">{t('resetPassword.title')}</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-gray-300 mb-1">{t('resetPassword.email')}</label>
          <input
            type="email"
            required
            value={form.email}
            onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
            className="w-full px-4 py-3 bg-dark-800/80 border border-dark-600 rounded-full text-white placeholder-gray-500 focus:outline-none focus:border-brand-violet text-sm"
            placeholder={t('resetPassword.emailPlaceholder')}
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-300 mb-1">{t('resetPassword.newPassword')}</label>
          <input
            type="password"
            required
            minLength={8}
            value={form.password}
            onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
            className="w-full px-4 py-3 bg-dark-800/80 border border-dark-600 rounded-full text-white placeholder-gray-500 focus:outline-none focus:border-brand-violet text-sm"
            placeholder="••••••••"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-300 mb-1">{t('resetPassword.confirmPassword')}</label>
          <input
            type="password"
            required
            value={form.password_confirmation}
            onChange={(e) => setForm((p) => ({ ...p, password_confirmation: e.target.value }))}
            className="w-full px-4 py-3 bg-dark-800/80 border border-dark-600 rounded-full text-white placeholder-gray-500 focus:outline-none focus:border-brand-violet text-sm"
            placeholder="••••••••"
          />
        </div>

        {error && <p className="text-sm text-red-500 text-center">{error}</p>}
        {success && <p className="text-sm text-green-500 text-center">{success}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3.5 rounded-lg font-semibold text-white bg-gradient-brand disabled:opacity-50 transition-opacity mt-2"
        >
          {loading ? t('resetPassword.submitting') : t('resetPassword.submit')}
        </button>
      </form>
    </div>
  )
}
