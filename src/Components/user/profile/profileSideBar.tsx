  import React from "react";
  import { useSelector } from "react-redux";
  import {BookOpen,
    CalendarClock,
    Wallet,
    ShoppingBag,
    BookX,
    Handshake,
    FileText, 
    ClipboardList} from "lucide-react";
  import { Avatar, AvatarFallback, AvatarImage } from "@/Components/ui/avatar";
  import { RootState } from "@/store/store";
  import { Link } from "react-router-dom";

  interface ProfileSidebarProps {
    sidebarRef: React.RefObject<HTMLDivElement | null>;
    onDragStart: (e: React.MouseEvent) => void;
  }

  const ProfileSidebar: React.FC<ProfileSidebarProps> = ({ sidebarRef, onDragStart }) => {
    const userData = useSelector((state: RootState) => state.user.User);

    if (!userData) return null;

    const getInitials = (name: string) => {
      return name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase();
    };

    const readerNavItems = [
      { icon: BookOpen, label: "My Books", active: false, path: `/Books/${userData._id}` },
      { icon: ShoppingBag, label: "Bought Books", active: false, path: "/bought-books" },
      { icon: CalendarClock, label: "Borrowed Books", active: false, path: "/borrowed-books" },
      { icon: ClipboardList, label: "My Requests", active: false, path: "/contract-requests" },
      { icon: Wallet, label: "Purse", active: false, path: "/purse" },
    ];
    
    const sellerNavItems = [
      { icon: BookX, label: "Sold Out Books", active: false, path: "/sold-books" },
      { icon: Handshake, label: "Rent Out Books", active: false, path: "/rented-books" },
      { icon: FileText, label: "Contract Requests", active: false, path: "/owner/contract-request" },
    ];
    

    return (
      <div
        ref={sidebarRef}
        className="w-72 h-screen bg-white border-r border-gray-200 flex flex-col shadow-md rounded-xl"
        onMouseDown={onDragStart}
      >
        <div className="p-6 flex flex-col items-center">
          <Avatar className="w-20 h-20 border-4 border-white shadow-lg">
            {userData.profileImage ? (
              <AvatarImage src={userData.profileImage} alt={userData.Name} />
            ) : (
              <AvatarFallback className="text-xl bg-gradient-to-br from-black to-gray-800 text-white font-bold">
                {getInitials(userData.Name)}
              </AvatarFallback>
            )}
          </Avatar>
          <h2 className="mt-4 font-bold text-lg text-gray-900">{userData.Name}</h2>
          <p className="text-sm text-gray-500">{userData.email}</p>
        </div>

        <div className="flex-1 px-4 py-4 overflow-y-auto ">
          <div className="mb-6">
            <h3 className="text-xs uppercase font-semibold text-gray-500 tracking-wider px-4 mb-2">Reader Navigation</h3>
            <nav className="space-y-1">
              {readerNavItems.map((item, index) => (
                <Link
                  key={index}
                  to={item.path}
                  className={`flex items-center px-4 py-3 rounded-lg transition-colors ${
                    item.active
                      ? "bg-gradient-to-r from-black to-gray-800 text-white"
                      : "text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  <item.icon className={`h-5 w-5 ${item.active ? "text-white" : "text-gray-500"} mr-3`} />
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>

          <div>
            <h3 className="text-xs uppercase font-semibold text-gray-500 tracking-wider px-4 mb-2">Seller Navigation</h3>
            <nav className="space-y-1">
              {sellerNavItems.map((item, index) => (
                <Link
                  key={index}
                  to={item.path}
                  className={`flex items-center px-4 py-3 rounded-lg transition-colors ${
                    item.active
                      ? "bg-gradient-to-r from-black to-gray-800 text-white"
                      : "text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  <item.icon className={`h-5 w-5 ${item.active ? "text-white" : "text-gray-500"} mr-3`} />
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
        </div>

        <div className="p-4 border-t border-gray-200">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-medium text-sm text-gray-700 mb-2">Currently Reading</h3>
            <div className="flex items-center space-x-3">
              <div className="w-10 h-14 bg-gray-200 rounded-sm flex items-center justify-center">
                <BookOpen className="h-4 w-4 text-gray-500" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">The Great Gatsby</p>
                <p className="text-xs text-gray-500">Page 142 of 218</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  export default ProfileSidebar;