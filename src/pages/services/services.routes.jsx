import { lazy } from "react";
import { ROUTES } from "@/routes/constants.js";

const ServicesPage = lazy(() => import("./ServicesPage.jsx"));
const ServiceDetailsPage = lazy(() => import("./ServiceDetailsPage.jsx"));

export const servicesRoutes = [
  { path: ROUTES.SERVICES, element: <ServicesPage /> },
  { path: ROUTES.SERVICE_DETAILS, element: <ServiceDetailsPage /> },
];
