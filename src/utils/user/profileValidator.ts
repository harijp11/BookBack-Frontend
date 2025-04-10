// src/validations/formValidation.ts
import { z } from "zod";

const PHONE_REGEX = /^[6789]\d{9}$/; 
// const NAME_REGEX = /^[A-Za-z]{3,50}$/;

export const profileValidationSchema = z.object({
  Name: z.string()
    .trim() 
    .min(2, "Name must be at least 2 characters")
    .max(50, "Name cannot exceed 50 characters")
    .refine(name => /^[a-zA-Z\s]+$/.test(name), "Name can only contain letters and spaces"),
  
 phoneNumber: z
     .string()
     .trim()
     .regex(PHONE_REGEX, "Phone number must start with 6, 7, 8, or 9 and be exactly 10 digits long")
     .refine((value) => (value.match(/0/g) || []).length <= 3, {
       message: "Phone number can contain at most 3 zeros",
     }),
  
  profileImage: z.string().optional().or(z.literal("")),
});


export const passwordValidationSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number"),
  confirmPassword: z.string().min(1, "Please confirm your password"),
}).refine(data => data.newPassword === data.confirmPassword, {
  message: "New password do not match to Confirm password",
  path: ["confirmPassword"]
})
.refine(data => data.newPassword !== data.currentPassword, {
  message: "New password must be different from the current password",
  path: ["newPassword"],
});


export type ProfileFormData = z.infer<typeof profileValidationSchema>;

export type PasswordFormData = z.infer<typeof passwordValidationSchema>;


export const validateForm = <T>(schema: z.ZodType<T>, data: T): { 
  isValid: boolean; 
  errorMessage: string | null;
} => {
  const result = schema.safeParse(data);
  
  if (!result.success) {
    return {
      isValid: false,
      errorMessage: result.error.errors[0].message
    };
  }
  
  return {
    isValid: true,
    errorMessage: null
  };
};


export const validateProfileForm = (data: ProfileFormData) => {
  return validateForm(profileValidationSchema, data);
};


export const validatePasswordForm = (data: PasswordFormData) => {
  return validateForm(passwordValidationSchema, data);
};