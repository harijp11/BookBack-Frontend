import { adminAxiosInstance } from "@/APIs/admin_axios";
import { UserAxiosInstance } from "@/APIs/user_axios";
import { renewal_details} from "../rental/rentalService";
import { Book } from "../book/bookService";


export interface Response {
    success:boolean
    message:string
}
interface ReturnRejectionPayload {
  rentId: string;
  ownerId: string;
  borrowerId: string;
  reason: string;
}

export interface ReturnRejectionRequest {
    _id: string; 
    rentId: string;
    ownerId: string;
    borrowerId: string;
    reason: string;
    status: 'pending' | 'accepted' | 'rejected';
    createdAt?: Date;
    updatedAt?: Date;
  }


  interface FetchReturnRejectionRequestParams {
    filter:object
    page: number;
    limit: number;
  }



 interface UserInfo {
  _id: string;
  Name?: string;
  email: string;
  phoneNumber?: string;
}


 interface RentalContract{
        _id: string;
        borrowerId: string; 
        ownerId: string;      
        bookId: Book;       
        rent_amount: number;  
        original_amount:number 
        rent_start_date: Date; 
        rent_end_date: Date;
        period_of_contract: number;
        status: 'Returned' | 'Return Requested' | 'On Rental' | 'Return Rejected' | 'Contract Date Exceeded' | 'Return Rejection Requested';
        renewal_status: 'No Renewal' | 'Renewal Requested' | 'Renewal Rejected' | 'Renewed';
        renewal_details: renewal_details[] | [];  
        requested_at: Date 
        returned_at:Date
        penalty_amount: number;
        created_at: Date;
        updated_at: Date;
      }

interface ReturnRejectionItem {
  _id: string;
  rentId: RentalContract;
  borrowerId: UserInfo;
  ownerId: UserInfo;
  reason: string;
  status: "pending" | "accepted" | "rejected";
  createdAt: string;
  updatedAt: string;
}

interface TopComplaint {
  _id:string
  count: number;
  user: UserInfo;
}

export interface AdminReturnRejectionResponse {
  success: boolean;
  message: string;
  topFiveMostComplaintedBy: TopComplaint[];
  topFiveMostComplaintedAgainst: TopComplaint[];
  returnRejectionRequest: ReturnRejectionItem[];
  totalReturnRejectionRequest: number;
  totalPages: number;
  currentPage: number;
}

interface UpdateReturnRejectionStatusPayload {
  status: "accepted" | "rejected";
}


export const createReturnRejectionRequest = async (data: ReturnRejectionPayload):Promise<Response> => {
  try {
    const response = await UserAxiosInstance.post('/user/Return-rejection-request/', data);
    return response.data;
  } catch (error) {
    console.error('Error creating return rejection request:', error);
    throw error;
  }
};



export const fetchAdminReturnRejectionRequests = async ({
  filter,
  page,
  limit,
}: FetchReturnRejectionRequestParams): Promise<AdminReturnRejectionResponse> => {
  try {
    const response = await adminAxiosInstance.get<AdminReturnRejectionResponse>(
      "/admin/return-rejection-request",
      {
        params: { filter, page, limit },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching return rejection requests:", error);
    throw error;
  }
};


export const updateReturnRejectionRequestStatus = async (
  retRejId: string,
  status: UpdateReturnRejectionStatusPayload
): Promise<Response> => {
  try {
    const response = await adminAxiosInstance.put<Response>(
      `/admin/return-rejection-request/${retRejId}/update`,
      status
    );
    return response.data;
  } catch (error) {
    console.error("Error updating return rejection request status:", error);
    throw error;
  }
};