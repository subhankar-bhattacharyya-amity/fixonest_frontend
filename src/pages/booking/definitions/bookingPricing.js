// Pricing for the booking flow's "Review & pay" step. No fees or coupons:
// the customer pays the service's price (or the worker's hourly rate × hours),
// matching the backend's finalAmount. Keep every amount the customer sees
// coming from computeBookingPrice so the review step and the summary card
// never disagree.

// What the customer pays for the work: the service's price, or the worker's
// hourly rate × hours. null when there's no price to show.
export const getBaseAmount = (bookable, hours) => {
  if (!bookable.unitPrice) return null;
  return bookable.unitPrice * (bookable.perHour ? hours : 1);
};

// The price breakdown. `lines` render top to bottom; `total` is what is
// paid in cash after the job.
export const computeBookingPrice = ({ bookable, hours }) => {
  const base = getBaseAmount(bookable, hours);
  if (base === null) return { base: null, total: null, lines: [] };

  const lines = [
    {
      key: "base",
      label: bookable.perHour ? `${bookable.shortName}'s time (${hours} ${hours === 1 ? "hr" : "hrs"})` : bookable.title,
      amount: base,
    },
  ];
  return { base, total: base, lines };
};
