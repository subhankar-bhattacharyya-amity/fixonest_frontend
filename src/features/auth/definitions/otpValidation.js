// Mirrors backend/app/modules/auth/validator/auth.validator.js's
// verifyOtpSchema (4-digit code) and resendOtpSchema (email only).
import { z } from "zod";

export const OTP_LENGTH = 4;

// Mirrors backend appConfig.security.otpResendCooldownSeconds. Only a
// fallback for when the backend hasn't told us resendAvailableAt yet.
export const OTP_RESEND_COOLDOWN_SECONDS = 60;

// Login rejects an unverified customer with this marker in `errors`
// (backend MESSAGES.AUTH.OTP.EMAIL_NOT_VERIFIED_CODE).
export const EMAIL_NOT_VERIFIED_CODE = "EMAIL_NOT_VERIFIED";

export const otpValidationSchema = z.object({
  otp: z.string().regex(new RegExp(`^\\d{${OTP_LENGTH}}$`), `Enter the ${OTP_LENGTH}-digit code`),
});

export const otpEmailValidationSchema = z.object({
  email: z.string().trim().toLowerCase().min(1, "Email is required").email("Enter a valid email address"),
});
