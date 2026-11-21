import { lazy } from "react";
import { ROUTES } from "@/routes/constants.js";

const ServiceBookingPage = lazy(() => import("./ServiceBookingPage.jsx"));
const WorkerBookingPage = lazy(() => import("./WorkerBookingPage.jsx"));

// Registered under private.routes.jsx - booking needs a logged-in customer.
export const bookingRoutes = [
  { path: ROUTES.SERVICE_BOOKING, element: <ServiceBookingPage /> },
  { path: ROUTES.WORKER_BOOKING, element: <WorkerBookingPage /> },
];
