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
    enabled: !!receiverId, // Only fetch if receiverId is non-empty
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    onError: (error) => {
      console.error("useFetchReceiverDetails Error:", error);
    },
    onSuccess: (data) => {
      console.log("useFetchReceiverDetails Success:", data);
    },
  });
};