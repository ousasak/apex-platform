import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ArrowLeft } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function BackButton({ to, label, className, onClick }) {
  const { t } = useTranslation('common')
  const navigate = useNavigate()
  const text = label || t('actions.back')

  const classes = cn(
    'inline-flex h-9 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-3.5 text-sm font-medium text-slate-700 shadow-xs transition-colors hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900 dark:border-white/10 dark:bg-dark-800 dark:text-gray-200 dark:hover:border-white/20 dark:hover:bg-white/[0.06] dark:hover:text-white',
    className
  )

  if (to) {
    return (
      <Link to={to} onClick={onClick} className={classes}>
        <ArrowLeft className="size-4" strokeWidth={1.8} />
        <span>{text}</span>
      </Link>
    )
  }

  return (
    <button
      type="button"
      onClick={onClick || (() => navigate(-1))}
      className={classes}
    >
      <ArrowLeft className="size-4" strokeWidth={1.8} />
      <span>{text}</span>
    </button>
  )
}
