import { Routes, Route } from "react-router-dom";
import { lazy, Suspense } from "react";
import { PublicRoute } from "@/protected/publicRoute";
import { ProtectedRoute } from "@/protected/ProtectedRoute";
import BookLoadingSpinner from "@/hooks/ui/loading/loading"; // Adjust path if needed

// Lazy-loaded components
const UserAuth = lazy(() => import("@/pages/user/UserAuth"));
const UserLandingPage = lazy(() => import("@/pages/user/UserLanding"));
const ForgotPassword = lazy(() => import("@/Components/auth/forgotPassword"));
const ResetPassword = lazy(() => import("@/Components/auth/resetPassword"));
const UserProfilePage = lazy(() => import("@/pages/user/userProfilepage"));
const OwnerBooksMangementPage = lazy(() => import("@/pages/user/ownerBooksMangementPage"));
const BookFormPage = lazy(() => import("@/Components/user/book/CreateBook"));
const BookView = lazy(() => import("@/Components/user/book/getUserBookDetails"));
const OwnerBookDetailsPage = lazy(() => import("@/Components/user/book/viewOwnerBookDetails"));
const OwnerContractRequestHandlingPage = lazy(() => import("@/pages/user/OwnerContractRequestPage"));
const BoughtBooksPage = lazy(() => import("@/pages/user/BoughtBooksPage"));
const RentedOutBooksPage = lazy(() => import("@/pages/user/RentalHistoryPage"));
const BorrowedBooksPage = lazy(() => import("@/pages/user/BorrowedBooksContractPage"));
const UserPursePage = lazy(() => import("@/pages/user/PursePage"));
const UserContractRequestsPage = lazy(() => import("@/pages/user/ContractRequestPage"));
const UserContractFormPage = lazy(() => import("@/pages/user/ContractFormPage"));
const SoldBooksHistoryPage = lazy(() => import("@/pages/user/SoldBooksPage"));
const BorrowedBookDetailsPage = lazy(() => import("@/Components/user/rentalContracts/BorrowedBookDetails"));
const RentedOutBookDetailsPage = lazy(() => import("@/Components/user/rentalContracts/RentedOutBookDetails"));
const BoughtBookDetails = lazy(() => import("@/Components/user/SaleContracts/BoughtBookDetails"));
const SoldBookDetails = lazy(() => import("@/Components/user/SaleContracts/SoldBookDetails"));
const Notifications = lazy(() => import("@/Components/user/notifications/userNotification"));
const UserChatPage = lazy(() => import("@/pages/user/UserChatPage"));
const UserChatListPage = lazy(() => import("@/pages/user/UserListPage"));
const UserAboutPage = lazy(() => import("@/pages/user/UserAboutPage"));
const UserContactPage = lazy(() => import("@/pages/user/UserContactPage"));
const NotFoundPage = lazy(() => import("@/pages/404Page"));

function UserRoutes() {
  return (
    <Suspense fallback={<BookLoadingSpinner message="Loading page..." />}>
      <Routes>
        {/* Public routes */}
        <Route element={<PublicRoute authType="user" />}>
          <Route path="/auth" element={<UserAuth />} />
        </Route>

        <Route path="/book/:bookId" element={<BookView />} />
        <Route path="/forgot-password/:role" element={<ForgotPassword />} />
        <Route path="/reset-password/:token/:role" element={<ResetPassword />} />
        <Route path="/" element={<UserLandingPage />} />
        <Route path="/about" element={<UserAboutPage />} />
        <Route path="/contact" element={<UserContactPage />} />

        {/* Protected routes */}
        <Route element={<ProtectedRoute authType="user" />}>
          <Route path="/profile" element={<UserProfilePage />} />
          <Route path="/books" element={<OwnerBooksMangementPage />} />
          <Route path="/book/owner/:bookId" element={<OwnerBookDetailsPage />} />
          <Route path="/newBook/:userId" element={<BookFormPage mode="create" />} />
          <Route path="/editBook/:userId/:bookId" element={<BookFormPage mode="update" />} />

          <Route path="/chats/:receiverId" element={<UserChatPage />} />
          <Route path="/chats" element={<UserChatListPage />} />
          <Route path="/notifications" element={<Notifications />} />

          {/* Contract request */}
          <Route path="/owner/contract-request" element={<OwnerContractRequestHandlingPage />} />

          {/* Sale contract */}
          <Route path="/sold-books" element={<SoldBooksHistoryPage />} />
          <Route path="/bought-books" element={<BoughtBooksPage />} />
          <Route path="/bought-book/details/:saleContractId" element={<BoughtBookDetails />} />
          <Route path="/sold-book/details/:saleContractId" element={<SoldBookDetails />} />

          {/* Rental contract */}
          <Route path="/rented-books" element={<RentedOutBooksPage />} />
          <Route path="/borrowed-books" element={<BorrowedBooksPage />} />
          <Route path="/borrowed-book/details/:rentalId" element={<BorrowedBookDetailsPage />} />
          <Route path="/rentedout-book/details/:rentalId" element={<RentedOutBookDetailsPage />} />

          {/* Purse and contract requests */}
          <Route path="/purse" element={<UserPursePage />} />
          <Route path="/contract-requests" element={<UserContractRequestsPage />} />
          <Route path="/fix-deal/:conReqId" element={<UserContractFormPage />} />

          {/* Fallback for unknown routes */}
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </Suspense>
  );
}

export default UserRoutes;