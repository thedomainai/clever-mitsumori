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
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            {headers.map((header, index) => (
              <Fragment key={index}>{header}</Fragment>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">{children}</tbody>
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
      className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${
        sortable ? 'cursor-pointer hover:bg-gray-100' : ''
      } ${className}`}
      onClick={sortable ? onSort : undefined}
      {...props}
    >
      <div className="flex items-center space-x-1">
        <span>{children}</span>
        {sortable && (
          <span className="text-gray-400">
            {sorted === 'asc' ? '↑' : sorted === 'desc' ? '↓' : '⇅'}
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
  return <tr className={className}>{children}</tr>
}

export interface TableCellProps extends TdHTMLAttributes<HTMLTableCellElement> {
  children: ReactNode
}

export function TableCell({ children, className = '', ...props }: TableCellProps) {
  return (
    <td className={`px-6 py-4 whitespace-nowrap text-sm text-gray-900 ${className}`} {...props}>
      {children}
    </td>
  )
}

export default Table
