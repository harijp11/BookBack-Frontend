import { useMutation } from "@tanstack/react-query";
import { updateReturnRejectionRequestStatus } from "@/services/return_rejection_request/returnRejectionRequestService";

interface UpdateReturnRejectionStatusPayload {
  status: "accepted" | "rejected";
}

export const useUpdateReturnRejectionMutation = () => {
//   const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      retRejId,
      status,
    }: {
      retRejId: string;
      status: UpdateReturnRejectionStatusPayload;
    }) =>
      updateReturnRejectionRequestStatus(retRejId, status),
    onError: (error) => {
      console.error("Mutation error:", error);
    },
  });
};