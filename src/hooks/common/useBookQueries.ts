import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { 
  getAllPaginatedAdminBooks, 
  BookListResponse,
  BookSearchParams, 
  fetchAvailableBooks
} from '@/services/book/bookService';
import { GetBooksByLocationInput } from '@/Components/user/book/fetchAllAvailableBooks';

/**
 * Custom hook for fetching paginated books data
 * @param params - Query parameters for fetching books
 * @returns Query result with paginated books data
 */
export const usePaginatedBooks = (
  params: Omit<BookSearchParams, 'ownerId'>,
  ownerId: string // Separate parameter for ownerId
): UseQueryResult<BookListResponse, Error> => {
  return useQuery<BookListResponse, Error>({
    queryKey: ['adminBooks', params, ownerId],
    queryFn: () => getAllPaginatedAdminBooks({ ...params, ownerId }),
    placeholderData: previousData => previousData,
    staleTime: 5000
  });
};

// Alternative approach if you want to pass the full params object
export const usePaginatedBooksAlternative = (
  params: BookSearchParams
): UseQueryResult<BookListResponse, Error> => {
  return useQuery<BookListResponse, Error>({
    queryKey: ['adminBooks', params],
    queryFn: () => getAllPaginatedAdminBooks(params),
    placeholderData: previousData => previousData,
    staleTime: 5000
  });
};

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