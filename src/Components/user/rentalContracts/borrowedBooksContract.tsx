"use client";

import React, { useState } from "react";
import { ReusableFilterTopbar, FilterOptions } from "@/Components/common/FilterSidebar/filterHeader";
import { DataTable } from "@/Components/common/tablecomponent/tableComponent";
import { useBorrowedBooksQuery } from "@/hooks/user/rentalContracts/useBorrowedBooksContractqueries";
import { RentalContract } from "@/services/rental/rentalService";
import { DollarSign, Calendar, } from "lucide-react";
import { useNavigate } from "react-router-dom";

const BorrowedBooks: React.FC = () => {
  const [page, setPage] = useState<number>(1);
  const [limit] = useState<number>(5); // Matches backend default
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({
    dateRange: { startDate: null, endDate: null },
    priceRange: { min: "", max: "" },
  });
 

  const { data, isLoading, error } = useBorrowedBooksQuery(page, limit, filterOptions);
 const navigate = useNavigate()
  console.log("API response data:", data); // Debugging

  const hasActiveFilters = !!(
    filterOptions.dateRange.startDate ||
    filterOptions.dateRange.endDate ||
    (filterOptions.priceRange.min && filterOptions.priceRange.min !== "") ||
    (filterOptions.priceRange.max && filterOptions.priceRange.max !== "")
  );

  const handleApplyFilters = (filters: FilterOptions) => {
    console.log("Applied filters:", filters);
    const sanitizedFilters: FilterOptions = {
      dateRange: {
        startDate: filters.dateRange.startDate || null,
        endDate: filters.dateRange.endDate || null,
      },
      priceRange: {
        min: filters.priceRange.min && !isNaN(Number(filters.priceRange.min)) ? filters.priceRange.min : "",
        max: filters.priceRange.max && !isNaN(Number(filters.priceRange.max)) ? filters.priceRange.max : "",
      },
    };
    setFilterOptions(sanitizedFilters);
    setPage(1); 
  };

  const handleClearFilters = () => {
    setFilterOptions({
      dateRange: { startDate: null, endDate: null },
      priceRange: { min: "", max: "" },
    });
    setPage(1);
  };

  const handlePagePrev = () => {
    if (page > 1) setPage(page - 1);
  };

  const handlePageNext = () => {
    if (data && page < (data.totalPages || 1)) {
      setPage(page + 1);
    }
  };

  const handlePageSelect = (selectedPage: number) => {
    setPage(selectedPage);
  };

  // Define DataTable columns
  const columns = [
     {
              header: "Book",
              accessor: (contract: RentalContract) => (
                contract.bookId.images && contract.bookId.images.length > 0 ? (
                  <img
                    src={contract.bookId.images[0]}
                    alt={contract.bookId.name}
                    className="w-12 h-12 object-cover rounded"
                    onClick={()=>navigate(`/borrowed-book/details/${contract._id}`)}
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
      accessor: (row: RentalContract) => row.bookId.name || "Unknown",
      className: "text-left text-gray-800",
    },
    {
      header: "Borrowed From",
      accessor: (row: RentalContract) => row.ownerId.Name || "Unknown",
      className: "text-left text-gray-800",
    },
    {
      header: "Rent Amount",
      accessor: (row: RentalContract) => `$${row.rent_amount.toFixed(2)}`,
      className: "text-right text-gray-800",
    },
    {
      header: "Status",
      accessor: (row: RentalContract) => (
        <span
          className={
            row.status === "Returned"
              ? "text-green-600 font-medium"
              : row.status === "Contract Date Exceeded"
              ? "text-red-600 font-medium"
              : "text-gray-600 font-medium"
          }
        >
          {row.status}
        </span>
      ),
      className: "text-center",
    },
    {
      header: "Requested At",
      accessor: (row: RentalContract) => new Date(row.requested_at).toLocaleDateString(),
      className: "text-center text-gray-800",
    },
    {
      header: "Contract Period (Days)",
      accessor: (row: RentalContract) => row.period_of_contract,
      className: "text-center text-gray-800",
    },
    // {
    //   header: "Actions",
    //   accessor: () => (
    //     <button
    //       className="flex items-center gap-1 px-3 py-1 text-sm text-white bg-gradient-to-r from-blue-500 to-blue-600 rounded-md hover:from-blue-600 hover:to-blue-700 transition-all"
    //       onClick={() => setIsViewingDetails(true)}
    //     >
    //       <Eye size={16} />
    //       View Details
    //     </button>
    //   ),
    //   className: "text-center",
    // },
  ];

  // Use totalBorrowedContracts and totalPages from API response
  const totalItems = data?.totalBorrowedContracts || data?.borrowedBooksContract?.length || 0;
  const totalPages = data?.totalPages || Math.ceil(totalItems / limit) || 1;

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto p-6">
        <h2 className="text-3xl font-bold mb-6 text-gray-800 bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
          Borrowed Books
        </h2>

        {/* Filter Topbar */}
        <ReusableFilterTopbar
          title="Filter Borrowed Books"
          onApplyFilters={handleApplyFilters}
          onClearFilters={handleClearFilters}
          initialFilters={filterOptions}
          hasActiveFilters={hasActiveFilters}
          initiallyExpanded={false}
          priceRangeIcon={<DollarSign size={16} className="text-gray-600" />}
          dateRangeIcon={<Calendar size={16} className="text-gray-600" />}
        />

        {/* Data Table */}
        <div className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
          <DataTable<RentalContract>
            data={data?.borrowedBooksContract || []}
            columns={columns}
            isLoading={isLoading}
            emptyMessage="No borrowed books found."
            emptyStateRenderer={() => (
              <div className="text-center py-8 text-gray-500">
                No borrowed books found for the selected filters (Rent Amount: $
                {filterOptions.priceRange.min || "Any"} - ${filterOptions.priceRange.max || "Any"}, Date:{" "}
                {filterOptions.dateRange.startDate
                  ? new Date(filterOptions.dateRange.startDate).toLocaleDateString()
                  : "Any"}{" "}
                -{" "}
                {filterOptions.dateRange.endDate
                  ? new Date(filterOptions.dateRange.endDate).toLocaleDateString()
                  : "Any"}
                ). Try adjusting or clearing the filters.
              </div>
            )}
            currentPage={page}
            totalPages={totalPages}
            onPagePrev={handlePagePrev}
            onPageNext={handlePageNext}
            onPageSelect={handlePageSelect}
            showPagination={totalPages > 1}
          />
        </div>

        {/* Error State */}
        {error && (
          <div className="text-center py-8 text-red-500 bg-white rounded-lg shadow-lg border border-red-200 mt-4">
            Error: {error.message}
          </div>
        )}
      </div>
    </div>
  );
};

export default BorrowedBooks;