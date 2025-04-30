"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader } from "@/Components/ui/card";
import { DataTable } from "@/Components/common/tablecomponent/tableComponent";
import { RentalContract, CombinedRentalContracts } from "@/services/rental/rentalService";
import { useRentalContractsQuery } from "@/hooks/admin/rentalHooks/useRentalContractsQuery";
import { format } from "date-fns";
import { ReusableFilterTopbar, FilterOptions } from "@/Components/common/FilterSidebar/filterHeader";
import { DollarSign, Calendar } from "lucide-react";

const RentalManagement: React.FC = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [activeFilters, setActiveFilters] = useState<FilterOptions | null>(null);
  const ITEMS_PER_PAGE = 5;

  // Build filter object for price range and date range
  const isValidDate = (date: string) => !isNaN(new Date(date).getTime());
  const buildFilterObject = (filters: FilterOptions | null): object => {
    const filter: Record<string, object> = {};

    // Price range filter (rent_amount)
    if (filters?.priceRange.min && filters?.priceRange.max) {
      filter.rent_amount = {
        $gte: parseFloat(filters.priceRange.min),
        $lte: parseFloat(filters.priceRange.max),
      };
    } else if (filters?.priceRange.min) {
      filter.rent_amount = { $gte: parseFloat(filters.priceRange.min) };
    } else if (filters?.priceRange.max) {
      filter.rent_amount = { $lte: parseFloat(filters.priceRange.max) };
    }

    // Date range filter (rent_start_date)
    if (filters?.dateRange.startDate && filters?.dateRange.endDate) {
      filter.rent_start_date = {
        $gte: new Date(filters.dateRange.startDate).toISOString(),
        $lte: new Date(filters.dateRange.endDate).toISOString(),
      };
    

    } else if (filters?.dateRange.startDate && isValidDate(filters.dateRange.startDate)) {
        filter.rent_start_date = {
          ...filter.rent_start_date,
          $gte: new Date(filters.dateRange.startDate).toISOString(),
        };
      }
      
      if (filters?.dateRange.endDate && isValidDate(filters.dateRange.endDate)) {
        // Set time to end of the day to include the full date
        const endDate = new Date(filters.dateRange.endDate);
        endDate.setHours(23, 59, 59, 999);
        filter.rent_start_date = {
          ...filter.rent_start_date,
          $lte: endDate.toISOString(),
        };
      }

    return filter;
  };

  // Fetch rental contracts using useQuery
  const { data: rentalData, isLoading, } = useRentalContractsQuery({
    filter: buildFilterObject(activeFilters),
    page: currentPage,
    limit: ITEMS_PER_PAGE,
  });

  // Handle apply filters from ReusableFilterTopbar
  const handleApplyFilters = (filters: FilterOptions) => {
    setActiveFilters(filters);
    setCurrentPage(1); // Reset to first page when filters change
  };

  // Handle clear filters from ReusableFilterTopbar
  const handleClearFilters = () => {
    setActiveFilters(null);
    setCurrentPage(1); // Reset to first page
  };

  // Check if there are active filters
  const hasActiveFilters =
    !!activeFilters?.priceRange.min ||
    !!activeFilters?.priceRange.max ||
    !!activeFilters?.dateRange.startDate ||
    !!activeFilters?.dateRange.endDate;

  // Define columns for the DataTable
  const columns = [
    {
      header: "Book Image",
      accessor: (rental: RentalContract) => (
        <img
          src={rental.bookId.images[0] || "/placeholder-book.jpg"}
          alt={rental.bookId.name}
          className="w-12 h-16 object-cover rounded"
          onError={(e) => (e.currentTarget.src = "/placeholder-book.jpg")}
        />
      ),
      className: "text-center",
    },
    {
      header: "Book Name",
      accessor: (rental: RentalContract) => rental.bookId.name,
    },
    {
      header: "Borrower Name",
      accessor: (rental: RentalContract) => rental.borrowerId.Name || rental.borrowerId.email,
    },
    {
      header: "Owner Name",
      accessor: (rental: RentalContract) => rental.ownerId.Name || rental.ownerId.email,
    },
    {
      header: "Rented At",
      accessor: (rental: RentalContract) =>
        format(new Date(rental.rent_start_date), "MMM dd, yyyy"),
    },
    {
      header: "Rent Amount",
      accessor: (rental: RentalContract) => `$${rental.rent_amount.toFixed(2)}`,
    },
    {
      header: "Rental Period",
      accessor: (rental: RentalContract) => `${rental.period_of_contract} days`,
    },
  ];

  // Safely access rental contracts, default to empty array if data is not yet available
  const rentalContracts = (rentalData as CombinedRentalContracts)?.rentedBooksContracts || [];

  // Safely access pagination data
  const totalPages = (rentalData as CombinedRentalContracts)?.totalPages || 1;
  const currentPageDisplay = (rentalData as CombinedRentalContracts)?.currentPage || 1;
  const totalContracts = (rentalData as CombinedRentalContracts)?.totalRentedContracts || 0;

  return (
    <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
      {/* ReusableFilterTopbar for price and date range filters */}
      <ReusableFilterTopbar
        title="Rental Filters"
        onApplyFilters={handleApplyFilters}
        onClearFilters={handleClearFilters}
        hasActiveFilters={hasActiveFilters}
        initiallyExpanded={false}
        priceRangeIcon={<DollarSign size={16} />}
        dateRangeIcon={<Calendar size={16} />}
      />

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h2 className="text-lg font-semibold">Contract Requests</h2>
              <p className="text-sm text-muted-foreground">
                You have made {totalContracts} contract requests in total
              </p>
            </div>
          
          </div>
        </CardHeader>
        <CardContent>
          <DataTable
            data={rentalContracts}
            columns={columns}
            isLoading={isLoading}
            emptyMessage="No rental contracts found."
            currentPage={currentPageDisplay}
            totalPages={totalPages}
            onPagePrev={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            onPageNext={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
            onPageSelect={setCurrentPage}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default RentalManagement;