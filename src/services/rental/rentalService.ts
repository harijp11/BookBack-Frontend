import { adminAxiosInstance } from "@/APIs/admin_axios";
import { UserAxiosInstance } from "@/APIs/user_axios";
import { AxiosError, AxiosResponse } from "axios";

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


  export interface renewal_details {
    days: number;
    amount: number;
    requested_at:Date
    response:"Pending" | "Accepted" | "Rejected"
    responded_at:Date
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
        status: 'Returned' | 'Return Requested' | 'On Rental' | 'Return Rejected' | 'Contract Date Exceeded' | 'Return Rejection Requested';
        renewal_status: 'No Renewal' | 'Renewal Requested' | 'Renewal Rejected' | 'Renewed';
        renewal_details: renewal_details[] | [];  
        return_requested_at: Date 
        returned_at:Date
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

     export interface SingleCombinedRentalContracts{
         success:true
         message:string
         rentedBooksContracts:RentalContract                      
     }

     export interface CombinedBorrowedContracts0{
      success:true,
         message:string
         borrowedBooksContract:RentalContract[]
         totalBorrowedContracts:number,
         totalPages:number,
         currentPage:number
                  
         
     }

     export interface SendOtpResponse {
      success: boolean;
      message: string;
    }

    export interface VerifyOtpResponse {
      success: boolean;
      message: string;
    }
    
    // Define request payload type
    export interface VerifyOtpPayload {
      email: string;
      otp: string;
    }




     export const sendOtpEmailForContractReturn = async (email: string): Promise<SendOtpResponse | undefined> => {
         try {
           const response: AxiosResponse<SendOtpResponse> = await UserAxiosInstance.post(
             '/user/rental-book/return/send-otp',
             { email }
           );
           return response.data;
         } catch (error) {
             if(error instanceof AxiosError)
           // Handle errors (e.g., network issues, 4xx/5xx responses)
           throw new Error(
             error.response?.data?.message || 'Failed to send OTP. Please try again.'
           );
         }
       };


       export const verifyOtpForContractReturn = async (payload: VerifyOtpPayload): Promise<VerifyOtpResponse | undefined> => {
           try {
             const response: AxiosResponse<VerifyOtpResponse> = await UserAxiosInstance.post(
               '/user/rental-book/return/verify-otp',
               payload
             );
             return response.data;
           } catch (error) {
               if(error instanceof AxiosError)
             throw new Error(
               error.response?.data?.message || 'Failed to verify OTP. Please try again.'
             );
           }
         };

export const fetchRentedOutBooksContract = async (params: { page: number; limit: number; filter?: object }):Promise<CombinedRentalContracts> => {
    const response = await UserAxiosInstance.get("/user/owner/rental-contract", {
      params
    });
    return response.data;
  };
  

  export const fetchBorrowedBooksContract = async (params: { page: number; limit: number; filter?: object }):Promise<CombinedBorrowedContracts0> => {
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


  export const fetchRentalContractDetails = async (
    rentalId: string
  ): Promise<SingleCombinedRentalContracts> => {
    try {
      const response = await UserAxiosInstance.get(`/user/rental-contract/details/${rentalId}`);
      return response.data;
    } catch (error) {
      if (error instanceof AxiosError) {
        console.error('Error fetching rental contract details:', error);
        throw error; // ✅ Rethrow to maintain function contract
      }
      throw new Error('Unknown error occurred while fetching rental contract details');
    }
  };
  


  export const updateRentalContractStatus = async (rentalId:string, status:string) => {
    try {
      const response = await UserAxiosInstance.patch(`/user/rental-contract/${rentalId}/status`, {
        status,
      });
  
      return response.data;
    } catch (error) {
      console.error('Failed to update rental status:', error);
      throw error;
    }
  };

  //renew contract 

 export  const requestForRenewRentalContract = async (rentalId: string, renewalDetails: {days:number,amount:number}) => {
    try {
      const response = await UserAxiosInstance.put(`/user/renew-rental-contract/${rentalId}`, renewalDetails);
      console.log("Contract renewal successful:", response.data);
      return response.data;
    } catch (error) {
      console.error("Error renewing rental contract:", error);
      throw error;
    }
  };

  export  const RenewRentalContract = async (rentalId: string, renewalDetails: renewal_details) => {
    try {
      const response = await UserAxiosInstance.patch(`/user/renew-rental-contract/${rentalId}`, renewalDetails);
      console.log("Contract renewal successful:", response.data);
      return response.data;
    } catch (error) {
      console.error("Error renewing rental contract:", error);
      throw error;
    }
  };