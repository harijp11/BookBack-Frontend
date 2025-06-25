import { UserAxiosInstance } from "@/APIs/user_axios";
import { AxiosError } from "axios";

export type ContractRequestPayload = {
  requesterId: string;
  ownerId:string
  bookId: string;
  request_type: "borrow" | "buy";
};

export interface ContractRequestResponse{
  success:boolean,
  message:string
}

interface requesterId {
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

interface ownerId{
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

interface bookId {
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


export interface ContractRequest {
   _id:string,
   requesterId:requesterId,
   ownerId:ownerId,
   bookId:bookId,
   request_type:string
   status:string
   createdAt:Date,
   updatedAt:Date
}

export interface CombineRequest0 extends ContractRequestResponse {
  success: boolean;
  message: string;
  request?:ContractRequest
}

export interface CombineRequest extends ContractRequestResponse {

  requests:ContractRequest[]
}

export interface PaginatedRequestsResponse {
  success: boolean;
  message: string;
  requests: ContractRequest[];       
  totalRequests: number;
  totalPages: number;
  currentPage: number;
}



 

export const checkIfRequestExists = async (requesterId:string,bookId: string):Promise< CombineRequest0> => {
  try {
    const response = await UserAxiosInstance.get('/user/check-Request-exist', {
      params: { requesterId,bookId },
    });
    return response.data; 
  } catch (error) {
    if (error instanceof AxiosError) {
    console.error('Error checking request existence:', error?.response?.data || error.message);
  }
  throw error;
}
};

export const sendContractRequest = async (
  data: ContractRequestPayload
): Promise<ContractRequestResponse> => {

    const response = await UserAxiosInstance.post(
      "/user/contract-request",
      data
    );
    return response.data;

};


export const updateContractRequestStatus = async (
  data:{conReqId:string,status:string}
): Promise<ContractRequest | ContractRequestResponse> => {
  try {
    const response = await UserAxiosInstance.patch('/user/owner/contract-request',data);
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      console.error("Error updating contract request status:", error?.response?.data || error.message);
      throw error;
    }
    throw error;
  }
};


export const fetchOwnerContractRequests = async (): Promise<CombineRequest> => {
  try {
    const response = await UserAxiosInstance.get('/user/owner/contract-request',
    );
    console.log("fetch data",response.data)
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      console.error("Error fetching owner's contract requests:", error?.response?.data || error.message);
      throw error;
    }
    throw error;
  }
};


export const fetchPaginatedUserContractRequests = async (page=1,limit=5,filter={}):Promise<PaginatedRequestsResponse | ContractRequestResponse> => {
  try {
    const response = await UserAxiosInstance.get('/user/contract-request',{
      params:{page,limit,filter}
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching contract requests:', error);
    throw error; 
  }
};

export const cancelContractRequest = async (conReqId: string): Promise<ContractRequestResponse> => {
  try {
    const response = await UserAxiosInstance.patch(`/user/contract-request/${conReqId}/cancel`)
    return response.data
  } catch (error) {
    console.error("Error cancelling contract request:", error)
    throw error
  }
}

export async function fetchFixDealDetailsApi(conReqId:string): Promise<CombineRequest0> {
  try {
    const response = await UserAxiosInstance.get<CombineRequest0>("/user/fix-deal",{
    params:{conReqId}
    });
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError && error.response) {
      throw new Error(error.response.data.message || "Failed to fetch fix deal details");
    } else {
      throw new Error("Network Error");
    }
  }
}




