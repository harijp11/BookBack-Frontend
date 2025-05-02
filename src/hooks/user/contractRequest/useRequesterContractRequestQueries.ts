// src/hooks/useContractRequests.ts
import { useQuery, UseQueryOptions } from "@tanstack/react-query";
import { 
  fetchPaginatedUserContractRequests,
  ContractRequest 
} from "@/services/contractrequest/contractRequestService";

export interface PaginatedRequestsResponse {
  requests: ContractRequest[];
  totalPages: number;
  totalRequests: number;
}

export function useContractRequests(
  page: number = 1,
  pageSize: number = 5,
  filters: Record<string, string> = {},
  options?: Omit<UseQueryOptions<PaginatedRequestsResponse, Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery<PaginatedRequestsResponse, Error>({
    queryKey: ['contractRequests', page, pageSize, filters],
    queryFn: async () => {
      return await fetchPaginatedUserContractRequests(page, pageSize, filters) as PaginatedRequestsResponse;
    },
    keepPreviousData: true,
    ...options,
    refetchOnWindowFocus:true
  });
}