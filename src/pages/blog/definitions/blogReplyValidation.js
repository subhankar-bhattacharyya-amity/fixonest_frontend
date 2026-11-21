// Inline reply / edit form validation for BlogReplyForm.jsx - just the text;
// the author is the logged-in customer. Max length matches the backend's limit.
import { z } from "zod";
import { COMMENT_MAX_LENGTH } from "@/features/blog/index.js";

export const blogReplyValidationSchema = z.object({
  message: z
    .string()
    .trim()
    .min(1, "Text is required")
    .min(2, "Text must be at least 2 characters")
    .max(COMMENT_MAX_LENGTH, `Text must be at most ${COMMENT_MAX_LENGTH} characters`),
});
