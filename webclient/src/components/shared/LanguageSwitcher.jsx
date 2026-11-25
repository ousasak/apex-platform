import React from 'react'
import { useTranslation } from 'react-i18next'

function FlagUK({ className = 'w-5 h-3.5' }) {
  return (
    <svg className={`${className} rounded-[2px] shadow-xs shrink-0`} viewBox="0 0 60 36" fill="none">
      <clipPath id="uk-flag-clip">
        <rect width="60" height="36" rx="2" />
      </clipPath>
      <g clipPath="url(#uk-flag-clip)">
        <rect width="60" height="36" fill="#012169" />
        <path d="M0 0L60 36M60 0L0 36" stroke="#FFFFFF" strokeWidth="7" />
        <path d="M0 0L60 36M60 0L0 36" stroke="#C8102E" strokeWidth="4" />
        <path d="M30 0V36M0 18H60" stroke="#FFFFFF" strokeWidth="11" />
        <path d="M30 0V36M0 18H60" stroke="#C8102E" strokeWidth="7" />
      </g>
    </svg>
  )
}

function FlagCambodia({ className = 'w-5 h-3.5' }) {
  return (
    <svg className={`${className} rounded-[2px] shadow-xs shrink-0`} viewBox="0 0 60 36" fill="none">
      <clipPath id="kh-flag-clip">
        <rect width="60" height="36" rx="2" />
      </clipPath>
      <g clipPath="url(#kh-flag-clip)">
        <rect width="60" height="9" fill="#032EA6" />
        <rect y="9" width="60" height="18" fill="#ED1B24" />
        <rect y="27" width="60" height="9" fill="#032EA6" />
        {/* Angkor Wat white emblem */}
        <g fill="#FFFFFF">
          <rect x="18" y="22.5" width="24" height="2" rx="0.5" />
          <rect x="21" y="20.5" width="18" height="2" rx="0.5" />
          <path d="M22 20.5 L24 14.5 L26 20.5 Z" />
          <rect x="23" y="16.5" width="2" height="4" />
          <path d="M28.5 20.5 L30 12 L31.5 20.5 Z" />
          <rect x="29" y="15" width="2" height="5.5" />
          <path d="M34 20.5 L36 14.5 L38 20.5 Z" />
          <rect x="35" y="16.5" width="2" height="4" />
        </g>
      </g>
    </svg>
  )
}

export default function LanguageSwitcher({ className = '' }) {
  const { t, i18n } = useTranslation('common')
  const currentLang = i18n.language?.startsWith('km') ? 'km' : 'en'
  const isEn = currentLang === 'en'

  const toggleLanguage = () => {
    const nextLang = isEn ? 'km' : 'en'
    i18n.changeLanguage(nextLang)
    try {
      localStorage.setItem('i18nextLng', nextLang)
    } catch {
      /* ignore */
    }
  }

  return (
    <button
      type="button"
      onClick={toggleLanguage}
      className={`group inline-flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-white dark:bg-dark-800 border border-slate-200 dark:border-white/10 hover:border-brand-violet/40 dark:hover:border-brand-cyan/40 shadow-xs hover:shadow-sm active:scale-95 transition-all duration-200 cursor-pointer select-none ${className}`}
      title={isEn ? t('language.switchToKhmer') : t('language.switchToEnglish')}
      aria-label={t('language.toggleLanguage')}
    >
      <div className="flex items-center justify-center shrink-0 transition-transform duration-200 group-hover:scale-105">
        {isEn ? <FlagUK className="w-5 h-3.5" /> : <FlagCambodia className="w-5 h-3.5" />}
      </div>
      <div className="flex flex-col text-left leading-none">
        <span className="text-[11px] font-bold text-slate-800 dark:text-white uppercase tracking-wider group-hover:text-brand-violet dark:group-hover:text-brand-cyan transition-colors">
          {isEn ? 'EN' : 'KH'}
        </span>
        <span className="text-[9px] font-medium text-slate-400 dark:text-gray-400 mt-0.5">
          {isEn ? 'English' : 'ភាសាខ្មែរ'}
        </span>
      </div>
    </button>
  )
}
