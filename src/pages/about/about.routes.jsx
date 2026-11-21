import { lazy } from "react";
import { ROUTES } from "@/routes/constants.js";

const AboutPage = lazy(() => import("./AboutPage.jsx"));

export const aboutRoutes = [{ path: ROUTES.ABOUT, element: <AboutPage /> }];
