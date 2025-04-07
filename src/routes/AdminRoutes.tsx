import { AdminAuth } from "@/pages/admin/AdminAuth";
import AdminCategoryManagement from "@/pages/admin/AdminCategoryManagement";
import AdminDashboard from "@/pages/admin/AdminDashboard";
import AdminUserManagement from "@/pages/admin/AdminUserManagementPage";
import { Route, Routes } from "react-router-dom";
import { ProtectedRoute } from "@/protected/ProtectedRoute";
import { PublicRoute } from "@/protected/publicRoute"; // Update path as needed
import AdminDealTypeManagement from "@/pages/admin/AdminDealTypeManagement";

function AdminRoutes() {
  return (
    <Routes>
      {/* Public routes */}
      <Route element={<PublicRoute authType="admin" />}>
        <Route path="/login" element={<AdminAuth />} />
      </Route>
      
      {/* Protected routes */}
      <Route element={<ProtectedRoute authType="admin" />}>
        <Route path="/Dashboard" element={<AdminDashboard />} />
        <Route path="/Users" element={<AdminUserManagement />} />
        <Route path="/categories" element={<AdminCategoryManagement />} />
        <Route path="/deal-types" element={<AdminDealTypeManagement />} />
      </Route>
    </Routes>
  );
}

export default AdminRoutes;