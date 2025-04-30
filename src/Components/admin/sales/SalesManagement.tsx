"use client"

import React, { useState } from "react"
import { DollarSign, Calendar } from "lucide-react"
import { DataTable } from "@/Components/common/tablecomponent/tableComponent"
import { ReusableFilterTopbar, FilterOptions } from "@/Components/common/FilterSidebar/filterHeader"
import { CombinedSaleContracts, SaleContract } from "@/services/sale/saleService"
import { useSaleContractsQuery } from "@/hooks/admin/salesHooks/useSoldBooksContractquery"

// Define a local column interface to replace the removed Column type
interface ColumnDef<T> {
  header: string
  accessor: keyof T | ((data: T) => React.ReactNode)
}

const SalesManagement: React.FC = () => {
  const [currentPage, setCurrentPage] = useState(1)
  const [activeFilters, setActiveFilters] = useState<FilterOptions | null>(null)
  const limit = 5

  const filter: any = {}
  if (activeFilters) {
    // Price range filter
    const isValidDate = (dateStr: string) => {
        return /^\d{4}-\d{2}-\d{2}$/.test(dateStr) && !isNaN(Date.parse(dateStr));
      };
    if (activeFilters.priceRange.min && activeFilters.priceRange.max) {
      filter.price = { 
        $gte: parseFloat(activeFilters.priceRange.min), 
        $lte: parseFloat(activeFilters.priceRange.max) 
      }
    } else if (activeFilters.priceRange.min) {
      filter.price = { $gte: parseFloat(activeFilters.priceRange.min) }
    } else if (activeFilters.priceRange.max) {
      filter.price = { $lte: parseFloat(activeFilters.priceRange.max) }
    }
    
    // Date range filter
    if (activeFilters.dateRange.startDate && activeFilters.dateRange.endDate) {
      filter.sale_date = {
        $gte: new Date(activeFilters.dateRange.startDate).toISOString(),
        $lte: new Date(activeFilters.dateRange.endDate).toISOString()
      }
    } else if (activeFilters?.dateRange?.startDate && isValidDate(activeFilters.dateRange.startDate)) {
        filter.sale_date = {
          ...filter.sale_date,
          $gte: new Date(activeFilters.dateRange.startDate).toISOString(),
        };
      }
      
      if (activeFilters?.dateRange?.endDate && isValidDate(activeFilters.dateRange.endDate)) {
        const end = new Date(activeFilters.dateRange.endDate);
        end.setHours(23, 59, 59, 999);
        filter.sale_date = {
          ...filter.sale_date,
          $lte: end.toISOString(),
        };
      }
  }

  const { data, isLoading, error } = useSaleContractsQuery({
    page: currentPage,
    limit,
    ...(Object.keys(filter).length > 0 && { filter })
  })

  const saleContracts = (data && 'success' in data && data.success) 
    ? (data as CombinedSaleContracts).saleBooksContracts 
    : []
  const totalPages = (data && 'success' in data && data.success) 
    ? (data as CombinedSaleContracts).totalPages 
    : 1

  if (error) {
    console.error("Failed to fetch sale contracts:", error)
  }

  const columns: ColumnDef<SaleContract>[] = [
    {
        header: "Book",
        accessor: (row) => (
          row.bookId.images && row.bookId.images.length > 0 ? (
            <img
              src={row.bookId.images[0]}
              alt={row.bookId.name}
              className="w-12 h-12 object-cover rounded"
              onError={(e) => {
                e.currentTarget.src = "/placeholder-image.jpg" // Fallback image
              }}
            />
          ) : (
            <img
              src="/placeholder-image.jpg"
              alt="No image"
              className="w-12 h-12 object-cover rounded"
            />
          )
        )
      },
    {
      header: "Book Name",
      accessor: (row) => row.bookId.name
    },
    {
      header: "Buyer",
      accessor: (row) => row.buyerId.Name || row.buyerId.email
    },
    {
      header: "Seller",
      accessor: (row) => row.ownerId.Name || row.ownerId.email
    },
    {
      header: "Price",
      accessor: (row) => `$${row.price.toFixed(2)}`
    },
    {
      header: "Sale Date",
      accessor: (row) => new Date(row.sale_date).toLocaleDateString()
    }
  ]

  const handleApplyFilters = (filters: FilterOptions) => {
    setActiveFilters(filters)
    setCurrentPage(1)
  }

  const handleClearFilters = () => {
    setActiveFilters(null)
    setCurrentPage(1)
  }

  const hasActiveFilters = !!activeFilters && (
    !!activeFilters.dateRange.startDate ||
    !!activeFilters.dateRange.endDate ||
    !!activeFilters.priceRange.min ||
    !!activeFilters.priceRange.max
  )

  return (
    <div className="min-h-screen bg-white text-black p-6">
      <h1 className="text-2xl font-bold mb-6">Sales Management</h1>
      
      <ReusableFilterTopbar
        title="Filter Sales"
        onApplyFilters={handleApplyFilters}
        onClearFilters={handleClearFilters}
        hasActiveFilters={hasActiveFilters}
        initiallyExpanded={false}
        priceRangeIcon={<DollarSign size={16} />}
        dateRangeIcon={<Calendar size={16} />}
      />

      <DataTable
        data={saleContracts}
        columns={columns}
        isLoading={isLoading}
        emptyMessage="No sale contracts found."
        currentPage={currentPage}
        totalPages={totalPages}
        onPagePrev={() => setCurrentPage(prev => Math.max(1, prev - 1))}
        onPageNext={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
        onPageSelect={(page) => setCurrentPage(page)}
        showPagination={true}
      />
    </div>
  )
}

export default SalesManagement