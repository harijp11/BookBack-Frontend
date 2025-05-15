// src/hooks/useDashboardData.ts
import { useQuery } from "@tanstack/react-query";
import { fetchDashboardDetails,DashboardData, DashboardQueryParams } from "@/services/admin/dashboardService";


export const useDashboardData = (params: DashboardQueryParams = {}) => {
  return useQuery<DashboardData, Error>({
    queryKey: ["dashboardData", params], // Cache key includes params for refetching on param change
    queryFn: () => fetchDashboardDetails(params),
    retry: 1, // Retry failed requests once
  });
};