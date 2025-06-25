import { Login } from "@/Components/auth/Login";
import { useLoginMutation } from "@/hooks/auth/useLogin";
import { ILoginData } from "@/services/auth/authService";
import { useDispatch } from "react-redux";
import { adminLogin } from "@/store/slice/admin_slice";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

function AdminAuth() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { mutate: loginClient } = useLoginMutation();

  const handleLoginSubmit = (data: Omit<ILoginData, "role">) => {
    loginClient(
      { ...data, role: "admin" },
      {
        onSuccess: (data) => {
          toast.success(data.message);
          console.log("admin", data.user);
          dispatch(adminLogin(data.user));
          navigate("/admin/Dashboard");
        },
        onError: (error: any) => toast.error(error.response.data.message),
      }
    );
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="w-full max-w-md p-4">
        <Login userType="admin" onSubmit={handleLoginSubmit} />
      </div>
    </div>
  );
}
export default AdminAuth