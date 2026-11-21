// The edit form always shows both fields pre-filled with the current
// profile values (never blank-to-skip), so both are required here — same
// rules as registerValidation.js's fullName/phone. The backend's
// updateProfileSchema accepts a partial body (at least one field), but this
// form always sends both, so that flexibility never needs to surface here.
import { z } from "zod";

export const updateProfileValidationSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(1, "Full name is required")
    .min(2, "Name must be at least 2 characters")
    .max(120, "Name must be at most 120 characters"),
  phone: z
    .string()
    .trim()
    .min(1, "Phone number is required")
    .regex(/^\+?[1-9]\d{6,14}$/, "Enter a valid phone number (7-15 digits, optional leading +)"),
});
