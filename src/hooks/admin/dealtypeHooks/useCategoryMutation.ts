import { useMutation, useQueryClient } from "@tanstack/react-query";
import { DealTypeResponse, DealType, toggleDealTypeStatus } from "@/services/admin/adminService";
import { useToast } from "@/hooks/ui/toast";

export const useDealTypeMutations = () => {
  const queryClient = useQueryClient();
  const toast = useToast();

  const toggleStatusMutation = useMutation({
    mutationFn: (dealTypeId: string) => toggleDealTypeStatus(dealTypeId),
    onMutate: async (dealTypeId) => {
      const queryParams = queryClient.getQueryCache().findAll({queryKey:['dealTypes']})[0]?.queryKey as unknown[];
      const [query, currentPage, searchQuery, itemsPerPage] = queryParams || ['dealTypes', 1, "", 5];
      
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: [query, currentPage, searchQuery, itemsPerPage] });
      
      const previousDealTypes = queryClient.getQueryData([query, currentPage, searchQuery, itemsPerPage]);
      
      queryClient.setQueryData(
        [query, currentPage, searchQuery, itemsPerPage], 
        (old: DealTypeResponse) => ({
          ...old,
          dealTypes: old.dealTypes.map((dealType: DealType) => 
            dealType._id === dealTypeId 
              ? { ...dealType, isActive: !dealType.isActive } 
              : dealType
          )
        })
      );
      
      return { previousDealTypes, queryParams: [currentPage, searchQuery, itemsPerPage] };
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
      if (context?.queryParams) {
        const [currentPage, searchQuery, itemsPerPage] = context.queryParams;
        queryClient.setQueryData(
          ['dealTypes', currentPage, searchQuery, itemsPerPage], 
          context.previousDealTypes
        );
      }
      toast.error("Failed to update deal type status. Please try again.");
    },
  });

  return {
    toggleStatusMutation
  };
};