import { useQuery } from "@tanstack/react-query"
import { fetchOwnerContractRequests, type ContractRequest } from "@/services/contractrequest/contractRequestService"

export function useContractRequests(userId: string | undefined) {


  return useQuery<ContractRequest[]>({
    queryKey: ["contractRequests", userId],
    queryFn: async () => {
      if (!userId) return []
      const data = await fetchOwnerContractRequests()
      return data.requests || []
    },
    enabled: !!userId,
  })
}