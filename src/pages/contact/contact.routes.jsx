import { lazy } from "react";
import { ROUTES } from "@/routes/constants.js";

const ContactPage = lazy(() => import("./ContactPage.jsx"));

export const contactRoutes = [{ path: ROUTES.CONTACT, element: <ContactPage /> }];
