import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, CheckCircle, Eye, EyeOff } from "lucide-react";
import { useFormik } from "formik";
import { useNavigate, useParams } from "react-router-dom";
import Lottie from "lottie-react";
// Import shadcn components
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Label } from "@radix-ui/react-label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/Components/ui/dialog";

// Import your existing validation schema
import { passwordSchema } from "@/utils/validations/password_validation";


import congrats from "@/assets/congrats.json"; 
import { useResetPasswordMutation } from "@/hooks/auth/userResetPassword";
import { useToast } from "../../hooks/ui/toast";
import img from "@/assets/books-pictures-7d1exn9cgj0dqbo0.webp"
import { AxiosError } from "axios";

const ResetPassword = () => {
 
  const { token, role } = useParams();
  const [passwordReset, setPasswordReset] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  
  const navigate = useNavigate();
  
  
  const { success: successToast, error: errorToast } = useToast();
  
  const { mutate: resetPasswordReq, isPending } = useResetPasswordMutation();
  
  const userRole = role ?? "user"; 

  const handleResetPasswordSubmit = (password: string) => {
    resetPasswordReq(
      { password, role:userRole, token },
      {
        onSuccess: (data) => {
        
          successToast(data.message);
          setPasswordReset(true);
          setShowSuccessModal(true);
        },
        onError: (
          error: Error | AxiosError<{ message: string }>, 
        ) => {
          const errorMessage =
            error instanceof AxiosError
              ? error.response?.data?.message || "Password reset failed"
              : error.message || "An unexpected error occurred";
        
          errorToast(errorMessage);
        },
      }
    );
  };

 
  const formik = useFormik({
    initialValues: {
      password: "",
      confirmPassword: "",
    },
    validationSchema: passwordSchema,
    onSubmit: (values) => {
      handleResetPasswordSubmit(values.password);
    },
  });

  const Navigate = (role: string) => {
    if (role === "admin") {
      navigate("/admin/login");
    } else {
      navigate("/auth");
    }
  }

  return (
    <>
      <div className="min-h-screen flex flex-col md:flex-row bg-white">
      
        <div className="hidden md:block w-1/2 bg-gray-100 relative overflow-hidden order-1">
          <div className="absolute inset-0 bg-gradient-to-br from-gray-200 to-gray-300"></div>
          <img
          src={img}
            alt="Security illustration"
            className="absolute inset-0 w-full h-full object-cover object-center"
          />
        </div>

     
        <div className="w-full md:w-1/2 p-6 md:p-12 flex flex-col justify-center bg-white order-2">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="max-w-md mx-auto w-full space-y-8"
          >
           
            <Button 
              variant="ghost" 
              onClick={() => navigate("/auth")}
              className="flex items-center text-gray-500 hover:text-black transition-colors p-0"
            >
              <ArrowLeft className="mr-1 h-4 w-4" />
              Back to Sign In
            </Button>

            {passwordReset ? (
          
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center space-y-6"
              >
                <CheckCircle className="mx-auto h-16 w-16 text-green-500" />
                <div>
                  <h2 className="text-3xl font-bold tracking-tight mb-2 text-black">
                    Password Reset Complete
                  </h2>
                  <p className="text-gray-600">
                    Your password has been successfully reset. You can now log in with your new password.
                  </p>
                </div>
                <Button
                  onClick={() => Navigate(userRole)}
                  className="w-full bg-black hover:bg-gray-800 text-white"
                >
                  Go to Sign in
                </Button>
              </motion.div>
            ) : (
              // Form State
              <>
                <div className="text-center mb-8">
                  <h2 className="text-3xl font-bold tracking-tight text-black">
                    Reset Your Password
                  </h2>
                  <p className="text-gray-600 mt-2">
                    Please enter your new password below
                  </p>
                </div>

                <form 
                  className="space-y-6"
                  onSubmit={formik.handleSubmit}
                >
                  <div className="space-y-4">
                    {/* Password */}
                    <div className="space-y-2">
                      <Label htmlFor="password" className="text-black">Password</Label>
                      <div className="relative">
                        <Input
                          id="password"
                          name="password"
                          type={showPassword ? "text" : "password"}
                          value={formik.values.password}
                          onChange={formik.handleChange}
                          onBlur={formik.handleBlur}
                          placeholder="Enter your new password"
                          className="border-gray-300 focus:border-black focus:ring-black"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-black"
                        >
                          {showPassword ? (
                            <EyeOff className="h-5 w-5" />
                          ) : (
                            <Eye className="h-5 w-5" />
                          )}
                        </button>
                      </div>
                      {formik.touched.password && formik.errors.password && (
                        <p className="text-red-500 text-sm mt-1">
                          {formik.errors.password}
                        </p>
                      )}
                    </div>

                    {/* Confirm Password */}
                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword" className="text-black">Confirm Password</Label>
                      <div className="relative">
                        <Input
                          id="confirmPassword"
                          name="confirmPassword"
                          type={showConfirmPassword ? "text" : "password"}
                          value={formik.values.confirmPassword}
                          onChange={formik.handleChange}
                          onBlur={formik.handleBlur}
                          placeholder="Confirm your new password"
                          className="border-gray-300 focus:border-black focus:ring-black"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-black"
                        >
                          {showConfirmPassword ? (
                            <EyeOff className="h-5 w-5" />
                          ) : (
                            <Eye className="h-5 w-5" />
                          )}
                        </button>
                      </div>
                      {formik.touched.confirmPassword && formik.errors.confirmPassword && (
                        <p className="text-red-500 text-sm mt-1">
                          {formik.errors.confirmPassword}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Submit Button */}
                  <Button
                    disabled={isPending}
                    type="submit"
                    className="w-full bg-black hover:bg-gray-800 text-white"
                  >
                    {isPending ? "Resetting..." : "Reset Password"}
                  </Button>
                </form>
              </>
            )}
          </motion.div>
        </div>
      </div>

      {/* Success Modal with Lottie Animation */}
      <Dialog open={showSuccessModal} onOpenChange={setShowSuccessModal}>
        <DialogContent className="sm:max-w-md bg-white">
          <DialogHeader>
            <DialogTitle className="text-center text-2xl font-bold text-black">Congratulations!</DialogTitle>
            <DialogDescription className="text-center text-gray-600">
              Your password has been successfully reset.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col items-center justify-center py-4">
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5 }}
              className="w-64 h-64"
            >
              <Lottie
                loop
                animationData={congrats}
                style={{ width: '100%', height: '100%' }}
              />
            </motion.div>
          </div>
          <div className="flex justify-center">
            <Button 
              onClick={() => {
                setShowSuccessModal(false);
                Navigate(userRole);
              }}
              className="bg-black hover:bg-gray-800 text-white"
            >
              Go to Sign In
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ResetPassword;