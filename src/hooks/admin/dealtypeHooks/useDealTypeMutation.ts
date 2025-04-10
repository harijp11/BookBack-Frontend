import { useMutation, useQueryClient } from "@tanstack/react-query";
import { DealTypeResponse, DealType, toggleDealTypeStatus } from "@/services/admin/adminService";
import { useToast } from "@/hooks/ui/toast";

export const useDealTypeMutations = () => {
  const queryClient = useQueryClient();
  const toast = useToast();

  const toggleStatusMutation = useMutation({
    mutationFn: (dealTypeId: string) => toggleDealTypeStatus(dealTypeId),
    onMutate: async (dealTypeId) => {
      // Cancel any outgoing refetches for all dealTypes queries
      await queryClient.cancelQueries({ queryKey: ['dealTypes'] });
      
      // Store previous data for potential rollback
      const previousQueries = new Map();
      
      // Get all dealTypes queries from the cache
      const queries = queryClient.getQueryCache().findAll({queryKey: ['dealTypes']});
      
      // Update each query in the cache
      queries.forEach(query => {
        const queryKey = query.queryKey;
        const previousData = queryClient.getQueryData(queryKey);
        
        if (previousData) {
          previousQueries.set(queryKey, previousData);
          
          queryClient.setQueryData(queryKey, (old: DealTypeResponse) => ({
            ...old,
            dealTypes: old.dealTypes.map((dealType: DealType) => 
              dealType._id === dealTypeId 
                ? { ...dealType, isActive: !dealType.isActive } 
                : dealType
            )
          }));
        }
      });
      
      return { previousQueries };
    },
    onSuccess: (data) => {
      if (data.success) {
        toast.success("Deal type status updated successfully.");
      } else {
        toast.error("Failed to update deal type status.");
      }
    },
    onError: (error, _, context) => {
      console.error("Failed to toggle deal type status:", error);
      
      // Restore all previous data on error
      if (context?.previousQueries) {
        context.previousQueries.forEach((data, queryKey) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
      
      toast.error("Failed to update deal type status. Please try again.");
    },
  });

  return {
    toggleStatusMutation
  };
};