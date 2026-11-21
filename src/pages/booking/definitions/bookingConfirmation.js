// "Confirmed" step helpers. Both service and worker bookings get their
// booking number from the booking API.

// The "What happens next" timeline. `who` is the first name of the worker
// booked or the professional assigned, or null when not known.
export const getNextSteps = (who) => [
  { key: "confirmed", title: "Booking placed", text: "Your slot is reserved.", done: true },
  {
    key: "assigned",
    title: who ? `${who} accepts the job` : "Professional assigned",
    text: who ? "Usually within 30 minutes." : "We match you with a verified pro within 30 minutes.",
  },
  { key: "call", title: "A call before the visit", text: "They'll call the contact number when they're on the way." },
  { key: "pay", title: "Job done, pay in cash", text: "Pay the professional only after the work is finished." },
];
