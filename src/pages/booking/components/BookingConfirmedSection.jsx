import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { toast } from "sonner";
import {
  ArrowRight,
  Banknote,
  CalendarDays,
  Check,
  Clock,
  Copy,
  Headset,
  Home,
  MapPin,
  Phone,
  UserRound,
} from "lucide-react";
import { WorkerPhoto } from "@/features/workers/components/index.js";
import { ROUTES } from "@/routes/constants.js";
import { API_BOOKING_STATUS_LABELS } from "@/features/bookings/index.js";
import { formatRupees } from "../definitions/bookable.js";
import { formatFullAddress } from "@/features/addresses/index.js";
import { getNextSteps } from "../definitions/bookingConfirmation.js";
import { formatDayLong, formatSlotRange } from "../definitions/bookingSchedule.data.js";

const CONFETTI_COLORS = ["bg-indigo-500", "bg-fuchsia-500", "bg-amber-400", "bg-emerald-500", "bg-sky-400"];
const CONFETTI_COUNT = 18;

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0 },
};

// Step 4 of the booking flow: the booking is placed. `booking` is the
// snapshot BookingFlow.jsx takes when the customer confirms.
export default function BookingConfirmedSection({ booking }) {
  const { id, status, bookable, date, slot, hours, address, contact, total, provider } = booking;
  // Service bookings: the professional assigned (null = not known yet).
  const showProvider = bookable.kind === 'service' && provider !== undefined;
  // A booking from the API starts "pending" until the professional accepts it.
  const isPending = status === "pending";
  const statusLabel = status ? API_BOOKING_STATUS_LABELS[status] ?? status : "Confirmed";
  const nextSteps = getNextSteps(bookable.kind === "worker" ? bookable.shortName : provider?.firstName || null);

  const copyId = async () => {
    try {
      await navigator.clipboard.writeText(id);
      toast.success("Booking ID copied");
    } catch {
      toast.error("Couldn't copy - please note it down");
    }
  };

  return (
    <div className="mx-auto max-w-3xl">
      <SuccessBadge />

      <motion.div
        className="mt-6 text-center"
        initial="hidden"
        animate="visible"
        variants={fadeUp}
        transition={{ duration: 0.5, delay: 0.5, ease: "easeOut" }}
      >
        <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-(--text-primary) sm:text-4xl">
          {isPending ? "Booking placed!" : "Booking confirmed!"}
        </h2>
        <p className="mx-auto mt-2 max-w-lg text-base text-slate-600 dark:text-(--text-muted)">
          {bookable.kind === "worker" ? `${bookable.shortName} is` : provider ? `${provider.firstName} is` : "Your professional is"} booked for{" "}
          <span className="font-semibold text-slate-900 dark:text-(--text-primary)">{formatDayLong(date)}</span>
          {isPending ? " - we'll let you know as soon as they accept." : "."} Keep your booking ID handy in case you
          need help.
        </p>
      </motion.div>

      {/* Ticket */}
      <motion.div
        className="mt-8 overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-2xl shadow-indigo-900/10 dark:border-(--border-subtle) dark:bg-(--surface-1) dark:shadow-black/30"
        initial={{ opacity: 0, y: 32, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, delay: 0.65, ease: "easeOut" }}
      >
        <div className="flex flex-wrap items-center justify-between gap-3 bg-linear-to-r from-indigo-600 to-fuchsia-600 px-5 py-4 text-white sm:px-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-white/70">Booking ID</p>
            <div className="mt-0.5 flex items-center gap-2">
              <span className="font-mono text-lg font-bold tracking-wider">{id}</span>
              <button
                type="button"
                onClick={copyId}
                aria-label="Copy booking ID"
                className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/15 transition hover:bg-white/25"
              >
                <Copy className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1.5 text-xs font-bold uppercase tracking-wide backdrop-blur">
            <span className={`h-2 w-2 animate-pulse rounded-full ${isPending ? "bg-amber-300" : "bg-emerald-300"}`} />
            {statusLabel}
          </span>
        </div>

        <div className="p-5 sm:p-6">
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-indigo-50 dark:bg-indigo-500/10">
              {bookable.worker ? (
                <WorkerPhoto worker={bookable.worker} initialsClassName="text-lg" />
              ) : bookable.image ? (
                <img
                  src={bookable.image}
                  alt=""
                  className={`h-full w-full ${bookable.hasCover ? "object-cover" : "object-contain p-2.5"}`}
                />
              ) : null}
            </div>
            <div className="min-w-0">
              <p className="truncate text-lg font-bold text-slate-900 dark:text-(--text-primary)">{bookable.title}</p>
              <p className="truncate text-sm text-indigo-600 dark:text-indigo-400">{bookable.subtitle}</p>
            </div>
          </div>

          <dl className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2">
            <TicketItem icon={CalendarDays} label="Date">
              {formatDayLong(date)}
            </TicketItem>
            <TicketItem icon={Clock} label={bookable.perHour ? "Time" : "Arrival window"}>
              {formatSlotRange(slot)}
              {bookable.perHour ? ` (${hours} ${hours === 1 ? "hr" : "hrs"})` : ""}
            </TicketItem>
            <TicketItem icon={MapPin} label={`Address · ${address.label}`}>
              {formatFullAddress(address)}
            </TicketItem>
            <TicketItem icon={Phone} label="Contact">
              {contact.name} · {contact.phone}
            </TicketItem>
            {showProvider && (
              <TicketItem icon={UserRound} label="Professional">
                {provider ? (
                  <span className="inline-flex items-center gap-2">
                    <span className="h-6 w-6 overflow-hidden rounded-full">
                      <WorkerPhoto worker={provider} initialsClassName="text-[10px]" />
                    </span>
                    {provider.name}
                  </span>
                ) : (
                  "Any available - we'll confirm who's coming"
                )}
              </TicketItem>
            )}
          </dl>
        </div>

        <div className="relative px-5 sm:px-6" aria-hidden="true">
          <div className="border-t-2 border-dashed border-slate-200 dark:border-(--border-subtle)" />
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4 p-5 sm:p-6">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-500 text-white shadow-md shadow-emerald-500/30">
              <Banknote className="h-5 w-5" />
            </span>
            <div>
              <p className="text-sm font-bold text-slate-900 dark:text-(--text-primary)">Cash on delivery</p>
              <p className="text-xs text-slate-500 dark:text-(--text-muted)">Pay after the job is done · nothing paid yet</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 dark:text-(--text-muted)">To pay</p>
            <p className="text-2xl font-extrabold text-slate-900 dark:text-(--text-primary)">
              {total ? formatRupees(total) : "Quoted on site"}
            </p>
          </div>
        </div>
      </motion.div>

      {/* Actions */}
      <motion.div
        className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2"
        initial="hidden"
        animate="visible"
        variants={fadeUp}
        transition={{ duration: 0.5, delay: 0.85, ease: "easeOut" }}
      >
        <Link
          to={ROUTES.HOME}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:-translate-y-0.5 hover:border-indigo-300 hover:text-indigo-600 hover:shadow-md dark:border-(--border-subtle) dark:bg-(--surface-1) dark:text-(--text-primary)"
        >
          <Home className="h-4 w-4" />
          Back to home
        </Link>
        <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
          <Link
            to={ROUTES.MY_BOOKINGS}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-linear-to-r from-indigo-600 to-fuchsia-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-600/25 transition hover:brightness-110"
          >
            View my bookings
            <ArrowRight className="h-4 w-4" />
          </Link>
        </motion.div>
      </motion.div>

      {/* What happens next */}
      <motion.div
        className="mt-8 rounded-3xl border border-slate-100 bg-white/70 p-5 backdrop-blur sm:p-6 dark:border-(--border-subtle) dark:bg-(--surface-1)/70"
        initial="hidden"
        animate="visible"
        variants={fadeUp}
        transition={{ duration: 0.5, delay: 1, ease: "easeOut" }}
      >
        <h3 className="text-base font-bold text-slate-900 dark:text-(--text-primary)">What happens next</h3>
        <ol className="mt-5">
          {nextSteps.map((item, index) => (
            <motion.li
              key={item.key}
              className="relative flex gap-4 pb-6 last:pb-0"
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.35, delay: 1.1 + index * 0.12 }}
            >
              {index < nextSteps.length - 1 && (
                <span
                  aria-hidden="true"
                  className={`absolute left-4 top-9 h-[calc(100%-2.25rem)] w-0.5 -translate-x-1/2 ${
                    item.done ? "bg-emerald-300 dark:bg-emerald-500/40" : "bg-slate-200 dark:bg-(--border-subtle)"
                  }`}
                />
              )}
              <span
                className={`relative flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
                  item.done
                    ? "bg-emerald-500 text-white shadow-md shadow-emerald-500/30"
                    : "bg-slate-100 text-slate-500 dark:bg-(--surface-2) dark:text-(--text-muted)"
                }`}
              >
                {item.done ? <Check className="h-4 w-4" strokeWidth={3} /> : index + 1}
              </span>
              <div className="pt-1">
                <p className="text-sm font-semibold text-slate-900 dark:text-(--text-primary)">{item.title}</p>
                <p className="mt-0.5 text-sm text-slate-500 dark:text-(--text-muted)">{item.text}</p>
              </div>
            </motion.li>
          ))}
        </ol>
      </motion.div>

      <motion.p
        className="mt-6 flex flex-wrap items-center justify-center gap-1.5 text-center text-sm text-slate-500 dark:text-(--text-muted)"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.4 }}
      >
        <Headset className="h-4 w-4" />
        Need to change something? Reschedule free up to 2 hours before.
        <Link to={ROUTES.CONTACT} className="font-semibold text-indigo-600 hover:underline dark:text-indigo-400">
          Contact us
        </Link>
      </motion.p>
    </div>
  );
}

function TicketItem({ icon: Icon, label, children }) {
  return (
    <div className="flex items-start gap-3">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400">
        <Icon className="h-4 w-4" />
      </span>
      <div className="min-w-0">
        <dt className="text-xs font-semibold uppercase tracking-wide text-slate-400 dark:text-(--text-muted)">{label}</dt>
        <dd className="mt-0.5 text-sm font-medium leading-relaxed text-slate-800 dark:text-(--text-primary)">{children}</dd>
      </div>
    </div>
  );
}

// Animated check with ripples and a small confetti burst.
function SuccessBadge() {
  const [confetti] = useState(() =>
    Array.from({ length: CONFETTI_COUNT }, (_, index) => {
      const angle = (index / CONFETTI_COUNT) * Math.PI * 2;
      const distance = 90 + (index % 3) * 28;
      return {
        key: index,
        x: Math.cos(angle) * distance,
        y: Math.sin(angle) * distance,
        color: CONFETTI_COLORS[index % CONFETTI_COLORS.length],
        size: index % 2 === 0 ? "h-2.5 w-2.5" : "h-2 w-1",
        rotate: index * 40,
      };
    }),
  );

  return (
    <div className="relative mx-auto flex h-32 w-32 items-center justify-center" aria-hidden="true">
      {[0, 1].map((ring) => (
        <motion.span
          key={ring}
          className="absolute inset-4 rounded-full bg-emerald-400/30"
          initial={{ scale: 1, opacity: 0.6 }}
          animate={{ scale: 1.9, opacity: 0 }}
          transition={{ duration: 1.6, delay: 0.4 + ring * 0.5, repeat: 2, ease: "easeOut" }}
        />
      ))}

      {confetti.map((piece) => (
        <motion.span
          key={piece.key}
          className={`absolute rounded-sm ${piece.color} ${piece.size}`}
          initial={{ x: 0, y: 0, opacity: 0, scale: 0.4, rotate: 0 }}
          animate={{ x: piece.x, y: piece.y, opacity: [0, 1, 1, 0], scale: 1, rotate: piece.rotate }}
          transition={{ duration: 1.3, delay: 0.35, ease: "easeOut" }}
        />
      ))}

      <motion.div
        className="relative flex h-24 w-24 items-center justify-center rounded-full bg-linear-to-br from-emerald-400 to-emerald-600 shadow-2xl shadow-emerald-500/40"
        initial={{ scale: 0, rotate: -45 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: "spring", stiffness: 260, damping: 18 }}
      >
        <svg viewBox="0 0 24 24" className="h-12 w-12" fill="none" stroke="white" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
          <motion.path
            d="M5 12.5l4.5 4.5L19 7.5"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.45, delay: 0.3, ease: "easeOut" }}
          />
        </svg>
      </motion.div>
    </div>
  );
}
