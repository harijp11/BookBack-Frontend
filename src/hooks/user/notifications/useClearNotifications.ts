import { clearAllNotifications, clearNotificationById } from "@/services/notifications/notificationService";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export const useClearNotifications = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: clearAllNotifications,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    }
  });
};

export const useClearNotificationById = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => clearNotificationById(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    }
  });
};
