import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { getAllUsers } from "@/services/admin/adminService";
import { IUser } from "@/types/User";
import { useToast } from "@/hooks/ui/toast";
import { useDebounce } from "@/Components/common/useDebounceHook/useDebounce"; // Import the reusable hook

// Interface for the response from the API
export interface UsersResponse<T> {
  success: true,
  message: string
  users: T[];
  totalPages: number;
  currentPage: number;
}

// Parameters for fetching users
export interface FetchUsersParams {
  userType: string;
  page?: number;
  limit?: number;
  search?: string;
}

export const useUsersQuery = (initialPage = 1, initialSearch = "", limit = 5) => {
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const [users, setUsers] = useState<IUser[]>([]);
  
  // Use the reusable debounce hook
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  const { error } = useToast();
  
  const query = useQuery({
    queryKey: ['users', currentPage, debouncedSearchTerm, limit] as const, // Use debounced search term in query key
    queryFn: async () => {
      try {
        const response = await getAllUsers<IUser>({
          userType: "user",
          page: currentPage,
          limit: limit,
          search: debouncedSearchTerm, // Use debounced search term in API call
        });
        if (!response.success) {
          error("Failed to fetch user data");
        }
        setUsers(response.users);
        return response;
      } catch (err) {
        console.error("Query error:", err);
        error("An error occurred while fetching users");
        throw err;
      }
    },
    staleTime: 30000
  });

  // Add useEffect to trigger refetch when debounced search term changes
  useEffect(() => {
    if (debouncedSearchTerm !== undefined) {
      // Reset to page 1 when search term changes
      if (currentPage !== 1) {
        setCurrentPage(1);
      } else {
        // If already on page 1, just refetch
        query.refetch();
      }
    }
  }, [debouncedSearchTerm]);
  
  // Refetch when page changes
  useEffect(() => {
    query.refetch();
  }, [currentPage]);

  const handlePagePrev = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handlePageNext = () => {
    if (query.data && currentPage < query.data.totalPages) setCurrentPage(currentPage + 1);
  };

  const handlePageSelect = (page: number) => {
    setCurrentPage(page);
  };

  // const handleSearch = (e: React.FormEvent) => {
  //   e.preventDefault();
  //   query.refetch();
  // };

  return {
    users,
    data: query.data, 
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
    currentPage,
    searchTerm,
    setSearchTerm,
    handlePagePrev,
    handlePageNext,
    handlePageSelect,
    // handleSearch
  };
};