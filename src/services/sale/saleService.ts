import { adminAxiosInstance } from "@/APIs/admin_axios";
import { UserAxiosInstance } from "@/APIs/user_axios";

export interface Response {
    success:boolean,
    message:string
}

export interface User {
    _id: string;
    userId:string
    Name?: string;
    email: string;
    password: string;
    googleId: string;
    phoneNumber?: string;
    profileImage?:string;
    onlineStatus?: "online" | "offline";
    lastStatusUpdated: Date;
    role:string
    isActive:boolean
    createdAt: Date;
    updatedAt: Date;
  }


  export interface Book {
    _id?: string;  
    name: string;
    categoryId: string;
    dealTypeId: string
    originalAmount: number;
    rentAmount: number;
    description: string;
    maxRentalPeriod: number; // in days
    images: string[];
    ownerId: string;
    isActive: boolean;
    status:string;
    location: {
      type: 'Point';
      coordinates: [number, number];
    };
    locationName: string;
    createdAt?: Date;
    updatedAt?: Date;
  }
  



export interface SaleContract{
    _id: string;
    buyerId: User;
    ownerId: User;
    bookId: Book;
    price: number;
    sale_date: Date;
    created_at: Date;
    updated_at: Date;
  }

  export interface SingleCombinedSaleContracts{
    success:true,
    message:string
    saleBooksContracts:SaleContract                    
}




  export interface CombinedSaleContracts{
    success:true,
    message:string
    saleBooksContracts:SaleContract[]
    totalSoldContracts:number,
    totalPages:number,
    currentPage:number
                        
}



export const fetchSoldBooksContract = async (params: { page: number; limit: number; filter?: object }):Promise<CombinedSaleContracts> => {
    const response = await UserAxiosInstance.get("/user/owner/sale-contract", {
      params
    });
    return response.data;
  };


  export const fetchBoughtBooksContract = async (params: { page: number; limit: number; filter?: object }):Promise<CombinedSaleContracts>  => {
    const response = await UserAxiosInstance.get("/user/buyer/sale-contract", {
      params
    });
    return response.data;
  };

  
  export const fetchAdminSoldBooksContracts = async (
    filter: object = {},
    page: number = 1,
    limit: number = 10
  ): Promise<CombinedSaleContracts | Response> => {
    try {
      const response = await adminAxiosInstance.get("/admin/sale/contract", {
        params: {
          filter: JSON.stringify(filter),
          page,
          limit,
        },
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching admin sold books contracts:", error);
      throw error;
    }
  };


  export const fetchSaleContractDetails = async (
    saleContractId: string
  ): Promise<SingleCombinedSaleContracts | Response> => {
    try {
      const response = await UserAxiosInstance.get(`/user/sale-contract/details/${saleContractId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching sale contract details:', error);
     throw error
    }
  };
  
