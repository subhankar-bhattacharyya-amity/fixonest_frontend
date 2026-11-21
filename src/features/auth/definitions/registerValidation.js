// Registration is auth domain knowledge, same reasoning as loginValidation.js
// — built with Zod. Mirrors backend/app/modules/auth/validator/auth.validator.js's
// registerSchema exactly (field names included — fullName, not name) so a
// value that passes here never gets rejected by the server's own Joi schema.
import { z } from "zod";
import { phoneSchema } from "@/utils/phone.js";

export const registerValidationSchema = z
  .object({
    fullName: z
      .string()
      .trim()
      .min(1, "Full name is required")
      .min(2, "Name must be at least 2 characters")
      .max(120, "Name must be at most 120 characters"),
    email: z.string().trim().toLowerCase().min(1, "Email is required").email("Enter a valid email address"),
    // Country-code dropdown value, e.g. "+919876543210" - see utils/phone.js.
    phone: phoneSchema,
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .max(128, "Password must be at most 128 characters")
      .regex(/^(?=.*[A-Za-z])(?=.*\d).+$/, "Password must contain at least one letter and one number"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((values) => values.password === values.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });
