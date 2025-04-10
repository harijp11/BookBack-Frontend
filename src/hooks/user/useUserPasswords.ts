// src/hooks/user/usePasswordMutation.ts
import { useMutation } from "@tanstack/react-query";
import { Changepassword } from "@/services/user/userService";
import { useToast } from "../ui/toast"; 

export interface PasswordChangeData {
  userId: string;
  currentPassword: string;
  newPassword: string;
}

export const usePasswordMutation = () => {
  const toast = useToast()
  return useMutation({
    mutationFn: async ({ userId, currentPassword, newPassword }: PasswordChangeData) => {
      const response = await Changepassword(userId, currentPassword, newPassword);
      return response;
    },
    onSuccess: () => {
      toast.success("Password changed successfully");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to change password");
    }
  });
};