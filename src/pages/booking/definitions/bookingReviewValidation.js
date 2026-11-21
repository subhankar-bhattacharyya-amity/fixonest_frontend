// "Review & pay" step validation for BookingReviewSection.jsx. Cash on
// delivery is the only payment method for now.
import { z } from "zod";

export const PAYMENT_METHODS = { COD: "cod" };

export const bookingReviewValidationSchema = z.object({
  paymentMethod: z.enum([PAYMENT_METHODS.COD]),
  acceptTerms: z.boolean().refine((value) => value, "Please accept the booking terms to continue"),
});
