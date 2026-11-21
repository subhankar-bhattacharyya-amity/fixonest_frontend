// "Write a Comment" form validation for BlogCommentForm.jsx. Only the
// comment text is sent - the author is the logged-in customer, taken from
// the login token by the backend. Max length matches the backend's limit.
import { z } from "zod";
import { COMMENT_MAX_LENGTH } from "@/features/blog/index.js";

export const blogCommentValidationSchema = z.object({
  message: z
    .string()
    .trim()
    .min(1, "Comment is required")
    .min(2, "Comment must be at least 2 characters")
    .max(COMMENT_MAX_LENGTH, `Comment must be at most ${COMMENT_MAX_LENGTH} characters`),
  agreeToTerms: z.literal(true, { message: "You must agree to the terms & conditions" }),
});
