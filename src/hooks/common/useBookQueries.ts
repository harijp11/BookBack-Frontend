import { useQuery, UseQueryResult } from '@tanstack/react-query';
import {  
  BookListResponse,
  fetchAvailableBooks
} from '@/services/book/bookService';
import { GetBooksByLocationInput } from '@/Components/user/book/fetchAllAvailableBooks';

// Hook for available books by location
export const useAvailableBooks = (
  params: GetBooksByLocationInput
): UseQueryResult<BookListResponse, Error> => {
  return useQuery<BookListResponse, Error>({
    queryKey: ['availableBooks', params],
    queryFn: () => fetchAvailableBooks(params),
    placeholderData: previousData => previousData,
    staleTime: 5000
  });
};