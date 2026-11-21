// "Date & time" step validation for BookingScheduleSection.jsx.
import { z } from "zod";
import { MAX_WORKER_HOURS } from "./bookingSchedule.data.js";

export const bookingScheduleValidationSchema = z.object({
  date: z.string().min(1, "Pick a date"),
  slot: z.string().min(1, "Pick a time slot"),
  hours: z.number().int().min(1).max(MAX_WORKER_HOURS),
});
