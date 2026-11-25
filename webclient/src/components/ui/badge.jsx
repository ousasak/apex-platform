import React from 'react'
import { cn } from '../../lib/utils'

export function Badge({ className, variant = 'default', ...props }) {
  const variants = {
    default: 'bg-brand-violet/20 text-brand-violet dark:text-purple-300 border-brand-violet/30',
    cyan: 'bg-cyan-500/20 text-cyan-700 dark:text-cyan-300 border-cyan-500/30',
    success: 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border-emerald-500/30',
    warning: 'bg-amber-500/20 text-amber-700 dark:text-amber-300 border-amber-500/30',
    danger: 'bg-red-500/20 text-red-700 dark:text-red-300 border-red-500/30',
    outline: 'border border-gray-300 dark:border-dark-700 text-gray-700 dark:text-gray-300',
  }

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium border transition-colors',
        variants[variant],
        className
      )}
      {...props}
    />
  )
}

export default Badge
