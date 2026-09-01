import { z } from "zod";

export const ADDRESS_LABELS = ["HOME", "OFFICE", "OTHER"] as const;

export const addressSchema = z.object({
  label: z.enum(ADDRESS_LABELS, {
    message: "Please select an address type",
  }),

  firstName: z
    .string()
    .trim()
    .min(2, "First name must be at least 2 characters")
    .max(50, "First name cannot exceed 50 characters"),

  lastName: z
    .string()
    .trim()
    .max(50, "Last name cannot exceed 50 characters")
    .optional(),

  phone: z
    .string()
    .trim()
    .regex(/^[6-9]\d{9}$/, "Invalid phone number"),

  addressLine1: z
    .string()
    .trim()
    .min(5, "Address line 1 must be at least 5 characters")
    .max(200, "Address line 1 cannot exceed 200 characters"),

  addressLine2: z
    .string()
    .trim()
    .max(200, "Address line 2 cannot exceed 200 characters")
    .optional(),

  city: z
    .string()
    .trim()
    .min(2, "City must be at least 2 characters")
    .max(100, "City cannot exceed 100 characters"),

  state: z
    .string()
    .trim()
    .min(2, "State must be at least 2 characters")
    .max(100, "State cannot exceed 100 characters"),

  postalCode: z
    .string()
    .trim()
    .regex(/^\d{6}$/, "Postal code must contain exactly 6 digits"),

  country: z
    .string()
    .trim()
    .min(2, "Country must be at least 2 characters")
    .max(100, "Country cannot exceed 100 characters"),
});

export type AddressFormData = z.infer<typeof addressSchema>;
