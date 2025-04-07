// src/utils/signup.validator.ts
import { z } from "zod";

const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
const PHONE_REGEX = /^[6789]\d{9}$/; // Ensures the number starts with 6, 7, 8, or 9 and has exactly 10 digits
const NAME_REGEX = /^[A-Za-z]{3,50}$/; // Only alphabets, min 3 and max 50 characters

export const signupSchema = z.object({
  Name: z
    .string()
    .trim()
    .regex(NAME_REGEX, "Name must contain only alphabets (A-Z, a-z) with at least 3 letters")
    .min(3, "Name must be at least 3 characters")
    .max(50, "Name must be less than 50 characters"),
  
  email: z
    .string()
    .trim()
    .email("Please enter a valid email address")
    .min(5, "Email must be at least 5 characters")
    .max(100, "Email must be less than 100 characters"),
  
  phoneNumber: z
    .string()
    .trim()
    .regex(PHONE_REGEX, "Phone number must start with 6, 7, 8, or 9 and be exactly 10 digits long")
    .refine((value) => (value.match(/0/g) || []).length <= 3, {
      message: "Phone number can contain at most 3 zeros",
    }),
  
  password: z
    .string()
    .trim()
    .min(8, "Password must be at least 8 characters")
    .max(64, "Password must be less than 64 characters")
    .regex(
      PASSWORD_REGEX,
      "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character"
    ),
  
  confirmPassword: z
    .string()
    .trim()
    .min(8, "Password confirmation required"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

// Type inference from the schema
export type SignupFormValues = z.infer<typeof signupSchema>;

// This is for if you want to use Formik with Zod
import { toFormikValidationSchema } from 'zod-formik-adapter';

export const formikSignupSchema = toFormikValidationSchema(signupSchema);
