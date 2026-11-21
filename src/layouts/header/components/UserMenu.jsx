import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useDispatch } from "react-redux";
import { toast } from "sonner";
import { AnimatePresence, motion } from "framer-motion";
import { CalendarCheck, LogOut, UserRound } from "lucide-react";
import { logoutCustomer, buildProfileImageUrl, initialsOf } from "@/features/auth/index.js";
import { ConfirmDialog } from "@/components/common/confirmDialog/index.js";
import { ROUTES } from "@/routes/constants.js";

// Colocated at layouts/header/components because only Header.jsx uses it.
export default function UserMenu({ user }) {
  const [open, setOpen] = useState(false);
  const [failedSrc, setFailedSrc] = useState(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const dispatch = useDispatch();
  const rootRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (rootRef.current && !rootRef.current.contains(event.target))
        setOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handleLogoutClick() {
    setOpen(false);
    setConfirmOpen(true);
  }

  async function handleLogoutConfirm() {
    setLoggingOut(true);
    try {
      const result = await dispatch(logoutCustomer()).unwrap();
      toast.success(result.message);
    } catch {
      // Local session is already cleared by authSlice's logoutCustomer.rejected
      // case regardless — the error itself was already toasted globally by
      // lib/httpClient.js's response interceptor.
    } finally {
      setLoggingOut(false);
      setConfirmOpen(false);
    }
  }

  const avatarSrc = buildProfileImageUrl(user);
  const showImage = Boolean(avatarSrc) && avatarSrc !== failedSrc;

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-label="Account menu"
        aria-expanded={open}
        className="block h-9 w-9 shrink-0 rounded-full transition hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-300 focus-visible:ring-offset-2 lg:h-10 lg:w-10"
      >
        {showImage ? (
          <img
            src={avatarSrc}
            onError={() => setFailedSrc(avatarSrc)}
            alt={user.fullName ?? "Account"}
            className="h-full w-full rounded-full object-cover"
          />
        ) : (
          <span className="flex h-full w-full items-center justify-center rounded-full bg-slate-100 text-base font-semibold text-slate-600 dark:bg-(--surface-2) dark:text-(--text-primary) dark:ring-1 dark:ring-(--border-subtle)">
            {initialsOf(user?.fullName)}
          </span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.96 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="absolute right-0 mt-3 w-64 origin-top-right overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-xl shadow-slate-200/70 dark:border-(--border-subtle) dark:bg-(--surface-1) dark:shadow-black/30"
          >
            <div className="flex items-center gap-3 px-4 py-4">
              {showImage ? (
                <img
                  src={avatarSrc}
                  onError={() => setFailedSrc(avatarSrc)}
                  alt=""
                  className="h-11 w-11 shrink-0 rounded-full object-cover"
                />
              ) : (
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-slate-100 text-sm font-semibold text-slate-600 dark:bg-(--surface-2) dark:text-(--text-primary) dark:ring-1 dark:ring-(--border-subtle)">
                  {initialsOf(user?.fullName)}
                </span>
              )}
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-slate-900 dark:text-(--text-primary)">
                  {user?.fullName}
                </p>
                <p className="truncate text-xs text-slate-500 dark:text-(--text-muted)">{user?.email}</p>
              </div>
            </div>

            <div className="border-t border-slate-100 py-1.5 dark:border-(--border-subtle)">
              <Link
                to={ROUTES.PROFILE}
                onClick={() => setOpen(false)}
                className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-600 transition hover:bg-slate-50 hover:text-slate-900 dark:text-(--text-muted) dark:hover:bg-(--surface-2) dark:hover:text-(--text-primary)"
              >
                <UserRound className="h-4 w-4" />
                My profile
              </Link>
              <Link
                to={ROUTES.MY_BOOKINGS}
                onClick={() => setOpen(false)}
                className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-600 transition hover:bg-slate-50 hover:text-slate-900 dark:text-(--text-muted) dark:hover:bg-(--surface-2) dark:hover:text-(--text-primary)"
              >
                <CalendarCheck className="h-4 w-4" />
                My bookings
              </Link>
            </div>

            <div className="border-t border-slate-100 py-1.5 dark:border-(--border-subtle)">
              <button
                type="button"
                onClick={handleLogoutClick}
                className="flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-sm text-red-600 transition hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/40"
              >
                <LogOut className="h-4 w-4" />
                Log out
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <ConfirmDialog
        open={confirmOpen}
        title="Log out of Fixonest?"
        description="You'll need to log in again to book services, like, or comment."
        confirmLabel="Yes, log out"
        cancelLabel="Cancel"
        variant="danger"
        loading={loggingOut}
        onConfirm={handleLogoutConfirm}
        onCancel={() => setConfirmOpen(false)}
      />
    </div>
  );
}
