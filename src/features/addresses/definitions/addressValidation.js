import { z } from "zod";
import { ADDRESS_TYPES } from "./addresses.js";

// The add / edit address form (components/AddressFormModal.jsx). Fields
// match the backend address (router/customer/user.routes.js): companyName
// is optional and only shown for Work.
export const addressValidationSchema = z.object({
  label: z.enum(ADDRESS_TYPES, { error: "Choose an address type" }),
  companyName: z.string().trim().max(100, "Keep it under 100 characters"),
  road: z
    .string()
    .trim()
    .min(1, "Address is required")
    .min(3, "Enter at least 3 characters")
    .max(200, "Keep it under 200 characters"),
  city: z.string().trim().min(1, "City is required").min(2, "Enter a valid city").max(60, "Keep it under 60 characters"),
  state: z.string().trim().min(1, "State is required").min(2, "Enter a valid state").max(60, "Keep it under 60 characters"),
  pincode: z
    .string()
    .trim()
    .min(1, "Pincode is required")
    .regex(/^[1-9]\d{5}$/, "Enter a valid 6-digit pincode"),
  isDefault: z.boolean(),
});
