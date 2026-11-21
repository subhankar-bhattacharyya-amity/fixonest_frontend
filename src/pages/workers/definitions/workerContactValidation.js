// "Get In Touch" form validation for WorkerDetailsContactSection.jsx — same
// shape as pages/contact's contactFormValidationSchema, plus a phone field
// (using the same regex as registerValidation.js/updateProfileValidation.js).
import { z } from "zod";

export const workerContactValidationSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(1, "Full name is required")
    .min(2, "Name must be at least 2 characters")
    .max(120, "Name must be at most 120 characters"),
  email: z.string().trim().toLowerCase().min(1, "Email is required").email("Enter a valid email address"),
  phone: z
    .string()
    .trim()
    .min(1, "Phone number is required")
    .regex(/^\+?[1-9]\d{6,14}$/, "Enter a valid phone number (7-15 digits, optional leading +)"),
  subject: z.string().trim().min(1, "Subject is required").max(150, "Subject must be at most 150 characters"),
  message: z
    .string()
    .trim()
    .min(1, "Message is required")
    .min(10, "Message must be at least 10 characters")
    .max(2000, "Message must be at most 2000 characters"),
});
