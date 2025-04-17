import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createNewBook,
  getCloudinarySignature,
  getAllPaginatedBooks,
  updateBookDetails,
  IBook,
} from "@/services/book/bookService";
import { getAllCategories } from "@/services/category/categoryService";
import { getAllDealTypes } from "@/services/dealtype/dealTypeService";
import { Book } from "@/services/book/bookService";
import { AxiosError } from "axios";

interface Category {
  _id: string;
  name: string;
}

interface DealType {
  _id: string;
  name: string;
}

export const useBookQueries = () => {
  const queryClient = useQueryClient();

  const categoriesQuery = useQuery<Category[]>({
    queryKey: ["categories"],
    queryFn: getAllCategories,
    staleTime: 1000 * 60 * 5,
    retry: 1,
  });

  const dealTypesQuery = useQuery<DealType[]>({
    queryKey: ["dealTypes"],
    queryFn: getAllDealTypes,
    staleTime: 1000 * 60 * 5,
    retry: 1,
  });

  const createBookMutation = useMutation({
    mutationFn: (bookData: Book) => createNewBook(bookData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["books"] });
    },
    onError: (error) => {
      if (error instanceof AxiosError) {
        console.error("Error creating book:", error);
      }
    },
  });

  const updateBookMutation = useMutation({
    mutationFn: ({ bookId, bookData }: { bookId: string; bookData: Book }) =>
      updateBookDetails(bookId, bookData),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["book", variables.bookId],
      });
      queryClient.invalidateQueries({
        queryKey: ["books"],
        type: "all",
      });
    },
    onError: (error) => {
      if (error instanceof AxiosError) {
        console.error("Error updating book:", error);
      }
    },
  });

  const getCloudinarySignatureMutation = useMutation({
    mutationFn: getCloudinarySignature,
    onError: (error) => {
      if (error instanceof AxiosError) {
        console.error("Error getting Cloudinary signature:", error);
      }
    },
  });

  // ✅ Renamed to follow the Rules of Hooks
  const useBookByIdQuery = (
    bookId: string,
    ownerId: string,
    options?: { enabled?: boolean } // 👈 added third argument with optional `enabled`
  ) => {
    return useQuery<IBook>({
      queryKey: ["book", bookId, ownerId],
      queryFn: async () => {
        const response = await getAllPaginatedBooks({
          ownerId,
          filter: { _id: bookId },
          limit: 1,
          page: 1,
        });
  
        if (!response.books || response.books.length === 0) {
          throw new Error("Book not found");
        }
  
        return response.books[0];
      },
      enabled: options?.enabled ?? true, // 👈 use enabled from options
      staleTime: 1000 * 60,
      refetchOnMount: "always",
      retry: 1,
    });
  };
  

  return {
    categoriesQuery,
    dealTypesQuery,
    createBookMutation,
    updateBookMutation,
    getCloudinarySignatureMutation,
    useBookByIdQuery, // <- ✅ use this in your components
  };
};
