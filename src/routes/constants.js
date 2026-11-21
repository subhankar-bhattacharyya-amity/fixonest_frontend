// Route strings live in one place to prevent repeated hard-coded URLs.
export const ROUTES = {
  ROOT: "/",
  LOGIN: "/login",
  REGISTER: "/register",
  VERIFY_EMAIL: "/verify-email",
  FORGOT_PASSWORD: "/forgot-password",
  HOME: "/home",
  ABOUT: "/about",
  SERVICES: "/services",
  SERVICE_DETAILS: "/services/:slug",
  WORKERS: "/workers",
  WORKER_DETAILS: "/workers/:workerId",
  BLOG: "/blog",
  BLOG_DETAILS: "/blog/:postId",
  CONTACT: "/contact",
  PROFILE: "/profile",
  SERVICE_BOOKING: "/book/service/:slug",
  WORKER_BOOKING: "/book/worker/:workerId",
  MY_BOOKINGS: "/my-bookings",
};

// One reusable page (ServiceDetailsPage.jsx) renders every service's detail
// view, looked up by its slug (e.g. /services/drain-and-clog-removal) — this
// builds the link, pairing with the ROUTES.SERVICE_DETAILS ":slug" pattern above.
export const getServiceDetailsPath = (slug) => `${ROUTES.SERVICES}/${slug}`;

// Same pattern as getServiceDetailsPath, for WorkerDetailsPage.jsx.
export const getWorkerDetailsPath = (workerId) => `${ROUTES.WORKERS}/${workerId}`;

// Same pattern as getServiceDetailsPath, for BlogDetailsPage.jsx. A blog's
// id in the URL is its slug (e.g. /blog/5-signs-you-need-a-plumber).
export const getBlogDetailsPath = (postId) => `${ROUTES.BLOG}/${postId}`;

// Booking pages (pages/booking) - one for a service, one for a worker.
export const getServiceBookingPath = (slug) => `/book/service/${slug}`;
export const getWorkerBookingPath = (workerId) => `/book/worker/${workerId}`;
