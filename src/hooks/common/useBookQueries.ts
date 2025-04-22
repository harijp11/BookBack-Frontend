import { useQuery, UseQueryResult } from '@tanstack/react-query';
import {  
  BookListResponse,
  fetchAvailableBooks,
  IBook
} from '@/services/book/bookService';
import { GetBooksByLocationInput } from '@/Components/user/book/fetchAllAvailableBooks';

export interface DetailBook extends IBook {
    distance:number
}

// Hook for available books by location
export const useAvailableBooks = (
  params: GetBooksByLocationInput
): UseQueryResult<BookListResponse, Error> => {
  return useQuery({
    queryKey: ['availableBooks', params],
    queryFn: () => fetchAvailableBooks(params) as Promise<BookListResponse>,
    placeholderData: (previousData: BookListResponse | undefined) => previousData,
    staleTime: 5000,
  }) as UseQueryResult<BookListResponse, Error>;
};