import { useQuery } from "@tanstack/react-query";
import { fetchUserChatList } from "@/services/chat/chatServices";
import { Chat } from "@/types/ChatTypes";

interface FetchUserChatListResponse {
  success: boolean;
  chatList: Chat[];
}

export const useUserChatList = () => {
  return useQuery<FetchUserChatListResponse, Error>({
    queryKey: ["userChatList"],
    queryFn: fetchUserChatList,
    refetchInterval: 10 * 1000, 
    retry: 1, 
    enabled: false,
  });
};