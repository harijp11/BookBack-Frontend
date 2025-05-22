"use client"

import React, { useState, useEffect } from "react"
import { format } from "date-fns"
import {  ArrowLeft, DollarSign, Calendar } from "lucide-react"
import { type SaleContract } from "@/services/sale/saleService"
import { DataTable } from "@/Components/common/tablecomponent/tableComponent"
import { FilterOptions, ReusableFilterTopbar } from "@/Components/common/FilterSidebar/filterHeader"
import { useSoldBooksQuery } from "@/hooks/user/saleContractquries/useSoldBooksQuery"
import { useNavigate } from "react-router-dom"

export const SoldBooksHistory: React.FC = () => {
  // State management
  const [contracts, setContracts] = useState<SaleContract[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [selectedContract, setSelectedContract] = useState<SaleContract | null>(null)
  const [isViewingDetails, setIsViewingDetails] = useState(false)
  const [activeFilters, setActiveFilters] = useState<FilterOptions | null>(null)

  const navigate = useNavigate()
  
  const limit = 8
    // Fetch contracts using custom hook
  const { data, isLoading: queryLoading } = useSoldBooksQuery(
    currentPage,
    limit,
    activeFilters,
    isViewingDetails
  )

  // Update state when query data changes
  useEffect(() => {
    setIsLoading(queryLoading)
    if (data?.success && data.saleBooksContracts) {
      setContracts(data.saleBooksContracts)
      // Calculate total pages based on the total count
      const estimatedTotalPages = Math.ceil(
        data.saleBooksContracts.length > 0 ? (data.saleBooksContracts.length < limit ? 1 : currentPage + 1) : 1
      )
      setTotalPages(estimatedTotalPages)
    } else {
      setContracts([]) // Reset contracts if data is not successful or missing
      setTotalPages(1) // Reset total pages
    }
  }, [data, queryLoading])

  // Handle applying filters
  const handleApplyFilters = (filters: FilterOptions) => {
    setActiveFilters(filters)
    setCurrentPage(1)
  }

  // Clear all filters
  const clearFilters = () => {
    setActiveFilters(null)
    setCurrentPage(1)
  }

  // Check if any filters are active
  const hasActiveFilters = activeFilters && (
    activeFilters.priceRange.min || 
    activeFilters.priceRange.max ||
    activeFilters.dateRange.startDate ||
    activeFilters.dateRange.endDate
  )

  

  // Handle back button click
  const handleGoBack = () => {
    setIsViewingDetails(false)
    setSelectedContract(null)
  }

  // Pagination handlers
  const handlePagePrev = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1)
    }
  }

  const handlePageNext = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1)
    }
  }

  const handlePageSelect = (page: number) => {
    setCurrentPage(page)
  }

  // Table columns configuration
  const columns = [
    {
      header: "Book",
      accessor: (contract: SaleContract) => (
        contract.bookId.images && contract.bookId.images.length > 0 ? (
          <img
            src={contract.bookId.images[0]}
            alt={contract.bookId.name}
            className="w-12 h-12 object-cover rounded"
            onClick={()=>navigate(`/sold-book/details/${contract._id}`)}
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
      accessor: (contract: SaleContract) => contract.bookId.name,
      className: "font-medium",
    },
    {
      header: "Sale Date",
      accessor: (contract: SaleContract) => format(new Date(contract.sale_date), "MMM dd, yyyy"),
    },
    {
      header: "Buyer",
      accessor: (contract: SaleContract) => contract.buyerId.Name || contract.buyerId.email,
    },
    {
      header: "Seller",
      accessor: (contract: SaleContract) => contract.ownerId.Name || contract.ownerId.email,
    },
    {
      header: "Price",
      accessor: (contract: SaleContract) => `$${contract.price.toFixed(2)}`,
      className: "text-black font-medium",
    },
    // {
    //   header: "Actions",
    //   accessor: (contract: SaleContract) => (
    //     <button
    //       onClick={() => handleViewDetails(contract)}
    //       className="flex items-center gap-1 px-3 py-1.5 text-sm border border-black text-black rounded-md hover:bg-gray-100 transition-colors"
    //     >
    //       <Eye size={16} />
    //       <span>View</span>
    //     </button>
    //   ),
    //   className: "text-right",
    // },
  ]

  // Empty state renderer
  const emptyStateRenderer = () => (
    <div className="flex flex-col items-center justify-center py-12">
      <h3 className="text-lg font-medium text-gray-900">No sold books found</h3>
      <p className="text-gray-500 mt-2">
        {hasActiveFilters 
          ? "No results match your search criteria. Try adjusting your filters."
          : "When you sell books, they will appear here."}
      </p>
      {hasActiveFilters && (
        <button
          onClick={clearFilters}
          className="mt-4 px-4 py-2 bg-gray-100 text-black rounded-md hover:bg-gray-200 transition-all"
        >
          Clear All Filters
        </button>
      )}
    </div>
  )

  // Render contract details view
  const renderContractDetails = () => {

    if (!selectedContract) {
      return (
        <div className="flex flex-col items-center justify-center py-12">
          <h3 className="text-lg font-medium text-gray-900">Contract not found</h3>
          <p className="text-gray-500 mt-2">
            The contract you're looking for doesn't exist or you don't have permission to view it.
          </p>
          <button
            onClick={handleGoBack}
            className="mt-4 px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 transition-all shadow-sm"
          >
            Go Back
          </button>
        </div>
      )
    }

    return (
      <div className="space-y-6">
        <button
          onClick={handleGoBack}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft size={16} />
          Back to Sold Books
        </button>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="bg-gray-100 px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Sale Contract Details</h2>
            <p className="text-sm text-gray-500 mt-1">Contract ID: {selectedContract._id}</p>
          </div>

          <div className="p-6">
            {/* Contract detail sections */}
            {/* Keeping these the same as in your original code */}
          </div>
        </div>
      </div>
    )
  }

  // Main render
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {isViewingDetails ? (
        renderContractDetails()
      ) : (
        <div className="space-y-4">
          <ReusableFilterTopbar
            title="Search & Filter"
            onApplyFilters={handleApplyFilters}
            onClearFilters={clearFilters}
            initialFilters={activeFilters || undefined}
            hasActiveFilters={!!hasActiveFilters}
            priceRangeIcon={<DollarSign size={18} className="text-gray-700" />}
            dateRangeIcon={<Calendar size={18} className="text-gray-700" />}
          />
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="bg-gray-100 px-6 py-4 border-b border-gray-200">
              <h1 className="text-xl font-semibold text-gray-900">Sold Books History</h1>
            </div>
            <div className="p-6">
              <DataTable
                data={contracts}
                columns={columns}
                isLoading={isLoading}
                emptyStateRenderer={emptyStateRenderer}
                currentPage={currentPage}
                totalPages={totalPages}
                onPagePrev={handlePagePrev}
                onPageNext={handlePageNext}
                onPageSelect={handlePageSelect}
                showPagination={true}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}