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
    const baseClasses =
      'inline-flex items-center justify-center font-medium select-none transition-all duration-150 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.99]'

    const variantClasses: Record<ButtonVariant, string> = {
      primary:
        'bg-stone-900 hover:bg-stone-700 active:bg-stone-950 text-white shadow-card focus-visible:outline-stone-900',
      secondary:
        'bg-white ring-1 ring-inset ring-stone-300 hover:bg-stone-50 active:bg-stone-100 text-stone-700 focus-visible:outline-stone-900',
      danger:
        'bg-red-600 hover:bg-red-500 active:bg-red-700 text-white shadow-card focus-visible:outline-red-600',
      ghost:
        'hover:bg-stone-100 active:bg-stone-200 text-stone-600 focus-visible:outline-stone-900',
    }

    const sizeClasses: Record<ButtonSize, string> = {
      sm: 'h-8 px-3 text-xs rounded-md gap-1.5',
      md: 'h-10 px-4 text-sm rounded-lg gap-2',
      lg: 'h-12 px-5 text-[15px] rounded-lg gap-2',
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
