import React from 'react'
import { useTranslation } from 'react-i18next'
import { Inbox } from 'lucide-react'
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty'

export default function EmptyState({
  title,
  message,
  icon: Icon = Inbox,
  action = null,
  loading = false,
  className = '',
}) {
  const { t } = useTranslation('common')
  const effectiveTitle = title ?? t('messages.noData')
  const effectiveMessage = message ?? t('messages.noItemsToDisplay')

  if (loading) {
    return (
      <div className={`glass-card text-center py-12 px-6 rounded-2xl ${className}`}>
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-brand-violet/30 border-t-brand-violet rounded-full animate-spin" />
          <p className="text-gray-500 dark:text-gray-400">{t('actions.loading')}</p>
        </div>
      </div>
    )
  }

  return (
    <Empty className={`glass-card rounded-2xl ${className}`}>
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <Icon className="size-5" strokeWidth={1.75} />
        </EmptyMedia>
        <EmptyTitle>{effectiveTitle}</EmptyTitle>
        {effectiveMessage && <EmptyDescription>{effectiveMessage}</EmptyDescription>}
      </EmptyHeader>
      {action && <EmptyContent>{action}</EmptyContent>}
    </Empty>
  )
}
