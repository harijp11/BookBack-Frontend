"use client";

import React, { useState } from "react";
import {
  ReusableFilterTopbar,
  FilterOptions,
} from "@/Components/common/FilterSidebar/filterHeader";
import { DataTable } from "@/Components/common/tablecomponent/tableComponent";
import { useBoughtBooksQuery } from "@/hooks/user/saleContractquries/useBoughtBooksQueries";
import { SaleContract } from "@/services/sale/saleService";
import { DollarSign, Calendar } from "lucide-react";
import { useNavigate } from "react-router-dom";

const BoughtBooks: React.FC = () => {
  const [page, setPage] = useState<number>(1);
  const [limit] = useState<number>(5);
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({
    dateRange: { startDate: null, endDate: null },
    priceRange: { min: "", max: "" },
  });

  const navigate = useNavigate();
  // const [isViewingDetails, setIsViewingDetails] = useState<boolean>(false);

  const { data, isLoading, error } = useBoughtBooksQuery(
    page,
    limit,
    filterOptions
  );

 

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
        startDate: filters.dateRange.startDate
          ? new Date(filters.dateRange.startDate).toISOString()
          : null,
        endDate: filters.dateRange.endDate
          ? new Date(filters.dateRange.endDate).toISOString()
          : null,
      },
      priceRange: {
        min:
          filters.priceRange.min && !isNaN(Number(filters.priceRange.min))
            ? filters.priceRange.min
            : "",
        max:
          filters.priceRange.max && !isNaN(Number(filters.priceRange.max))
            ? filters.priceRange.max
            : "",
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

  const columns = [
    {
      header: "Book",
      accessor: (contract: SaleContract) =>
        contract.bookId.images && contract.bookId.images.length > 0 ? (
          <img
            src={contract.bookId.images[0]}
            alt={contract.bookId.name}
            className="w-12 h-12 object-cover rounded"
            onClick={() => navigate(`/bought-book/details/${contract._id}`)}
            onError={(e) => {
              e.currentTarget.src = "/placeholder-image.jpg"; // Fallback image
            }}
          />
        ) : (
          <img
            src="/placeholder-image.jpg"
            alt="No image"
            className="w-12 h-12 object-cover rounded"
          />
        ),
    },
    {
      header: "Book Name",
      accessor: (row: SaleContract) => row.bookId.name || "Unknown",
      className: "text-left",
    },
    {
      header: "Buyer Name",
      accessor: (row: SaleContract) => row.buyerId.Name || "Unknown",
      className: "text-left",
    },
    {
      header: "Owner Name",
      accessor: (row: SaleContract) => row.ownerId.Name || "Unknown",
      className: "text-left",
    },
    {
      header: "Sale Date",
      accessor: (row: SaleContract) =>
        new Date(row.sale_date).toLocaleDateString(),
      className: "text-center",
    },
    {
      header: "Price",
      accessor: (row: SaleContract) => `$${row.price.toFixed(2)}`,
      className: "text-right",
    },
    // {
    //   header: 'Actions',
    //   accessor: () => (
    //     <button
    //       className="flex items-center gap-1 px-3 py-1 text-sm text-white bg-blue-500 rounded-md hover:bg-blue-600 transition-colors"
    //       onClick={() => setIsViewingDetails(true)}
    //     >
    //       <Eye size={16} />
    //       View Details
    //     </button>
    //   ),
    //   className: 'text-center',
    // },
  ];

  const totalItems =
    data?.totalBoughtContracts || data?.boughtBooksContract?.length || 0;
  const totalPages = data?.totalPages || Math.ceil(totalItems / limit) || 1;

  return (
    <div className="max-w-7xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6">Bought Books</h2>

      <ReusableFilterTopbar
        title="Filter Bought Books"
        onApplyFilters={handleApplyFilters}
        onClearFilters={handleClearFilters}
        initialFilters={filterOptions}
        hasActiveFilters={hasActiveFilters}
        initiallyExpanded={false}
        priceRangeIcon={<DollarSign size={16} className="text-gray-600" />}
        dateRangeIcon={<Calendar size={16} className="text-gray-600" />}
      />

      <DataTable<SaleContract>
        data={data?.boughtBooksContract || []}
        columns={columns}
        isLoading={isLoading}
        emptyMessage="No bought books found."
        emptyStateRenderer={() => (
          <div className="text-center py-8 text-muted-foreground">
            No bought books found for the selected filters (Price: $
            {filterOptions.priceRange.min || "Any"} - $
            {filterOptions.priceRange.max || "Any"}, Date: $
            {filterOptions.dateRange.startDate
              ? new Date(filterOptions.dateRange.startDate).toLocaleDateString()
              : "Any"}{" "}
            - $
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

      {error && (
        <div className="text-center py-8 text-red-500">
          Error: {error.message}
        </div>
      )}
    </div>
  );
};

export default BoughtBooks;
