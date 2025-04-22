// src/hooks/useBookQueries.ts
import { useQuery } from '@tanstack/react-query';
import { getUserBookDetails, getRelatedBooks, type IBook, type BookListResponse } from '@/services/book/bookService';

export function useBookDetails(bookId: string | undefined) {
  return useQuery({
    queryKey: ['book', bookId],
    queryFn: async () => {
      if (!bookId) {
        throw new Error('Book ID is missing');
      }
      
      const data: BookListResponse = await getUserBookDetails({ _id: bookId });
      
      if (data && data.book) {
        return data.book as IBook;
      } else {
        throw new Error('Book not found');
      }
    },
    enabled: !!bookId, // Only run the query if bookId exists
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