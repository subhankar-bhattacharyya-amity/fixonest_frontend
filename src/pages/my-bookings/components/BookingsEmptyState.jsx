import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { CalendarX2, SearchX } from "lucide-react";
import { ROUTES } from "@/routes/constants.js";
import { DEFAULT_TAB, EMPTY_STATES } from "../definitions/myBookings.data.js";

// Shown when a tab has no bookings, or the search/filters match none.
export default function BookingsEmptyState({
  tab,
  query,
  typeFilter = "all",
  hasActiveSubFilter = false,
  onResetFilters,
}) {
  const isSearch = Boolean(query?.trim());
  const isFiltered = isSearch || typeFilter !== "all" || hasActiveSubFilter;

  let copy;
  if (isSearch) {
    copy = { title: "No matching bookings", text: `Nothing matches "${query.trim()}" in this view.` };
  } else if (typeFilter === "worker") {
    copy = {
      title: "No hired providers found",
      text: "You haven't hired any direct professionals in this status.",
    };
  } else if (typeFilter === "service") {
    copy = {
      title: "No service bookings found",
      text: "You don't have any service bookings in this status.",
    };
  } else if (hasActiveSubFilter) {
    copy = {
      title: "No bookings for this status filter",
      text: "No bookings match the selected status sub-filter in this tab.",
    };
  } else {
    copy = EMPTY_STATES[tab] ?? EMPTY_STATES[DEFAULT_TAB];
  }

  const Icon = isSearch ? SearchX : CalendarX2;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="flex flex-col items-center rounded-3xl border-2 border-dashed border-slate-200 px-6 py-16 text-center dark:border-(--border-subtle)"
    >
      <span className="relative flex h-20 w-20 items-center justify-center">
        <span className="absolute inset-0 rounded-full bg-linear-to-br from-indigo-100 to-fuchsia-100 dark:from-indigo-500/15 dark:to-fuchsia-500/10" />
        <Icon className="relative h-9 w-9 text-indigo-500 dark:text-indigo-400" />
      </span>
      <h3 className="mt-5 text-lg font-bold text-slate-900 dark:text-(--text-primary)">{copy.title}</h3>
      <p className="mt-1 max-w-sm text-sm text-slate-500 dark:text-(--text-muted)">{copy.text}</p>
      {isFiltered ? (
        <button
          type="button"
          onClick={onResetFilters}
          className="mt-6 rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-indigo-300 hover:text-indigo-600 dark:border-(--border-subtle) dark:text-(--text-primary)"
        >
          Reset filters
        </button>
      ) : typeFilter === "worker" ? (
        <Link
          to={ROUTES.WORKERS}
          className="mt-6 rounded-xl bg-linear-to-r from-indigo-600 to-fuchsia-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-600/25 transition hover:brightness-110"
        >
          Hire a professional
        </Link>
      ) : (
        <Link
          to={ROUTES.SERVICES}
          className="mt-6 rounded-xl bg-linear-to-r from-indigo-600 to-fuchsia-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-600/25 transition hover:brightness-110"
        >
          Browse services
        </Link>
      )}
    </motion.div>
  );
}
