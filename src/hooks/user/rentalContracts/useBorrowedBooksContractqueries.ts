"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchBorrowedBooksContract, CombinedRentalContracts } from "@/services/rental/rentalService";
import { FilterOptions } from "@/Components/common/FilterSidebar/filterHeader";

export const useBorrowedBooksQuery = (
  currentPage: number,
  limit: number,
  activeFilters: FilterOptions | null,
  isViewingDetails: boolean = false
) => {
  return useQuery<CombinedRentalContracts, Error>({
    queryKey: ["borrowedBooks", currentPage, activeFilters],
    queryFn: async () => {
      // Prepare filter object
      const filter: Record<string, object> = {};

      if (activeFilters) {
        // Price range filter (rent_amount)
        if (activeFilters.priceRange.min && activeFilters.priceRange.max) {
          filter.rent_amount = {
            $gte: parseFloat(activeFilters.priceRange.min),
            $lte: parseFloat(activeFilters.priceRange.max),
          };
        } else if (activeFilters.priceRange.min) {
          filter.rent_amount = { $gte: parseFloat(activeFilters.priceRange.min) };
        } else if (activeFilters.priceRange.max) {
          filter.rent_amount = { $lte: parseFloat(activeFilters.priceRange.max) };
        }

        // Date range filter (requested_at)
        if (activeFilters.dateRange.startDate && activeFilters.dateRange.endDate) {
          filter.requested_at = {
            $gte: new Date(activeFilters.dateRange.startDate).toISOString(),
            $lte: new Date(activeFilters.dateRange.endDate).toISOString(),
          };
        } else if (activeFilters.dateRange.startDate) {
          filter.requested_at = { $gte: new Date(activeFilters.dateRange.startDate).toISOString() };
        } else if (activeFilters.dateRange.endDate) {
          filter.requested_at = { $lte: new Date(activeFilters.dateRange.endDate).toISOString() };
        }
      }

      try {
        const response = await fetchBorrowedBooksContract({
          page: currentPage,
          limit,
          ...(Object.keys(filter).length > 0 && { filter }),
        });
        console.log("fetchBorrowedBooksContract response:", response); // Debugging
        return response;
      } catch (error) {
        console.error("fetchBorrowedBooksContract error:", error); // Debugging
        throw error;
      }
    },
    enabled: !isViewingDetails,
    keepPreviousData: true, // Smooth pagination
  });
};