import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useTheme } from '@/contexts/ThemeContext'
import { publicApi } from '@/services'

export default function AppFooter() {
  const { isDark } = useTheme()
  const { t } = useTranslation(['navigation', 'common'])
  const [siteSettings, setSiteSettings] = useState({})

  useEffect(() => {
    publicApi
      .getSettings()
      .then((res) => setSiteSettings(res.data?.data || {}))
      .catch(() => {})
  }, [])

  const quickLinks = [
    { to: '/', label: t('navigation:home') },
    { to: '/about', label: t('navigation:about') },
    { to: '/projects', label: t('navigation:projects') },
    { to: '/contact', label: t('navigation:contact') },
  ]

  const resourceLinks = [
    { to: '/blog', label: t('navigation:blog') },
    { to: '/services', label: t('navigation:services') },
    { to: '/privacy', label: t('navigation:privacyPolicy') },
    { to: '/terms', label: t('navigation:termsOfService') },
  ]

  const footerBg = isDark
    ? `radial-gradient(ellipse 100% 80% at 50% 120%, rgba(123,47,255,0.12) 0%, rgba(0,212,255,0.05) 35%, transparent 65%), #050508`
    : `radial-gradient(ellipse 100% 70% at 50% 110%, rgba(123,47,255,0.12) 0%, rgba(0,212,255,0.06) 40%, transparent 70%), #f8fafc`

  return (
    <footer className="relative z-10">
      <div className="relative" style={{ background: footerBg }}>
        <div className="relative max-w-7xl mx-auto px-6 lg:px-8">
          {/* Top: Brand + Nav columns */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 pt-10 pb-16">
            {/* Brand column */}
            <div className="lg:col-span-5 flex flex-col gap-6">
              <div className="flex items-center gap-3">
                <img
                  src="/favicon.svg"
                  alt={t('common:logoAlt')}
                  width="40"
                  height="40"
                  className="w-10 h-10 rounded-full object-contain"
                />
                <span className="text-xl font-display font-bold tracking-tight text-gray-900 dark:text-white">
                  {t('common:appName')}
                </span>
              </div>

              <p className="text-base leading-relaxed text-gray-500 dark:text-gray-400 max-w-sm">
                {t('navigation:footer.taglineLine1')}
                <br />
                {t('navigation:footer.taglineLine2')}
              </p>

              {/* Social row */}
              <div className="flex items-center gap-3 pt-1">
                {siteSettings.github_url && (
                  <a
                    href={siteSettings.github_url}
                    target="_blank"
                    rel="noreferrer"
                    aria-label="GitHub"
                    className="w-9 h-9 rounded-xl flex items-center justify-center bg-white dark:bg-white/[0.04] border border-black/[0.08] dark:border-white/[0.08] text-gray-500 dark:text-gray-400 hover:border-black/[0.18] hover:text-brand-violet dark:hover:border-white/20 dark:hover:text-brand-cyan transition-all duration-300 backdrop-blur-sm"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                    </svg>
                  </a>
                )}
                {siteSettings.telegram_url && (
                  <a
                    href={siteSettings.telegram_url}
                    target="_blank"
                    rel="noreferrer"
                    aria-label="Telegram"
                    className="w-9 h-9 rounded-xl flex items-center justify-center bg-white dark:bg-white/[0.04] border border-black/[0.08] dark:border-white/[0.08] text-gray-500 dark:text-gray-400 hover:border-black/[0.18] hover:text-brand-violet dark:hover:border-white/20 dark:hover:text-brand-cyan transition-all duration-300 backdrop-blur-sm"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
                    </svg>
                  </a>
                )}
              </div>
            </div>

            {/* Spacer */}
            <div className="hidden lg:block lg:col-span-1" />

            {/* Quick Links */}
            <div className="lg:col-span-3">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-brand-violet dark:text-brand-violet">
                {t('navigation:footer.quickLinks')}
              </p>
              <ul className="space-y-3 mt-5">
                {quickLinks.map((link) => (
                  <li key={link.to}>
                    <Link
                      to={link.to}
                      className="text-[15px] text-gray-600 dark:text-gray-400 hover:text-brand-violet dark:hover:text-white transition-colors duration-150"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Resources */}
            <div className="lg:col-span-3">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-brand-violet dark:text-brand-violet">
                {t('navigation:footer.resources')}
              </p>
              <ul className="space-y-3 mt-5">
                {resourceLinks.map((link) => (
                  <li key={link.to}>
                    <Link
                      to={link.to}
                      className="text-[15px] text-gray-600 dark:text-gray-400 hover:text-brand-violet dark:hover:text-white transition-colors duration-150"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="flex items-center justify-center py-6 border-t border-gray-200 dark:border-white/10">
            <p className="text-sm font-medium bg-gradient-brand bg-clip-text text-transparent opacity-75">
              {t('navigation:footer.copyright', { year: new Date().getFullYear() })}
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}
