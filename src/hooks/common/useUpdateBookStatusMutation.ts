
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateBookStatus, BookStatusUpdateResponse } from '@/services/book/bookService';
import { useToast } from '@/hooks/ui/toast';


export const useUpdateBookStatusMutation = () => {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation<BookStatusUpdateResponse, Error, string>({
    mutationFn: async (bookId: string) => {
      const response = await updateBookStatus(bookId);
      if (!response) {
        
        throw new Error('Failed to update book status');
      }
      return response;
    },
    onSuccess: () => {
      toast.success("Book status updated successfully");
     
      queryClient.invalidateQueries({ queryKey: ['books'] });
    },
    onError: (error) => {
      toast.error(`Failed to update book status: ${error.message || 'Unknown error'}`);
    }
  });
};