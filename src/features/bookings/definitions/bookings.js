// The customer's bookings, from GET /api/v1/bookings/my-bookings, turned
// into the record below by toMyBookingRecord.
//
// A booking record (kept serializable for Redux - dates are strings):
// {
//   id (booking number), apiId (Mongo _id),
//   kind: "service" | "worker" (backend bookingType "hourly"),
//   status: "upcoming" | "completed" | "cancelled",
//   apiStatus: the backend status (booking.model.js BOOKING_STATUS) or null,
//   stage: "pending" | "confirmed" | "in_progress" (upcoming only),
//   title, subtitle, image, hasCover, icon (category key when there's no image),
//   worker: { name, initials, avatar } | null,
//   professional: { name, phone } | null,   // who was assigned
//   rebookPath,                              // "Book again" link, null -> listing
//   date: "2026-10-30", startHour, endHour, hours,
//   address: { label, houseNo, area, landmark, city, state, pincode },
//   contact: { name, phone }, instructions,
//   total, paymentMethod: "cod",
//   cancelReason, createdAt,
//   details (the "View details" panel):
//     { verticalName, durationMinutes, price, discountPrice, paymentStatus,
//       professional: { name, initials, avatar, phone, email } | null,
//       timeline: { bookedAt, acceptedAt, completedAt, cancelledAt, rejectedAt } (ISO strings or null) }
// }
import { formatPhoneNumberIntl } from "react-phone-number-input/mobile";
import { toWorker } from "@/features/workers/index.js";
import { buildServiceImageUrl } from "@/features/services/index.js";
import {
  getServiceBookingPath,
  getWorkerBookingPath,
} from "@/routes/constants.js";

// backend/app/router/customer/booking.routes.js (customer base path "/api").
// POST and my-bookings need a logged-in customer.
export const BOOKINGS_API_PATH = "/api/v1/bookings";
export const MY_BOOKINGS_API_PATH = `${BOOKINGS_API_PATH}/my-bookings`;
// Upcoming / completed / cancelled counts and cash paid (hero cards, tabs).
export const MY_BOOKINGS_STATISTICS_API_PATH = `${MY_BOOKINGS_API_PATH}/statistics`;
// One of the customer's bookings (404/403 if it isn't theirs).
export const getMyBookingApiPath = (id) =>
  `${MY_BOOKINGS_API_PATH}/${encodeURIComponent(id)}`;
// PATCH - cancel one of the customer's pending / accepted bookings.
export const getCancelBookingApiPath = (id) =>
  `${getMyBookingApiPath(id)}/cancel`;

// The statistics response as the numbers My bookings shows.
export const toBookingStatistics = (data) => ({
  upcoming: Number(data?.upcoming) || 0,
  completed: Number(data?.completed) || 0,
  cancelled: Number(data?.cancelled) || 0,
  paidInCash: Number(data?.paidInCash) || 0,
});
// The backend's largest page (config pagination.maxPerPage). The list loads
// every page so the tab counts and search cover all bookings.
export const MY_BOOKINGS_PAGE_SIZE = 100;
// backend/app/router/customer/provider_availability.routes.js - public. The
// providers of a service free in one time slot (not on leave, no overlapping
// booking), paged, best rated first.
export const SLOT_PROVIDERS_API_PATH =
  "/api/v1/provider-availability/available-providers";
// Everyone free in a slot fits on one page.
export const SLOT_PROVIDERS_PAGE_SIZE = 50;
// backend/app/router/customer/working_hours.routes.js - public. arrival-windows
// gives service bookings each day's slots and whether it's closed - all set by
// the super admin (open hours, breaks, slot length, gap between slots, how far
// ahead and how soon a customer can book).
export const WORKING_HOURS_API_PATH = "/api/v1/working-hours";
export const ARRIVAL_WINDOWS_API_PATH = `${WORKING_HOURS_API_PATH}/arrival-windows`;

// backend/app/router/customer/booking.routes.js - booking a worker by the
// hour. POST needs a logged-in customer; availability is public and gives,
// per day, a start time every hour from opening time with how many hours the
// worker is free from it (closing time, breaks, their leave and bookings, and
// the admin's "book at least" / "book up to" are all applied by the backend).
export const WORKER_BOOKINGS_API_PATH = `${BOOKINGS_API_PATH}/workers`;
export const getWorkerAvailabilityApiPath = (workerId) =>
  `${WORKER_BOOKINGS_API_PATH}/${encodeURIComponent(workerId)}/availability`;

// "09:30" -> 9.5 (the booking flow keeps times as hours of the day).
const toHourOfDay = (time) => {
  const [hours, minutes] = time.split(":").map(Number);
  return hours + minutes / 60;
};

// The arrival-windows response as
// { byDate: { "2026-11-07": { closedReason, windows: [{ hour, endHour }] } },
//   dayCount (the admin's "book up to" days), leadHours (the admin's "book at least") }.
export const toArrivalWindows = (data) => ({
  byDate: Object.fromEntries(
    (data?.days ?? []).map((day) => [
      day.date,
      {
        closedReason: day.isOpen ? null : day.closedReason,
        windows: (day.windows ?? []).map((window) => ({
          hour: toHourOfDay(window.startTime),
          endHour: toHourOfDay(window.endTime),
        })),
      },
    ]),
  ),
  dayCount: data?.days?.length ?? 0,
  leadHours: Number(data?.slotSettings?.bookingCutoffHours),
});

// The backend's booking status (booking.model.js BOOKING_STATUS) as shown to
// the customer right after booking.
export const API_BOOKING_STATUS_LABELS = {
  pending: "Awaiting confirmation",
  upcoming: "Upcoming",
  confirmed: "Confirmed",
  rejected: "Rejected",
  cancelled: "Cancelled",
  in_progress: "In progress",
  completed: "Completed",
};

// The worker availability response as
// { byDate: { "2026-11-13": { closedReason, starts: [{ hour, maxHours }] } },
//   dayCount, maxHours (the longest booking any start allows) }.
// A start with maxHours 0 can't be picked (too soon, in a break or busy).
export const toWorkerSchedule = (data) => ({
  byDate: Object.fromEntries(
    (data?.days ?? []).map((day) => [
      day.date,
      {
        closedReason:
          day.status === "open" ? null : day.closedReason || "Unavailable",
        starts: (day.startTimes ?? []).map((start) => ({
          hour: toHourOfDay(start.startTime),
          maxHours: Number(start.maxHours) || 0,
        })),
      },
    ]),
  ),
  dayCount: data?.days?.length ?? 0,
  maxHours: Number(data?.maxHours) || 0,
});

export const BOOKING_STATUS = {
  UPCOMING: "upcoming",
  COMPLETED: "completed",
  CANCELLED: "cancelled",
};

// Free cancellation / rescheduling up to this many hours before the visit.
export const FREE_CANCEL_HOURS = 2;

// "2026-10-30" + 14 -> Date at 2:00 PM local time (14.5 -> 2:30 PM).
export const getBookingStart = (booking) => {
  const [year, month, day] = booking.date.split("-").map(Number);
  const hour = Math.floor(booking.startHour);
  return new Date(
    year,
    month - 1,
    day,
    hour,
    Math.round((booking.startHour - hour) * 60),
    0,
    0,
  );
};

// Which My bookings tab each backend status goes in. The backend calls an
// accepted booking "upcoming" (constant/status.js).
const TAB_BY_API_STATUS = {
  pending: BOOKING_STATUS.UPCOMING,
  upcoming: BOOKING_STATUS.UPCOMING,
  confirmed: BOOKING_STATUS.UPCOMING,
  in_progress: BOOKING_STATUS.UPCOMING,
  completed: BOOKING_STATUS.COMPLETED,
  cancelled: BOOKING_STATUS.CANCELLED,
  rejected: BOOKING_STATUS.CANCELLED,
};

// The booking flow puts a contact other than the customer at the top of the
// notes ("Contact person: <name>") - split it back out.
const CONTACT_LINE = /^Contact person: (.+)$/m;
const splitNotes = (notes = "") => {
  const match = notes.match(CONTACT_LINE);
  if (!match) return { contactName: null, instructions: notes.trim() };
  return {
    contactName: match[1].trim(),
    instructions: notes.replace(match[0], "").trim(),
  };
};

const getCancelReason = (booking) => {
  if (booking.status === "rejected")
    return booking.rejectionReason || "Not accepted by the professional";
  if (booking.status === "cancelled")
    return booking.cancellationReason || "Cancelled";
  return null;
};

// The service booking's title, picture and "Book again" link.
const toServiceDisplay = (service) => {
  const category =
    service?.categoryId && typeof service.categoryId === "object"
      ? service.categoryId
      : null;
  const coverUrl = buildServiceImageUrl(service?.image_url);
  return {
    title: service?.name ?? "Service",
    subtitle: category?.name ?? "",
    image: coverUrl ?? buildServiceImageUrl(category?.icon_url),
    hasCover: Boolean(coverUrl),
    icon: category?.slug ?? null,
    worker: null,
    rebookPath: service?.slug ? getServiceBookingPath(service.slug) : null,
    verticalName:
      category?.vertical_id?.display_name ||
      category?.vertical_id?.name ||
      null,
  };
};

// An hourly (worker) booking has no service - it shows the worker booked.
const toWorkerDisplay = (provider) => ({
  title: provider?.name ?? "Professional",
  subtitle: "Hourly booking",
  image: null,
  hasCover: false,
  icon: null,
  worker: provider
    ? {
        name: provider.name,
        initials: provider.initials,
        avatar: provider.avatar,
      }
    : null,
  rebookPath: provider ? getWorkerBookingPath(provider.id) : null,
  verticalName: null,
});

// One booking from GET /bookings/my-bookings (service, its category and the
// provider populated) as a booking record.
export const toMyBookingRecord = (booking) => {
  const isHourly = booking.bookingType === "hourly";
  const service =
    booking.service_id && typeof booking.service_id === "object"
      ? booking.service_id
      : null;
  const provider =
    booking.provider_id && typeof booking.provider_id === "object"
      ? toWorker(booking.provider_id)
      : null;
  const { verticalName, ...display } = isHourly
    ? toWorkerDisplay(provider)
    : toServiceDisplay(service);
  const hours = isHourly ? Number(booking.durationHours) || 1 : 1;
  const address = booking.customerAddress ?? {};
  const { contactName, instructions } = splitNotes(booking.customerNotes);
  const status = TAB_BY_API_STATUS[booking.status] ?? BOOKING_STATUS.UPCOMING;

  return {
    id: booking.bookingNumber,
    apiId: booking._id,
    kind: isHourly ? "worker" : "service",
    bookingType: booking.bookingType || (isHourly ? "hourly" : "service"),
    status,
    apiStatus: booking.status,
    // An accepted ("upcoming") booking is the tracker's "Confirmed" stage.
    stage:
      status === BOOKING_STATUS.UPCOMING
        ? booking.status === "upcoming"
          ? "confirmed"
          : booking.status
        : null,
    ...display,
    serviceId: service?._id ?? null,
    professional: provider
      ? { name: provider.name, phone: provider.phone }
      : null,
    previousProviderId:
      provider?.id ??
      (typeof booking.provider_id === "string" ? booking.provider_id : null),
    previousProviderName: provider?.name ?? null,
    date: booking.bookingDate,
    startTime: booking.startTime,
    endTime: booking.endTime,
    startHour: toHourOfDay(booking.startTime),
    endHour: toHourOfDay(booking.endTime),
    hours,
    hourlyRate: isHourly
      ? Number(booking.hourlyRate) || (hours > 0 ? Math.round(Number(booking.finalAmount) / hours) : null)
      : null,
    // The backend keeps the address without its Home/Work label.
    address: {
      label: null,
      houseNo: address.street ?? "",
      area: "",
      landmark: address.landmark ?? "",
      city: address.city ?? "",
      state: address.state ?? "",
      pincode: address.postalCode ?? "",
    },
    contact: {
      name: contactName,
      phone:
        formatPhoneNumberIntl(booking.customerPhone ?? "") ||
        booking.customerPhone,
    },
    instructions,
    total: Number(booking.finalAmount) || 0,
    paidAmount: Number(booking.paidAmount) || 0,
    paymentMethod: booking.paymentMethod || "cash_on_delivery",
    paymentStatus: booking.paymentStatus,
    cancelReason: getCancelReason(booking),
    createdAt: booking.createdAt,
    details: {
      verticalName,
      durationMinutes: isHourly
        ? hours * 60
        : Number(service?.durationInMinutes) || null,
      price: Number(booking.price) || 0,
      discountPrice: Number(booking.discountPrice) || 0,
      finalAmount: Number(booking.finalAmount) || 0,
      paidAmount: Number(booking.paidAmount) || 0,
      paymentStatus: booking.paymentStatus ?? null,
      paymentMethod: booking.paymentMethod ?? "cash_on_delivery",
      professional: provider
        ? {
            name: provider.name,
            initials: provider.initials,
            avatar: provider.avatar,
            phone: provider.phone,
            email: provider.email,
          }
        : null,
      timeline: {
        bookedAt: booking.createdAt ?? null,
        acceptedAt: booking.acceptedAt ?? null,
        completedAt: booking.completedAt ?? null,
        cancelledAt: booking.cancelledAt ?? null,
        rejectedAt: booking.rejectedAt ?? null,
      },
    },
  };
};
