import { useEffect, useMemo, useState } from "react";
import { useDispatch } from "react-redux";
import { useSearchParams } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { AlertTriangle, ChevronDown, RotateCcw, Search, X } from "lucide-react";
import { useDocumentTitle } from "@/hooks/useDocumentTitle.js";
import { useAuth } from "@/features/auth/index.js";
import { BOOKING_STATUS, fetchMyBookingStatistics, fetchMyBookings, useBookings } from "@/features/bookings/index.js";
import { Pagination } from "@/components/common/pagination/index.js";
import { BookingListCard, BookingsEmptyState, MyBookingsHeroSection } from "./components/index.js";
import { BOOKING_TABS, DEFAULT_TAB, matchesQuery, sortBookings } from "./definitions/myBookings.data.js";

const SKELETON_CARDS = 3;
const BOOKINGS_PER_PAGE = 5;

// The logged-in customer's bookings, organized by clear lifecycle status tabs:
// All / Awaiting Confirmation / Confirmed / Completed / Cancelled.
// Designed with a clean, unified view so non-tech customers can immediately
// understand their booking status without nested filter confusion.
export default function MyBookingsPage() {
  const dispatch = useDispatch();
  const { items, list, statistics } = useBookings();
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("all"); // 'all' | 'service' | 'worker'
  const [page, setPage] = useState(1);

  useDocumentTitle("My bookings | Fixonest");

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    dispatch(fetchMyBookings());
    dispatch(fetchMyBookingStatistics());
  }, [dispatch]);

  // Skeletons only on the first load - a reload keeps showing the last list.
  const isFirstLoad = (list.status === "idle" || list.status === "loading") && items.length === 0;
  const loadFailed = list.status === "failed" && items.length === 0;

  const tabParam = searchParams.get("tab");
  // Normalize tabParam (support legacy "upcoming" by mapping to "confirmed")
  let tab = tabParam;
  if (!tab || !BOOKING_TABS.some((item) => item.key === tab)) {
    tab = tabParam === "upcoming" ? "confirmed" : DEFAULT_TAB;
  }

  // Reset pagination when tab or filters change
  const selectTab = (key) => {
    setSearchParams(key === DEFAULT_TAB ? {} : { tab: key }, { replace: true });
    setPage(1);
  };

  useEffect(() => {
    setPage(1);
  }, [tab, query, typeFilter]);

  const resetAllFilters = () => {
    setQuery("");
    setTypeFilter("all");
    setPage(1);
  };

  // Compute live counts for each primary status tab directly from items
  const counts = useMemo(() => {
    return {
      all: items.length,
      pending: items.filter((item) => item.stage === "pending").length,
      confirmed: items.filter(
        (item) =>
          item.stage === "confirmed" ||
          item.stage === "in_progress" ||
          (item.status === BOOKING_STATUS.UPCOMING && item.stage !== "pending"),
      ).length,
      [BOOKING_STATUS.COMPLETED]: items.filter((item) => item.status === BOOKING_STATUS.COMPLETED).length,
      [BOOKING_STATUS.CANCELLED]: items.filter(
        (item) => item.status === BOOKING_STATUS.CANCELLED || item.apiStatus === "rejected",
      ).length,
    };
  }, [items]);

  const hasStatistics = statistics.status === "succeeded";
  const paidInCash = useMemo(
    () =>
      hasStatistics
        ? statistics.paidInCash
        : items.filter((item) => item.status === BOOKING_STATUS.COMPLETED).reduce((sum, item) => sum + item.total, 0),
    [hasStatistics, statistics, items],
  );

  // Type counts within the currently active status tab
  const typeCounts = useMemo(() => {
    const inTab = items.filter((item) => {
      if (tab === "all") return true;
      if (tab === "pending") return item.stage === "pending";
      if (tab === "confirmed") {
        return (
          item.stage === "confirmed" ||
          item.stage === "in_progress" ||
          (item.status === BOOKING_STATUS.UPCOMING && item.stage !== "pending")
        );
      }
      if (tab === "completed") return item.status === BOOKING_STATUS.COMPLETED;
      if (tab === "cancelled") return item.status === BOOKING_STATUS.CANCELLED || item.apiStatus === "rejected";
      if (tab === "upcoming") return item.status === BOOKING_STATUS.UPCOMING;
      return true;
    });

    return {
      all: inTab.length,
      service: inTab.filter((item) => item.kind === "service").length,
      worker: inTab.filter((item) => item.kind === "worker").length,
    };
  }, [items, tab]);

  // Filtered and sorted bookings list
  const visible = useMemo(
    () =>
      sortBookings(
        items.filter((item) => {
          // Status tab filter
          if (tab === "pending" && item.stage !== "pending") return false;
          if (tab === "confirmed") {
            const isConfirmed =
              item.stage === "confirmed" ||
              item.stage === "in_progress" ||
              (item.status === BOOKING_STATUS.UPCOMING && item.stage !== "pending");
            if (!isConfirmed) return false;
          }
          if (tab === "completed" && item.status !== BOOKING_STATUS.COMPLETED) return false;
          if (tab === "cancelled") {
            const isCancelled = item.status === BOOKING_STATUS.CANCELLED || item.apiStatus === "rejected";
            if (!isCancelled) return false;
          }
          if (tab === "upcoming" && item.status !== BOOKING_STATUS.UPCOMING) return false;

          // Booking type filter
          if (typeFilter !== "all" && item.kind !== typeFilter) return false;

          // Search query
          return matchesQuery(item, query);
        }),
        tab,
      ),
    [items, tab, typeFilter, query],
  );

  // Pagination calculations
  const totalPages = Math.max(1, Math.ceil(visible.length / BOOKINGS_PER_PAGE));
  const safePage = Math.min(page, totalPages);

  const pagedBookings = useMemo(() => {
    const start = (safePage - 1) * BOOKINGS_PER_PAGE;
    return visible.slice(start, start + BOOKINGS_PER_PAGE);
  }, [visible, safePage]);

  const handlePageChange = (newPage) => {
    setPage(newPage);
    window.scrollTo({ top: 320, behavior: "smooth" });
  };

  return (
    <section className="relative overflow-hidden">
      <div className="pointer-events-none absolute -left-32 -top-32 h-96 w-96 rounded-full bg-indigo-400/20 blur-3xl dark:bg-indigo-500/10" />
      <div className="pointer-events-none absolute -right-24 top-40 h-96 w-96 rounded-full bg-fuchsia-400/20 blur-3xl dark:bg-fuchsia-500/10" />

      <div className="relative mx-auto max-w-5xl px-3 py-10 sm:px-6 sm:py-14 lg:px-8">
        <MyBookingsHeroSection
          upcomingCount={counts.confirmed + counts.pending}
          completedCount={counts.completed}
          paidInCash={paidInCash}
          isLoading={!hasStatistics && statistics.status !== "failed"}
          onSelectTab={selectTab}
        />

        {/* Primary Status Tabs: One clear, elegant row with direct status counts */}
        <motion.div
          className="mt-10 overflow-x-auto pb-1 sm:overflow-visible"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          <div
            role="tablist"
            aria-label="Booking status tabs"
            className="inline-flex min-w-full rounded-2xl border border-slate-100 bg-white p-1.5 shadow-xs sm:flex dark:border-(--border-subtle) dark:bg-(--surface-1)"
          >
            {BOOKING_TABS.map(({ key, label }) => {
              const isActive = key === tab;
              const count = counts[key] ?? 0;
              return (
                <button
                  key={key}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => selectTab(key)}
                  className={`relative flex flex-1 items-center justify-center gap-2 whitespace-nowrap rounded-xl px-4 py-2.5 text-xs font-semibold transition sm:text-sm ${
                    isActive
                      ? "text-white shadow-xs"
                      : "text-slate-600 hover:text-slate-900 dark:text-(--text-muted) dark:hover:text-(--text-primary)"
                  }`}
                >
                  {isActive && (
                    <motion.span
                      layoutId="my-bookings-tab"
                      className="absolute inset-0 rounded-xl bg-linear-to-r from-indigo-600 to-fuchsia-600 shadow-md shadow-indigo-600/25"
                      transition={{ type: "spring", stiffness: 450, damping: 35 }}
                    />
                  )}
                  <span className="relative">{label}</span>
                  <span
                    className={`relative rounded-full px-2 py-0.5 text-xs font-bold ${
                      isActive
                        ? "bg-white/20 text-white"
                        : "bg-slate-100 text-slate-600 dark:bg-(--surface-2) dark:text-(--text-muted)"
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </motion.div>

        {/* Clean Controls Toolbar: Result summary on left, Type Filter & Search on right */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.25 }}
          className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
        >
          {/* Result counter & active filter reset */}
          <div className="flex items-center gap-2 text-xs text-slate-500 sm:text-sm dark:text-(--text-muted)">
            {visible.length > 0 && !isFirstLoad && !loadFailed && (
              <span>
                Showing{" "}
                <span className="font-semibold text-slate-900 dark:text-(--text-primary)">
                  {(safePage - 1) * BOOKINGS_PER_PAGE + 1}–{Math.min(safePage * BOOKINGS_PER_PAGE, visible.length)}
                </span>{" "}
                of{" "}
                <span className="font-semibold text-slate-900 dark:text-(--text-primary)">
                  {visible.length}
                </span>{" "}
                {visible.length === 1 ? "booking" : "bookings"}
              </span>
            )}
            {(query || typeFilter !== "all") && (
              <button
                type="button"
                onClick={resetAllFilters}
                className="inline-flex items-center gap-1 font-semibold text-indigo-600 hover:text-indigo-800 dark:text-indigo-400"
              >
                <RotateCcw className="h-3 w-3" />
                Reset filters
              </button>
            )}
          </div>

          {/* Controls: Type dropdown & Search */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Type Filter Select */}
            <div className="relative">
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                aria-label="Filter by booking type"
                className="appearance-none rounded-xl border border-slate-200 bg-white py-2 pl-3.5 pr-8 text-xs font-semibold text-slate-700 shadow-xs outline-none transition hover:border-slate-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 dark:border-(--border-subtle) dark:bg-(--surface-1) dark:text-(--text-primary)"
              >
                <option value="all">All types ({typeCounts.all})</option>
                <option value="service">Services only ({typeCounts.service})</option>
                <option value="worker">Hired providers only ({typeCounts.worker})</option>
              </select>
              <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
            </div>

            {/* Search Input */}
            <div className="relative w-full sm:w-64">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
              <input
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search service, pro or ID..."
                aria-label="Search bookings"
                className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-9 pr-8 text-xs text-slate-900 shadow-xs outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 dark:border-(--border-subtle) dark:bg-(--surface-1) dark:text-(--text-primary) [&::-webkit-search-cancel-button]:hidden"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery("")}
                  aria-label="Clear search"
                  className="absolute right-2.5 top-1/2 flex h-5 w-5 -translate-y-1/2 items-center justify-center rounded text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  <X className="h-3 w-3" />
                </button>
              )}
            </div>
          </div>
        </motion.div>

        {/* Bookings List Section */}
        <div className="mt-5 space-y-4" role="tabpanel">
          <AnimatePresence mode="popLayout">
            {isFirstLoad ? (
              Array.from({ length: SKELETON_CARDS }, (_, index) => <BookingCardSkeleton key={`skeleton-${index}`} />)
            ) : loadFailed ? (
              <BookingsLoadError key="error" onRetry={() => dispatch(fetchMyBookings())} />
            ) : visible.length > 0 ? (
              pagedBookings.map((booking, index) => (
                <BookingListCard key={booking.id} booking={booking} customerName={user?.fullName} index={index} />
              ))
            ) : (
              <BookingsEmptyState
                key={`empty-${tab}-${typeFilter}`}
                tab={tab}
                query={query}
                typeFilter={typeFilter}
                onResetFilters={resetAllFilters}
              />
            )}
          </AnimatePresence>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="pt-4">
              <Pagination
                page={safePage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
                ariaLabel="My bookings pagination"
              />
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function BookingCardSkeleton() {
  return (
    <div className="animate-pulse rounded-3xl border border-slate-100 bg-white p-5 shadow-lg shadow-slate-900/5 sm:p-6 dark:border-(--border-subtle) dark:bg-(--surface-1)">
      <div className="flex items-center gap-4">
        <div className="h-16 w-16 shrink-0 rounded-2xl bg-slate-100 sm:h-20 sm:w-20 dark:bg-(--surface-2)" />
        <div className="flex-1 space-y-2.5">
          <div className="h-4 w-32 rounded-full bg-slate-100 dark:bg-(--surface-2)" />
          <div className="h-5 w-48 rounded-full bg-slate-100 dark:bg-(--surface-2)" />
          <div className="h-4 w-64 max-w-full rounded-full bg-slate-100 dark:bg-(--surface-2)" />
        </div>
        <div className="hidden h-8 w-20 rounded-full bg-slate-100 sm:block dark:bg-(--surface-2)" />
      </div>
    </div>
  );
}

function BookingsLoadError({ onRetry }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="flex flex-col items-center rounded-3xl border-2 border-dashed border-rose-200 px-6 py-16 text-center dark:border-rose-500/30"
    >
      <span className="flex h-16 w-16 items-center justify-center rounded-full bg-rose-50 dark:bg-rose-500/10">
        <AlertTriangle className="h-8 w-8 text-rose-500" />
      </span>
      <h3 className="mt-5 text-lg font-bold text-slate-900 dark:text-(--text-primary)">Couldn't load your bookings</h3>
      <p className="mt-1 max-w-sm text-sm text-slate-500 dark:text-(--text-muted)">Check your connection and try again.</p>
      <button
        type="button"
        onClick={onRetry}
        className="mt-6 inline-flex items-center gap-2 rounded-xl bg-linear-to-r from-indigo-600 to-fuchsia-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-600/25 transition hover:brightness-110"
      >
        <RotateCcw className="h-4 w-4" />
        Try again
      </button>
    </motion.div>
  );
}


