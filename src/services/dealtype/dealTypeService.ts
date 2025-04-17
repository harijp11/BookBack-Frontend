import { UserAxiosInstance } from "@/APIs/user_axios";


// src/types/entities/category_entity.ts

export interface DealType {
    _id: string;
    name: string;
    description: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
  }
  
  export const getAllDealTypes = async (): Promise<DealType[]> => {
    const response = await UserAxiosInstance.get<{ dealtypes: DealType[] }>(
      "/user/dealtype"
    );
    return response.data.dealtypes || [];
  };
