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
    green: 'bg-green-100 text-green-800',
    red: 'bg-red-100 text-red-800',
    yellow: 'bg-yellow-100 text-yellow-800',
    gray: 'bg-gray-100 text-gray-800',
  }

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colorClasses[color]} ${className}`}
    >
      {children}
    </span>
  )
}
