
import { useQuery } from "@tanstack/react-query";
import { fetchAdminRentedOutBooksContracts, CombinedRentalContracts, Response } from "@/services/rental/rentalService";

interface RentalContractsQueryParams {
  filter: object;
  page: number;
  limit: number;
}

export const useRentalContractsQuery = ({ filter, page, limit }: RentalContractsQueryParams) => {
  return useQuery<CombinedRentalContracts | Response, Error>({
    queryKey: ["rentalContracts", filter, page, limit],
    queryFn: async () => {
      return await fetchAdminRentedOutBooksContracts(filter, page, limit);
    },
    keepPreviousData: true, // Maintain previous data while fetching new data for smooth pagination
    retry: 1, // Retry failed requests once
  });
};