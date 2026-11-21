import { lazy } from "react";
import { ROUTES } from "@/routes/constants.js";

const ProfilePage = lazy(() => import("./ProfilePage.jsx"));

export const profileRoutes = [{ path: ROUTES.PROFILE, element: <ProfilePage /> }];
