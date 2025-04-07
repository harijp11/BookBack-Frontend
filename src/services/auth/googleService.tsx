import { authAxiosInstance } from "@/APIs/auth_axios";
import { AuthResponse } from "./authService";

export const GoogleAuth = async ({
  credential,
  client_id,
  role,
}: {
  credential: string;
  client_id: string;
  role: string;
}): Promise<AuthResponse> => {
  const response = await authAxiosInstance.post<AuthResponse>("/google-auth", {
    credential,
    client_id,
    role,
  });
  return response.data;
};