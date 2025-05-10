import { fetchAdminReturnRejectionRequests } from "@/services/return_rejection_request/returnRejectionRequestService";
import { useQuery } from "@tanstack/react-query";

interface FetchReturnRejectionRequestParams {
    filter: object;
    page: number;
    limit: number;
  }

  export const useReturnRejectionRequests = ({
    filter,
    page,
    limit,
  }: FetchReturnRejectionRequestParams) => {
    return useQuery({
      queryKey: ["returnRejectionRequests", filter, page, limit],
      queryFn: () => fetchAdminReturnRejectionRequests({ filter, page, limit }),
      keepPreviousData: true,
    });
  };