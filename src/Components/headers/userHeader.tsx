import { useEffect, useState } from "react";
import { Menu, BookOpen } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useDispatch, useSelector } from "react-redux";
import { userLogout } from "@/store/slice/user_slice";
import { useUserAuth } from "@/hooks/custom/useAuth";
import { useLogout } from "@/hooks/auth/userLogout";
import { toast } from "sonner";
import { logoutClient } from "@/services/auth/authService";
import { Link, useNavigate } from "react-router-dom";
import { RootState } from "@/store/store";
import { Avatar, AvatarFallback, AvatarImage } from "@/Components/ui/avatar";
import { User as UserIcon } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/Components/ui/alert-dialog";
import { Sheet, SheetContent, SheetTrigger } from "@/Components/ui/sheet";
import { AxiosError } from "axios";



export function UserHeader() {
  // Original UserHeader functionality
  const user = useSelector((state: RootState) => state.user.User);
  const navigate = useNavigate();
  const { isLoggedIn } = useUserAuth();
  const { mutate: logoutReq } = useLogout(logoutClient);
  const dispatch = useDispatch();
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const [dateTime, setDateTime] = useState(new Date());

  // Original Navbar_1 state
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  // Move mobileMenuOpen state to this component
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);


  const navItems = [
    { name: "Home", href: "/" },
    { name: "Books", href: `/Books/${user?._id}` },
    { name: "Buyings", href: "#" },
    { name: "Rentals", href: "#" },
  ];

  // UserHeader's logout functionality
  const logoutUser = () => {
    logoutReq(undefined, {
      onSuccess: (data) => {
        dispatch(userLogout());
        toast.success(data?.message);
        navigate("/auth");
        setUserMenuOpen(false); // Ensure menu closes after logout
      },
      onError: (error) => {
        if (error instanceof AxiosError) {
          toast.error(error.response?.data?.message || "Logout failed");
        }
      },
    });
  };

  // Handle profile navigation with menu closing
  const handleProfileClick = () => {
    setUserMenuOpen(false); // Close menu first
    setTimeout(() => {
      navigate(`/profile/${user?.id}`);
    }, 50); // Small delay to ensure animation completes smoothly
  };

  // Handle logout button click
  const handleLogoutClick = () => {
    setUserMenuOpen(false); // Close menu first
    setTimeout(() => {
      setShowLogoutDialog(true);
    }, 50); // Small delay to ensure animation completes smoothly
  };

  // Animation variants
  const slideDown = {
    hidden: { y: -20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.75 } },
  };

  const staggerChildren = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setDateTime(new Date());
    }, 1000); // Update every second

    return () => clearInterval(interval);
  }, []);

  const day = dateTime.toLocaleDateString("en-US", { weekday: "long" });
  const time = dateTime.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second:"2-digit",
    hour12: true,
  });

  return (
    <>
      {/* Top Bar */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={{
          hidden: { opacity: 0 },
          visible: { opacity: 1, transition: { duration: 0.5 } },
        }}
        className="bg-black text-white py-1 px-4"
      >
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="text-xs">
            <span className="mr-4">
              {day},{time}
            </span>
            {isLoggedIn && <span>My Account</span>}
          </div>
          <div className="hidden md:flex space-x-4 text-xs">
            <a href="#" className="hover:underline">
              Contact
            </a>
            <a href="#" className="hover:underline">
              Donate
            </a>
            <a href="#" className="hover:underline">
              Support Us
            </a>
          </div>
        </div>
      </motion.div>

      {/* Main Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-white">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            {/* Logo */}
            <motion.div
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="flex items-center"
            >
              <Link to="/" className="flex items-center">
                <BookOpen className="mr-2" />
                <div className="text-2xl font-bold">BookBack</div>
              </Link>
            </motion.div>

            {/* Desktop Navigation */}
            <motion.nav
              initial="hidden"
              animate="visible"
              variants={staggerChildren}
              className="hidden md:flex space-x-6"
            >
              {navItems.map((item) => (
                <motion.div key={item.name} variants={slideDown}>
                  <Link
                    to={item.href}
                    className="text-gray-700 hover:text-blue-400 font-medium"
                  >
                    {item.name}
                  </Link>
                </motion.div>
              ))}
            </motion.nav>

            {/* Mobile Menu Button */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="md:hidden flex items-center space-x-4"
            >
              {isLoggedIn && user && (
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                >
                  <div className="bg-gray-200 rounded-full p-1">
                    <Avatar className="h-8 w-8">
                      <AvatarImage
                        src={user.profileImage || "/placeholder-avatar.jpg"}
                        alt={user.Name || "@username"}
                      />
                      <AvatarFallback>
                        {user?.Name?.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                </motion.button>
              )}
              <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                <SheetTrigger asChild>
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  >
                    <Menu size={24} className="text-gray-700" />
                  </motion.button>
                </SheetTrigger>
                <SheetContent side="left" className="pr-0">
                  <MobileNav />
                </SheetContent>
              </Sheet>
            </motion.div>

            {/* User Account Button (Desktop) */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="hidden md:block"
            >
              {isLoggedIn && user ? (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center text-gray-700"
                >
                  <div className="bg-gray-200 rounded-full p-1 mr-2">
                    <Avatar className="h-8 w-8">
                      {user?.profileImage ? (
                        <AvatarImage
                          src={user.profileImage}
                          alt={user.Name || "@username"}
                          className="object-cover"
                        />
                      ) : (
                        <AvatarFallback className="bg-black text-white border border-white">
                        {user?.Name ? (
                          user.Name.charAt(0).toUpperCase()
                        ) : (
                          <UserIcon className="h-5 w-5 text-white" />
                        )}
                      </AvatarFallback>
                      )}
                    </Avatar>
                  </div>
                  <span>{user.Name}</span>
                </motion.button>
              ) : (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Link
                    to="/auth"
                    state={{ isLogin: true }}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
                  >
                    Log In
                  </Link>
                </motion.button>
              )}
            </motion.div>
          </div>
        </div>
      </header>
      <motion.div
        initial={{ opacity: 0, width: "0%" }}
        animate={{ opacity: 1, width: "100%" }}
        transition={{ delay: 0.3, duration: 0.8 }}
        className="h-[1.5px] ml-10 w-full px-5 sm:px-10 md:px-20 rounded-2xl shadow-gray-700 bg-gradient-to-r from-gray-400 to-gray-200"
      />

      {/* User Menu Dropdown */}
      <AnimatePresence>
        {userMenuOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-white shadow-lg overflow-hidden absolute right-4 md:right-1 top-10 z-50 w-55 rounded-lg"
          >
            {isLoggedIn && user ? (
              <motion.div
                variants={staggerChildren}
                initial="hidden"
                animate="visible"
                className="px-4 py-2 space-y-1"
              >
                <div className="border-b border-gray-200 pb-2 pt-1">
                  <p className="text-sm font-semibold text-gray-700">
                    {user.Name || "Welcome"}
                  </p>
                  <p className="text-xs text-gray-500">
                    {user.email || "Manage your account"}
                  </p>
                </div>
                <motion.div
                  variants={slideDown}
                  whileHover={{ x: 5 }}
                  onClick={handleProfileClick}
                  className="block py-2 text-gray-700 hover:text-blue-700 text-sm font-medium cursor-pointer"
                >
                  Profile
                </motion.div>
                <motion.div
                  variants={slideDown}
                  whileHover={{ x: 5 }}
                  onClick={handleLogoutClick}
                  className="block py-2 text-gray-700 hover:text-blue-700 text-sm font-medium cursor-pointer"
                >
                  Log out
                </motion.div>
              </motion.div>
            ) : (
              <motion.div
                variants={staggerChildren}
                initial="hidden"
                animate="visible"
                className="px-4 py-2 space-y-1"
              >
                <div className="border-b border-gray-200 pb-2 pt-1">
                  <p className="text-sm font-semibold text-gray-700">Welcome</p>
                  <p className="text-xs text-gray-500">
                    Manage your library account
                  </p>
                </div>
                <motion.div variants={slideDown} whileHover={{ x: 5 }}>
                  <Link
                    to="/auth"
                    state={{ isLogin: true }}
                    className="block py-2 text-gray-700 hover:text-blue-700 text-sm font-medium"
                    onClick={() => setUserMenuOpen(false)}
                  >
                    Log In
                  </Link>
                </motion.div>
                <motion.div variants={slideDown} whileHover={{ x: 5 }}>
                  <Link
                    to="/auth"
                    state={{ isLogin: false }}
                    className="block py-2 text-gray-700 hover:text-blue-700 text-sm font-medium"
                    onClick={() => setUserMenuOpen(false)}
                  >
                    Create Account
                  </Link>
                </motion.div>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Logout Confirmation Dialog */}
      <AlertDialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Logout</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to log out of your account?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={logoutUser}
              className="bg-red-600 text-white hover:bg-red-700"
            >
              Log out
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

function MobileNav() {
  return (
    <div className="flex flex-col space-y-3">
      <Link className="flex items-center space-x-2" to={"/"}>
        <BookOpen className="h-6 w-6" />
        <span className="font-bold">BookBack</span>
      </Link>
      <nav className="flex flex-col space-y-3">
        {navItems.map((item) => (
          <Link
            key={item.name}
            to={item.href}
            className="transition-colors hover:text-blue-600 text-gray-700"
          >
            {item.name}
          </Link>
        ))}
      </nav>
    </div>
  );
}
