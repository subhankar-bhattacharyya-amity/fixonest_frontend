import { AnimatePresence, motion } from "framer-motion";
import { BadgeIndianRupee, Banknote, CalendarClock, CalendarDays, Clock, MapPin, ShieldCheck, Star, Timer, UserRound } from "lucide-react";
import { WorkerPhoto } from "@/features/workers/components/index.js";
import { formatRupees } from "../definitions/bookable.js";
import { formatFullAddress } from "@/features/addresses/index.js";
import {
  BOOKING_TRUST_POINTS,
  CASH_ON_DELIVERY,
  formatDayLong,
  formatSlotRange,
} from "../definitions/bookingSchedule.data.js";

const TRUST_ICONS = { verified: ShieldCheck, pricing: BadgeIndianRupee, reschedule: CalendarClock };

// The sticky "your booking" card beside every step: what is booked, when,
// what it costs and how it's paid (cash on delivery). `address` is shown from
// the Address step on.
// `pricing` is bookingPricing.js's computeBookingPrice result.
// `provider` (service bookings, once a slot is picked) is the chosen
// professional, or null for "any available".
export default function BookingSummaryCard({ bookable, selectedDay, selectedSlot, hours, address, pricing, provider }) {
  const { total } = pricing;

  return (
    <motion.aside
      className="lg:sticky lg:top-24 lg:self-start"
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.25, ease: "easeOut" }}
    >
      <div className="overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-xl shadow-slate-900/5 dark:border-(--border-subtle) dark:bg-(--surface-1) dark:shadow-black/20">
        <div className="p-5 sm:p-6">
          <p className="text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-(--text-muted)">Your booking</p>

          <div className="mt-4 flex items-center gap-4">
            <div className="h-16 w-16 shrink-0 overflow-hidden rounded-2xl bg-indigo-50 shadow-sm dark:bg-indigo-500/10">
              {bookable.worker ? (
                <WorkerPhoto worker={bookable.worker} initialsClassName="text-xl" />
              ) : bookable.image ? (
                <img
                  src={bookable.image}
                  alt=""
                  className={`h-full w-full ${bookable.hasCover ? "object-cover" : "object-contain p-3"}`}
                />
              ) : null}
            </div>
            <div className="min-w-0">
              <p className="truncate text-lg font-bold text-slate-900 dark:text-(--text-primary)">{bookable.title}</p>
              <p className="truncate text-sm font-medium text-indigo-600 dark:text-indigo-400">{bookable.subtitle}</p>
              {bookable.rating > 0 && (
                <p className="mt-0.5 inline-flex items-center gap-1 text-xs text-slate-500 dark:text-(--text-muted)">
                  <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                  <span className="font-semibold text-slate-800 dark:text-(--text-primary)">{bookable.rating}</span>(
                  {Number(bookable.reviewCount || 0).toLocaleString()})
                </p>
              )}
            </div>
          </div>

          <dl className="mt-6 space-y-3.5 border-t border-slate-100 pt-5 text-sm dark:border-(--border-subtle)">
            <SummaryRow icon={CalendarDays} label="Date">
              <AnimatedValue value={selectedDay ? formatDayLong(selectedDay.date) : null} />
            </SummaryRow>
            <SummaryRow icon={Clock} label={bookable.perHour ? "Time" : "Arrival"}>
              <AnimatedValue value={selectedSlot ? formatSlotRange(selectedSlot) : null} />
            </SummaryRow>
            {bookable.perHour ? (
              <SummaryRow icon={Timer} label="Duration">
                <AnimatedValue value={`${hours} ${hours === 1 ? "hour" : "hours"}`} />
              </SummaryRow>
            ) : bookable.duration ? (
              <SummaryRow icon={Timer} label="Takes about">
                {bookable.duration}
              </SummaryRow>
            ) : null}
            {provider !== undefined && (
              <SummaryRow icon={UserRound} label="Professional">
                <AnimatePresence mode="wait" initial={false}>
                  <motion.span
                    key={provider?.id ?? 'any'}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    transition={{ duration: 0.15 }}
                    className="inline-flex items-center gap-2"
                  >
                    {provider ? (
                      <>
                        <span className="h-6 w-6 overflow-hidden rounded-full">
                          <WorkerPhoto worker={provider} initialsClassName="text-[10px]" />
                        </span>
                        {provider.name}
                      </>
                    ) : (
                      <span className="font-normal text-slate-500 dark:text-(--text-muted)">Any available</span>
                    )}
                  </motion.span>
                </AnimatePresence>
              </SummaryRow>
            )}
          </dl>

          <AnimatePresence initial={false}>
            {address && (
              <motion.div
                key="address"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.25 }}
                className="overflow-hidden"
              >
                <div className="mt-4 flex gap-2.5 rounded-xl bg-slate-50 p-3 text-sm dark:bg-(--surface-2)/60">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-indigo-500 dark:text-indigo-400" />
                  <AnimatePresence mode="wait" initial={false}>
                    <motion.div
                      key={address.id}
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                      transition={{ duration: 0.15 }}
                      className="min-w-0"
                    >
                      <p className="font-semibold text-slate-900 dark:text-(--text-primary)">{address.label}</p>
                      <p className="mt-0.5 text-xs leading-relaxed text-slate-500 dark:text-(--text-muted)">
                        {formatFullAddress(address)}
                      </p>
                    </motion.div>
                  </AnimatePresence>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="mt-5 flex items-end justify-between border-t border-dashed border-slate-200 pt-5 dark:border-(--border-subtle)">
            <div>
              <p className="text-sm font-semibold text-slate-900 dark:text-(--text-primary)">Total</p>
              <p className="text-xs text-slate-500 dark:text-(--text-muted)">
                {total === null ? "Price confirmed before the job" : "Pay after service"}
              </p>
              {bookable.perHour && bookable.priceLabel && (
                <p className="mt-0.5 text-xs text-slate-400 dark:text-(--text-muted)">{bookable.priceLabel}</p>
              )}
            </div>
            <div className="text-right">
              <AnimatePresence mode="popLayout" initial={false}>
                <motion.p
                  key={total ?? "none"}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.2 }}
                  className="text-2xl font-extrabold text-slate-900 dark:text-(--text-primary)"
                >
                  {total ? formatRupees(total) : "—"}
                </motion.p>
              </AnimatePresence>
            </div>
          </div>
        </div>

        <div className="mx-5 mb-5 flex gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 sm:mx-6 dark:border-emerald-500/20 dark:bg-emerald-500/10">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500 text-white shadow-md shadow-emerald-500/30">
            <Banknote className="h-5 w-5" />
          </span>
          <div>
            <p className="text-sm font-bold text-emerald-800 dark:text-emerald-300">{CASH_ON_DELIVERY.title}</p>
            <p className="mt-0.5 text-xs leading-relaxed text-emerald-700/90 dark:text-emerald-400/90">{CASH_ON_DELIVERY.text}</p>
          </div>
        </div>
      </div>

      <ul className="mt-4 space-y-3 rounded-3xl border border-slate-100 bg-white/70 p-5 backdrop-blur dark:border-(--border-subtle) dark:bg-(--surface-1)/70">
        {BOOKING_TRUST_POINTS.map((point) => {
          const Icon = TRUST_ICONS[point.key];
          return (
            <li key={point.key} className="flex items-center gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400">
                <Icon className="h-4 w-4" />
              </span>
              <div>
                <p className="text-sm font-semibold text-slate-800 dark:text-(--text-primary)">{point.title}</p>
                <p className="text-xs text-slate-500 dark:text-(--text-muted)">{point.text}</p>
              </div>
            </li>
          );
        })}
      </ul>
    </motion.aside>
  );
}

function SummaryRow({ icon: Icon, label, children }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <dt className="flex items-center gap-2 text-slate-500 dark:text-(--text-muted)">
        <Icon className="h-4 w-4 text-indigo-500 dark:text-indigo-400" />
        {label}
      </dt>
      <dd className="text-right font-semibold text-slate-900 dark:text-(--text-primary)">{children}</dd>
    </div>
  );
}

// Fades between values; shows a muted "Not selected" placeholder when empty.
function AnimatedValue({ value }) {
  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.span
        key={value ?? "empty"}
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -4 }}
        transition={{ duration: 0.15 }}
        className={value ? "" : "font-normal text-slate-400 dark:text-(--text-muted)"}
      >
        {value ?? "Not selected"}
      </motion.span>
    </AnimatePresence>
  );
}
