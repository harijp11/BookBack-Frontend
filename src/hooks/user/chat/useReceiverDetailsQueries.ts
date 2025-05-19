import { useQuery } from "@tanstack/react-query";
import { fetchReceiverDetails, ReceiverResponse } from "@/services/chat/chatServices";

export const useFetchReceiverDetails = (receiverId: string) => {
  return useQuery<ReceiverResponse, Error>({
    queryKey: ["receiverDetails", receiverId],
    queryFn: async () => {
      const response = await fetchReceiverDetails(receiverId);
      console.log("fetchReceiverDetails Response:", response);
      return response;
    },
    enabled: !!receiverId, 
    staleTime: 5 * 60 * 1000, 
  });
};