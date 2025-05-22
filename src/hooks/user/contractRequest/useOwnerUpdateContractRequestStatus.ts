"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { 
  fetchOwnerContractRequests, 
  updateContractRequestStatus, 
  type ContractRequest 
} from "@/services/contractrequest/contractRequestService"
import { useToast } from "@/hooks/ui/toast"
import { AxiosError } from "axios"

// Query key factory
const contractKeys = {
  all: ['contractRequests'] as const,
  owner: (ownerId: string) => [...contractKeys.all, 'owner', ownerId] as const,
}


export function useOwnerContractRequests() {
  return useQuery({
    queryKey: contractKeys.all,  // just use the general key or create a new one
    queryFn: async () => {
      const data = await fetchOwnerContractRequests();
      return data.requests || [];
    },
    refetchOnWindowFocus: true,
  });
}


/**
 * Hook to update contract request status
 */
export function useUpdateContractRequestStatus() {
  const queryClient = useQueryClient()
  const toast = useToast()
  return useMutation({
    mutationFn: updateContractRequestStatus,
    onMutate: async ({ conReqId, status }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: contractKeys.all })
      
      // Snapshot the previous value
      const previousRequests = queryClient.getQueryData(contractKeys.all)
      
      // Optimistically update to the new value
      queryClient.setQueriesData(
        { queryKey: contractKeys.all },
        (old: ContractRequest[]) => {
          if (!old) return old
          return old.map((request: ContractRequest) => 
            request._id === conReqId ? { ...request, status } : request
          )
        }
      )
      
      return { previousRequests }
    },
    onSuccess: (_, { status }) => {
      toast.success(`Request ${status === "accepted" ? "accepted" : "rejected"} successfully`)
    },
    onError: (error, { status }, context) => {
      // Rollback to the previous value if mutation fails
      if (context?.previousRequests) {
        queryClient.setQueriesData(
          { queryKey: contractKeys.all },
          context.previousRequests
        )
      }
      
      if (error instanceof AxiosError) {
        toast.error(`Failed to ${status === "accepted" ? "accept" : "reject"} request`)
      }
    },
    onSettled: () => {
      // Refetch after error or success
      queryClient.invalidateQueries({ queryKey: contractKeys.all })
    },
  })
}