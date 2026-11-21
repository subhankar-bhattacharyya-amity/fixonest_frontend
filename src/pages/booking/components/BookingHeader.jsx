import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Banknote, Check, ChevronRight } from "lucide-react";
import { ROUTES } from "@/routes/constants.js";
import { BOOKING_STEPS } from "../definitions/bookingSchedule.data.js";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0 },
};

// Breadcrumb, title and the step progress of the booking flow. Finished
// steps can be clicked to go back to them, until the booking is complete
// (`isComplete`), when every step shows as done.
export default function BookingHeader({ bookable, currentStep, isComplete = false, onStepClick }) {
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
        <Link to={bookable.breadcrumb.to} className="transition hover:text-indigo-600 dark:hover:text-indigo-400">
          {bookable.breadcrumb.label}
        </Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <Link to={bookable.detailsTo} className="max-w-48 truncate transition hover:text-indigo-600 dark:hover:text-indigo-400">
          {bookable.title}
        </Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="text-slate-700 dark:text-(--text-primary)">Book</span>
      </motion.nav>

      <motion.div
        className="mt-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between"
        initial="hidden"
        animate="visible"
        variants={fadeUp}
        transition={{ duration: 0.5, delay: 0.05, ease: "easeOut" }}
      >
        <div>
          <h1 className="text-3xl font-extrabold leading-tight tracking-tight text-slate-900 dark:text-(--text-primary) sm:text-4xl">
            Book{" "}
            <span className="bg-linear-to-r from-indigo-600 to-fuchsia-600 bg-clip-text text-transparent dark:from-indigo-400 dark:to-fuchsia-400">
              {bookable.shortName}
            </span>
          </h1>
          <p className="mt-2 max-w-xl text-base text-slate-600 dark:text-(--text-muted)">
            A few quick steps and you're done. No advance payment needed.
          </p>
        </div>

        <span className="inline-flex w-fit items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-400">
          <Banknote className="h-4 w-4" />
          Pay after service
        </span>
      </motion.div>

      <motion.ol
        aria-label="Booking progress"
        className="mt-8 flex items-center rounded-2xl border border-slate-100 bg-white/70 p-3 shadow-sm backdrop-blur sm:p-4 dark:border-(--border-subtle) dark:bg-(--surface-1)/70"
        initial="hidden"
        animate="visible"
        variants={fadeUp}
        transition={{ duration: 0.5, delay: 0.1, ease: "easeOut" }}
      >
        {BOOKING_STEPS.map((step, index) => {
          const isDone = isComplete || index < currentStep;
          const isCurrent = !isComplete && index === currentStep;
          const canGoBack = isDone && !isComplete && Boolean(onStepClick);
          return (
            <li
              key={step.key}
              aria-current={isCurrent ? "step" : undefined}
              className={`flex items-center ${index < BOOKING_STEPS.length - 1 ? "flex-1" : ""}`}
            >
              <button
                type="button"
                onClick={() => onStepClick?.(index)}
                disabled={!canGoBack}
                aria-label={canGoBack ? `Back to ${step.label}` : step.label}
                className="flex items-center gap-2.5 rounded-full transition enabled:hover:opacity-80 disabled:cursor-default"
              >
                <span
                  className={`relative flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold transition ${
                    isCurrent
                      ? "bg-linear-to-br from-indigo-600 to-fuchsia-600 text-white shadow-lg shadow-indigo-600/30"
                      : isDone
                        ? "bg-emerald-500 text-white"
                        : "bg-slate-100 text-slate-400 dark:bg-(--surface-2) dark:text-(--text-muted)"
                  }`}
                >
                  {isCurrent && (
                    <span className="absolute inset-0 animate-ping rounded-full bg-indigo-500/30" aria-hidden="true" />
                  )}
                  {isDone ? <Check className="h-4 w-4" /> : index + 1}
                </span>
                <span
                  className={`text-sm font-semibold ${isCurrent ? "block" : "hidden md:block"} ${
                    isCurrent || isDone
                      ? "text-slate-900 dark:text-(--text-primary)"
                      : "text-slate-400 dark:text-(--text-muted)"
                  }`}
                >
                  {step.label}
                </span>
              </button>
              {index < BOOKING_STEPS.length - 1 && (
                <span
                  aria-hidden="true"
                  className={`mx-3 h-0.5 flex-1 rounded-full ${
                    isDone ? "bg-emerald-500" : "bg-slate-100 dark:bg-(--surface-2)"
                  }`}
                />
              )}
            </li>
          );
        })}
      </motion.ol>
    </div>
  );
}
