import { useQuery } from "@tanstack/react-query";
import { getAllCategories } from "@/services/admin/adminService";

interface UseCategoriesQueryProps {
  currentPage: number;
  searchQuery: string;
  itemsPerPage: number;
}

export const useCategoriesQuery = ({ currentPage, searchQuery, itemsPerPage }: UseCategoriesQueryProps) => {
  const {
    data: categoriesData,
    isLoading,
    refetch
  } = useQuery({
    queryKey: ['categories', currentPage, searchQuery, itemsPerPage],
    queryFn: () => getAllCategories({ 
      page: currentPage, 
      limit: itemsPerPage, 
      search: searchQuery 
    }),
    staleTime: 5000,
  });

  const categories = categoriesData?.categories || [];
  const totalPages = categoriesData?.totalPages || 1;

  return {
    categories,
    totalPages,
    isLoading,
    refetch
  };
};