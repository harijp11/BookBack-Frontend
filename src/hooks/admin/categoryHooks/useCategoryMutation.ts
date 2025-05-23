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
      // Cancel any outgoing refetches for all categories queries
      await queryClient.cancelQueries({ queryKey: ['categories'] });
      
      // Store previous data for potential rollback
      const previousQueries = new Map();
      
      // Get all categories queries from the cache
      const queries = queryClient.getQueryCache().findAll({queryKey: ['categories']});
      
      // Update each query in the cache
      queries.forEach(query => {
        const queryKey = query.queryKey;
        const previousData = queryClient.getQueryData(queryKey);
        
        if (previousData) {
          previousQueries.set(queryKey, previousData);
          
          queryClient.setQueryData(queryKey, (old: CategoryResponse) => ({
            ...old,
            categories: old.categories.map((category: CategoryType) => 
              category._id === categoryId 
                ? { ...category, isActive: !category.isActive } 
                : category
            )
          }));
        }
      });
      
      return { previousQueries };
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
      
      // Restore all previous data on error
      if (context?.previousQueries) {
        context.previousQueries.forEach((data, queryKey) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
      
      toast.error("Failed to update category status. Please try again.");
    },
  });

  return {
    toggleStatusMutation
  };
};