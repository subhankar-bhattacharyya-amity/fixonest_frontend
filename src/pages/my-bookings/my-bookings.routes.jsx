import { lazy } from "react";
import { ROUTES } from "@/routes/constants.js";

const MyBookingsPage = lazy(() => import("./MyBookingsPage.jsx"));

// Registered under private.routes.jsx - a customer's own bookings.
export const myBookingsRoutes = [{ path: ROUTES.MY_BOOKINGS, element: <MyBookingsPage /> }];
