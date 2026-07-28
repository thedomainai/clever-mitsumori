'use client'

import { InputHTMLAttributes, forwardRef } from 'react'

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  /** Unit shown inside the field on the right (e.g. "μm", "mm", "%") */
  suffix?: string
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, suffix, className = '', ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-xs font-medium text-stone-500 mb-1.5">
            {label}
          </label>
        )}
        <div className="relative">
          <input
            ref={ref}
            className={`
              w-full h-10 px-3 text-sm rounded-lg border bg-white
              placeholder:text-stone-400
              hover:border-stone-400
              focus:outline-none focus:ring-2 focus:ring-stone-900/10 focus:border-stone-500
              disabled:bg-stone-50 disabled:text-stone-400 disabled:cursor-not-allowed
              transition-colors duration-150
              ${suffix ? 'pr-10' : ''}
              ${error ? 'border-red-400' : 'border-stone-300'}
              ${className}
            `}
            {...props}
          />
          {suffix && (
            <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-xs text-stone-400">
              {suffix}
            </span>
          )}
        </div>
        {error && (
          <p className="mt-1.5 text-xs text-red-600">{error}</p>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'

export default Input
