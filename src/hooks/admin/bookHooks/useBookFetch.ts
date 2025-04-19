import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { getAllPaginatedAdminBooks, IBook } from '@/services/book/bookService';

// Define the interface for search parameters
export interface BookSearchParams {
  search?: string;
  filter?: Record<string,object>;
  page?: number;
  limit?: number;
}

// Interface for the paginated books response
export interface PaginatedBooksResponse {
  books: IBook[];
  totalBooks: number;
  totalPages: number;
  currentPage: number;
}

export const usePaginatedBooks = (
  params: BookSearchParams
): UseQueryResult<PaginatedBooksResponse, Error>=> {
  return useQuery<PaginatedBooksResponse, Error>({
    queryKey: ['adminBooks', params],
    queryFn: () => getAllPaginatedAdminBooks(params),
    placeholderData: (previousData) => previousData, 
    staleTime: 5000
  });
};