import React, { useEffect } from 'react'
import { ConfigProvider, theme as antdTheme } from 'antd'
import enUS from 'antd/locale/en_US'
import kmKH from 'antd/locale/km_KH'
import dayjs from 'dayjs'
import 'dayjs/locale/km'
import { useTranslation } from 'react-i18next'
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClient } from './lib/queryClient'
import { useThemeStore } from './stores/themeStore'
import { useAuthStore } from './stores/authStore'
import { UiProvider } from './contexts/UiContext'
import ToastNotification from './components/shared/ToastNotification'
import AppRoutes from './routes/AppRoutes'

function AppContent() {
  const isDark = useThemeStore((state) => state.isDark)
  const token = useAuthStore((state) => state.token)
  const fetchMe = useAuthStore((state) => state.fetchMe)
  const { i18n } = useTranslation()
  const isKm = i18n.language?.startsWith('km')

  useEffect(() => {
    const lang = isKm ? 'km' : 'en'
    document.documentElement.lang = lang
    dayjs.locale(lang)
  }, [isKm])

  // Hydrate fresh user profile & RBAC permissions on mount when a session token exists
  useEffect(() => {
    if (token) {
      fetchMe().catch(() => {
        // 401 interceptor handles expired sessions
      })
    }
  }, [token, fetchMe])

  return (
    <ConfigProvider
      locale={isKm ? kmKH : enUS}
      theme={{
        algorithm: isDark ? antdTheme.darkAlgorithm : antdTheme.defaultAlgorithm,
        token: {
          colorPrimary: '#7b2fff',
          borderRadius: 8,
          fontFamily: isKm
            ? "'Kantumruy Pro', 'Google Sans', sans-serif"
            : "'Google Sans', 'Kantumruy Pro', sans-serif",
        },
      }}
    >
      <UiProvider>
        <div className={`min-h-screen ${isDark ? 'dark' : ''}`}>
          <AppRoutes />
          <ToastNotification />
        </div>
      </UiProvider>
    </ConfigProvider>
  )
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppContent />
    </QueryClientProvider>
  )
}
