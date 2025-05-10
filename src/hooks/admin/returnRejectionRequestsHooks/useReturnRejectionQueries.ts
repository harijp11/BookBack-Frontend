import { AdminReturnRejectionResponse, fetchAdminReturnRejectionRequests, } from "@/services/return_rejection_request/returnRejectionRequestService";
import { useQuery, UseQueryResult } from "@tanstack/react-query";

interface FetchReturnRejectionRequestParams {
    filter: object;
    page: number;
    limit: number;
  }

  export const useReturnRejectionRequests = ({
    filter,
    page,
    limit,
  }: FetchReturnRejectionRequestParams): UseQueryResult<AdminReturnRejectionResponse, Error> => {
    return useQuery<AdminReturnRejectionResponse, Error, AdminReturnRejectionResponse, [string, object, number, number]>({
      queryKey: ["returnRejectionRequests", filter, page, limit],
      queryFn: () => fetchAdminReturnRejectionRequests({ filter, page, limit }),
      placeholderData: keepPreviousData => keepPreviousData,
    });
  };
  