import { lazy } from "react";
import { ROUTES } from "@/routes/constants.js";

const WorkersPage = lazy(() => import("./WorkersPage.jsx"));
const WorkerDetailsPage = lazy(() => import("./WorkerDetailsPage.jsx"));

export const workersRoutes = [
  { path: ROUTES.WORKERS, element: <WorkersPage /> },
  { path: ROUTES.WORKER_DETAILS, element: <WorkerDetailsPage /> },
];
