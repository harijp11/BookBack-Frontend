import { useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchUserChatList } from "@/services/chat/chatServices";
import { Chat } from "@/types/ChatTypes";

interface FetchUserChatListResponse {
  success: boolean;
  chatList: Chat[];
}

export const useUserChatList = () => {
  const queryClient = useQueryClient();

  const query = useQuery<FetchUserChatListResponse, Error>({
    queryKey: ["userChatList"],
    queryFn: fetchUserChatList,
    retry: 1,
    enabled: false,
  });

  const setChatListCache = (newData: FetchUserChatListResponse) => {
    queryClient.setQueryData(["userChatList"], newData);
  };

  return {
    ...query,
    setChatListCache,
  };
};
