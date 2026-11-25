import React from 'react'
import { Inbox } from 'lucide-react'
import { cn } from '@/lib/utils'

function Empty({ className, ...props }) {
  return (
    <div
      data-slot="empty"
      className={cn(
        'flex min-w-0 flex-1 flex-col items-center justify-center gap-4 rounded-xl border border-dashed border-slate-200/90 dark:border-white/10 p-6 text-center text-balance md:p-12',
        className
      )}
      {...props}
    />
  )
}

function EmptyHeader({ className, ...props }) {
  return (
    <div
      data-slot="empty-header"
      className={cn('flex max-w-sm flex-col items-center gap-2 text-center', className)}
      {...props}
    />
  )
}

function EmptyMedia({ className, variant = 'default', ...props }) {
  return (
    <div
      data-slot="empty-icon"
      data-variant={variant}
      className={cn(
        'mb-1 flex shrink-0 items-center justify-center [&_svg]:pointer-events-none [&_svg]:shrink-0',
        variant === 'icon'
          ? 'size-11 rounded-xl border border-slate-200/90 bg-slate-100/90 text-slate-500 shadow-xs dark:border-white/10 dark:bg-white/[0.06] dark:text-gray-400 [&_svg:not([class*="size-"])]:size-5'
          : 'bg-transparent text-slate-400 dark:text-gray-500',
        className
      )}
      {...props}
    />
  )
}

function EmptyTitle({ className, ...props }) {
  return (
    <div
      data-slot="empty-title"
      className={cn('text-base font-semibold tracking-tight text-slate-900 dark:text-white', className)}
      {...props}
    />
  )
}

function EmptyDescription({ className, ...props }) {
  return (
    <p
      data-slot="empty-description"
      className={cn(
        'text-sm leading-relaxed text-slate-500 dark:text-gray-400 [&>a]:underline [&>a]:underline-offset-4 [&>a:hover]:text-brand-violet dark:[&>a:hover]:text-brand-cyan',
        className
      )}
      {...props}
    />
  )
}

function EmptyContent({ className, ...props }) {
  return (
    <div
      data-slot="empty-content"
      className={cn('flex w-full max-w-sm min-w-0 flex-col items-center gap-3 text-sm text-balance', className)}
      {...props}
    />
  )
}

function TableEmpty({
  colSpan = 1,
  icon: Icon = Inbox,
  title,
  description,
  action,
  className,
}) {
  return (
    <tr>
      <td colSpan={colSpan} className="p-4 sm:p-6">
        <Empty className={cn('border-dashed bg-slate-50/50 dark:bg-white/[0.015] py-10 md:py-12', className)}>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <Icon className="size-5" strokeWidth={1.75} />
            </EmptyMedia>
            {title && <EmptyTitle>{title}</EmptyTitle>}
            {description && <EmptyDescription>{description}</EmptyDescription>}
          </EmptyHeader>
          {action && <EmptyContent>{action}</EmptyContent>}
        </Empty>
      </td>
    </tr>
  )
}

export {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
  EmptyContent,
  TableEmpty,
}
