import React from "react"
import { cn } from "@/lib/utils"

interface TableProps {
  children: React.ReactNode
  className?: string
}

export const Table: React.FC<TableProps> = ({ children, className }) => {
  return (
    <div className="w-full overflow-x-auto">
      <table className={cn("w-full bg-white border border-gray-200", className)}>
        {children}
      </table>
    </div>
  )
}

interface TableHeaderProps {
  children: React.ReactNode
  className?: string
}

export const TableHeader: React.FC<TableHeaderProps> = ({ children, className }) => {
  return (
    <thead className={cn("bg-white border-b border-gray-200", className)}>
      {children}
    </thead>
  )
}

interface TableBodyProps {
  children: React.ReactNode
  className?: string
}

export const TableBody: React.FC<TableBodyProps> = ({ children, className }) => {
  return (
    <tbody className={cn("divide-y divide-gray-200", className)}>
      {children}
    </tbody>
  )
}

interface TableRowProps {
  children: React.ReactNode
  className?: string
}

export const TableRow: React.FC<TableRowProps> = ({ children, className }) => {
  return (
    <tr className={cn("hover:bg-gray-50 transition-colors", className)}>
      {children}
    </tr>
  )
}

interface TableHeadProps {
  children: React.ReactNode
  className?: string
}

export const TableHead: React.FC<TableHeadProps> = ({ children, className }) => {
  return (
    <th
      scope="col"
      className={cn(
        "py-3 px-4 text-left font-medium text-black text-sm uppercase tracking-wider",
        className
      )}
    >
      {children}
    </th>
  )
}

interface TableCellProps {
  children: React.ReactNode
  className?: string
}

export const TableCell: React.FC<TableCellProps> = ({ children, className }) => {
  return (
    <td className={cn("py-3 px-4 text-sm text-black", className)}>
      {children}
    </td>
  )
}