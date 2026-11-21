import { Outlet } from "react-router-dom";
import { Header } from "../header/index.js";
import { Footer } from "../footer/index.js";
import { BackToTopButton } from "@/components/common/backToTop/index.js";

// Outlet is replaced by the page matching the current URL. No wrapper-level
// page-transition animation here on purpose - pages with real content
// (Home, Profile) already animate their own sections/cards in on mount, so
// an outer fade/slide here just stacked a second, competing entrance
// animation on top of theirs (looked like the content "loading twice").
export default function Wrapper() {
  return (
    <div className="flex min-h-screen flex-col bg-white dark:bg-(--surface-0)">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-xl focus:bg-indigo-600 focus:px-4 focus:py-2.5 focus:text-sm focus:font-semibold focus:text-white focus:shadow-lg"
      >
        Skip to main content
      </a>

      <Header />

      <main id="main-content" className="flex-1">
        <Outlet />
      </main>

      <Footer />
      <BackToTopButton />
    </div>
  );
}
