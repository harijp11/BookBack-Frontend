// src/hooks/useBookQueries.ts
import { useQuery, useMutation,useQueryClient} from '@tanstack/react-query';
import { getUserBookDetails, getRelatedBooks, type IBook, BookResponse } from '@/services/book/bookService';
import { checkIfRequestExists,CombineRequest0,sendContractRequest } from '@/services/contractrequest/contractRequestService'; // Adjust import path as needed
import { ContractRequestPayload } from '@/services/contractrequest/contractRequestService'; // Adjust import path as needed

export function useBookDetails(bookId: string | undefined) {
  return useQuery({
    queryKey: ['book', bookId],
    queryFn: async () => {
      if (!bookId) {
        throw new Error('Book ID is missing');
      }
      
      const data: BookResponse = await getUserBookDetails({ _id: bookId });

      
      
      if (data && data.book) {
        return data.book as IBook;
      } else {
        throw new Error('Book not found');
      }
    },
    enabled: !!bookId, 
  });
}

export function useRelatedBooks(categoryId: string | undefined, currentBookId: string | undefined) {
  return useQuery({
    queryKey: ['relatedBooks', categoryId],
    queryFn: async () => {
      if (!categoryId) {
        throw new Error('Category ID is missing');
      }
      
      const relatedData = await getRelatedBooks({ catId: categoryId });
      
      if (relatedData && Array.isArray(relatedData)) {
        // Filter out the current book from related books
        return relatedData.filter((relatedBook) => relatedBook._id !== currentBookId);
      } else {
        return [];
      }
    },
    enabled: !!categoryId, // Only run the query if categoryId exists
  });
}







// Hook to check if a request exists - Updated for React Query v5
export const useCheckIfRequestExists = (userId: string, bookId: string)=> {
  return useQuery({
    queryKey: ['contractRequestExists', userId, bookId],
    queryFn: async () => {
      if (!userId || !bookId) return {
      success: false,
      message: "Missing user or book ID",
      request: undefined,
    } satisfies CombineRequest0;
      
      try {
        const response = await checkIfRequestExists(userId, bookId);
        return response as CombineRequest0;
      } catch (error) {
        console.error("Error in useCheckIfRequestExists:", error);
        return { success: false, message: "Failed to check request status" };
      }
    },
    enabled: !!userId && !!bookId,
    refetchOnWindowFocus: true
  });
};

// Hook to send a contract request - Updated for React Query v5
export const useSendContractRequest = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (payload: ContractRequestPayload) => {
      return await sendContractRequest(payload);
    },
    onSuccess: (data, variables) => {
      // Invalidate the check-request query to trigger a refetch
      queryClient.invalidateQueries({
        queryKey: ['contractRequestExists', variables.requesterId, variables.bookId]
      });
      return data;
    },
  });
}