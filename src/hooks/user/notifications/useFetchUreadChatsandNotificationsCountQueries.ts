import { useQuery } from "@tanstack/react-query";
import { fetchUnreadCounts, UnreadCountsResponse } from "@/services/notifications/notificationService";
import { useUserAuth } from "@/hooks/custom/useAuth"; // Adjust the path if needed

export const useUnreadCounts = () => {
  const { isLoggedIn } = useUserAuth();

  return useQuery<UnreadCountsResponse | null, Error>({
    queryKey: ["unreadCounts"],
    queryFn: fetchUnreadCounts,
    // refetchInterval: 10 * 1000,
    retry: 1,
    enabled: isLoggedIn, 
  });
};
