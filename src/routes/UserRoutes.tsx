import { Routes, Route } from "react-router-dom";
import { UserAuth } from "@/pages/user/UserAuth";
import UserLandingPage from "@/pages/user/UserLanding";
import ForgotPassword from "@/Components/auth/forgotPassword";
import ResetPassword from "@/Components/auth/resetPassword";
import { PublicRoute } from "@/protected/publicRoute"; // Update path as needed
import ProfilePage from "@/Components/user/userProfile";
import { ProtectedRoute } from "@/protected/ProtectedRoute";

function UserRoutes() {
  return (
    <Routes>
      {/* Public routes */}
      <Route element={<PublicRoute authType="user" />}>
        <Route path="/auth" element={<UserAuth />} />
      </Route>
      
      
      <Route path="/forgot-password/:role" element={<ForgotPassword />} />
      <Route path="/reset-password/:token/:role" element={<ResetPassword />} />
      <Route path="/" element={<UserLandingPage />} />
      
      
      <Route element={<ProtectedRoute authType="user" />}>
      <Route path="/profile/:id" element={<ProfilePage />} />
      </Route>
    </Routes>
  );
}

export default UserRoutes;