import React from 'react'
import { cn } from '../../lib/utils'

export const Button = React.forwardRef(
  ({ className, variant = 'default', size = 'default', disabled, ...props }, ref) => {
    const baseStyles =
      'inline-flex items-center justify-center rounded-lg font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-violet disabled:pointer-events-none disabled:opacity-50'

    const variants = {
      default: 'bg-brand-violet hover:bg-brand-violet/90 text-white shadow-sm',
      primary: 'bg-brand-cyan hover:bg-brand-cyan/90 text-dark-900 font-semibold',
      secondary:
        'bg-gray-100 dark:bg-dark-800 text-gray-900 dark:text-gray-100 hover:bg-gray-200 dark:hover:bg-dark-700',
      outline:
        'border border-gray-300 dark:border-dark-700 bg-transparent hover:bg-gray-100 dark:hover:bg-dark-800 text-gray-900 dark:text-gray-100',
      ghost: 'hover:bg-gray-100 dark:hover:bg-dark-800 text-gray-700 dark:text-gray-300',
      danger: 'bg-red-600 hover:bg-red-700 text-white shadow-sm',
    }

    const sizes = {
      default: 'h-10 px-4 py-2 text-sm',
      sm: 'h-8 px-3 text-xs',
      lg: 'h-12 px-6 text-base',
      icon: 'h-9 w-9 p-0',
    }

    return (
      <button
        ref={ref}
        disabled={disabled}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        {...props}
      />
    )
  }
)

Button.displayName = 'Button'
export default Button
