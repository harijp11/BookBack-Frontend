import { AuthResponse } from "@/services/auth/authService";
import { GoogleAuth} from "@/services/auth/googleService";
import { useMutation } from "@tanstack/react-query";

export const useGoogleMutation = () => {
  return useMutation<
    AuthResponse,
    Error,
    { credential: string; client_id: string; role: string }
  >({
    mutationFn: GoogleAuth,
  });
};