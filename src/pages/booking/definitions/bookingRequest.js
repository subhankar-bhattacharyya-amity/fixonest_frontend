// Turns the booking flow's choices into the body of POST /api/v1/bookings
// (backend booking.validator.js createBookingSchema) or, for a worker booked
// by the hour, POST /api/v1/bookings/workers (createWorkerBookingSchema), and
// the saved booking either returns into what the Confirmed step shows.
import { toWorker } from "@/features/workers/index.js";
import { toChosenProvider } from "./bookingProviders.js";
import { toApiTime } from "./bookingSchedule.data.js";
import { MAX_INSTRUCTIONS_LENGTH } from "./bookingAddress.data.js";

// The backend has no separate contact name, so a contact other than the
// customer goes at the top of the notes.
const buildNotes = ({ contactName, instructions }, user) => {
  const notes = instructions?.trim() ?? "";
  const name = contactName?.trim();
  if (!name || name === user?.fullName?.trim()) return notes;
  return `Contact person: ${name}${notes ? `\n${notes}` : ""}`.slice(0, MAX_INSTRUCTIONS_LENGTH);
};

// The address, contact and payment fields both booking bodies share.
const toCustomerFields = ({ address, contact, user }) => ({
  customerAddress: {
    street: [address.houseNo, address.area].filter(Boolean).join(", "),
    city: address.city,
    state: address.state,
    postalCode: address.pincode,
    landmark: address.landmark ?? "",
  },
  customerPhone: contact.phone,
  customerEmail: user?.email ?? "",
  customerNotes: buildNotes(contact, user),
  paymentMethod: "cash_on_delivery",
});

// provider = null means "any available professional" - provider_id is left
// out and the backend assigns the best-rated professional free at that time.
export const toCreateBookingPayload = ({ bookable, day, slot, address, contact, provider, user }) => {
  const payload = {
    service_id: bookable.serviceId,
    bookingDate: day.key,
    startTime: toApiTime(slot.hour),
    endTime: toApiTime(slot.endHour),
    ...toCustomerFields({ address, contact, user }),
  };
  if (provider?.id) payload.provider_id = provider.id;
  return payload;
};

// A worker booked for `hours` from the slot's start. No end time or price -
// the backend works both out from the start, the hours and the worker's rate.
export const toCreateWorkerBookingPayload = ({ bookable, day, slot, hours, address, contact, user }) => ({
  provider_id: bookable.worker.id,
  bookingDate: day.key,
  startTime: toApiTime(slot.hour),
  durationHours: hours,
  ...toCustomerFields({ address, contact, user }),
});

// The saved booking (provider_id populated) as the Confirmed step's
// { id, status, provider } - id is the human-readable booking number.
export const fromCreatedBooking = (booking) => ({
  id: booking.bookingNumber,
  apiId: booking._id,
  status: booking.status,
  provider: booking.provider_id && typeof booking.provider_id === "object" ? toChosenProvider(toWorker(booking.provider_id)) : null,
});
