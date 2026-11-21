// Mirrors backend/app/modules/auth/validator/auth.validator.js's
// resetPasswordSchema (newPassword rules). confirmNewPassword only exists
// client-side (the backend never sees it) to catch typos before submitting.
// The email and OTP steps reuse otpEmailValidationSchema/otpValidationSchema.
import { z } from "zod";

export const resetPasswordValidationSchema = z
  .object({
    newPassword: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .max(128, "Password must be at most 128 characters")
      .regex(/^(?=.*[A-Za-z])(?=.*\d).+$/, "Password must contain at least one letter and one number"),
    confirmNewPassword: z.string().min(1, "Please confirm your new password"),
  })
  .refine((values) => values.newPassword === values.confirmNewPassword, {
    message: "Passwords do not match",
    path: ["confirmNewPassword"],
  });

// Checklist shown under the new-password field. The first two are what the
// backend requires; the rest only make the strength meter climb.
export const PASSWORD_RULES = [
  { id: "length", label: "At least 8 characters", test: (value) => value.length >= 8, required: true },
  { id: "mix", label: "A letter and a number", test: (value) => /[A-Za-z]/.test(value) && /\d/.test(value), required: true },
  { id: "case", label: "Upper and lower case", test: (value) => /[a-z]/.test(value) && /[A-Z]/.test(value) },
  { id: "symbol", label: "A symbol (e.g. ! @ #)", test: (value) => /[^A-Za-z0-9]/.test(value) },
];
