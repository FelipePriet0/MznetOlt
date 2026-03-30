'use client'

import { cn } from '@/lib/utils'
import { TableRowSkeleton } from './skeleton'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

export interface Column<T> {
  key:       string
  header:    string
  cell:      (row: T) => React.ReactNode
  className?: string
}

interface DataTableProps<T> {
  columns:    Column<T>[]
  data:       T[]
  loading?:   boolean
  skeletonRows?: number
  emptyText?: string
  page?:      number
  pageSize?:  number
  total?:     number
  onPageChange?: (page: number) => void
  onRowClick?: (row: T) => void
  headerRowClassName?: string
  headerCellClassName?: string
  containerClassName?: string
  bodyClassName?: string
  rowClassName?: string
}

export function DataTable<T>({
  columns,
  data,
  loading       = false,
  skeletonRows  = 8,
  emptyText     = 'No data found.',
  page          = 1,
  pageSize      = 50,
  total,
  onPageChange,
  onRowClick,
  headerRowClassName = '',
  headerCellClassName = '',
  containerClassName = '',
  bodyClassName = '',
  rowClassName = '',
}: DataTableProps<T>) {
  const totalPages = total ? Math.ceil(total / pageSize) : undefined

  return (
    <div className="flex flex-col gap-0">
      {/* Table */}
      <div className={cn('relative w-full overflow-auto', containerClassName)}>
        <table className="w-full text-sm">
          <thead>
            <tr className={cn('bg-[hsl(var(--primary))]', headerRowClassName)}>
              {columns.map(col => (
                <th
                  key={col.key}
                  className={cn(
                    'px-4 py-2.5 text-left text-xs font-medium !text-white',
                    headerCellClassName,
                    col.className
                  )}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="table-row h-2" aria-hidden="true"></tbody>
          <tbody className={cn('[&_td:first-child]:rounded-l-lg [&_td:last-child]:rounded-r-lg', bodyClassName)}>
            {loading ? (
              Array.from({ length: skeletonRows }).map((_, i) => (
                <TableRowSkeleton key={i} cols={columns.length} />
              ))
            ) : data.length === 0 ? (
              <tr className="odd:bg-muted/50 odd:hover:bg-muted/50 border-none hover:bg-transparent">
                <td
                  colSpan={columns.length}
                  className="px-4 py-12 text-center text-muted-foreground"
                >
                  {emptyText}
                </td>
              </tr>
            ) : (
              data.map((row, i) => (
                <tr
                  key={i}
                  className={cn(
                    'odd:bg-[hsl(var(--secondary))]/20 odd:hover:bg-[hsl(var(--secondary))]/20 border-none hover:bg-transparent transition-colors',
                    onRowClick && 'cursor-pointer',
                    rowClassName
                  )}
                  onClick={() => onRowClick?.(row)}
                >
                  {columns.map(col => (
                    <td key={col.key} className={cn('px-4 py-2.5', col.className)}>
                      {col.cell(row)}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
          <tbody className="table-row h-2" aria-hidden="true"></tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages && totalPages > 1 && onPageChange && (
        <div className="flex items-center justify-between px-2 pt-4">
          <p className="text-xs text-muted-foreground">
            Showing {((page - 1) * pageSize) + 1}–{Math.min(page * pageSize, total!)} of {total}
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon-sm"
              onClick={() => onPageChange(page - 1)}
              disabled={page <= 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-xs font-medium">
              {page} / {totalPages}
            </span>
            <Button
              variant="outline"
              size="icon-sm"
              onClick={() => onPageChange(page + 1)}
              disabled={page >= totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
