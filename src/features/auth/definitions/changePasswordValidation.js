// Mirrors backend/app/modules/auth/validator/auth.validator.js's
// changePasswordSchema. confirmNewPassword only exists client-side (the
// backend never sees it) to catch typos before submitting.
import { z } from "zod";

export const changePasswordValidationSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
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
