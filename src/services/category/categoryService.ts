import { UserAxiosInstance } from "@/APIs/user_axios";

// src/types/entities/deal_type_entity.ts

export interface Category {
    _id: string;
    name: string;
    description: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
  }
  

  export const getAllCategories = async (): Promise<Category[]> => {
    const response = await UserAxiosInstance.get<{ categories: Category[] }>(
      "/user/category"
    );
    return response.data.categories || [];
  };
