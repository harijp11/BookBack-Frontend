// src/hooks/queries/useDealTypeQueries.ts
import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { getAllAdminDealTypes } from '@/services/dealtype/dealTypeService';
import { DealType } from '@/services/book/bookService';


export const useAdminDealTypes = (): UseQueryResult<DealType[], Error> => {
  return useQuery({
    queryKey: ['adminDealTypes'],
    queryFn: getAllAdminDealTypes
  });
};