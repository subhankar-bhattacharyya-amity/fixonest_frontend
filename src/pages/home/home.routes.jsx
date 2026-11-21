import { lazy } from "react";
import { ROUTES } from "@/routes/constants.js";

const HomePage = lazy(() => import("./HomePage.jsx"));

export const homeRoutes = [{ path: ROUTES.HOME, element: <HomePage /> }];
