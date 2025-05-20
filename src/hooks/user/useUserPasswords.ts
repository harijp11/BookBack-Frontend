// src/hooks/user/usePasswordMutation.ts
import { useMutation } from "@tanstack/react-query";
import { Changepassword } from "@/services/user/userService";
import { useToast } from "../ui/toast"; 
import { AxiosError } from "axios";

export interface PasswordChangeData {
  currentPassword: string;
  newPassword: string;
}

export const usePasswordMutation = () => {
  const toast = useToast()
  return useMutation({
    mutationFn: async ({currentPassword, newPassword }: PasswordChangeData) => {
      const response = await Changepassword( currentPassword, newPassword);
      return response;
    },
    onSuccess: () => {
      toast.success("Password changed successfully");
    },
    onError: (error) => {
      if(error instanceof AxiosError)
      toast.error(error.response?.data?.message || "Failed to change password");
    }
  });
};