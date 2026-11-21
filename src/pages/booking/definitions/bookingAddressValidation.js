// "Address" step validation for BookingAddressSection.jsx.
import { z } from "zod";
import { phoneSchema } from "@/utils/phone.js";
import { MAX_INSTRUCTIONS_LENGTH } from "./bookingAddress.data.js";

// The step itself: which address, who to contact, and optional notes.
export const bookingAddressValidationSchema = z.object({
  addressId: z.string().min(1, "Choose an address or add a new one"),
  contactName: z
    .string()
    .trim()
    .min(1, "Contact name is required")
    .min(2, "Name must be at least 2 characters")
    .max(80, "Name must be at most 80 characters"),
  contactPhone: phoneSchema,
  instructions: z
    .string()
    .trim()
    .max(MAX_INSTRUCTIONS_LENGTH, `Keep it under ${MAX_INSTRUCTIONS_LENGTH} characters`),
});
