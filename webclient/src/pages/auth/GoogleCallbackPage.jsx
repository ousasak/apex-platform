import React, { useState, useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '@/contexts/AuthContext'

export default function GoogleCallbackView() {
  const { t } = useTranslation('auth')
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { fetchMe } = useAuth()
  const [statusKey, setStatusKey] = useState('oauth.googleSigningIn')

  useEffect(() => {
    const runCallback = async () => {
      const token = searchParams.get('token')
      const error = searchParams.get('error')

      if (error) {
        setStatusKey('oauth.googleFailed')
        setTimeout(() => navigate('/auth/login?error=google_failed'), 2000)
        return
      }

      if (token) {
        try {
          localStorage.setItem('auth_token', token)
          const user = await fetchMe()
          const isAdmin = ['admin', 'superadmin'].includes(user?.role?.name)
          navigate(isAdmin ? '/admin' : '/')
        } catch {
          setStatusKey('oauth.sessionFailed')
          setTimeout(() => navigate('/auth/login'), 2000)
        }
      } else {
        setStatusKey('oauth.invalidCallback')
        setTimeout(() => navigate('/auth/login'), 2000)
      }
    }

    runCallback()
  }, [searchParams, navigate, fetchMe])

  return (
    <div className="min-h-screen flex items-center justify-center bg-dark-900">
      <div className="text-center">
        <div className="w-14 h-14 mx-auto mb-4 border-[3px] border-dark-600 border-t-brand-violet rounded-full animate-spin" />
        <p className="text-gray-400">{t(statusKey)}</p>
      </div>
    </div>
  )
}
