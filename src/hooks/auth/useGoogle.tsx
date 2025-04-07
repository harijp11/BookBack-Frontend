import { AuthResponse } from "@/services/auth/authService";
import { GoogleAuth} from "@/services/auth/googleService";
import { useMutation } from "@tanstack/react-query";

export const useGoogleMutation = () => {
  return useMutation<
    AuthResponse,
    Error,
    { credential: any; client_id: any; role: string }
  >({
    mutationFn: GoogleAuth,
  });
};