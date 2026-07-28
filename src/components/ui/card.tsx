'use client'

import { ReactNode } from 'react'

export interface CardProps {
  title?: string
  /** Optional element rendered on the right side of the title bar */
  action?: ReactNode
  children: ReactNode
  className?: string
  /** Remove inner padding (e.g. when the card wraps a table) */
  flush?: boolean
}

export default function Card({ title, action, children, className = '', flush = false }: CardProps) {
  return (
    <div className={`bg-white rounded-lg border border-stone-200/80 shadow-card overflow-hidden ${className}`}>
      {title && (
        <div className="px-5 py-3.5 border-b border-stone-100 flex items-center justify-between gap-3">
          <h2 className="text-sm font-semibold text-stone-900">{title}</h2>
          {action}
        </div>
      )}
      <div className={flush ? '' : 'p-5'}>{children}</div>
    </div>
  )
}
