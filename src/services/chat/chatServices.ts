import { UserAxiosInstance } from "@/APIs/user_axios";
import { CloudinarySignatureResponse } from "@/types/ChatTypes";

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