import axios from "axios";
import { toast } from "sonner";

export const UserAxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_PRIVATE_API_URL + "_us",
  withCredentials: true,
});


let isRefreshing = false;

UserAxiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      if (!isRefreshing) {
        isRefreshing = true;
        try {
          await UserAxiosInstance.post("/user/refresh-token");
          isRefreshing = false;

          return UserAxiosInstance(originalRequest);
        } catch (refreshError) {
          isRefreshing = false;

          localStorage.removeItem("userData");
          window.location.href = "/";
          toast.info("Please login again");
          return Promise.reject(refreshError);
        }
      }
    }

    if (
      (error.response.status === 403 &&
        error.response.data.message ===
          "Access denied. You do not have permission to access this resource.") ||
      (error.response.status === 403 &&
        error.response.data.message === "Token is blacklisted") ||
      (error.response.status === 403 &&
        error.response.data.message ===
          "Access denied: Your account has been blocked" &&
        !originalRequest._retry)
    ){
      localStorage.removeItem("userData");
      window.location.href = "/";
      toast.info("Please login again");
      return Promise.reject(error);
    }

    return Promise.reject(error);
  }
);
