import { Routes, Route } from "react-router-dom";
import { lazy, Suspense } from "react";
import { PublicRoute } from "@/protected/publicRoute";
import { ProtectedRoute } from "@/protected/ProtectedRoute";
import BookLoadingSpinner from "@/hooks/ui/loading/loading"; // Adjust path if needed

// Lazy-loaded components
const AdminAuth = lazy(() => import("@/pages/admin/AdminAuth"));
const AdminDashboard = lazy(() => import("@/pages/admin/AdminDashboard"));
const AdminUserManagement = lazy(() => import("@/pages/admin/AdminUserManagementPage"));
const AdminCategoryManagement = lazy(() => import("@/pages/admin/AdminCategoryManagement"));
const AdminDealTypeManagement = lazy(() => import("@/pages/admin/AdminDealTypeManagement"));
const AdminBookMangement = lazy(() => import("@/pages/admin/AdminBooksListPage"));
const AdminRentalTypeManagement = lazy(() => import("@/pages/admin/AdminRentalManagemenet"));
const AdminSalesTypeManagement = lazy(() => import("@/pages/admin/AdminSalesManagement"));
const AdminReturnRejectionRequestPage = lazy(() => import("@/pages/admin/AdminReturnRejectionRequestPage"));
const NotFoundPage = lazy(() => import("@/pages/404Page"));

function AdminRoutes() {
  return (
    <Suspense fallback={<BookLoadingSpinner message="Loading admin page..." />}>
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
          <Route path="/book" element={<AdminBookMangement />} />
          <Route path="/rentals" element={<AdminRentalTypeManagement />} />
          <Route path="/sales" element={<AdminSalesTypeManagement />} />
          <Route path="/return-rejection" element={<AdminReturnRejectionRequestPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </Suspense>
  );
}

export default AdminRoutes;