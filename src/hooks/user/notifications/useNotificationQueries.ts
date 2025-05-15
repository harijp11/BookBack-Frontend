import { useQuery } from "@tanstack/react-query";
import { fetchUserNotifications, NotificationFilter, NotificationResponse } from "@/services/notifications/notificationService";

export const useFetchNotifications = (
  filter: NotificationFilter = {},
  page: number = 1,
  limit: number = 5
) => {
  return useQuery<NotificationResponse, Error>({
    queryKey: ["notifications", filter, page, limit],
    queryFn: async () => {
      try {
        const response = await fetchUserNotifications(filter, page, limit);
        console.log("fetchUserNotifications Response:", response);
        return response;
      } catch (error) {
        console.error("fetchUserNotifications Error:", error);
        throw new Error
      }
    },
    onSuccess: (data) => {
      console.log("useFetchNotifications Success:", data);
    },
  });
};