import React, { useState } from "react";
import {
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Home,
  Boxes,
  ShoppingCart,
  Users,
  LogOut,
} from "lucide-react";
import { FaHandshake } from "react-icons/fa";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/store/store";
import { useLocation, useNavigate } from "react-router-dom";
import { adminLogout } from "@/store/slice/admin_slice";
import { logoutAdmin } from "@/services/auth/authService";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/Components/ui/dialog";
import { Button } from "@/Components/ui/button";
import { useToast } from "@/hooks/ui/toast";

interface SidebarItem {
  title: string;
  href: string;
  icon: React.ElementType;
}

const sidebarItems: SidebarItem[] = [
  { title: "Dashboard", href: "/admin/Dashboard", icon: Home },
  { title: "Books", href: "/admin/book", icon: BookOpen },
  { title: "Rentals", href: "/admin/rentals", icon: ShoppingCart },
  { title: "Users", href: "/admin/users", icon: Users },
  { title: "Categories", href: "/admin/categories", icon: Boxes },
  { title: "DealTypes", href: "/admin/deal-types", icon: FaHandshake },
];

const Sidebar: React.FC = () => {
  const toast = useToast()
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const [collapsed, setCollapsed] = useState<boolean>(false);
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);

  const AdminEmail = useSelector((state: RootState) => state.admin.admin?.email);
  const AdminRole = useSelector((state: RootState) => state.admin.admin?.role);
  const [activePath, setActivePath] = useState(location.pathname);

  const handleNavigation = (path: string) => {
    navigate(path);
    setActivePath(path);
  };

  const handleLogout = async () => {
    try {
      await logoutAdmin(); // Wait for API call
      dispatch(adminLogout()); // Clear Redux state
      navigate("/admin/login"); // Redirect to login
      toast.success("Admin Logout successfully")
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <div className={`relative flex h-screen flex-col border-r bg-white transition-all duration-300 ${collapsed ? "w-16" : "w-64"}`}>
      <div className="flex items-center justify-between p-4">
        <div className={`flex items-center gap-2 ${collapsed && "justify-center"}`}>
          <BookOpen className="h-6 w-6 text-black" />
          {!collapsed && <span className="text-xl font-bold text-black">BookBack</span>}
        </div>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="h-8 w-8 rounded-md flex items-center justify-center hover:bg-gray-200"
        >
          {collapsed ? <ChevronRight className="h-4 w-4 text-black" /> : <ChevronLeft className="h-4 w-4 text-black" />}
        </button>
      </div>

      <div className="flex-1 overflow-auto py-2">
        <nav className="grid gap-1 px-2">
          {sidebarItems.map((item) => (
            <button
              key={item.href}
              onClick={() => handleNavigation(item.href)}
              className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                activePath === item.href ? "bg-black text-white" : "hover:bg-gray-200 text-black"
              }`}
            >
              <item.icon className={`h-5 w-5 ${activePath === item.href ? "text-white" : "text-black"} ${collapsed ? "mx-auto" : ""}`} />
              {!collapsed && <span>{item.title}</span>}
            </button>
          ))}
        </nav>
      </div>

      {/* Admin Info */}
      <div className="border-t border-gray-300 p-4">
        <div className={`flex items-center gap-3 ${collapsed && "justify-center"}`}>
          <div className="h-8 w-8 rounded-full bg-black flex items-center justify-center text-white font-bold uppercase">
            {AdminEmail ? AdminEmail[0] : "A"}
          </div>
          {!collapsed && (
            <div>
              <p className="text-sm font-medium text-black">{AdminRole}</p>
              <p className="text-xs text-gray-600">{AdminEmail}</p>
            </div>
          )}
        </div>
      </div>

      {/* Logout Button with Confirmation */}
      <Dialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
        <DialogTrigger asChild>
          <button
            className="m-4 flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-red-100 text-red-600"
          >
            <LogOut className="h-5 w-5 text-red-600" />
            {!collapsed && <span>Logout</span>}
          </button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Logout</DialogTitle>
          </DialogHeader>
          <p>Are you sure you want to log out?</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowLogoutDialog(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleLogout}>Logout</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Sidebar;
