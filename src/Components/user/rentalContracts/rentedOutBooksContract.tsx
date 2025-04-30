"use client";

import React, { useState } from "react";
import { ReusableFilterTopbar, FilterOptions } from "@/Components/common/FilterSidebar/filterHeader";
import { DataTable } from "@/Components/common/tablecomponent/tableComponent";
import { useRentedOutBooksQuery } from "@/hooks/user/rentalContracts/useRentedOutBooksQueries";
import { RentalContract } from "@/services/rental/rentalService";
import { DollarSign, Calendar, Eye } from "lucide-react";

const RentedOutBooks: React.FC = () => {
  const [page, setPage] = useState<number>(1);
  const [limit] = useState<number>(5); // Matches backend default
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({
    dateRange: { startDate: null, endDate: null },
    priceRange: { min: "", max: "" },
  });
  const [isViewingDetails, setIsViewingDetails] = useState<boolean>(false);

  const { data, isLoading, error } = useRentedOutBooksQuery(page, limit, filterOptions, isViewingDetails);

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
    setPage(1); // Reset to first page when filters change
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
      className: "text-left",
    },
    {
      header: "Borrowed By",
      accessor: (row: RentalContract) => row.borrowerId.Name || "Unknown",
      className: "text-left",
    },
    {
      header: "Owner Name",
      accessor: (row: RentalContract) => row.ownerId.Name || "Unknown",
      className: "text-left",
    },
    {
      header: "Rent Amount",
      accessor: (row: RentalContract) => `$${row.rent_amount.toFixed(2)}`,
      className: "text-right",
    },
    {
      header: "Status",
      accessor: (row: RentalContract) => row.status,
      className: "text-center",
    },
    {
      header: "Requested At",
      accessor: (row: RentalContract) => new Date(row.requested_at).toLocaleDateString(),
      className: "text-center",
    },
    {
      header: "Contract Period (Days)",
      accessor: (row: RentalContract) => row.period_of_contract,
      className: "text-center",
    },
    // {
    //   header: "Actions",
    //   accessor: () => (
    //     <button
    //       className="flex items-center gap-1 px-3 py-1 text-sm text-white bg-blue-500 rounded-md hover:bg-blue-600 transition-colors"
    //       onClick={() => setIsViewingDetails(true)}
    //     >
    //       <Eye size={16} />
    //       View Details
    //     </button>
    //   ),
    //   className: "text-center",
    // },
  ];

  // Use totalRentedContracts and totalPages from API response
  const totalItems = data?.totalRentedContracts || data?.rentedBooksContracts?.length || 0;
  const totalPages = data?.totalPages || Math.ceil(totalItems / limit) || 1;

  return (
    <div className="max-w-7xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6">Rented Out Books</h2>

      {/* Filter Topbar */}
      <ReusableFilterTopbar
        title="Filter Rented Out Books"
        onApplyFilters={handleApplyFilters}
        onClearFilters={handleClearFilters}
        initialFilters={filterOptions}
        hasActiveFilters={hasActiveFilters}
        initiallyExpanded={false}
        priceRangeIcon={<DollarSign size={16} className="text-gray-600" />}
        dateRangeIcon={<Calendar size={16} className="text-gray-600" />}
      />

      {/* Data Table */}
      <DataTable<RentalContract>
        data={data?.rentedBooksContracts || []}
        columns={columns}
        isLoading={isLoading}
        emptyMessage="No rented out books found."
        emptyStateRenderer={() => (
          <div className="text-center py-8 text-muted-foreground">
            No rented out books found for the selected filters (Rent Amount: $
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

      {/* Error State */}
      {error && (
        <div className="text-center py-8 text-red-500">
          Error: {error.message}
        </div>
      )}
    </div>
  );
};

export default RentedOutBooks;