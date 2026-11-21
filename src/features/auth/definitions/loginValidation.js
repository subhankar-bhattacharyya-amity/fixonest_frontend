// Which rules apply to the login form is auth domain knowledge, so the
// schema lives here (not in pages/auth/login/definitions/) — built with Zod.
// Mirrors backend/app/modules/auth/validator/auth.validator.js's loginSchema:
// login only requires a non-empty password (no length/format policy — an
// account's password may predate today's registration policy), unlike
// registerValidation.js's password rule.
import { z } from "zod";

export const loginValidationSchema = z.object({
  email: z.string().trim().toLowerCase().min(1, "Email is required").email("Enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});
