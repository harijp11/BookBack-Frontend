// src/validation/bookFormSchema.ts
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
    .min(2, { message: "Book name must be at least 2 characters" }),
  categoryId: z.string().min(1, { message: "Category is required" }),
  dealTypeId: z.string().min(1, { message: "Deal type is required" }),
  originalAmount: z.coerce
    .number()
    .positive({ message: "Original amount must be positive" }),
  rentAmount: z.coerce
    .number()
    .positive({ message: "Rent amount must be positive" }),
  description: z
    .string()
    .min(10, { message: "Description must be at least 10 characters" }),
  maxRentalPeriod: z.coerce
    .number()
    .int()
    .positive({ message: "Rental period must be a positive number of days" }),
  locationName: z.string().min(1, { message: "Location name is required" }),
  latitude: z.coerce.number().min(-90).max(90),
  longitude: z.coerce.number().min(-180).max(180),
  latitude2: z.coerce.number().min(-90).max(90).optional(),
  longitude2: z.coerce.number().min(-180).max(180).optional(),
});