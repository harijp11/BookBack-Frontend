import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateUserStatus } from "@/services/admin/adminService";
import { useToast } from "@/hooks/ui/toast";
import { IUser } from "@/types/User";
import { IAxiosResponse } from "@/types/Response";

// Define the UsersResponse interface
interface UsersResponse<T> {
  users: T[];
  totalPages: number;
  currentPage: number;
}

interface UpdateStatusParams {
  userId: string;
  currentStatus: boolean;
}

interface UserResponse extends IAxiosResponse {
  user?: {
    _id: string;
    isActive: boolean;
  };
}

export const useStatusUpdateMutation = () => {
  const queryClient = useQueryClient();
  const { success, error: toastError } = useToast();

  const toggleStatusMutation = useMutation<UserResponse, Error, UpdateStatusParams>({
    mutationFn: ({ userId }: UpdateStatusParams) =>
      updateUserStatus({
        userType: "user",
        userId: userId,
      }),
    onMutate: async ({ userId, currentStatus }: UpdateStatusParams) => {
      // Use simple query key array
      const queryKey = ['users'];
      
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({queryKey:['users'] });

      // Find all users queries
      const userQueries = queryClient.getQueryCache().findAll({ queryKey: queryKey });
      
      // Store previous data and update all matching queries
      const previousDataEntries: Array<{ queryKey: unknown; data:unknown }> = [];
      
      userQueries.forEach(query => {
        const queryData = queryClient.getQueryData(query.queryKey);
        if (queryData && typeof queryData === 'object' && 'users' in queryData) {
          // Save previous state
          previousDataEntries.push({
            queryKey: query.queryKey,
            data: queryData
          });
          
          // Optimistically update
          queryClient.setQueryData(query.queryKey, {
            ...queryData,
            users: (queryData as UsersResponse<IUser>).users.map((user) =>
              user._id === userId
                ? { ...user, isActive: !currentStatus }
                : user
            ),
          });
        }
      });

      return { previousDataEntries };
    },
    onSuccess: (data, { currentStatus }) => {
      if (data.success) {
        const actionText = !currentStatus ? 'activated' : 'deactivated';
        success(`User ${actionText} successfully`);
      } else {
        toastError(data.message || "Failed to update user status");
      }
    },
  });

  return {
    toggleStatusMutation,
  };
};