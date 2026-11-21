import { Link } from "react-router-dom";
import { ArrowLeft, Wrench } from "lucide-react";
import { ThemeToggle } from "@/components/common/themeToggle/index.js";
import { ROUTES } from "@/routes/constants.js";

// Standalone page (no Header/Footer via layouts/wrapper/Wrapper.jsx, see
// routes/config/public.routes.jsx) — same reasoning as pages/auth/components/
// AuthLayout.jsx: it needs its own ThemeToggle since it can't reach the one
// in the main Header.
export default function NotFoundPage() {
  return (
    <main className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-slate-50 px-4 py-16 dark:bg-(--surface-0)">
      <div className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full bg-indigo-400/20 blur-3xl dark:bg-indigo-500/10" />
      <div className="pointer-events-none absolute -bottom-32 -right-16 h-80 w-80 rounded-full bg-fuchsia-400/20 blur-3xl dark:bg-fuchsia-500/10" />

      <div className="absolute right-4 top-4 sm:right-8 sm:top-6">
        <ThemeToggle className="border-slate-200 bg-white/80 backdrop-blur-sm dark:bg-(--surface-1)/80" />
      </div>

      <div className="relative mx-auto w-full max-w-md text-center">
        <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-linear-to-br from-indigo-600 to-fuchsia-600 text-2xl font-bold text-white shadow-lg shadow-indigo-600/25">
          <Wrench className="h-7 w-7" />
        </span>

        <p className="mt-8 bg-linear-to-r from-indigo-600 to-fuchsia-600 bg-clip-text text-7xl font-extrabold tracking-tight text-transparent sm:text-8xl">
          404
        </p>

        <h1 className="mt-4 text-2xl font-bold tracking-tight text-slate-900 dark:text-(--text-primary) sm:text-3xl">
          This page went missing
        </h1>
        <p className="mt-3 text-base leading-relaxed text-slate-500 dark:text-(--text-muted)">
          The page you're looking for doesn't exist or may have been moved. Let's get you back on track.
        </p>

        <Link
          to={ROUTES.HOME}
          className="mt-8 inline-flex items-center justify-center gap-2 rounded-xl bg-linear-to-r from-indigo-600 to-fuchsia-600 px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-indigo-600/25 transition hover:brightness-110 active:scale-[0.99] sm:text-base"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to home
        </Link>
      </div>
    </main>
  );
}
