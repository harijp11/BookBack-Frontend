// hooks/useBooksQuery.ts
import { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getAllPaginatedBooks } from '@/services/book/bookService';
import { useDebounce } from '@/Components/common/useDebounceHook/useDebounce';
import { BookSearchParams, BookListResponse } from '@/services/book/bookService';

interface BookFilter {
  name?: string;
  categoryId?: string;
  dealTypeId?: string;
  status?: 'Available' | 'Sold Out' | 'Borrowed';
  minOriginalAmount?: number;
  maxOriginalAmount?: number;
  minRentAmount?: number;
  maxRentAmount?: number;
  maxRentalPeriod?: number;
  location?: {
    coordinates?: [number, number];
    maxDistance?: number;
  };
  locationName?: string;
  isActive?: boolean;
}

interface ExtendedBookSearchParams extends BookSearchParams {
  filter: BookFilter;
}

export const useBooksQuery = (initialOwnerId: string) => {
  const queryClient = useQueryClient();
  const [searchParams, setSearchParams] = useState<ExtendedBookSearchParams>({
    ownerId: initialOwnerId,
    page: 1,
    limit: 5,
    search: '',
    filter: {},
  });

  const debouncedSearch = useDebounce(searchParams.search, 500);
  const debouncedFilter = useDebounce(searchParams.filter, 500);

  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery<BookListResponse>({
    queryKey: [
      'books',
      searchParams.ownerId,
      searchParams.page,
      searchParams.limit,
      debouncedSearch,
      debouncedFilter,
    ],
    queryFn: () => getAllPaginatedBooks(searchParams),
    enabled: !!searchParams.ownerId,
  });

  const setSearchTerm = (search: string) => {
    setSearchParams((prev) => ({ ...prev, search, page: 1 }));
  };

  const setFilter = (filter: BookFilter) => {
    setSearchParams((prev) => ({ ...prev, filter, page: 1 }));
  };

  const clearFilter = () => {
    setSearchParams((prev) => ({ ...prev, filter: {}, page: 1 }));
  };

  const handlePagePrev = () => {
    setSearchParams((prev) => ({
      ...prev,
      page: prev.page && prev.page > 1 ? prev.page - 1 : 1,
    }));
  };

  const handlePageNext = () => {
    if (data?.totalPages && searchParams.page && searchParams.page < data.totalPages) {
      setSearchParams((prev) => ({
        ...prev,
        page: (prev.page || 1) + 1,
      }));
    }
  };

  const handlePageSelect = (page: number) => {
    setSearchParams((prev) => ({ ...prev, page }));
  };

  useEffect(() => {
    queryClient.invalidateQueries({ queryKey: ['books', searchParams.ownerId] });
  }, [debouncedSearch, debouncedFilter, searchParams.ownerId, queryClient]);

  return {
    data,
    isLoading,
    isError,
    error,
    currentPage: searchParams.page || 1,
    searchTerm: searchParams.search,
    filter: searchParams.filter,
    setSearchTerm,
    setFilter,
    clearFilter,
    handlePagePrev,
    handlePageNext,
    handlePageSelect,
    refetch,
  };
};