import { Wrapper } from "@/layouts/wrapper/index.js";
import { profileRoutes } from "@/pages/profile/profile.routes.jsx";
import { bookingRoutes } from "@/pages/booking/booking.routes.jsx";
import { myBookingsRoutes } from "@/pages/my-bookings/my-bookings.routes.jsx";
import AuthGuard from "../guards/AuthGuard.jsx";

// Only pages that genuinely require a logged-in session live here - the
// rest of the site is publicly browsable (see open.routes.jsx). Booking
// needs a customer account, so both booking pages are here.
export const privateRoutes = {
  element: <AuthGuard />,
  children: [
    {
      element: <Wrapper />,
      children: [...profileRoutes, ...bookingRoutes, ...myBookingsRoutes],
    },
  ],
};
