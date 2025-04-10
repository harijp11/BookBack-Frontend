import { UserAxiosInstance } from "@/APIs/user_axios";

export type User = {
  _id: string;
  userId: string;
  Name: string;
  email: string;
  password: string;
  role: string;
  phoneNumber: string;
  profileImage: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  __v: number;
};

export type UserResponse = {
  success: boolean;
  user: User;
};

export type CloudinarySignatureData = {
  timestamp: number;
  signature: string;
  folder: string;
  apiKey: string;
  cloudName: string;
};

export type CloudinarySignatureResponse = {
  success: boolean;
  data: CloudinarySignatureData;
};

export const getUserDetails = async () => {
  const response = await UserAxiosInstance.get<UserResponse>(
    "/_cl/client/details"
  );
  return response.data;
};

export const getCloudinarySignature = async (
  folder: string = "user-profiles"
) => {
  try {
    const response = await UserAxiosInstance.get<CloudinarySignatureResponse>(
      `/user/cloudinary/upload-signature?folder=${folder}`
    );
    return response.data;
  } catch (error) {
    console.error("Error getting Cloudinary signature:", error);
    throw error;
  }
};

export type IUpdateUserData = Pick<
  User,
  "Name" | "phoneNumber" | "profileImage"
>;

export const updateUserProfile = async (
  userId: string,
  data: IUpdateUserData
) => {
  const response = await UserAxiosInstance.patch(
    `/user/update-profile/${userId}`,
    data
  );
  return response.data.data;
};

export const Changepassword = async (
  _id:string,
  password: string,
  newPassword: string
) => {
  const response =  await UserAxiosInstance.patch(
    `user/change-password/?_id=${_id}`,
    {
    password,
    newPassword
    }
  )
  return response
};
