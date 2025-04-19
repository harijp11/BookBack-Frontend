// src/hooks/queries/useCategoryQueries.ts
import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { getAllAdminCategories } from '@/services/category/categoryService';
import { Category } from '@/services/book/bookService';


export const useAdminCategories = (): UseQueryResult<Category[], Error> => {
  return useQuery({
    queryKey: ['adminCategories'],
    queryFn: getAllAdminCategories
  });
};