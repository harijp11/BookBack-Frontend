import { useQuery } from "@tanstack/react-query"
import { fetchSoldBooksContract } from "@/services/sale/saleService"
import type { FilterOptions } from "@/Components/common/FilterSidebar/filterHeader"

export const useSoldBooksQuery = (
  currentPage: number,
  limit: number,
  activeFilters: FilterOptions | null,
  isViewingDetails: boolean
) => {
  return useQuery({
    queryKey: ['soldBooks', currentPage, activeFilters],
    queryFn: async () => {
      // Prepare filter object
      const filter: Record<string, object> = {}
      
      if (activeFilters) {
        // Price range filter
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
          // Create the end date for the next day at 00:00:00 to include the entire end date
          const endDate = new Date(activeFilters.dateRange.endDate);
          endDate.setDate(endDate.getDate() + 1);
          
          filter.sale_date = {
            $gte: new Date(activeFilters.dateRange.startDate).toISOString(),
            $lt: endDate.toISOString()
          }
        } else if (activeFilters.dateRange.startDate) {
          filter.sale_date = { 
            $gte: new Date(activeFilters.dateRange.startDate).toISOString() 
          }
        } else if (activeFilters.dateRange.endDate) {
          // Create the end date for the next day at 00:00:00 to include the entire end date
          const endDate = new Date(activeFilters.dateRange.endDate);
          endDate.setDate(endDate.getDate() + 1);
          
          filter.sale_date = { 
            $lt: endDate.toISOString() 
          }
        }
      }
      
      const result = await fetchSoldBooksContract({
        page: currentPage,
        limit,
        ...(Object.keys(filter).length > 0 && { filter })
      })
      
      return result
    },
    enabled: !isViewingDetails,
  })
}