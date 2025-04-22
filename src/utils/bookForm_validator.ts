import { z } from "zod";

export interface Category {
  _id: string;
  name: string;
  description: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface DealType {
  _id: string;
  name: string;
  description: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export const formSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, { message: "Book name must be at least 2 characters" }),
  categoryId: z.string().min(1, { message: "Category is required" }),
  dealTypeId: z.string().min(1, { message: "Deal type is required" }),
  originalAmount: z.coerce
    .number()
    .positive({ message: "Original amount must be positive" }),
  rentAmount: z.coerce
    .number()
    .optional(),
  description: z
    .string()
    .trim()
    .min(10, { message: "Description must be at least 10 characters" }),
  maxRentalPeriod: z.coerce
    .number()
    .optional(),
  locationName: z
    .string()
    .trim()
    .min(1, { message: "Location name is required" }),
  latitude: z.coerce.number().min(-90).max(90),
  longitude: z.coerce.number().min(-180).max(180),
  latitude2: z.coerce.number().min(-90).max(90).optional(),
  longitude2: z.coerce.number().min(-180).max(180).optional(),
}).superRefine((data, ctx) => {
  // Define deal types that require rent validation
  const rentRequiredDealTypeNames = ["For Rent Only", "For Rent And Sale"];

  const requiresRentValidation = rentRequiredDealTypeNames.some(name => 
    data.dealTypeId === name 
  );

  if (requiresRentValidation) {
    // Validate rentAmount
    if (data.rentAmount === undefined || data.rentAmount <= 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Rent amount must be a positive number",
        path: ["rentAmount"],
      });
    } else if (data.rentAmount > data.originalAmount) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Rent amount must not exceed original amount",
        path: ["rentAmount"],
      });
    }

    // Validate maxRentalPeriod
    if (data.maxRentalPeriod === undefined || data.maxRentalPeriod <= 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Max rental period must be a positive number of days",
        path: ["maxRentalPeriod"],
      });
    }
  }
});