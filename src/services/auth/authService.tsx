import { adminAxiosInstance } from "@/APIs/admin_axios";
import { authAxiosInstance } from "@/APIs/auth_axios";
import { UserAxiosInstance } from "@/APIs/user_axios";
import { UserDTO } from "@/types/User";

export interface AuthResponse {
  success: boolean;
  message: string;
  user: {
    _id:string,  
    id: string;
    Name:string
    email: string;
    phoneNumber:string
    profileImage:string
    role: "user" | "admin" 
  };
}

export interface AxiosResponse {
  success: boolean;
  message: string;
}

export interface ILoginData {
  email: string;
  password: string;
  role: "admin" | "user"
}

export const signup = async (user: UserDTO): Promise<AuthResponse> => {
  const response = await authAxiosInstance.post<AuthResponse>(
    "/signup",
    user
  );
  return response.data;
};

export const login = async (user: ILoginData): Promise<AuthResponse> => {
  const response = await authAxiosInstance.post<AuthResponse>("/login", user);
  return response.data;
};

export const sendOtp = async (email: string): Promise<AxiosResponse> => {
  const response = await authAxiosInstance.post<AxiosResponse>("/send-otp", {
    email,
  });
  return response.data;
};

export const verifyOtp = async (data: { email: string; otp: string }) => {
  const response = await authAxiosInstance.post<AxiosResponse>(
    "/verify-otp",
    data
  );
  return response.data;
};

export const logoutClient = async (): Promise<AxiosResponse> => {
  const response = await UserAxiosInstance.post("/user/logout");
  return response.data;
};



export const logoutAdmin = async (): Promise<AxiosResponse> => {
  const response = await adminAxiosInstance.post("/admin/logout");
  return response.data;
};



export const forgotPassword = async ({
	email,
	role,
}: {
	email: string;
	role: string;
}) => {
	const response = await authAxiosInstance.post<AxiosResponse>(
		"/forgot-password",
		{
			email,
			role,
		}
	);
	console.log(response.data)
	return response.data;
};

export const resetPassword = async ({
	password,
	role,
	token,
  }: {
	password: string;
	role: string;
	token: string | undefined;
  }) => {
	console.log("Reset Password Request:", { password, role, token });
	const response = await authAxiosInstance.post<AxiosResponse>(
	  "/reset-password",
	  {
		password,
		role,
		token
	  }
	);
	console.log("Reset Password Response:", response.data);
	return response.data;
  };
  