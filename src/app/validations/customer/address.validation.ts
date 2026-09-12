import { z } from "zod";

export const ADDRESS_LABELS = ["HOME", "OFFICE", "OTHER"] as const;

export const INDIAN_STATES = [
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chhattisgarh",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
  "Andaman and Nicobar Islands",
  "Chandigarh",
  "Dadra and Nagar Haveli and Daman and Diu",
  "Delhi",
  "Jammu and Kashmir",
  "Ladakh",
  "Lakshadweep",
  "Puducherry",
] as const;

export const addressSchema = z.object({
  label: z.enum(ADDRESS_LABELS, {
    error: "Please select an address type",
  }),

  firstName: z
    .string({ error: "First name is required" })
    .trim()
    .min(2, "First name must be at least 2 characters")
    .max(50, "First name cannot exceed 50 characters"),

  lastName: z
    .string()
    .trim()
    .max(50, "Last name cannot exceed 50 characters")
    .optional(),

  phone: z
    .string({ error: "Mobile number is required" })
    .trim()
    .regex(/^[6-9]\d{9}$/, "Enter a valid 10 digit mobile number"),

  addressLine1: z
    .string({ error: "Flat, house no. or building is required" })
    .trim()
    .min(3, "Flat, house no. or building is required")
    .max(150, "Flat, house no. or building cannot exceed 150 characters"),

  addressLine2: z
    .string({ error: "Area, street or village is required" })
    .trim()
    .min(3, "Area, street or village is required")
    .max(150, "Area, street or village cannot exceed 150 characters"),

  landmark: z
    .string()
    .trim()
    .max(150, "Landmark cannot exceed 150 characters")
    .optional(),

  postalCode: z
    .string({ error: "Pincode is required" })
    .trim()
    .regex(/^[1-9][0-9]{5}$/, "Enter a valid 6 digit pincode"),

  city: z
    .string({ error: "Town or city is required" })
    .trim()
    .min(2, "Town or city is required")
    .max(100, "Town or city cannot exceed 100 characters"),

  state: z.enum(INDIAN_STATES, {
    error: "Please select a state",
  }),

  country: z.literal("India", {
    error: "We currently deliver only within India",
  }),
});

export type AddressFormData = z.infer<typeof addressSchema>;
