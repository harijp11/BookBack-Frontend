import { useQuery } from "@tanstack/react-query"
import { fetchAdminSoldBooksContracts, CombinedSaleContracts, Response } from "@/services/sale/saleService"

export const useSaleContractsQuery = ({
  page,
  limit,
  filter = {}
}: {
  page: number
  limit: number
  filter?: object
}) => {
  return useQuery<CombinedSaleContracts | Response, Error>({
    queryKey: ['saleContracts', page, limit, filter],
    queryFn: async () => {
      const response = await fetchAdminSoldBooksContracts(filter, page, limit)
      return response
    },
    keepPreviousData: true,
  })
}