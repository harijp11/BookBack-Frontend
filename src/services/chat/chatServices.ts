import { UserAxiosInstance } from "@/APIs/user_axios";
import { CloudinarySignatureResponse } from "@/types/ChatTypes";

export interface IUserEntity {
  _id: string
  userId:string
  Name?: string;
  email: string;
  password: string;
  googleId: string;
  phoneNumber?: string;
  profileImage?:string;
  onlineStatus?: "online" | "offline";
  lastStatusUpdated: Date;
  role: 'admin' | 'user'
  isActive:boolean
  createdAt: Date;
  updatedAt: Date;
}

interface response {
  success:boolean
  message: string
}

export interface ReceiverResponse {
  response:response
  receiverDetails
:IUserEntity
}

export const getCloudinarySignature = async (): Promise<CloudinarySignatureResponse> => {
  try {
    
    const response = await UserAxiosInstance.get<{
      success: boolean;
      data: CloudinarySignatureResponse;
    }>("/user/chat/media-signature");
    
    if (!response.data.success || !response.data.data) {
      throw new Error("Failed to get Cloudinary signature");
    }
    
    return response.data.data;
  } catch (error) {
    console.error("Error getting cloudinary signature:", error);
    throw error;
  }
};

export const fetchUserChatList = async () => {
    try {
      const response = await UserAxiosInstance.get('/user/chat-list');
      return response.data;
    } catch (error) {
      console.error('Error fetching chat list:', error);
      throw error;
    }
  };

  export const fetchReceiverDetails = async (receiverId:string):Promise<ReceiverResponse> => {
  try {
    const response = await UserAxiosInstance.get(`/user/chat-list/receiver-details/${receiverId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching receiver details:", error);
    throw error;
  }
};