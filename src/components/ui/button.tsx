'use client'

import { ButtonHTMLAttributes, forwardRef } from 'react'

export type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost'
export type ButtonSize = 'sm' | 'md' | 'lg'

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  loading?: boolean
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', loading = false, disabled, className = '', children, ...props }, ref) => {
    const baseClasses = 'inline-flex items-center justify-center font-medium transition-all duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-40 disabled:cursor-not-allowed'

    const variantClasses: Record<ButtonVariant, string> = {
      primary: 'bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white shadow-sm focus-visible:outline-indigo-600',
      secondary: 'bg-white ring-1 ring-inset ring-slate-300 hover:bg-slate-50 active:bg-slate-100 text-slate-700 focus-visible:outline-indigo-600',
      danger: 'bg-red-600 hover:bg-red-500 active:bg-red-700 text-white shadow-sm focus-visible:outline-red-600',
      ghost: 'hover:bg-slate-100 active:bg-slate-200 text-slate-600 focus-visible:outline-indigo-600',
    }

    const sizeClasses: Record<ButtonSize, string> = {
      sm: 'px-2.5 py-1.5 text-xs rounded-md gap-1.5',
      md: 'px-3.5 py-2 text-sm rounded-lg gap-2',
      lg: 'px-4 py-2.5 text-sm rounded-lg gap-2',
    }

    return (
      <button
        ref={ref}
        className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
        disabled={disabled || loading}
        {...props}
      >
        {loading && (
          <div className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
        )}
        {children}
      </button>
    )
  }
)

Button.displayName = 'Button'

export default Button
