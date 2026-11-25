import React from 'react'
import { useTranslation } from 'react-i18next'
import { Loader2, Trash2 } from 'lucide-react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

export default function DeleteConfirmDialog({
  open,
  onOpenChange,
  onCancel,
  onConfirm,
  title,
  description,
  confirmLabel,
  cancelLabel,
  loading = false,
  loadingLabel,
  error = '',
  icon: Icon = Trash2,
  children,
}) {
  const { t } = useTranslation('common')

  const handleClose = () => {
    if (loading) return
    onCancel?.()
    onOpenChange?.(false)
  }

  return (
    <AlertDialog
      open={Boolean(open)}
      onOpenChange={(next) => {
        if (!next) handleClose()
      }}
    >
      <AlertDialogContent
        onEscapeKeyDown={(e) => {
          if (loading) e.preventDefault()
        }}
        onPointerDownOutside={(e) => {
          if (loading) e.preventDefault()
        }}
      >
        <div className="flex items-start gap-4">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-lg border border-red-200/80 bg-red-50 text-red-600 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-400">
            <Icon className="size-5" strokeWidth={1.8} />
          </div>
          <AlertDialogHeader className="min-w-0 flex-1">
            <AlertDialogTitle>{title || t('actions.delete')}</AlertDialogTitle>
            {description && (
              <AlertDialogDescription asChild={typeof description !== 'string'}>
                {typeof description === 'string' ? (
                  description
                ) : (
                  <div className="text-sm leading-relaxed text-slate-500 dark:text-gray-400 [&_strong]:font-semibold [&_strong]:text-slate-800 dark:[&_strong]:text-white">
                    {description}
                  </div>
                )}
              </AlertDialogDescription>
            )}
          </AlertDialogHeader>
        </div>

        {children && <div>{children}</div>}

        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-600 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-400">
            {error}
          </div>
        )}

        <AlertDialogFooter className="border-t border-slate-100 pt-4 dark:border-white/[0.06]">
          <AlertDialogCancel onClick={handleClose} disabled={loading}>
            {cancelLabel || t('actions.cancel')}
          </AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm} disabled={loading}>
            {loading && <Loader2 className="size-4 animate-spin" />}
            <span>{loading ? (loadingLabel || confirmLabel || t('actions.delete')) : (confirmLabel || t('actions.delete'))}</span>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
