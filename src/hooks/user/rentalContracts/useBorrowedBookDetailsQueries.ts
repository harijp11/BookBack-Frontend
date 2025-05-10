import { useQuery } from '@tanstack/react-query';
import { fetchRentalContractDetails, RentalContract, SingleCombinedRentalContracts } from '@/services/rental/rentalService';
import { AxiosError, isAxiosError } from 'axios';

interface ErrorResponse {
  message: string;
}


export const useRentalContract = (rentalId: string | undefined) => {
  const {
    data,
    isLoading,
    error,
    refetch,
  } = useQuery<SingleCombinedRentalContracts, AxiosError>({
    queryKey: ['rentalContract', rentalId],
    queryFn: () =>
      rentalId
        ? fetchRentalContractDetails(rentalId)
        : Promise.reject(new Error('No rental ID provided')),
    enabled: !!rentalId,
    retry: 1,
    refetchOnWindowFocus: true,
  });

  const rentalContract: RentalContract | null = data?.success
    ? data.rentedBooksContracts
    : null;

    const errorMessage =
    isAxiosError<ErrorResponse>(error) && error.response?.data?.message
      ? error.response.data.message
      : error instanceof Error
      ? error.message
      : 'Unknown error';

  return {
    rentalContract,
    isLoading,
    error: errorMessage,
    refetch,
  };
};