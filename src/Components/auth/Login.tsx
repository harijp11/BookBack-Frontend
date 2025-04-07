import { useFormik } from "formik";
import { Button } from "@/Components/ui/button";
import { Input } from "@/Components/ui/input";
import { Label } from "@/Components/ui/label";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/Components/ui/card";
// import { loginSchema } from "@/utils/login.validator";
import { useNavigate } from "react-router-dom";

type UserType = "admin" | "user" 

interface LoginProps {
  userType: UserType;
  onSubmit: (data: { email: string; password: string }) => void;
  setSignup?: () => void;
}

export function Login({ userType, onSubmit, setSignup }: LoginProps) {
  const navigate = useNavigate();
  
  const formik = useFormik({
    initialValues: {
      email: "",
      password: "",
    },
    // validationSchema: loginSchema,
    onSubmit: (values, actions) => {
      onSubmit({ email: values.email, password: values.password });
      actions.resetForm({
        values: {
          email: "",
          password: "",
        },
      });
    },
  });

  const handleForgotPasswordRedirection = () => {
    switch (userType) {
      case "admin":
        navigate("/forgot-password/admin");
        break;
      default:
        navigate("/forgot-password/user");
        break;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Login as {userType}</CardTitle>
        <CardDescription>
          Enter your credentials to access your account
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={formik.handleSubmit}>
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                {...formik.getFieldProps("email")}
              />
              {formik.touched.email && formik.errors.email && (
                <p className="text-sm text-red-500">{formik.errors.email}</p>
              )}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                {...formik.getFieldProps("password")}
              />
              {formik.touched.password && formik.errors.password && (
                <p className="text-sm text-red-500">{formik.errors.password}</p>
              )}
            </div>
            <Button type="submit" className="w-full">Login</Button>
            <Button 
              type="button" 
              variant="link" 
              className="px-0 text-sm text-right"
              onClick={handleForgotPasswordRedirection}
            >
              Forgot password?
            </Button>
          </div>
        </form>
      </CardContent>
      <CardFooter>
        {userType !== "admin" && (
          <div className="text-sm text-center w-full">
            Don't have an account?{" "}
            <Button variant="link" className="p-0" onClick={setSignup}>
              Sign up
            </Button>
          </div>
        )}
      </CardFooter>
    </Card>
  );
}