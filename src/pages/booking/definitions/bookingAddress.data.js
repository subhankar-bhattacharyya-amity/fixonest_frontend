// Static bits of the booking flow's "Address" step. Saved addresses and
// their formatters live in the addresses feature (@/features/addresses).

// Tap to add to the instructions box.
export const INSTRUCTION_SUGGESTIONS = [
  "Please call before arriving",
  "Parking available inside",
  "Pets at home",
  "Ring the bell twice",
  "Lift not available",
];

export const MAX_INSTRUCTIONS_LENGTH = 500;

// The logged-in user's phone as E.164 for PhoneField. Older accounts store
// the number without its country code.
export const toE164Phone = (user) => {
  const phone = user?.phone?.trim();
  if (!phone) return "";
  if (phone.startsWith("+")) return phone;
  return `${user.country_code || "+91"}${phone.replace(/\D/g, "")}`;
};
