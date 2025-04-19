import { Routes, Route } from "react-router-dom";
import { UserAuth } from "@/pages/user/UserAuth";
import {UserLandingPage} from "@/pages/user/UserLanding";
import ForgotPassword from "@/Components/auth/forgotPassword";
import ResetPassword from "@/Components/auth/resetPassword";
import { PublicRoute } from "@/protected/publicRoute"; // Update path as needed
import { ProtectedRoute } from "@/protected/ProtectedRoute";
import UserProfilePage from "@/pages/user/userProfilepage";
import OwnerBooksMangementPage from "@/pages/user/OwnerBooksMangementPage";
import BookFormPage from "@/Components/user/book/CreateBook";
import BooksFetchPage from "@/Components/user/book/fetchAllAvailableBooks";

function UserRoutes() {
  return (
    <Routes>
      {/* Public routes */}
      <Route element={<PublicRoute authType="user" />}>
        <Route path="/auth" element={<UserAuth />} />
      </Route>
      
      <Route path = "/boooks" element={<BooksFetchPage/>}/>
      <Route path="/forgot-password/:role" element={<ForgotPassword />} />
      <Route path="/reset-password/:token/:role" element={<ResetPassword />} />
      <Route path="/" element={<UserLandingPage />} />
      
      
      <Route element={<ProtectedRoute authType="user" />}>
      <Route path="/profile/:id" element={<UserProfilePage />} />
      </Route> 


      //book
      <Route path="/newBook/:userId" element={<BookFormPage mode="create" />} />
      <Route path="/editBook/:userId/:bookId" element={<BookFormPage mode="update" />} />
      <Route path="/books/:userId"  element ={<OwnerBooksMangementPage/> }/>
      <Route path="/books/:bookId"  element ={<OwnerBooksMangementPage/> }/>
    </Routes>
  );
}

export default UserRoutes;