import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Login } from "@/Components/auth/Login";
import { Signup } from "@/Components/auth/Signup";
import { Button } from "@/Components/ui/button";
import { Card } from "@/Components/ui/card";
import { AuthCarousel } from "@/Components/carousel/Authcarousel";
import { motion, AnimatePresence } from "framer-motion";
import { useRegisterMutation } from "@/hooks/auth/useRegister";
import { toast } from "sonner";
import { User } from "@/types/User";
import { useLoginMutation } from "@/hooks/auth/useLogin";
import { ILoginData } from "@/services/auth/authService";
import { useDispatch } from "react-redux";
import { userLogin } from "@/store/slice/user_slice";
import { UserHeader } from "@/Components/headers/userHeader";
import { CredentialResponse } from "@react-oauth/google";
import { useGoogleMutation } from "@/hooks/auth/useGoogle";
import GoogleAuth from "@/Components/auth/GoogleAuth";
import { AxiosError } from "axios";


export function UserAuth() {
  const location = useLocation();
  const [isLogin, setIsLogin] = useState(true);
  const dispatch = useDispatch();
  const navigate = useNavigate()

  // Check if location state has isLogin value
  useEffect(() => {
    if (location.state?.isLogin !== undefined) {
      setIsLogin(location.state.isLogin);
    }
  }, [location.state]);

  const { mutate: registerClient } = useRegisterMutation();
  const { mutate: loginClient } = useLoginMutation();
  const { mutate: googleLogin } = useGoogleMutation();


  const google = (credentialResponse: CredentialResponse) => {
    const credential = credentialResponse.credential;

  if (!credential) {
    toast.error("Google credential is missing. Please try again.");
    return;
  }

    googleLogin(
      {
        credential,
        client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
        role: "user",
      },
      {
        onSuccess: (data) => {
          toast.success(data.message);
          dispatch(userLogin(data.user));
        },
        onError: (error: unknown) => {
          const errorMessage =
            error instanceof AxiosError
              ? error.response?.data?.message || "An unexpected error occurred"
              : "Something went wrong. Please try again.";
        
          toast.error(errorMessage);
        },
        
      }
    );
  };

  const handleSignupSubmit = (data: Omit<User, "role"> ) => {
    registerClient(
      { ...data, role: "user" },
      {
        onSuccess: (data) => toast.success(data.message),
        onError: (error: unknown) => {
          const errorMessage =
            error instanceof AxiosError
              ? error.response?.data?.message || "An unexpected error occurred"
              : "Something went wrong. Please try again.";
        
          toast.error(errorMessage);
        },
      }
    );
    setIsLogin(true);
  };

  const handleLoginSubmit = (data: Omit<ILoginData, "role">) => {
    loginClient(
      { ...data, role: "user" },
      {
        onSuccess: (data) => {
          toast.success(data.message);
          dispatch(userLogin(data.user));
          navigate("/")
        },
        onError: (error: unknown) => {
          const errorMessage =
            error instanceof AxiosError
              ? error.response?.data?.message || "An unexpected error occurred"
              : "Something went wrong. Please try again.";
        
          toast.error(errorMessage);
        },
      }
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <UserHeader />
      <motion.div
        key={isLogin ? "login" : "signup"}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.5 }}
      >
        <div className="container mx-auto px-4 py-8 flex items-center justify-center">
          <Card className="w-full max-w-7xl flex flex-col md:flex-row overflow-hidden shadow-2xl">
            <div className="md:w-1/2 bg-primary overflow-hidden h-[300px] md:h-auto relative">
              <AuthCarousel />
              <div className="absolute inset-0 flex items-center justify-center bg-background/50">
                <div className="text-center">
                  <h1 className="text-4xl font-bold text-foreground mb-4">
                    Welcome Back
                  </h1>
                  <p className="text-xl text-muted-foreground">
                    We're glad to see you again!
                  </p>
                </div>
              </div>
            </div>
            <div className="md:w-1/2 p-8 bg-card text-card-foreground">
              <div className="flex mb-6">
                <Button
                  variant={isLogin ? "default" : "outline"}
                  className="flex-1 rounded-r-none"
                  onClick={() => setIsLogin(true)}
                >
                  Login
                </Button>
                <Button
                  variant={!isLogin ? "default" : "outline"}
                  className="flex-1 rounded-l-none"
                  onClick={() => setIsLogin(false)}
                >
                  Sign Up
                </Button>
              </div>
              <AnimatePresence mode="wait">
                <motion.div
                  key={isLogin ? "login" : "signup"}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.5 }}
                >
                  {isLogin ? (
                    <Login
                      userType="user"
                      onSubmit={handleLoginSubmit}
                      setSignup={() => setIsLogin(false)}
                    />
                  ) : (
                    <Signup
                      userType="user"
                      onSubmit={handleSignupSubmit}
                      setLogin={() => setIsLogin(true)}
                    />
                  )}
                </motion.div>
              </AnimatePresence>
              <div className="mt-6">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-muted"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-card text-muted-foreground">
                      Or continue with
                    </span>
                  </div>
                </div>
                <div className="mt-6">
                  <GoogleAuth handleGoogleSuccess={google} />
                </div>
              </div>
            </div>
          </Card>
        </div>
      </motion.div>
    </div>
  );
}