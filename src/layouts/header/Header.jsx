import { useEffect, useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, X } from "lucide-react";
import { useAuth } from "@/features/auth/index.js";
import { ROUTES } from "@/routes/constants.js";
import AuthGatedLink from "@/routes/guards/AuthGatedLink.jsx";
import { ThemeToggle } from "@/components/common/themeToggle/index.js";
import { navLinks } from "./header.data.js";
import { UserMenu } from "./components/index.js";

function desktopNavLinkClassName({ isActive }) {
  return `relative pb-1.5 text-base font-medium transition ${
    isActive
      ? "text-indigo-600 dark:text-white dark:font-semibold"
      : "text-slate-600 hover:text-indigo-600 dark:text-white/75 dark:hover:text-white"
  }`;
}

function mobileNavLinkClassName({ isActive }) {
  return `relative z-10 rounded-lg px-3 py-3 text-base font-medium transition ${
    isActive
      ? "text-indigo-600 dark:text-white dark:font-semibold"
      : "text-slate-700 hover:bg-slate-50 hover:text-indigo-600 dark:text-white/75 dark:hover:text-white"
  }`;
}

export default function Header() {
  const { user } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    function handleScroll() {
      setScrolled(window.scrollY > 8);
    }
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  function closeMobileMenu() {
    setMobileOpen(false);
  }

  return (
    <header
      className={`sticky top-0 z-50 border-b backdrop-blur-xl transition-colors dark:bg-(--surface-1) ${
        scrolled
          ? "border-slate-200/70 bg-white/85 shadow-sm shadow-slate-200/50 dark:border-(--border-subtle) dark:shadow-black/30"
          : "border-transparent bg-white/60 dark:border-transparent"
      }`}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-3 px-3 sm:px-6 lg:h-20 lg:px-8">
        <Link to={ROUTES.HOME} className="flex min-w-0 shrink-0 items-center gap-2">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-linear-to-br from-indigo-600 to-fuchsia-600 text-base font-bold text-white shadow-md shadow-indigo-600/20 lg:h-10 lg:w-10">
            F
          </span>
          <span className="truncate text-base font-semibold tracking-tight text-slate-900 dark:text-(--text-primary) sm:text-lg lg:text-xl">
            Fixonest
          </span>
        </Link>

        <nav className="hidden items-center gap-8 lg:flex">
          {navLinks.map((link) => (
            <NavLink key={link.to} to={link.to} className={desktopNavLinkClassName}>
              {({ isActive }) => (
                <>
                  {link.label}
                  {isActive && (
                    <motion.span
                      layoutId="desktop-nav-indicator"
                      className="absolute inset-x-0 -bottom-0.5 h-0.5 rounded-full bg-linear-to-r from-indigo-500 to-fuchsia-500"
                      transition={{ type: "spring", stiffness: 420, damping: 34 }}
                    />
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="hidden items-center gap-4 lg:flex">
          <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
            <AuthGatedLink
              to={ROUTES.SERVICES}
              className="inline-flex items-center justify-center rounded-xl bg-linear-to-r from-indigo-600 to-fuchsia-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-600/25 transition hover:brightness-110"
            >
              Book a service
            </AuthGatedLink>
          </motion.div>
          <ThemeToggle />
          {user ? (
            <UserMenu user={user} />
          ) : (
            <Link
              to={ROUTES.LOGIN}
              className="inline-flex items-center justify-center rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 dark:border-(--border-subtle) dark:text-(--text-primary) dark:hover:bg-(--surface-2)"
            >
              Sign In
            </Link>
          )}
        </div>

        <div className="flex shrink-0 items-center gap-2 lg:hidden">
          <ThemeToggle />
          {user ? (
            <UserMenu user={user} />
          ) : (
            <Link
              to={ROUTES.LOGIN}
              className="inline-flex h-9 items-center justify-center rounded-lg border border-slate-200 px-3 text-sm font-semibold text-slate-700 dark:border-(--border-subtle) dark:text-(--text-primary)"
            >
              Sign In
            </Link>
          )}
          <button
            type="button"
            onClick={() => setMobileOpen((value) => !value)}
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-600 dark:border-(--border-subtle) dark:text-(--text-muted)"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="overflow-hidden border-t border-slate-100 bg-white dark:border-(--border-subtle) dark:bg-(--surface-1) lg:hidden"
          >
            <div className="px-4 pb-6 pt-2 shadow-lg dark:shadow-black/30">
              <nav className="flex flex-col">
                {navLinks.map((link) => (
                  <NavLink key={link.to} to={link.to} onClick={closeMobileMenu} className={mobileNavLinkClassName}>
                    {({ isActive }) => (
                      <>
                        {link.label}
                        {isActive && (
                          <motion.span
                            layoutId="mobile-nav-indicator"
                            className="absolute inset-0 -z-10 rounded-lg bg-indigo-50 dark:bg-(--surface-2)"
                            transition={{ type: "spring", stiffness: 420, damping: 34 }}
                          />
                        )}
                      </>
                    )}
                  </NavLink>
                ))}
              </nav>

              <AuthGatedLink
                to={ROUTES.SERVICES}
                onClick={closeMobileMenu}
                className="mt-3 inline-flex w-full items-center justify-center rounded-xl bg-linear-to-r from-indigo-600 to-fuchsia-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-600/25 transition hover:brightness-110"
              >
                Book a service
              </AuthGatedLink>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
