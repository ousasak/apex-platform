import React from 'react'
import * as DialogPrimitive from '@radix-ui/react-dialog'
import { cn } from '@/lib/utils'

const AlertDialog = DialogPrimitive.Root
const AlertDialogTrigger = DialogPrimitive.Trigger
const AlertDialogPortal = DialogPrimitive.Portal

const AlertDialogOverlay = React.forwardRef(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn(
      'fixed inset-0 z-50 bg-black/50 backdrop-blur-[2px] transition-opacity duration-200',
      className
    )}
    {...props}
  />
))
AlertDialogOverlay.displayName = 'AlertDialogOverlay'

const AlertDialogContent = React.forwardRef(({ className, children, ...props }, ref) => (
  <AlertDialogPortal>
    <AlertDialogOverlay />
    <DialogPrimitive.Content
      ref={ref}
      role="alertdialog"
      className={cn(
        'fixed left-1/2 top-1/2 z-50 grid w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 gap-5 rounded-xl border border-slate-200/90 bg-white p-6 shadow-2xl shadow-black/15 outline-none transition-all duration-200 dark:border-white/10 dark:bg-dark-800 dark:shadow-black/50',
        className
      )}
      {...props}
    >
      {children}
    </DialogPrimitive.Content>
  </AlertDialogPortal>
))
AlertDialogContent.displayName = 'AlertDialogContent'

function AlertDialogHeader({ className, ...props }) {
  return (
    <div
      className={cn('flex flex-col gap-2 text-left', className)}
      {...props}
    />
  )
}

function AlertDialogFooter({ className, ...props }) {
  return (
    <div
      className={cn('flex flex-col-reverse gap-2 sm:flex-row sm:justify-end', className)}
      {...props}
    />
  )
}

const AlertDialogTitle = React.forwardRef(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    className={cn('text-base font-semibold leading-snug tracking-tight text-slate-900 dark:text-white', className)}
    {...props}
  />
))
AlertDialogTitle.displayName = 'AlertDialogTitle'

const AlertDialogDescription = React.forwardRef(({ className, ...props }, ref) => (
  <DialogPrimitive.Description
    ref={ref}
    className={cn('text-sm leading-relaxed text-slate-500 dark:text-gray-400', className)}
    {...props}
  />
))
AlertDialogDescription.displayName = 'AlertDialogDescription'

const AlertDialogCancel = React.forwardRef(({ className, ...props }, ref) => (
  <button
    ref={ref}
    type="button"
    className={cn(
      'inline-flex h-9 items-center justify-center rounded-lg border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 shadow-xs transition-colors hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-300 disabled:pointer-events-none disabled:opacity-50 dark:border-white/10 dark:bg-white/[0.04] dark:text-gray-200 dark:hover:bg-white/[0.08] dark:focus:ring-white/20',
      className
    )}
    {...props}
  />
))
AlertDialogCancel.displayName = 'AlertDialogCancel'

const AlertDialogAction = React.forwardRef(({ className, ...props }, ref) => (
  <button
    ref={ref}
    type="button"
    className={cn(
      'inline-flex h-9 items-center justify-center gap-2 rounded-lg bg-red-600 px-4 text-sm font-medium text-white shadow-xs transition-colors hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500/40 disabled:pointer-events-none disabled:opacity-50',
      className
    )}
    {...props}
  />
))
AlertDialogAction.displayName = 'AlertDialogAction'

export {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogPortal,
  AlertDialogOverlay,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogCancel,
  AlertDialogAction,
}
