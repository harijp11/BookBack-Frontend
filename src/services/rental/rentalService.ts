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
  

export interface RentalContract{
        _id: string;
        borrowerId: User; 
        ownerId: User;      
        bookId: Book;       
        rent_amount: number;  
        original_amount:number 
        rent_start_date: Date; 
        rent_end_date: Date;
        period_of_contract: number;
        status: 'Returned' | 'Return Requested' | 'On Rental' | 'Return Rejected' | 'Contract Date Exceeded';
        renewal_status: 'No Renewal' | 'Renewal Requested' | 'Renewal Rejected' | 'Renewed';
        renewal_details: {
          days: number;
          amount: number;
        } | null;  
        requested_at: Date 
        penalty_amount: number;
        created_at: Date;
        updated_at: Date;
      }



  export interface CombinedRentalContracts{
      success:true,
         message:string
         rentedBooksContracts:RentalContract[]
         totalRentedContracts:number,
         totalPages:number,
         currentPage:number
                             
     }

     export interface CombinedRentalContracts0{
      success:true,
         message:string
         borrowedBooksContract:RentalContract[]
         totalBorrowedContracts:number,
         totalPages:number,
         currentPage:number
                             
     }




export const fetchRentedOutBooksContract = async (params: { page: number; limit: number; filter?: object }):Promise<CombinedRentalContracts> => {
    const response = await UserAxiosInstance.get("/user/owner/rental-contract", {
      params
    });
    return response.data;
  };
  

  export const fetchBorrowedBooksContract = async (params: { page: number; limit: number; filter?: object }):Promise<CombinedRentalContracts0> => {
    const response = await UserAxiosInstance.get("/user/borrower/rental-contract", {
      params
    });
    return response.data;
  };
  

  export const fetchAdminRentedOutBooksContracts = async (
    filter: object = {},
    page: number = 1,
    limit: number = 10
  ):Promise <CombinedRentalContracts | Response> => {
    try {
      const response = await adminAxiosInstance.get("/admin/rent/contract", {
        params: {
          filter,
          page,
          limit,
        },
      })
      return response.data;
    } catch (error) {
      console.error("Error fetching admin rented out books contracts:", error);
      throw error;
    }
  };