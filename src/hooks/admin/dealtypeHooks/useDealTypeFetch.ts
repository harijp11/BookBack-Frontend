import { useQuery } from "@tanstack/react-query";
import { getAllDealTypes } from "@/services/admin/adminService";

interface UseDealTypesQueryProps {
  currentPage: number;
  searchQuery: string;
  itemsPerPage: number;
}

export const useDealTypesQuery = ({ currentPage, searchQuery, itemsPerPage }: UseDealTypesQueryProps) => {
  const {
    data: dealTypesData,
    isLoading,
    refetch
  } = useQuery({
    queryKey: ['dealTypes', currentPage, searchQuery, itemsPerPage],
    queryFn: () => getAllDealTypes({ 
      page: currentPage, 
      limit: itemsPerPage, 
      search: searchQuery 
    }),
    staleTime: 5000,
  });

  const dealTypes = dealTypesData?.dealTypes || [];
  const totalPages = dealTypesData?.totalPages || 1;

  return {
    dealTypes,
    totalPages,
    isLoading,
    refetch
  };
};