"use client";

import { useQuery } from '@tanstack/react-query';
import { fetchBoughtBooksContract, CombinedSaleContracts } from '@/services/sale/saleService';
import { FilterOptions } from '@/Components/common/FilterSidebar/filterHeader';

export const useBoughtBooksQuery = (
  currentPage: number,
  limit: number,
  activeFilters: FilterOptions | null,
  isViewingDetails: boolean = false
) => {
  return useQuery<CombinedSaleContracts, Error>({
    queryKey: ['boughtBooks', currentPage, activeFilters],
    queryFn: async () => {
      // Prepare filter object
      const filter: Record<string, object> = {};

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

        // Date range filter
        if (activeFilters.dateRange.startDate && activeFilters.dateRange.endDate) {
          filter.sale_date = {
            $gte: new Date(activeFilters.dateRange.startDate).toISOString(),
            $lte: new Date(activeFilters.dateRange.endDate).toISOString(),
          };
        } else if (activeFilters.dateRange.startDate) {
          filter.sale_date = { $gte: new Date(activeFilters.dateRange.startDate).toISOString() };
        } else if (activeFilters.dateRange.endDate) {
          filter.sale_date = { $lte: new Date(activeFilters.dateRange.endDate).toISOString() };
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
    keepPreviousData: true, // Smooth pagination
  });
};