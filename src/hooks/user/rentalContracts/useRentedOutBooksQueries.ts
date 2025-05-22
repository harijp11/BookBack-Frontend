"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchRentedOutBooksContract, CombinedRentalContracts } from "@/services/rental/rentalService";
import { FilterOptions } from "@/Components/common/FilterSidebar/filterHeader";

export const useRentedOutBooksQuery = (
  currentPage: number,
  limit: number,
  activeFilters: FilterOptions | null,
  isViewingDetails: boolean = false
) => {
  return useQuery<CombinedRentalContracts, Error>({
    queryKey: ["rentedOutBooks", currentPage, activeFilters],
    queryFn: async () => {
      // Prepare filter object
      const filter: Record<string, object> = {};
      
      // Helper function to validate date format
      const isValidDate = (dateStr: string) => {
        return /^\d{4}-\d{2}-\d{2}$/.test(dateStr) && !isNaN(Date.parse(dateStr));
      };

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
        if (activeFilters.dateRange.startDate && activeFilters.dateRange.endDate && 
            isValidDate(activeFilters.dateRange.startDate) && isValidDate(activeFilters.dateRange.endDate)) {
          // Create the end date for the next day at 00:00:00 to include the entire end date
          const endDate = new Date(activeFilters.dateRange.endDate);
          endDate.setDate(endDate.getDate() + 1);
          
          filter.created_at = {
            $gte: new Date(activeFilters.dateRange.startDate).toISOString(),
            $lt: endDate.toISOString()
          };
        } else if (activeFilters.dateRange.startDate && isValidDate(activeFilters.dateRange.startDate)) {
          filter.created_at = { 
            $gte: new Date(activeFilters.dateRange.startDate).toISOString() 
          };
        } else if (activeFilters.dateRange.endDate && isValidDate(activeFilters.dateRange.endDate)) {
          // Create the end date for the next day at 00:00:00 to include the entire end date
          const endDate = new Date(activeFilters.dateRange.endDate);
          endDate.setDate(endDate.getDate() + 1);
          
          filter.created_at = { 
            $lt: endDate.toISOString() 
          };
        }
      }

      try {
        const response = await fetchRentedOutBooksContract({
          page: currentPage,
          limit,
          ...(Object.keys(filter).length > 0 && { filter }),
        });
        console.log("fetchRentedOutBooksContract response:", response); // Debugging
        return response;
      } catch (error) {
        console.error("fetchRentedOutBooksContract error:", error); // Debugging
        throw error;
      }
    },
    enabled: !isViewingDetails,
  });
};