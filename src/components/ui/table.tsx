'use client'

import { ReactNode, Fragment, ThHTMLAttributes, TdHTMLAttributes } from 'react'

export interface TableProps {
  headers: ReactNode[]
  children: ReactNode
  className?: string
  /** Max height of the scroll area (headers stay pinned). */
  maxHeight?: string
}

export function Table({ headers, children, className = '', maxHeight }: TableProps) {
  return (
    <div
      className={`overflow-auto scrollbar-thin ${className}`}
      style={maxHeight ? { maxHeight } : undefined}
    >
      <table className="w-full">
        <thead>
          <tr>
            {headers.map((header, index) => (
              <Fragment key={index}>{header}</Fragment>
            ))}
          </tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  )
}

export interface TableHeaderProps extends ThHTMLAttributes<HTMLTableCellElement> {
  children: ReactNode
  sortable?: boolean
  sorted?: 'asc' | 'desc' | null
  onSort?: () => void
  align?: 'left' | 'right'
  /** Pin this column to the left edge while scrolling horizontally */
  stickyLeft?: boolean
  /** Always render the label in the strongest text tone */
  emphasis?: boolean
}

function SortIcon({ sorted }: { sorted: 'asc' | 'desc' | null | undefined }) {
  if (!sorted) {
    return (
      <svg className="w-3 h-3 text-stone-300 group-hover/th:text-stone-400 transition-colors flex-shrink-0" viewBox="0 0 12 12" fill="currentColor">
        <path d="M6 1.5 8.5 4.5h-5L6 1.5Z" />
        <path d="M6 10.5 3.5 7.5h5L6 10.5Z" />
      </svg>
    )
  }
  return (
    <svg className={`w-3 h-3 text-stone-900 flex-shrink-0 ${sorted === 'desc' ? 'rotate-180' : ''}`} viewBox="0 0 12 12" fill="currentColor">
      <path d="M6 2 9.5 6h-7L6 2Z" />
    </svg>
  )
}

export function TableHeader({
  children,
  sortable,
  sorted,
  onSort,
  align = 'left',
  stickyLeft = false,
  emphasis = false,
  className = '',
  ...props
}: TableHeaderProps) {
  return (
    <th
      className={`
        group/th sticky top-0 bg-stone-50 px-4 py-2.5 whitespace-nowrap
        text-[11px] font-semibold tracking-wide
        ${sorted || emphasis ? 'text-stone-900' : 'text-stone-500'}
        ${align === 'right' ? 'text-right' : 'text-left'}
        ${sortable ? 'cursor-pointer select-none hover:text-stone-900 transition-colors' : ''}
        ${stickyLeft
          ? 'left-0 z-30 shadow-[inset_0_-1px_0_#e7e5e4,inset_-1px_0_0_#e7e5e4]'
          : 'z-20 shadow-[inset_0_-1px_0_#e7e5e4]'}
        ${className}
      `}
      onClick={sortable ? onSort : undefined}
      {...props}
    >
      <div className={`flex items-center gap-1 ${align === 'right' ? 'justify-end' : ''}`}>
        <span>{children}</span>
        {sortable && <SortIcon sorted={sorted} />}
      </div>
    </th>
  )
}

export interface TableRowProps {
  children: ReactNode
  className?: string
}

export function TableRow({ children, className = '' }: TableRowProps) {
  return (
    <tr className={`group/row border-b border-stone-100 last:border-b-0 hover:bg-stone-50/70 transition-colors ${className}`}>
      {children}
    </tr>
  )
}

export interface TableCellProps extends TdHTMLAttributes<HTMLTableCellElement> {
  children: ReactNode
  /** Pin this cell to the left edge while scrolling horizontally */
  stickyLeft?: boolean
}

export function TableCell({ children, stickyLeft = false, className = '', ...props }: TableCellProps) {
  return (
    <td
      className={`
        px-4 py-2.5 text-sm text-stone-600 whitespace-nowrap
        ${stickyLeft ? 'sticky left-0 z-10 bg-white group-hover/row:bg-stone-50 transition-colors shadow-[inset_-1px_0_0_#e7e5e4]' : ''}
        ${className}
      `}
      {...props}
    >
      {children}
    </td>
  )
}

export default Table
