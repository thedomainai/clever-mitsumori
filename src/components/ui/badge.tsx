'use client'

import { ReactNode } from 'react'

export type BadgeColor = 'green' | 'red' | 'yellow' | 'gray'

export interface BadgeProps {
  color: BadgeColor
  children: ReactNode
  className?: string
}

export default function Badge({ color, children, className = '' }: BadgeProps) {
  const colorClasses: Record<BadgeColor, string> = {
    green: 'bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-600/20',
    red: 'bg-red-50 text-red-700 ring-1 ring-inset ring-red-600/10',
    yellow: 'bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-600/20',
    gray: 'bg-slate-50 text-slate-600 ring-1 ring-inset ring-slate-500/10',
  }

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium ${colorClasses[color]} ${className}`}
    >
      {children}
    </span>
  )
}
