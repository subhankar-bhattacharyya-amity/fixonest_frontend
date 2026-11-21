import { lazy } from "react";
import { ROUTES } from "@/routes/constants.js";

const BlogPage = lazy(() => import("./BlogPage.jsx"));
const BlogDetailsPage = lazy(() => import("./BlogDetailsPage.jsx"));

export const blogRoutes = [
  { path: ROUTES.BLOG, element: <BlogPage /> },
  { path: ROUTES.BLOG_DETAILS, element: <BlogDetailsPage /> },
];
