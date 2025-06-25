import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateBookStatus, BookStatusUpdateResponse, IBook } from '@/services/book/bookService';
import { useToast } from '@/hooks/ui/toast';

interface BooksQueryData {
  books: IBook[];
  totalBooks: number;
  totalPages: number;
  currentPage: number;
}

export const useUpdateBookStatusMutation = (ownerId: string) => {
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
    onSuccess: (response, bookId) => {
      toast.success("Book status updated successfully");
      queryClient.setQueriesData<BooksQueryData>(
        { 
          queryKey: ['books', ownerId],
          exact: false
        },
        (oldData) => {
          if (!oldData) return oldData;
          
          const bookExists = oldData.books.some(book => book._id === bookId);
          if (!bookExists) return oldData;
          
          return {
            ...oldData,
            books: oldData.books.map((book) =>
              book._id === bookId
                ? {
                    ...book,
                    isActive: response.success ? !book.isActive : book.isActive,
                    updatedAt: new Date(),
                  }
                : book
            ),
          };
        }
      );
    },
    onError: (error) => {
      toast.error(`Failed to update book status: ${error.message || 'Unknown error'}`);
    }
  });
};