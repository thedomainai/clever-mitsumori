'use client'

import { ReactNode, Fragment, ThHTMLAttributes, TdHTMLAttributes } from 'react'

export interface TableProps {
  headers: ReactNode[]
  children: ReactNode
  className?: string
}

export function Table({ headers, children, className = '' }: TableProps) {
  return (
    <div className={`overflow-x-auto ${className}`}>
      <table className="w-full">
        <thead>
          <tr className="border-b border-slate-200">
            {headers.map((header, index) => (
              <Fragment key={index}>{header}</Fragment>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">{children}</tbody>
      </table>
    </div>
  )
}

export interface TableHeaderProps extends ThHTMLAttributes<HTMLTableCellElement> {
  children: ReactNode
  sortable?: boolean
  sorted?: 'asc' | 'desc' | null
  onSort?: () => void
}

export function TableHeader({ children, sortable, sorted, onSort, className = '', ...props }: TableHeaderProps) {
  return (
    <th
      className={`px-4 py-3 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider ${
        sortable ? 'cursor-pointer select-none hover:text-slate-700' : ''
      } ${className}`}
      onClick={sortable ? onSort : undefined}
      {...props}
    >
      <div className="flex items-center gap-1">
        <span>{children}</span>
        {sortable && (
          <span className={`text-[10px] ${sorted ? 'text-indigo-600' : 'text-slate-300'}`}>
            {sorted === 'asc' ? '↑' : sorted === 'desc' ? '↓' : '↕'}
          </span>
        )}
      </div>
    </th>
  )
}

export interface TableRowProps {
  children: ReactNode
  className?: string
}

export function TableRow({ children, className = '' }: TableRowProps) {
  return <tr className={`hover:bg-slate-50/50 transition-colors ${className}`}>{children}</tr>
}

export interface TableCellProps extends TdHTMLAttributes<HTMLTableCellElement> {
  children: ReactNode
}

export function TableCell({ children, className = '', ...props }: TableCellProps) {
  return (
    <td className={`px-4 py-3 text-sm text-slate-700 whitespace-nowrap ${className}`} {...props}>
      {children}
    </td>
  )
}

export default Table
