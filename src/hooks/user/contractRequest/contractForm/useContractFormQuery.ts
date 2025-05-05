// src/hooks/useContractRequest.ts
import { useQuery } from "@tanstack/react-query";
import {
  fetchFixDealDetailsApi,
  type CombineRequest0,
  type ContractRequest,
} from "@/services/contractrequest/contractRequestService";

// Custom hook for fetching contract request details
export const useContractRequest = (contractRequestId: string | undefined) => {
  return useQuery({
    queryKey: ["contractRequest", contractRequestId],
    queryFn: async (): Promise<CombineRequest0> => {
      if (!contractRequestId) {
        throw new Error("No contract request ID provided");
      }
      
      const response = await fetchFixDealDetailsApi(contractRequestId);
      
      if (!response.success) {
        throw new Error(response.message || "Failed to fetch contract details");
      }
      
      return response;
    },
    enabled: !!contractRequestId, 
    refetchOnWindowFocus: true, 
  });
};

// Custom hook for calculating rent amount based on days
export const useRentalCalculation = (
  contractRequest: ContractRequest | null | undefined,
  selectedDays: number
) => {
  const baseRentAmount = contractRequest?.bookId?.rentAmount || 0;
  const maxRentalPeriod = contractRequest?.bookId?.maxRentalPeriod || 0;
  
  // Calculate total rent amount based on selected days
  const calculateTotalRentAmount = () => {
    // console.log("calculate rent amount")
    if (!contractRequest || maxRentalPeriod === 0) return 0;
    return (selectedDays / maxRentalPeriod) * baseRentAmount; 
  };
  
  // Create the dropdown options for days
  const getDayIncrementOptions = () => {
    if (!contractRequest) return [];
    
    return [
      { value: maxRentalPeriod, label: "Available" },
      { value: maxRentalPeriod + 1, label: "Extended 1 Days" },
      { value: maxRentalPeriod + 5, label: "Extended 5 Days" },
      { value: maxRentalPeriod + 10, label: "Extended 10 Days" },
      { value: maxRentalPeriod + 20, label: "Extended 20 Days" },
      { value: maxRentalPeriod + 30, label: "Extended 30 Days" }
    ];
  };
  
  return {
    totalRentAmount: calculateTotalRentAmount(),
    dayIncrementOptions: getDayIncrementOptions(),
    baseRentAmount,
    maxRentalPeriod
  };
};