import { useQuery } from "@tanstack/react-query";
import { fetchSaleContractDetails,SingleCombinedSaleContracts,Response } from "@/services/sale/saleService";

export const useSaleContract = (saleContractId: string | undefined) => {
  return useQuery<SingleCombinedSaleContracts, Response>({
    queryKey: ["saleContract", saleContractId],
    queryFn: async () => {
      if (!saleContractId) {
        throw new Error("Invalid sale contract ID");
      }
      const response = await fetchSaleContractDetails(saleContractId);
      if ("success" in response && response.success) {
        return response as SingleCombinedSaleContracts;
      }
      throw new Error((response as Response).message || "Failed to fetch sale contract details");
    },
    enabled: !!saleContractId, // Only fetch if saleContractId is defined
    retry: 1, // Retry once on failure
  });
};