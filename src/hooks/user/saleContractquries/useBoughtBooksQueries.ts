"use client";

import { useQuery } from '@tanstack/react-query';
import { fetchBoughtBooksContract,CombinedBoughtContracts } from '@/services/sale/saleService';
import { FilterOptions } from '@/Components/common/FilterSidebar/filterHeader';

export const useBoughtBooksQuery = (
  currentPage: number,
  limit: number,
  activeFilters: FilterOptions | null,
  isViewingDetails: boolean = false
) => {
  return useQuery<CombinedBoughtContracts, Error>({
    queryKey: ['boughtBooks', currentPage, activeFilters],
    queryFn: async () => {
      // Prepare filter object
      const filter: Record<string, object> = {};
      const isValidDate = (dateStr: string) => {
        return /^\d{4}-\d{2}-\d{2}$/.test(dateStr) && !isNaN(Date.parse(dateStr));
      };
      
      if (activeFilters) {
        // Price range filter
        if (activeFilters.priceRange.min && activeFilters.priceRange.max) {
          filter.price = {
            $gte: parseFloat(activeFilters.priceRange.min),
            $lte: parseFloat(activeFilters.priceRange.max),
          };
        } else if (activeFilters.priceRange.min) {
          filter.price = { $gte: parseFloat(activeFilters.priceRange.min) };
        } else if (activeFilters.priceRange.max) {
          filter.price = { $lte: parseFloat(activeFilters.priceRange.max) };
        }

        // Date range filter - updated approach
        if (activeFilters.dateRange.startDate && activeFilters.dateRange.endDate && 
            isValidDate(activeFilters.dateRange.startDate) && isValidDate(activeFilters.dateRange.endDate)) {
          // Create the end date for the next day at 00:00:00 to include the entire end date
          const endDate = new Date(activeFilters.dateRange.endDate);
          endDate.setDate(endDate.getDate() + 1);
          
          filter.sale_date = {
            $gte: new Date(activeFilters.dateRange.startDate).toISOString(),
            $lt: endDate.toISOString()
          };
        } else {
          // Handle start date only
          if (activeFilters.dateRange.startDate && isValidDate(activeFilters.dateRange.startDate)) {
            filter.sale_date = {
              ...(filter.sale_date as object || {}),
              $gte: new Date(activeFilters.dateRange.startDate).toISOString(),
            };
          }
          
          // Handle end date only
          if (activeFilters.dateRange.endDate && isValidDate(activeFilters.dateRange.endDate)) {
            // Create the end date for the next day at 00:00:00 to include the entire end date
            const endDate = new Date(activeFilters.dateRange.endDate);
            endDate.setDate(endDate.getDate() + 1);
            
            filter.sale_date = {
              ...(filter.sale_date as object || {}),
              $lt: endDate.toISOString(),
            };
          }
        }
      }

      try {
        const response = await fetchBoughtBooksContract({
          page: currentPage,
          limit,
          ...(Object.keys(filter).length > 0 && { filter }),
        });
        console.log('fetchBoughtBooksContract response:', response); // Debugging
        return response;
      } catch (error) {
        console.error('fetchBoughtBooksContract error:', error); // Debugging
        throw error;
      }
    },
    enabled: !isViewingDetails,
  });
};