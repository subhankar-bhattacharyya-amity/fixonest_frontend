// Contact form validation — page-specific, not auth-domain, so it's
// colocated here rather than in features/auth/definitions/. Built with
// Zod, matching this project's established validation convention. The length
// limits mirror fixonest_backend's contact.validator.js createContactSchema.
import { z } from "zod";

export const contactFormValidationSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(1, "Full name is required")
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must be at most 100 characters"),
  email: z
    .string()
    .trim()
    .toLowerCase()
    .min(1, "Email is required")
    .email("Enter a valid email address")
    .max(100, "Email must be at most 100 characters"),
  subject: z.string().trim().min(1, "Subject is required").max(150, "Subject must be at most 150 characters"),
  message: z
    .string()
    .trim()
    .min(1, "Message is required")
    .min(10, "Message must be at least 10 characters")
    .max(2000, "Message must be at most 2000 characters"),
});
