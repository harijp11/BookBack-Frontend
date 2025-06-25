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
    .optional()
    .refine((val) => val === undefined || val >= 0, {
      message: "Rent amount must be a non-negative number",
    }),
  description: z
    .string()
    .trim()
    .min(10, { message: "Description must be at least 10 characters" }),
  maxRentalPeriod: z.coerce
    .number()
    .optional()
    .refine((val) => val === undefined || val >= 0, {
      message: "Max rental period must be a non-negative number",
    }),
  locationName: z
    .string()
    .trim()
    .min(1, { message: "Location name is required" }),
  latitude: z.coerce.number().min(-90).max(90),
  longitude: z.coerce.number().min(-180).max(180),
  latitude2: z.coerce.number().min(-90).max(90).optional(),
  longitude2: z.coerce.number().min(-180).max(180).optional(),
  numberOfPages: z.coerce
    .number()
    .positive({ message: "Number of pages must be positive" }),
  avgReadingTimeDuration: z.coerce
    .number()
    .positive({ message: "Reading time duration must be positive" }),
  avgReadingTimeUnit: z.enum(["hours", "days", "months", "years"], {
    errorMap: () => ({ message: "Please select a valid time unit" }),
  }),
}).superRefine((data, ctx) => {

  if (data.rentAmount !== undefined && data.rentAmount > data.originalAmount) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Rent amount must not exceed original amount",
      path: ["rentAmount"],
    });
  }
});