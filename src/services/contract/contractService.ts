import { AxiosError, AxiosResponse } from "axios";
import { UserAxiosInstance } from "@/APIs/user_axios"; // Adjust path as needed
// import { useToast } from "@/hooks/ui/toast";

// Define contract input types (based on your backend)
export interface RentalInput {
  bookId: string;
  borrowerId: string;
  ownerId: string;
  rent_amount: number;
  original_amount: number;
  rent_start_date: Date;
  rent_end_date: Date;
  period_of_contract: number;
}

export interface SaleInput {
  buyerId: string;
  ownerId: string;
  bookId: string;
  price: number;
}

export interface RentalOut {
  _id: string;
  bookId: string;
  borrowerId: string;
  ownerId: string;
  rent_amount: number;
  original_amount: number;
  rent_start_date: Date;
  rent_end_date: Date;
  period_of_contract: number;
}

export interface SaleOut {
  _id: string;
  buyerId: string;
  ownerId: string;
  bookId: string;
  price: number;
}

// Define response type for the create contract API
export interface CreateContractResponse {
  success: boolean;
  message: string;
  data: RentalOut | SaleOut;
}

// Define request payload type
export interface CreateContractPayload {
  data: RentalInput | SaleInput;
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

export interface SendOtpResponse {
  success: boolean;
  message: string;
}

export const sendOtpEmail = async (
  email: string
): Promise<SendOtpResponse | undefined> => {
  try {
    const response: AxiosResponse<SendOtpResponse> =
      await UserAxiosInstance.post("/user/contract/send-otp", { email });
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError)
      // Handle errors (e.g., network issues, 4xx/5xx responses)
      throw new Error(
        error.response?.data || "Failed to send OTP. Please try again."
      );
  }
};

export const verifyOtp = async (
  payload: VerifyOtpPayload
): Promise<VerifyOtpResponse | undefined> => {
  const response: AxiosResponse<VerifyOtpResponse> =
    await UserAxiosInstance.post("/user/contract/verify-otp", payload);
  return response.data;
};

// Function to create a new contract
export const createContract = async (
  data: CreateContractPayload,
  request_type: "buy" | "borrow",
  requestId: string
): Promise<CreateContractResponse | undefined> => {
  try {
    const response: AxiosResponse<CreateContractResponse> =
      await UserAxiosInstance.post(
        `/user/contract/${request_type}/${requestId}/create`,
        data
      );
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError)
      throw new Error(
        error.response?.data?.message ||
          "Failed to create contract. Please try again."
      );
  }
};
