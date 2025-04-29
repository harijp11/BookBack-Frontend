// src/hooks/useContractRequestMutations.ts
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  cancelContractRequest,
} from "@/services/contractrequest/contractRequestService";
import { useToast } from "@/hooks/ui/toast";

export function useContractRequestMutations() {
  const queryClient = useQueryClient();
  const { success, error: toastError } = useToast();

  // Cancel request mutation
  const cancelMutation = useMutation({
    mutationFn: (requestId: string) => cancelContractRequest(requestId),
    onSuccess: () => {
      success("Request cancelled successfully");
      queryClient.invalidateQueries({ queryKey: ['contractRequests'] });
    },
    onError: (err) => {
      toastError(err instanceof Error ? err.message : "Failed to cancel request");
    },
  });


  return {
    cancelMutation,
  };
}