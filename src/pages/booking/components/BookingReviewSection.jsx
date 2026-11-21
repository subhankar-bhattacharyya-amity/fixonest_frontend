import { AnimatePresence, motion } from "framer-motion";
import {
  AlertCircle,
  ArrowLeft,
  Banknote,
  CalendarDays,
  Check,
  CreditCard,
  Loader2,
  MapPin,
  MessageSquareText,
  Pencil,
  Phone,
  ShieldCheck,
  Star,
  UserRound,
} from "lucide-react";
import { WorkerPhoto } from "@/features/workers/components/index.js";
import { formatRupees } from "../definitions/bookable.js";
import { formatFullAddress } from "@/features/addresses/index.js";
import { PAYMENT_METHODS } from "../definitions/bookingReviewValidation.js";
import { formatDayLong, formatSlotRange } from "../definitions/bookingSchedule.data.js";

// Step 3 of the booking flow: one last look at everything, the price,
// cash on delivery, and the terms.
// The form itself lives in BookingFlow.jsx.
export default function BookingReviewSection({
  bookable,
  hours,
  selectedDay,
  selectedSlot,
  address,
  contact,
  pricing,
  provider,
  form,
  onEditSchedule,
  onEditAddress,
  onBack,
  onSubmit,
}) {
  const { register, formState, values } = form;
  const { errors, isSubmitting } = formState;

  return (
    <motion.form
      noValidate
      onSubmit={onSubmit}
      className="overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-xl shadow-slate-900/5 dark:border-(--border-subtle) dark:bg-(--surface-1) dark:shadow-black/20"
    >
      <div className="p-5 sm:p-8">
        <p className="text-xs font-bold uppercase tracking-widest text-indigo-600 dark:text-indigo-400">Step 3</p>
        <h2 className="mt-1 text-2xl font-extrabold tracking-tight text-slate-900 dark:text-(--text-primary)">
          Review your booking
        </h2>
        <p className="mt-1 text-sm text-slate-500 dark:text-(--text-muted)">
          Check the details below. You pay in cash after the job is done.
        </p>

        {/* Booking details */}
        <div className="mt-6 divide-y divide-slate-100 rounded-2xl border border-slate-100 dark:divide-(--border-subtle) dark:border-(--border-subtle)">
          <div className="flex items-center gap-4 p-4">
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
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 dark:text-(--text-muted)">
                {bookable.kind === "worker" ? "Professional" : "Service"}
              </p>
              <p className="truncate font-bold text-slate-900 dark:text-(--text-primary)">{bookable.title}</p>
              <p className="truncate text-sm text-indigo-600 dark:text-indigo-400">{bookable.subtitle}</p>
            </div>
          </div>

          <ReviewRow icon={CalendarDays} label="When" onEdit={onEditSchedule}>
            {selectedDay && selectedSlot ? (
              <>
                <p className="font-semibold text-slate-900 dark:text-(--text-primary)">{formatDayLong(selectedDay.date)}</p>
                <p className="text-sm text-slate-500 dark:text-(--text-muted)">
                  {formatSlotRange(selectedSlot)}
                  {bookable.perHour ? ` · ${hours} ${hours === 1 ? "hour" : "hours"}` : ""}
                </p>
              </>
            ) : (
              <p className="text-sm text-rose-600">No time selected</p>
            )}
          </ReviewRow>

          {provider !== undefined && (
            <ReviewRow icon={UserRound} label="Professional" onEdit={onEditSchedule}>
              {provider ? (
                <span className="flex items-center gap-2.5">
                  <span className="h-8 w-8 shrink-0 overflow-hidden rounded-full">
                    <WorkerPhoto worker={provider} initialsClassName="text-xs" />
                  </span>
                  <span>
                    <span className="block font-semibold text-slate-900 dark:text-(--text-primary)">{provider.name}</span>
                    <span className="flex items-center gap-1 text-sm text-slate-500 dark:text-(--text-muted)">
                      <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                      {provider.rating} ({provider.reviewCount})
                    </span>
                  </span>
                </span>
              ) : (
                <>
                  <p className="font-semibold text-slate-900 dark:text-(--text-primary)">Any available professional</p>
                  <p className="text-sm text-slate-500 dark:text-(--text-muted)">We'll assign the best-rated pro who's free.</p>
                </>
              )}
            </ReviewRow>
          )}

          <ReviewRow icon={MapPin} label="Where" onEdit={onEditAddress}>
            {address ? (
              <>
                <p className="font-semibold text-slate-900 dark:text-(--text-primary)">{address.label}</p>
                <p className="text-sm leading-relaxed text-slate-500 dark:text-(--text-muted)">{formatFullAddress(address)}</p>
              </>
            ) : (
              <p className="text-sm text-rose-600">No address selected</p>
            )}
          </ReviewRow>

          <ReviewRow icon={Phone} label="Contact" onEdit={onEditAddress}>
            <p className="font-semibold text-slate-900 dark:text-(--text-primary)">{contact.name}</p>
            <p className="text-sm text-slate-500 dark:text-(--text-muted)">{contact.phone}</p>
          </ReviewRow>

          {contact.instructions?.trim() && (
            <ReviewRow icon={MessageSquareText} label="Notes" onEdit={onEditAddress}>
              <p className="whitespace-pre-line text-sm leading-relaxed text-slate-600 dark:text-(--text-muted)">
                {contact.instructions.trim()}
              </p>
            </ReviewRow>
          )}
        </div>

        {/* Price breakdown */}
        <div className="mt-8">
          <h3 className="text-base font-bold text-slate-900 dark:text-(--text-primary)">Price details</h3>
          {pricing.total === null ? (
            <p className="mt-3 rounded-2xl bg-slate-50 p-4 text-sm text-slate-600 dark:bg-(--surface-2)/60 dark:text-(--text-muted)">
              {bookable.shortName} will confirm the price with you before starting the job.
            </p>
          ) : (
            <div className="mt-3 rounded-2xl bg-slate-50 p-5 dark:bg-(--surface-2)/60">
              <dl className="space-y-3 text-sm">
                <AnimatePresence initial={false}>
                  {pricing.lines.map((line) => (
                    <motion.div
                      key={line.key}
                      layout
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="flex items-center justify-between gap-3"
                    >
                      <dt className="text-slate-600 dark:text-(--text-muted)">{line.label}</dt>
                      <dd className="font-semibold text-slate-900 dark:text-(--text-primary)">{formatRupees(line.amount)}</dd>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </dl>
              <div className="mt-4 flex items-end justify-between border-t border-dashed border-slate-300 pt-4 dark:border-(--border-subtle)">
                <div>
                  <p className="font-bold text-slate-900 dark:text-(--text-primary)">To pay after service</p>
                  {!bookable.perHour && (
                    <p className="text-xs text-slate-500 dark:text-(--text-muted)">Extra parts, if needed, are quoted on site</p>
                  )}
                </div>
                <AnimatePresence mode="popLayout" initial={false}>
                  <motion.p
                    key={pricing.total}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    className="text-2xl font-extrabold text-slate-900 dark:text-(--text-primary)"
                  >
                    {formatRupees(pricing.total)}
                  </motion.p>
                </AnimatePresence>
              </div>
            </div>
          )}
        </div>

        {/* Payment method */}
        <div className="mt-8">
          <h3 className="text-base font-bold text-slate-900 dark:text-(--text-primary)">Payment method</h3>
          <div role="radiogroup" aria-label="Payment method" className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <label className="relative flex cursor-pointer items-start gap-3 rounded-2xl border-2 border-emerald-500 bg-emerald-50/60 p-4 dark:border-emerald-400 dark:bg-emerald-500/10">
              <input
                type="radio"
                value={PAYMENT_METHODS.COD}
                className="sr-only"
                {...register("paymentMethod")}
              />
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500 text-white shadow-md shadow-emerald-500/30">
                <Banknote className="h-5 w-5" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block font-bold text-slate-900 dark:text-(--text-primary)">Cash on delivery</span>
                <span className="mt-0.5 block text-xs leading-relaxed text-slate-600 dark:text-(--text-muted)">
                  Pay the professional once the job is done
                </span>
              </span>
              {values.paymentMethod === PAYMENT_METHODS.COD && (
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-white">
                  <Check className="h-3 w-3" strokeWidth={3} />
                </span>
              )}
            </label>

            <div
              aria-disabled="true"
              className="flex cursor-not-allowed items-start gap-3 rounded-2xl border-2 border-dashed border-slate-200 p-4 opacity-60 dark:border-(--border-subtle)"
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-400 dark:bg-(--surface-2)">
                <CreditCard className="h-5 w-5" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="flex items-center gap-2 font-bold text-slate-700 dark:text-(--text-primary)">
                  Pay online
                  <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-slate-500 dark:bg-(--surface-2) dark:text-(--text-muted)">
                    Coming soon
                  </span>
                </span>
                <span className="mt-0.5 block text-xs text-slate-500 dark:text-(--text-muted)">UPI, cards & wallets</span>
              </span>
            </div>
          </div>
        </div>

        {/* Terms */}
        <div className="mt-8">
          <label className="group flex cursor-pointer items-start gap-3">
            <input type="checkbox" className="peer sr-only" {...register("acceptTerms")} />
            <span
              className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border-2 transition peer-focus-visible:ring-4 peer-focus-visible:ring-indigo-100 ${
                values.acceptTerms
                  ? "border-indigo-600 bg-indigo-600 text-white dark:border-indigo-400 dark:bg-indigo-400"
                  : errors.acceptTerms
                    ? "border-rose-400"
                    : "border-slate-300 group-hover:border-indigo-400 dark:border-(--border-subtle)"
              }`}
            >
              {values.acceptTerms && <Check className="h-3.5 w-3.5" strokeWidth={3} />}
            </span>
            <span className="text-sm leading-relaxed text-slate-600 dark:text-(--text-muted)">
              I agree to Fixonest's booking and cancellation terms. Cancel or reschedule for free up to 2 hours before the
              visit.
            </span>
          </label>
          <AnimatePresence>
            {errors.acceptTerms && (
              <motion.p
                role="alert"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1, x: [0, -6, 6, -4, 4, 0] }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4 }}
                className="mt-2 inline-flex items-center gap-1.5 text-sm font-medium text-rose-600 dark:text-rose-400"
              >
                <AlertCircle className="h-4 w-4" />
                {errors.acceptTerms.message}
              </motion.p>
            )}
          </AnimatePresence>
        </div>
      </div>

      <div className="flex flex-col-reverse gap-3 border-t border-slate-100 bg-slate-50/70 p-5 sm:flex-row sm:items-center sm:justify-between sm:px-8 dark:border-(--border-subtle) dark:bg-(--surface-2)/40">
        <button
          type="button"
          onClick={onBack}
          disabled={isSubmitting}
          className="inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold text-slate-600 transition hover:bg-white hover:text-slate-900 disabled:opacity-50 dark:text-(--text-muted) dark:hover:bg-(--surface-2) dark:hover:text-(--text-primary)"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>
        <div className="flex flex-col items-stretch gap-2 sm:items-end">
          <motion.button
            type="submit"
            disabled={isSubmitting}
            whileHover={isSubmitting ? undefined : { scale: 1.03 }}
            whileTap={isSubmitting ? undefined : { scale: 0.97 }}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-linear-to-r from-indigo-600 to-fuchsia-600 px-7 py-3.5 text-sm font-semibold text-white shadow-lg shadow-indigo-600/25 transition hover:brightness-110 disabled:cursor-wait disabled:opacity-80"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Confirming your booking…
              </>
            ) : (
              <>
                <ShieldCheck className="h-4 w-4" />
                Confirm booking{pricing.total !== null ? ` · ${formatRupees(pricing.total)}` : ""}
              </>
            )}
          </motion.button>
          <p className="text-center text-xs text-slate-500 sm:text-right dark:text-(--text-muted)">
            Nothing to pay now
          </p>
        </div>
      </div>
    </motion.form>
  );
}

function ReviewRow({ icon: Icon, label, onEdit, children }) {
  return (
    <div className="flex items-start gap-4 p-4">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400">
        <Icon className="h-5 w-5" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 dark:text-(--text-muted)">{label}</p>
        <div className="mt-0.5">{children}</div>
      </div>
      <button
        type="button"
        onClick={onEdit}
        aria-label={`Edit ${label.toLowerCase()}`}
        className="inline-flex shrink-0 items-center gap-1 rounded-lg px-2 py-1 text-sm font-semibold text-indigo-600 transition hover:bg-indigo-50 dark:text-indigo-400 dark:hover:bg-indigo-500/10"
      >
        <Pencil className="h-3.5 w-3.5" />
        <span className="hidden sm:inline">Edit</span>
      </button>
    </div>
  );
}
