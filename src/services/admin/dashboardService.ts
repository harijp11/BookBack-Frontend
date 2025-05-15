import { adminAxiosInstance } from "@/APIs/admin_axios";
import { AxiosError } from "axios";

// src/types/dashboard.ts
export interface DataPoint {
    sale: number;
    rental: number;
    saleCount: number;
    rentalCount: number;
  }
  
  export interface SalesData {
    daily: Array<{ day: string } & DataPoint>;
    weekly: Array<{ week: string } & DataPoint>;
    monthly: Array<{ month: string } & DataPoint>;
    yearly: Array<{ year: string } & DataPoint>;
  }
  
  export interface User {
    id: number;
    name: string;
    transactions: number;
    amount: number;
  }
  
  export interface Category {
    id: number;
    name: string;
    sales: number;
    amount: number;
  }
  
  export interface DashboardData {
    totalSales: number;
    totalRentals: number;
    totalUsers: number;
    salesData: SalesData;
    topUsers: User[];
    topCategories: Category[];
  }
  
  export interface DashboardQueryParams {
    startDate?: string;
    endDate?: string;
    view?: "daily" | "weekly" | "monthly" | "yearly";
    topLimit?: string;
  }

  // src/services/dashboardService.ts


export const fetchDashboardDetails = async (
  params: DashboardQueryParams = {}
): Promise<DashboardData> => {
  try {
    const response = await adminAxiosInstance.get<DashboardData>(
      "/admin/fetch-dashboard",
      { params }
    );
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError<{ message?: string }>;
    throw new Error(
      axiosError.response?.data?.message || "Failed to fetch dashboard data"
    );
  }
};