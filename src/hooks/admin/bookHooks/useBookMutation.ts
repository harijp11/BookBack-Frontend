// src/hooks/mutations/useBookStatusMutation.ts
import { useMutation, UseMutationResult } from '@tanstack/react-query';
import { BookStatusUpdateResponse, updateAdminBookStatus } from '@/services/book/bookService';
import { useToast } from '@/hooks/ui/toast';

interface UseBookStatusMutationProps {
  onSuccess?: () => void;
}


export const useBookStatusMutation = ({ 
  onSuccess 
}: UseBookStatusMutationProps = {}): UseMutationResult<BookStatusUpdateResponse, Error, string> => {
  const toast = useToast();

  return useMutation({
    mutationFn: (bookId: string) => updateAdminBookStatus(bookId),
    onSuccess: () => {
      toast.success('Book status updated successfully');
      if (onSuccess) {
        onSuccess();
      }
    },
    onError: (error) => {
      toast.error(`Failed to update book status: ${error.message || 'Unknown error'}`);
    }
  });
};