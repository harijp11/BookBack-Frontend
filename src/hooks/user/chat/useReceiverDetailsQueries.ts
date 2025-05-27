import { useQuery } from "@tanstack/react-query";
import { fetchReceiverDetails, ReceiverResponse } from "@/services/chat/chatServices";

export const useFetchReceiverDetails = (receiverId: string) => {
  return useQuery<ReceiverResponse, Error>({
    queryKey: ["receiverDetails", receiverId],
    queryFn: async () => {
      const response = await fetchReceiverDetails(receiverId);
      return response;
    },
    enabled: !!receiverId, 
    refetchOnWindowFocus: true,
    staleTime: 0,
  });
};