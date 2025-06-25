import { useMutation, useQueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { 
  sendOtpEmailForContractReturn, 
  verifyOtpForContractReturn, 
  updateRentalContractStatus, 
  SingleCombinedRentalContracts, 
  requestForRenewRentalContract,
  RenewRentalContract,
} from '@/services/rental/rentalService';
import { createReturnRejectionRequest, Response } from '@/services/return_rejection_request/returnRejectionRequestService';
import { renewal_details } from '@/services/rental/rentalService';

interface VerifyOtpPayload {
  email: string;
  otp: string;
  bookId?:string
}

interface UpdateStatusPayload {
  rentalId: string;
  status: string;
}

interface ReturnRejectionPayload {
  rentId: string;
  ownerId: string;
  borrowerId: string;
  reason: string;
}

interface RenewalRequestPayload {
  rentalId: string;
  days: number;
  amount: number;
}

interface RenewContractPayload {
  rentalId: string;
  renewalDetails: renewal_details;
}

export const useRentalMutations = () => {
  const queryClient = useQueryClient();

  const sendOtpMutation = useMutation({
    mutationFn: ({
    email,
    bookId,
  }: {
    email: string;
    bookId?: string;
  }) => sendOtpEmailForContractReturn(email,bookId),
    onSuccess: (response) => {
      if (response?.success) {
        return response;
      }
      throw new Error(response?.message || 'Failed to send OTP');
    },
    onError: (error: AxiosError) => {
      throw error;
    },
  });

  const verifyOtpMutation = useMutation({
    mutationFn: (payload: VerifyOtpPayload) => verifyOtpForContractReturn(payload),
    onSuccess: (response) => {
      if (response?.success) {
        return response;
      }
      throw new Error(response?.message || 'Invalid OTP');
    },
    onError: (error: AxiosError) => {
      throw error;
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ rentalId, status }: UpdateStatusPayload) =>
      updateRentalContractStatus(rentalId, status),
    onMutate: async ({ rentalId, status }) => {
      await queryClient.cancelQueries({ queryKey: ['rentalContract', rentalId] });

      const previousContract = queryClient.getQueryData(['rentalContract', rentalId]);

      queryClient.setQueryData(['rentalContract', rentalId], (old: SingleCombinedRentalContracts | undefined) => {
        if (!old || !old.success) return old;
        const updatedContract = {
          ...old,
          rentedBooksContracts: {
            ...old.rentedBooksContracts,
            status
          },
        };
        return updatedContract;
      });

      return { previousContract };
    },
    onSuccess: (response: SingleCombinedRentalContracts, { rentalId }) => {
      if (response?.success && response.rentedBooksContracts) {
        queryClient.setQueryData(['rentalContract', rentalId], {
          success: true,
          rentedBooksContracts: response.rentedBooksContracts,
        });
      }
    },
    onError: (error: AxiosError, { rentalId }, context) => {
      queryClient.setQueryData(['rentalContract', rentalId], context?.previousContract);
      throw error;
    },
    onSettled: () => {
    },
  });

  const createReturnRejectionMutation = useMutation({
    mutationFn: (payload: ReturnRejectionPayload) => createReturnRejectionRequest(payload),
    onSuccess: (response: Response) => {
      if (response?.success) {
        return response;
      }
      throw new Error(response?.message || 'Failed to create return rejection request');
    },
    onError: (error: AxiosError) => {
      throw error;
    },
  });

  const requestRenewalMutation = useMutation({
    mutationFn: ({ rentalId, days, amount }: RenewalRequestPayload) =>
      requestForRenewRentalContract(rentalId, { days, amount }),
    onMutate: async ({ rentalId, days, amount }) => {
      await queryClient.cancelQueries({ queryKey: ['rentalContract', rentalId] });

      const previousContract = queryClient.getQueryData(['rentalContract', rentalId]);

      queryClient.setQueryData(['rentalContract', rentalId], (old: SingleCombinedRentalContracts | undefined) => {
        if (!old || !old.success) return old;
        const currentRenewalDetails = Array.isArray(old.rentedBooksContracts.renewal_details)
          ? old.rentedBooksContracts.renewal_details
          : [];
        const updatedContract = {
          ...old,
          rentedBooksContracts: {
            ...old.rentedBooksContracts,
            renewal_status: 'Renewal Requested',
            renewal_details: [
              ...currentRenewalDetails,
              {
                days,
                amount,
                requested_at: new Date(),
                response: 'Pending',
                responded_at: new Date(),
              },
            ],
          },
        };
        return updatedContract;
      });

      return { previousContract };
    },
    onSuccess: (response: Response, { rentalId }) => {
      if (response?.success) {
        queryClient.invalidateQueries({ queryKey: ['rentalContract', rentalId] });
      }
    },
    onError: (error: AxiosError, { rentalId }, context) => {
      queryClient.setQueryData(['rentalContract', rentalId], context?.previousContract);
      throw error;
    },
  });

  const renewContractMutation = useMutation({
    mutationFn: ({ rentalId, renewalDetails }: RenewContractPayload) =>
      RenewRentalContract(rentalId, renewalDetails),
    onMutate: async ({ rentalId, renewalDetails }) => {
      await queryClient.cancelQueries({ queryKey: ['rentalContract', rentalId] });

      const previousContract = queryClient.getQueryData(['rentalContract', rentalId]);

      queryClient.setQueryData(['rentalContract', rentalId], (old: SingleCombinedRentalContracts | undefined) => {
        if (!old || !old.success) return old;
        const currentRenewalDetails = Array.isArray(old.rentedBooksContracts.renewal_details)
          ? old.rentedBooksContracts.renewal_details
          : [];
        const updatedRenewalDetails = currentRenewalDetails.map((detail, index) =>
          index === currentRenewalDetails.length - 1
            ? { ...detail, response: renewalDetails.response, responded_at: new Date() }
            : detail
        );
        const updatedContract = {
          ...old,
          rentedBooksContracts: {
            ...old.rentedBooksContracts,
            renewal_status: renewalDetails.response === 'Accepted' ? 'Renewed' : 'Renewal Rejected',
            renewal_details: updatedRenewalDetails,
          },
        };
        return updatedContract;
      });

      return { previousContract };
    },
    onSuccess: (response: Response, { rentalId }) => {
      if (response?.success) {
        queryClient.invalidateQueries({ queryKey: ['rentalContract', rentalId] });
      }
    },
    onError: (error: AxiosError, { rentalId }, context) => {
      queryClient.setQueryData(['rentalContract', rentalId], context?.previousContract);
      throw error;
    },
  });

  return {
    sendOtpMutation,
    verifyOtpMutation,
    updateStatusMutation,
    createReturnRejectionMutation,
    requestRenewalMutation,
    renewContractMutation,
  };
};