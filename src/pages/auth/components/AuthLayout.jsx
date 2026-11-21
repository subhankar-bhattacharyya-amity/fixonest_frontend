import { Check } from "lucide-react";
import { ThemeToggle } from "@/components/common/themeToggle/index.js";

const HIGHLIGHTS = [
  "Verified, background-checked professionals",
  "Repair and household services in one place",
  "Live status updates from booking to completion",
];

// Shared shell for every auth screen (login, register, ...): a brand panel
// on wide screens and a centered form card everywhere else. Colocated at
// pages/auth/components because only pages/auth/* uses it. Auth screens sit
// outside layouts/wrapper/Wrapper.jsx (no Header/Footer), so this is also
// the only place they can reach for a ThemeToggle.
export default function AuthLayout({ eyebrow, title, subtitle, children, footer }) {
  return (
    <div className="min-h-screen w-full bg-slate-50 dark:bg-(--surface-0) lg:grid lg:grid-cols-2">
      <aside className="relative hidden overflow-hidden bg-linear-to-br from-indigo-700 via-violet-700 to-fuchsia-600 dark:from-indigo-800 dark:via-violet-800 dark:to-fuchsia-700 lg:flex lg:flex-col lg:justify-between lg:p-12 xl:p-16">
        <div className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 -right-16 h-80 w-80 rounded-full bg-fuchsia-400/20 blur-3xl" />

        <div className="relative flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/15 text-lg font-bold text-white ring-1 ring-white/25">
            F
          </span>
          <span className="text-xl font-semibold tracking-tight text-white">Fixonest</span>
        </div>

        <div className="relative max-w-md">
          <h2 className="text-3xl font-semibold leading-tight text-white xl:text-4xl">
            Repair &amp; household help, booked in minutes.
          </h2>
          <p className="mt-4 text-base leading-relaxed text-indigo-100">
            From leaky taps to full home cleaning, Fixonest connects you with trusted professionals for every
            repair and household service you need.
          </p>
          <ul className="mt-8 space-y-4">
            {HIGHLIGHTS.map((item) => (
              <li key={item} className="flex items-start gap-3 text-sm text-indigo-50">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white/15">
                  <Check className="h-3 w-3 text-white" />
                </span>
                {item}
              </li>
            ))}
          </ul>
        </div>

        <p className="relative text-xs text-indigo-200">© {new Date().getFullYear()} Fixonest. All rights reserved.</p>
      </aside>

      <div className="relative flex min-h-screen flex-col justify-center px-4 py-10 sm:px-8 lg:px-12 xl:px-20">
        <div className="absolute right-4 top-4 sm:right-8 sm:top-6 lg:right-12 lg:top-8 xl:right-20">
          <ThemeToggle className="border-slate-200 bg-white/80 backdrop-blur-sm dark:bg-(--surface-1)/80" />
        </div>

        <div className="mx-auto w-full max-w-sm">
          <div className="mb-8 flex items-center gap-2.5 lg:hidden">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-linear-to-br from-indigo-600 to-fuchsia-600 text-base font-bold text-white">
              F
            </span>
            <span className="text-lg font-semibold tracking-tight text-slate-900 dark:text-(--text-primary)">
              Fixonest
            </span>
          </div>

          {eyebrow && (
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              {eyebrow}
            </p>
          )}
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-(--text-primary) sm:text-3xl">
            {title}
          </h1>
          {subtitle && <p className="mt-2 text-sm text-slate-500 dark:text-(--text-muted)">{subtitle}</p>}

          <div className="mt-8 rounded-2xl border border-slate-100 bg-white p-5 shadow-xl shadow-slate-200/60 dark:border-(--border-subtle) dark:bg-(--surface-1) dark:shadow-black/30 sm:p-8">
            {children}
          </div>

          {footer && (
            <div className="mt-6 text-center text-sm text-slate-500 dark:text-(--text-muted)">{footer}</div>
          )}
        </div>
      </div>
    </div>
  );
}
