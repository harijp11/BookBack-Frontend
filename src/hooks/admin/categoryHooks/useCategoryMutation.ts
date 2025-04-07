// hooks/useCategoryMutations.ts
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CategoryResponse, CategoryType, toggleCategoryStatus } from "@/services/admin/adminService";
import { useToast } from "@/hooks/ui/toast";

export const useCategoryMutations = () => {
  const queryClient = useQueryClient();
  const toast = useToast();

 
  const toggleStatusMutation = useMutation({
    mutationFn: (categoryId: string) => toggleCategoryStatus(categoryId),
    onMutate: async (categoryId) => {
      
      const queryParams = queryClient.getQueryCache().findAll({queryKey:['categories']})[0]?.queryKey as unknown[];
      const [query,currentPage, searchQuery, itemsPerPage] = queryParams || ['categories', 1, "", 5];
      
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: [query, currentPage, searchQuery, itemsPerPage] });
      
     
      const previousCategories = queryClient.getQueryData([query, currentPage, searchQuery, itemsPerPage]);
      
     
      queryClient.setQueryData(
        [query, currentPage, searchQuery, itemsPerPage], 
        (old: CategoryResponse) => ({
          ...old,
          categories: old.categories.map((category: CategoryType) => 
            category._id === categoryId 
              ? { ...category, isActive: !category.isActive } 
              : category
          )
        })
      );
      
      return { previousCategories, queryParams: [currentPage, searchQuery, itemsPerPage] };
    },
    onSuccess: (data) => {
      if (data.success) {
        toast.success("Category status updated successfully.");
      } else {
        toast.error("Failed to update category status.");
      }
    },
    onError: (error, _, context) => {
      console.error("Failed to toggle category status:", error);
      if (context?.queryParams) {
        const [currentPage, searchQuery, itemsPerPage] = context.queryParams;
        queryClient.setQueryData(
          ['categories', currentPage, searchQuery, itemsPerPage], 
          context.previousCategories
        );
      }
      toast.error("Failed to update category status. Please try again.");
    },
  });

  return {
    toggleStatusMutation
  };
};