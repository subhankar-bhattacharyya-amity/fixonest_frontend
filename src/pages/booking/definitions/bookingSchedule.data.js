// The booking flow's days and time choices - all from the backend, nothing
// made up here.
// - Service bookings: the slots the super admin sets up (open hours, breaks,
//   slot length, gap between slots, "book at least" notice, "book up to"
//   days), from GET /api/v1/working-hours/arrival-windows.
// - Worker bookings: a start time every hour from opening time, each with how
//   many hours the worker is free from it, from
//   GET /api/v1/bookings/workers/:id/availability.
// A day is unavailable when the company is closed (weekly day off or holiday)
// and a time when it starts too soon (or, for a worker, doesn't leave room for
// the hours chosen). Which professionals are free in a window comes from the
// booking API.

// The steps of the booking flow, shown in the stepper.
export const BOOKING_STEPS = [
  { key: "schedule", label: "Date & time" },
  { key: "address", label: "Address" },
  { key: "review", label: "Review & pay" },
  { key: "done", label: "Confirmed" },
];

// The most hours the backend accepts for one worker booking (the real limit
// per start time comes from the worker's availability).
export const MAX_WORKER_HOURS = 24;

// A time goes in the group its start hour falls in.
export const SLOT_GROUPS = [
  { key: "morning", label: "Morning", fromHour: 0, toHour: 12 },
  { key: "afternoon", label: "Afternoon", fromHour: 12, toHour: 17 },
  { key: "evening", label: "Evening", fromHour: 17, toHour: 24 },
];

// 9.5 -> [9, 30]
const splitHour = (hour) => {
  const whole = Math.floor(hour);
  return [whole, Math.round((hour - whole) * 60)];
};

// 9 -> "09:00", 9.5 -> "09:30", the API's HH:mm 24-hour time.
export const toApiTime = (hour) => {
  const [whole, minutes] = splitHour(hour);
  return `${String(whole).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
};

// "2026-10-30" for a local date - used as the form value.
export const toDateKey = (date) => {
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
};

// 14 -> "2:00 PM", 14.5 -> "2:30 PM"
export const formatHour = (hour) => {
  const [whole, minutes] = splitHour(hour);
  const suffix = whole >= 12 && whole < 24 ? "PM" : "AM";
  const display = whole % 12 === 0 ? 12 : whole % 12;
  return `${display}:${String(minutes).padStart(2, "0")} ${suffix}`;
};

const weekdayShort = new Intl.DateTimeFormat("en-IN", { weekday: "short" });
const monthShort = new Intl.DateTimeFormat("en-IN", { month: "short" });
const monthYear = new Intl.DateTimeFormat("en-IN", { month: "long", year: "numeric" });
const dayLong = new Intl.DateTimeFormat("en-IN", { weekday: "short", day: "numeric", month: "short" });

export const formatWeekday = (date) => weekdayShort.format(date);
export const formatMonthShort = (date) => monthShort.format(date);
export const formatMonthYear = (date) => monthYear.format(date);
// "Thu, 30 Oct"
export const formatDayLong = (date) => dayLong.format(date);

// "10:00 AM – 12:00 PM"
export const formatSlotRange = (slot) => `${formatHour(slot.hour)} – ${formatHour(slot.endHour)}`;

// "Today" / "Tomorrow" / "Thu"
export const formatDayLabel = (day) => {
  if (day.dayOffset === 0) return "Today";
  if (day.dayOffset === 1) return "Tomorrow";
  return formatWeekday(day.date);
};

const startsTooSoon = (date, hour, now, leadHours) => {
  const [whole, minutes] = splitHour(hour);
  const start = new Date(date);
  start.setHours(whole, minutes, 0, 0);
  return start.getTime() - now.getTime() < leadHours * 3600000;
};

// Worker bookings - the day's start times from the backend: "open" when the
// worker is free for `hours` from it, otherwise "booked" (can't be picked:
// too soon, in a break, or it would run into closing time, a break, leave or
// another booking).
const buildWorkerSlots = (starts, hours) =>
  starts.map((start) => ({
    key: String(start.hour),
    hour: start.hour,
    endHour: start.hour + hours,
    availability: start.maxHours >= hours ? "open" : "booked",
  }));

// Service bookings - the day's slots from the backend, "booked" when one
// starts sooner than the admin's "book at least" notice.
const buildWindowSlots = (date, windows, now, leadHours) =>
  windows.map((window) => ({
    key: toApiTime(window.hour),
    hour: window.hour,
    endHour: window.endHour,
    availability: startsTooSoon(date, window.hour, now, leadHours) ? "booked" : "open",
  }));

// The bookable days, each with its slots. Pass one of:
// - `arrivalWindows` (the bookings slice's { byDate, dayCount, leadHours }) for
//   a service booking;
// - `workerSchedule` (the bookings slice's workerAvailability: { byDate,
//   dayCount }) for a worker booking, where `hours` is how long they're booked.
// The days, their slots and closed state all come from the API: until it has
// loaded there are no days at all.
export const buildBookingDays = (hours = 1, now = new Date(), { arrivalWindows = null, workerSchedule = null } = {}) =>
  Array.from({ length: (arrivalWindows ?? workerSchedule)?.dayCount ?? 0 }, (_, dayOffset) => {
    const date = new Date(now);
    date.setHours(0, 0, 0, 0);
    date.setDate(date.getDate() + dayOffset);
    const key = toDateKey(date);
    const entry = (arrivalWindows ?? workerSchedule).byDate[key];
    const closedReason = entry?.closedReason ?? null;
    let slots = [];
    if (entry && !closedReason) {
      slots = arrivalWindows
        ? buildWindowSlots(date, entry.windows, now, arrivalWindows.leadHours)
        : buildWorkerSlots(entry.starts, hours);
    }
    const openCount = slots.filter((slot) => slot.availability !== "booked").length;
    return {
      key,
      date,
      dayOffset,
      slots,
      openCount,
      isAvailable: openCount > 0,
      closedReason,
    };
  });

// What the summary card promises (dummy copy until the policies are final).
export const BOOKING_TRUST_POINTS = [
  { key: "verified", title: "Verified professionals", text: "Background-checked and trained" },
  { key: "pricing", title: "Upfront pricing", text: "No hidden charges, ever" },
  { key: "reschedule", title: "Free rescheduling", text: "Up to 2 hours before the visit" },
];

export const CASH_ON_DELIVERY = {
  title: "Cash on delivery",
  text: "Pay the professional after the job is done. No advance payment needed.",
};
