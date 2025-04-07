import { useFormik } from "formik";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "../ui/card";
import { formikSignupSchema } from "@/utils/signupValidator";
import { User } from "@/types/User";
import OTPModal from "@/Components/modals/OtpModal";
import { useState } from "react";
import { useSendOTPMutation } from "@/hooks/auth/useSendOtp";
import { toast } from "sonner";
import { useVerifyOTPMutation } from "@/hooks/auth/useVerifyOtp";

type UserType = "admin" | "user" 

interface SignupProps {
  userType: UserType;
  onSubmit: (data: User) => void;
  setLogin?: () => void;
}

export function Signup({ userType, onSubmit, setLogin }: SignupProps) {
  const [isOTPModalOpen, setIsOTPModalOpen] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [userData, setUserData] = useState<User>({} as User);

  const { mutate: sendVerificationOTP } = useSendOTPMutation();
  const { mutate: verifyOTP } = useVerifyOTPMutation();

  const handleOpenOTPModal = () => {
    setIsOTPModalOpen(true);
  };

  const handleCloseOTPModal = () => {
    setIsOTPModalOpen(false);
  };

  const handleSendOTP = (email?: string) => {
    setIsSending(() => true);
    sendVerificationOTP(email ?? userData.email, {
      onSuccess: (data) => {
        toast.success(data.message);
        setIsSending(false);
      },
      onError: (error: any) => {
        toast.error(error.response.data.message);
        handleCloseOTPModal();
      },
    });
  };

  const submitRegister = () => {
    onSubmit(userData);
  };

  const handleVerifyOTP = (otp: string) => {
    verifyOTP(
      { email: userData.email, otp },
      {
        onSuccess: (data) => {
          toast.success(data.message);
          submitRegister();
          setIsOTPModalOpen(false);
        },
        onError: (error: any) => {
          toast.error(error.response.data.message);
        },
      }
    );
  };

  const formik = useFormik({
    initialValues: {
      Name: "",
      email: "",
      phoneNumber: "",
      password: "",
      confirmPassword: "",
    },
    validationSchema: formikSignupSchema,
    onSubmit: (values) => {
      setUserData(() => values);
      handleSendOTP(values.email);
      handleOpenOTPModal();
    },
  });

  return (
    <Card className="w-full max-w-xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-center">
          Sign up as {userType}
        </CardTitle>
        <CardDescription className="text-center">
          Create your account to get started
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={formik.handleSubmit} className="space-y-4">
          <div className="flex space-x-2">
            <div className="space-y-2 flex-1">
              <Label htmlFor="Name">Name</Label>
              <Input
                id="Name"
                type="text"
                placeholder="Enter your name"
                {...formik.getFieldProps("Name")}
                className={formik.touched.Name && formik.errors.Name ? "border-red-500" : ""}
              />
              {formik.touched.Name && formik.errors.Name && (
                <p className="text-sm text-red-500">
                  {formik.errors.Name}
                </p>
              )}
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="Enter your email"
              {...formik.getFieldProps("email")}
              className={formik.touched.email && formik.errors.email ? "border-red-500" : ""}
            />
            {formik.touched.email && formik.errors.email && (
              <p className="text-sm text-red-500">{formik.errors.email}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="phoneNumber">Contact Number</Label>
            <Input
              id="phoneNumber"
              type="tel"
              placeholder="Enter your contact number"
              {...formik.getFieldProps("phoneNumber")}
              className={formik.touched.phoneNumber && formik.errors.phoneNumber ? "border-red-500" : ""}
            />
            {formik.touched.phoneNumber && formik.errors.phoneNumber && (
              <p className="text-sm text-red-500">
                {formik.errors.phoneNumber}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="Create a password"
              {...formik.getFieldProps("password")}
              className={formik.touched.password && formik.errors.password ? "border-red-500" : ""}
            />
            {formik.touched.password && formik.errors.password && (
              <p className="text-sm text-red-500">{formik.errors.password}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <Input
              id="confirmPassword"
              type="password"
              placeholder="Confirm your password"
              {...formik.getFieldProps("confirmPassword")}
              className={formik.touched.confirmPassword && formik.errors.confirmPassword ? "border-red-500" : ""}
            />
            {formik.touched.confirmPassword &&
              formik.errors.confirmPassword && (
                <p className="text-sm text-red-500">
                  {formik.errors.confirmPassword}
                </p>
              )}
          </div>
          <Button type="submit" className="w-full">
            Sign Up
          </Button>
        </form>
      </CardContent>
      <CardFooter className="flex flex-col items-center">
        <p className="text-sm text-muted-foreground">
          Already have an account?{" "}
          <span
            onClick={setLogin}
            className="cursor-pointer text-primary hover:underline"
          >
            Log in
          </span>
        </p>
      </CardFooter>
      <OTPModal
        isOpen={isOTPModalOpen}
        onClose={handleCloseOTPModal}
        onVerify={handleVerifyOTP}
        onResend={handleSendOTP}
        isSending={isSending}
      />
    </Card>
  );
}