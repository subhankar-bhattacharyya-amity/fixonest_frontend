import { BOOKING_STATUS, getBookingStart } from "@/features/bookings/index.js";

export const BOOKING_TABS = [
  { key: "all", label: "All Bookings" },
  { key: "pending", label: "Awaiting Confirmation" },
  { key: "confirmed", label: "Confirmed" },
  { key: "completed", label: "Completed" },
  { key: "cancelled", label: "Cancelled" },
];

export const DEFAULT_TAB = "all";

// Progress of an upcoming booking (record.stage = the backend status).
export const BOOKING_STAGES = [
  { key: "pending", label: "Booked" },
  { key: "confirmed", label: "Confirmed" },
  { key: "in_progress", label: "In progress" },
  { key: "done", label: "Completed" },
];

export const EMPTY_STATES = {
  all: {
    title: "No bookings found",
    text: "Book a service or hire a professional to get started.",
  },
  pending: {
    title: "No bookings awaiting confirmation",
    text: "You don't have any requests currently waiting for provider acceptance.",
  },
  confirmed: {
    title: "No confirmed upcoming bookings",
    text: "Accepted visits and scheduled professionals will appear here.",
  },
  [BOOKING_STATUS.UPCOMING]: {
    title: "No upcoming bookings",
    text: "Book a service or a professional and it will show up here.",
  },
  [BOOKING_STATUS.COMPLETED]: {
    title: "No completed bookings yet",
    text: "Finished jobs appear here so you can rate them or book again.",
  },
  [BOOKING_STATUS.CANCELLED]: {
    title: "No cancelled bookings",
    text: "Good news - you haven't cancelled or had any declined bookings.",
  },
};

const dayLong = new Intl.DateTimeFormat("en-IN", { weekday: "short", day: "numeric", month: "short", year: "numeric" });

// "Thu, 30 Oct 2026"
export const formatBookingDate = (booking) => dayLong.format(getBookingStart(booking));

// 14 -> "2:00 PM", 14.5 -> "2:30 PM"
const formatHour = (hour) => {
  const whole = Math.floor(hour);
  const minutes = Math.round((hour - whole) * 60);
  const suffix = whole >= 12 && whole < 24 ? "PM" : "AM";
  const display = whole % 12 === 0 ? 12 : whole % 12;
  return `${display}:${String(minutes).padStart(2, "0")} ${suffix}`;
};

// "10:00 AM – 11:00 AM"
export const formatBookingTime = (booking) => `${formatHour(booking.startHour)} – ${formatHour(booking.endHour)}`;

const dateTimeShort = new Intl.DateTimeFormat("en-IN", {
  day: "numeric",
  month: "short",
  year: "numeric",
  hour: "numeric",
  minute: "2-digit",
});

// ISO timestamp -> "7 Nov 2026, 11:41 pm". Empty when missing.
export const formatTimestamp = (value) => (value ? dateTimeShort.format(new Date(value)) : "");

// 90 -> "1 hr 30 min", 60 -> "1 hr". Empty when unknown.
export const formatDurationMinutes = (minutes) => {
  const total = Math.round(Number(minutes) || 0);
  if (total <= 0) return "";
  const hours = Math.floor(total / 60);
  const rest = total % 60;
  if (!hours) return `${rest} min`;
  return rest ? `${hours} hr ${rest} min` : `${hours} hr${hours > 1 ? "s" : ""}`;
};

// The booking's payment status (backend PAYMENT_STATUS) in words.
export const getPaymentStatusLabel = (paymentStatus, isCompleted) => {
  if (paymentStatus === "paid") return "Paid";
  if (paymentStatus === "failed") return "Payment failed";
  if (paymentStatus === "pending") return "Payment pending";
  return isCompleted ? "Paid in cash" : "Pay in cash after the job";
};

// 1499 -> "₹1,499"
export const formatRupees = (value) => `₹${Math.round(Number(value) || 0).toLocaleString("en-IN")}`;

export const formatAddress = (address) =>
  [
    address.houseNo,
    address.area,
    address.landmark,
    address.city,
    [address.state, address.pincode].filter(Boolean).join(" "),
  ]
    .filter(Boolean)
    .join(", ");

// "Today" / "Tomorrow" / "In 5 days" / "In 3 hrs" for an upcoming confirmed booking.
// Returns null if the scheduled time has already passed or is not upcoming.
export const formatCountdown = (booking, now = new Date()) => {
  const start = getBookingStart(booking);
  const hoursLeft = (start.getTime() - now.getTime()) / 3600000;
  if (hoursLeft <= 0) return null;
  if (hoursLeft < 12) return `In ${Math.max(1, Math.round(hoursLeft))} hr${Math.round(hoursLeft) > 1 ? "s" : ""}`;
  const today = new Date(now);
  today.setHours(0, 0, 0, 0);
  const day = new Date(start);
  day.setHours(0, 0, 0, 0);
  const days = Math.round((day.getTime() - today.getTime()) / 86400000);
  if (days === 0) return "Today";
  if (days === 1) return "Tomorrow";
  return `In ${days} days`;
};

// Confirmed and pending soonest first; all others / past bookings most recent first.
export const sortBookings = (bookings, tab) =>
  [...bookings].sort((a, b) => {
    const diff = getBookingStart(a).getTime() - getBookingStart(b).getTime();
    return tab === "confirmed" || tab === "pending" || tab === BOOKING_STATUS.UPCOMING ? diff : -diff;
  });

export const matchesQuery = (booking, query) => {
  const text = query.trim().toLowerCase();
  if (!text) return true;
  return [
    booking.title,
    booking.subtitle,
    booking.id,
    booking.professional?.name,
    booking.worker?.name,
    booking.address?.label,
    booking.address?.city,
  ]
    .filter(Boolean)
    .some((value) => value.toLowerCase().includes(text));
};
