// "Choose your professional" for service bookings. The providers and which of
// them are free in a slot come from the API (features/bookings
// fetchSlotProviders); these helpers only shape them for the UI.

// Best rated first, then the most reviewed.
export const sortProviders = (workers) =>
  [...workers].sort((a, b) => Number(b.rating) - Number(a.rating) || b.reviewCount - a.reviewCount);

// The professional the customer picked, as kept with the booking (null =
// "any available professional", assigned by Fixonest).
export const toChosenProvider = (worker) =>
  worker
    ? {
        id: worker.id,
        name: worker.name,
        firstName: worker.firstName,
        initials: worker.initials,
        avatar: worker.avatar,
        rating: worker.rating,
        reviewCount: worker.reviewCount,
        phone: worker.phone,
      }
    : null;
