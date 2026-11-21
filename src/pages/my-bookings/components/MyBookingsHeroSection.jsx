import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { CalendarClock, CheckCircle2, ChevronRight, Plus, Wallet } from "lucide-react";
import { ROUTES } from "@/routes/constants.js";
import { formatRupees } from "../definitions/myBookings.data.js";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0 },
};

// Breadcrumb, title and three quick stats (from the statistics API -
// `isLoading` shows a placeholder until it answers).
export default function MyBookingsHeroSection({
  upcomingCount,
  completedCount,
  paidInCash,
  isLoading = false,
  onSelectTab,
}) {
  const stats = [
    {
      key: "upcoming",
      tabTarget: "confirmed",
      label: "Confirmed & Upcoming",
      value: upcomingCount,
      icon: CalendarClock,
      tone: "from-indigo-500 to-violet-600",
    },
    {
      key: "completed",
      tabTarget: "completed",
      label: "Completed visits",
      value: completedCount,
      icon: CheckCircle2,
      tone: "from-emerald-400 to-teal-600",
    },
    {
      key: "spent",
      tabTarget: null,
      label: "Paid in cash",
      value: formatRupees(paidInCash),
      icon: Wallet,
      tone: "from-amber-400 to-orange-500",
    },
  ];

  return (
    <div>
      <motion.nav
        aria-label="Breadcrumb"
        initial="hidden"
        animate="visible"
        variants={fadeUp}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="flex flex-wrap items-center gap-1.5 text-sm text-slate-500 dark:text-(--text-muted)"
      >
        <Link to={ROUTES.HOME} className="transition hover:text-indigo-600 dark:hover:text-indigo-400">
          Home
        </Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="text-slate-700 dark:text-(--text-primary)">My bookings</span>
      </motion.nav>

      <motion.div
        className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"
        initial="hidden"
        animate="visible"
        variants={fadeUp}
        transition={{ duration: 0.5, delay: 0.05, ease: "easeOut" }}
      >
        <div>
          <h1 className="text-3xl font-extrabold leading-tight tracking-tight text-slate-900 dark:text-(--text-primary) sm:text-4xl">
            My{" "}
            <span className="bg-linear-to-r from-indigo-600 to-fuchsia-600 bg-clip-text text-transparent dark:from-indigo-400 dark:to-fuchsia-400">
              bookings
            </span>
          </h1>
          <p className="mt-2 text-base text-slate-600 dark:text-(--text-muted)">
            Track upcoming visits, rate finished jobs and book again in a tap.
          </p>
        </div>
        <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} className="w-fit">
          <Link
            to={ROUTES.SERVICES}
            className="inline-flex items-center gap-2 rounded-xl bg-linear-to-r from-indigo-600 to-fuchsia-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-600/25 transition hover:brightness-110"
          >
            <Plus className="h-4 w-4" />
            New booking
          </Link>
        </motion.div>
      </motion.div>

      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {stats.map(({ key, tabTarget, label, value, icon: Icon, tone }, index) => {
          const isClickable = Boolean(tabTarget && onSelectTab);
          return (
            <motion.div
              key={key}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 + index * 0.08, ease: "easeOut" }}
              onClick={() => isClickable && onSelectTab(tabTarget)}
              className={`flex items-center gap-4 rounded-2xl border border-slate-100 bg-white/80 p-4 shadow-sm backdrop-blur transition dark:border-(--border-subtle) dark:bg-(--surface-1)/80 ${
                isClickable
                  ? "cursor-pointer hover:-translate-y-0.5 hover:border-indigo-200 hover:shadow-md dark:hover:border-indigo-500/30"
                  : ""
              }`}
            >
              <span className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-linear-to-br ${tone} text-white shadow-md`}>
                <Icon className="h-5 w-5" />
              </span>
              <div>
                {isLoading ? (
                  <span className="my-1.5 block h-6 w-14 animate-pulse rounded-full bg-slate-100 dark:bg-(--surface-2)" />
                ) : (
                  <p className="text-2xl font-extrabold text-slate-900 dark:text-(--text-primary)">{value}</p>
                )}
                <p className="text-sm text-slate-500 dark:text-(--text-muted)">{label}</p>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
