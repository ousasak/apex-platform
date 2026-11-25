import React from 'react'
import { Link, Outlet } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import StarfieldBg from '@/components/common/StarfieldBg'
import LanguageSwitcher from '@/components/shared/LanguageSwitcher'

export default function AuthLayout() {
  const { t } = useTranslation(['auth', 'common'])

  return (
    <div className="min-h-screen flex bg-dark-900 relative overflow-hidden">
      {/* Left Panel — Branding (hidden on mobile) */}
      <div className="hidden lg:flex lg:w-[45%] xl:w-[50%] relative flex-col justify-between p-10 xl:p-16 overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-dark-900 via-dark-800 to-brand-violet/20" />
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand-violet/10 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/4" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-brand-cyan/10 rounded-full blur-[100px] translate-y-1/3 -translate-x-1/4" />

        {/* Floating code snippets */}
        <div className="absolute top-[15%] right-[10%] font-mono text-xs text-brand-violet/30 animate-float pointer-events-none">
          <div className="space-y-1">
            <div>&lt;App&gt;</div>
            <div className="pl-4">&lt;Hero title="Welcome" /&gt;</div>
            <div>&lt;/App&gt;</div>
          </div>
        </div>
        <div
          className="absolute bottom-[20%] left-[8%] font-mono text-xs text-brand-cyan/25 pointer-events-none"
          style={{ animation: 'float 8s ease-in-out infinite reverse' }}
        >
          <div className="space-y-1">
            <div>const team = {'{'}</div>
            <div className="pl-4">name: 'APEX',</div>
            <div className="pl-4">passion: '∞',</div>
            <div className="pl-4">code: true</div>
            <div>{'}'};</div>
          </div>
        </div>

        {/* Top — Logo */}
        <div className="relative z-10">
          <Link to="/" className="inline-flex items-center gap-3 group">
            <img
              src="/favicon.svg"
              alt={t('common:logoAlt')}
              width="48"
              height="48"
              className="w-12 h-12 rounded-full object-contain shadow-lg shadow-brand-violet/25 group-hover:shadow-brand-violet/40 transition-shadow"
            />
            <div>
              <h1 className="text-xl font-sans font-bold text-white">{t('common:appName')}</h1>
              <p className="text-xs text-gray-400 tracking-wider uppercase">{t('common:appSubtitle')}</p>
            </div>
          </Link>
        </div>

        {/* Center — Headline */}
        <div className="relative z-10 space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-violet/10 border border-brand-violet/20">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            <span className="text-xs font-sans text-brand-cyan tracking-wider">{t('auth:layout.badge')}</span>
          </div>
          <h2 className="text-4xl xl:text-5xl font-sans font-bold text-white leading-tight">
            {t('auth:layout.headlinePart1')} <br />
            <span className="gradient-text">{t('auth:layout.headlineHighlight')}</span>
            <br />
            {t('auth:layout.headlinePart2')}
          </h2>
          <p className="text-gray-400 text-lg leading-relaxed max-w-md">
            {t('auth:layout.description')}
          </p>

          {/* Stats */}
          <div className="flex items-center gap-8 pt-4">
            <div>
              <div className="text-2xl font-bold text-white">10+</div>
              <div className="text-xs text-gray-500 uppercase tracking-wider">{t('auth:layout.stats.projects')}</div>
            </div>
            <div className="w-px h-10 bg-dark-600" />
            <div>
              <div className="text-2xl font-bold text-white">4</div>
              <div className="text-xs text-gray-500 uppercase tracking-wider">{t('auth:layout.stats.members')}</div>
            </div>
            <div className="w-px h-10 bg-dark-600" />
            <div>
              <div className="text-2xl font-bold text-white">🇰🇭</div>
              <div className="text-xs text-gray-500 uppercase tracking-wider">{t('auth:layout.stats.cambodia')}</div>
            </div>
          </div>
        </div>

        {/* Bottom — Quote */}
        <div className="relative z-10">
          <blockquote className="border-l border-white/20 pl-4">
            <p className="text-gray-400 text-sm italic leading-relaxed">
              {t('auth:layout.quotePrimary')}
            </p>
            <footer className="mt-2 text-xs text-gray-500">
              {t('auth:layout.quoteSecondary')}
            </footer>
          </blockquote>
        </div>
      </div>

      {/* Right Panel — Form */}
      <div className="w-full lg:w-[55%] xl:w-[50%] flex items-center justify-center relative">
        <div className="absolute inset-0 bg-dark-900">
          <StarfieldBg />
        </div>

        {/* Top bar (Mobile logo + Language switcher) */}
        <div className="absolute top-0 left-0 right-0 p-6 z-20 flex items-center justify-between">
          <Link to="/" className="lg:hidden inline-flex items-center gap-3 group">
            <img
              src="/favicon.svg"
              alt={t('common:logoAlt')}
              width="40"
              height="40"
              className="w-10 h-10 rounded-full shadow-lg shadow-brand-violet/25"
            />
            <div>
              <h1 className="text-lg font-sans font-bold text-white">{t('common:appName')}</h1>
              <p className="text-[10px] text-gray-400 tracking-wider uppercase">{t('common:appSubtitle')}</p>
            </div>
          </Link>
          <div className="ml-auto">
            <LanguageSwitcher />
          </div>
        </div>

        {/* Form Container */}
        <div className="relative z-10 w-full max-w-md px-6 sm:px-8 py-20 lg:py-8">
          <Outlet />
        </div>
      </div>
    </div>
  )
}
