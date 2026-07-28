'use client'

export interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  /** Optional label shown under the spinner */
  label?: string
  className?: string
}

export default function LoadingSpinner({ size = 'md', label, className = '' }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-4 h-4 border-[1.5px]',
    md: 'w-6 h-6 border-2',
    lg: 'w-7 h-7 border-2',
  }

  return (
    <div className={`flex flex-col items-center justify-center gap-3 ${className}`}>
      <div
        className={`${sizeClasses[size]} border-stone-300 border-t-stone-900 rounded-full animate-spin`}
      />
      {label && <p className="text-sm text-stone-500">{label}</p>}
    </div>
  )
}
