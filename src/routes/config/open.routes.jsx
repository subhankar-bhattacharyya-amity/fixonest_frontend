import { Wrapper } from "@/layouts/wrapper/index.js";
import { homeRoutes } from "@/pages/home/home.routes.jsx";
import { aboutRoutes } from "@/pages/about/about.routes.jsx";
import { servicesRoutes } from "@/pages/services/services.routes.jsx";
import { workersRoutes } from "@/pages/workers/workers.routes.jsx";
import { blogRoutes } from "@/pages/blog/blog.routes.jsx";
import { contactRoutes } from "@/pages/contact/contact.routes.jsx";

// Publicly browsable pages — no login required to view them. "Serious
// actions" within these pages (booking, liking, commenting) are gated
// individually via AuthGatedLink / useRequireAuth, not at the route level.
// Profile is the only page that still needs a real session - see
// private.routes.jsx.
export const openRoutes = {
  element: <Wrapper />,
  children: [
    ...homeRoutes,
    ...aboutRoutes,
    ...servicesRoutes,
    ...workersRoutes,
    ...blogRoutes,
    ...contactRoutes,
  ],
};
