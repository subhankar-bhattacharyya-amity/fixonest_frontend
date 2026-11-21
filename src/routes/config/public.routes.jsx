import { lazy } from "react";
import { authRoutes } from "@/pages/auth/auth.routes.jsx";

const NotFoundPage = lazy(() => import("@/pages/not-found/NotFoundPage.jsx"));

// authRoutes owns its own entries (see docs/how_to_setup_route/setup_route.md
// §9). The catch-all stays here directly and must remain the last entry.
export const publicRoutes = [...authRoutes, { path: "*", element: <NotFoundPage /> }];
