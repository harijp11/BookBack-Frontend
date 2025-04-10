// DataTable.tsx
import React from "react";
import { Loader2 } from "lucide-react";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/Components/ui/table";
import { Pagination1 } from "@/Components/common/pagination/pagination1";

interface Column<T> {
  header: string;
  accessor: keyof T | ((data: T) => React.ReactNode);
  className?: string;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  isLoading: boolean;
  emptyMessage?: string;
  emptyStateRenderer?: () => React.ReactNode; // New custom empty state renderer
  currentPage?: number;
  totalPages?: number;
  onPagePrev?: () => void;
  onPageNext?: () => void;
  onPageSelect?: (page: number) => void;
  showPagination?: boolean; // New prop to explicitly control pagination visibility
}

export function DataTable<T extends { _id?: string; id?: string }>({
  data,
  columns,
  isLoading,
  emptyMessage = "No data found.",
  emptyStateRenderer,
  currentPage,
  totalPages,
  onPagePrev,
  onPageNext,
  onPageSelect,
  showPagination,
}: DataTableProps<T>) {
  // Determine if pagination should be shown
  const shouldShowPagination = showPagination !== undefined 
    ? showPagination 
    : (totalPages && totalPages > 1 && onPagePrev && onPageNext && onPageSelect);
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (data.length === 0) {
    // Use custom renderer if provided, otherwise show default message
    return emptyStateRenderer ? emptyStateRenderer() : (
      <div className="text-center py-8 text-muted-foreground">{emptyMessage}</div>
    );
  }

  return (
    <div>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((column, index) => (
                <TableHead key={index} className={column.className}>
                  {column.header}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((row) => (
              <TableRow key={row._id || row.id} className="border-b hover:bg-muted/50">
                {columns.map((column, cellIndex) => (
                  <TableCell key={cellIndex} className={column.className}>
                    {typeof column.accessor === "function"
                      ? column.accessor(row)
                      : (row[column.accessor] as React.ReactNode)}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {shouldShowPagination && currentPage && totalPages && onPagePrev && onPageNext && onPageSelect && (
        <div className="mt-4 flex justify-center">
          <Pagination1
            currentPage={currentPage}
            totalPages={totalPages}
            onPagePrev={onPagePrev}
            onPageNext={onPageNext}
            onPageSelect={onPageSelect}
          />
        </div>
      )}
    </div>
  );
}