import { Routes, Route } from "react-router-dom";
import { UserAuth } from "@/pages/user/UserAuth";
import {UserLandingPage} from "@/pages/user/UserLanding";
import ForgotPassword from "@/Components/auth/forgotPassword";
import ResetPassword from "@/Components/auth/resetPassword";
import { PublicRoute } from "@/protected/publicRoute"; // Update path as needed
import { ProtectedRoute } from "@/protected/ProtectedRoute";
import UserProfilePage from "@/pages/user/userProfilepage";
import OwnerBooksMangementPage from "@/pages/user/ownerBooksMangementPage";
import BookFormPage from "@/Components/user/book/CreateBook";
import BooksFetchPage from "@/Components/user/book/fetchAllAvailableBooks";
import BookView from "@/Components/user/book/getUserBookDetails";
import OwnerBookDetailsPage from "@/Components/user/book/viewOwnerBookDetails";
import OwnerContractRequestHandlingPage from "@/pages/user/OwnerContractRequestPage";

import BoughtBooksPage from "@/pages/user/BoughtBooksPage";
import RentedOutBooksPage from "@/pages/user/RentalHistoryPage";
import BorrowedBooksPage from "@/pages/user/BorrowedBooksContractPage";
import UserPursePage from "@/pages/user/PursePage";
import UserContractRequestsPage from "@/pages/user/ContractRequestPage";
import UserContractFormPage from "@/pages/user/ContractFormPage";
import SoldBooksHistoryPage from "@/pages/user/SoldBooksPage";
import BorrowedBookDetailsPage from "@/Components/user/rentalContracts/BorrowedBookDetails";
import RentedOutBookDetailsPage from "@/Components/user/rentalContracts/RentedOutBookDetails";
import BoughtBookDetails from "@/Components/user/SaleContracts/BoughtBookDetails";
import SoldBookDetails from "@/Components/user/SaleContracts/SoldBookDetails";
import ChatWrapper from "@/Components/user/chat/ChatWrapper";
import UserList from "@/Components/user/chat/UserList";
import ChatLayout from "@/layouts/chatLayout";
import Notifications from "@/Components/user/notifications/userNotification";


function UserRoutes() {
  return (
    <Routes>
      {/* Public routes */}
      <Route element={<PublicRoute authType="user" />}>
        <Route path="/auth" element={<UserAuth />} />
      </Route>
      
      <Route path = "/boooks" element={<BooksFetchPage/>}/>
      <Route path="/book/:bookId" element={<BookView/>}/>
      <Route path="/forgot-password/:role" element={<ForgotPassword />} />
      <Route path="/reset-password/:token/:role" element={<ResetPassword />} />
      <Route path="/" element={<UserLandingPage />} />
      
      
      <Route element={<ProtectedRoute authType="user" />}>
      <Route path="/profile/:id" element={<UserProfilePage />} />
      <Route path="/books/:userId"  element ={<OwnerBooksMangementPage/> }/>
      <Route path="/book/owner/:bookId" element ={<OwnerBookDetailsPage/>}/>
      <Route path="/newBook/:userId" element={<BookFormPage mode="create" />} />
      <Route path="/editBook/:userId/:bookId" element={<BookFormPage mode="update" />} />


      
        <Route path="/chats/:receiverId" element={<ChatLayout/>} />
        <Route path="/chats" element={<UserList/>} />
        <Route path="/notifications" element={<Notifications/>}/>



      //contract request
      <Route path="/owner/contract-request" element={<OwnerContractRequestHandlingPage/>} />

      //sale contract
      <Route path="/sold-books" element={<SoldBooksHistoryPage/>} />
      <Route path="/bought-books" element={<BoughtBooksPage/>} />
      <Route path="/bought-book/details/:saleContractId" element={<BoughtBookDetails/>} />
      <Route path="/sold-book/details/:saleContractId" element={<SoldBookDetails/>} />

      //rental contract
      <Route path="/rented-books" element={<RentedOutBooksPage/>} />
      <Route path="/borrowed-books" element={<BorrowedBooksPage/>} />
      <Route path="/borrowed-book/details/:rentalId" element={<BorrowedBookDetailsPage/>} />
      <Route path="/rentedout-book/details/:rentalId" element={<RentedOutBookDetailsPage/>} />

      //purse
      <Route path="/purse" element={<UserPursePage/>} />
      <Route path="/contract-requests" element={<UserContractRequestsPage/>} />
      <Route path="/fix-deal/:conReqId" element={<UserContractFormPage/>} />
      </Route> 

       

      //book
      {/* <Route path="/book/:bookId"  element ={<BookView/> }/> */}
    </Routes>
  );
}

export default UserRoutes;