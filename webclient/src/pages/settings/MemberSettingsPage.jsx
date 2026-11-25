import React from 'react'
import { useTranslation } from 'react-i18next'
import { useTheme } from '@/contexts/ThemeContext'

export default function SettingsView() {
  const { t, i18n } = useTranslation('users')
  const { isDark, toggle } = useTheme()

  return (
    <div className="py-20">
      <div className="max-w-2xl mx-auto px-4">
        <h1 className="section-heading mb-8">{t('memberSettings.title')}</h1>

        <div className="glass-card rounded-2xl p-6 bg-white/70 dark:bg-dark-800/70 border border-gray-200 dark:border-white/10 shadow-xl backdrop-blur-xl">
          <h3 className="text-lg font-sans font-bold text-gray-900 dark:text-white mb-6">
            {t('memberSettings.appearance.title')}
          </h3>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900 dark:text-white">
                {t('memberSettings.appearance.darkMode')}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {t('memberSettings.appearance.darkModeDescription')}
              </p>
            </div>
            <button
              type="button"
              onClick={toggle}
              aria-label={t('memberSettings.appearance.darkMode')}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                isDark ? 'bg-brand-violet' : 'bg-gray-300'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 rounded-full bg-white transition-transform ${
                  isDark ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
