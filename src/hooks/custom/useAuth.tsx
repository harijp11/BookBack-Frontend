import { RootState } from "@/store/store";
import { useSelector } from "react-redux";

// export const useAdminAuth = () => {
//   const admin = useSelector((state: RootState) => state.admin.admin);
//   return { isLoggedIn: admin !== null, admin };
// };

export const useUserAuth = () => {
  const user = useSelector((state: RootState) => state.user.User);
  return { isLoggedIn: user !== null, user };
};

