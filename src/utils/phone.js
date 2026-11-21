// Shared phone rule for forms that use components/common/form/PhoneField.jsx.
// Same rule as fixonest_admin/src/utils/phone.js.
import { z } from "zod";
import { isValidPhoneNumber } from "react-phone-number-input/mobile";

// E.164 from the country-code dropdown (e.g. "+919876543210"), checked
// against the chosen country's mobile-number rules - India must be 10 digits
// starting 6-9, and so on. A valid value always also matches the backend's
// 7-15 digit rule.
export const phoneSchema = z
  .string()
  .trim()
  .min(1, "Phone number is required")
  .refine((value) => isValidPhoneNumber(value), "Enter a valid phone number for the selected country");
