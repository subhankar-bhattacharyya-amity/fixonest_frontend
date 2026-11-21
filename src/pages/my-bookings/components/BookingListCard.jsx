import { useState } from "react";
import { Link } from "react-router-dom";
import { useDispatch } from "react-redux";
import { AnimatePresence, motion } from "framer-motion";
import { toast } from "sonner";
import {
  AlertTriangle,
  Banknote,
  CalendarClock,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronDown,
  Clock,
  Copy,
  FileText,
  Headset,
  History,
  Loader2,
  Mail,
  MapPin,
  MessageSquareText,
  Phone,
  RefreshCw,
  RotateCcw,
  Sparkles,
  UserRound,
  Wrench,
  XCircle,
} from "lucide-react";
import { ConfirmDialog } from "@/components/common/confirmDialog/index.js";
import CustomerInvoiceModal from "./CustomerInvoiceModal.jsx";
import { WorkerPhoto } from "@/features/workers/components/index.js";
import {
  BOOKING_STATUS,
  FREE_CANCEL_HOURS,
  cancelMyBooking,
  fetchBookingDetails,
  fetchMyBookingStatistics,
  getBookingStart,
  useBookings,
} from "@/features/bookings/index.js";
import { ROUTES } from "@/routes/constants.js";
import { BOOKING_CATEGORY_ICONS } from "../definitions/bookingIcons.js";
import {
  BOOKING_STAGES,
  formatAddress,
  formatBookingDate,
  formatBookingTime,
  formatCountdown,
  formatDurationMinutes,
  formatRupees,
  formatTimestamp,
  getPaymentStatusLabel,
} from "../definitions/myBookings.data.js";

// Backend statuses a customer may still cancel (booking.repositories.js
// cancelBooking refuses in_progress / completed / cancelled / rejected).
const CANCELLABLE_STAGES = ["pending", "confirmed"];

const STATUS_BADGES = {
  pending: {
    label: "Awaiting confirmation",
    icon: Clock,
    className: "bg-amber-50 text-amber-700 ring-1 ring-amber-200/80 dark:bg-amber-500/10 dark:text-amber-300 dark:ring-amber-500/30",
  },
  confirmed: {
    label: "Confirmed",
    icon: CheckCircle2,
    className: "bg-indigo-50 text-indigo-700 ring-1 ring-indigo-200/80 dark:bg-indigo-500/10 dark:text-indigo-300 dark:ring-indigo-500/30",
  },
  in_progress: {
    label: "In progress",
    icon: Sparkles,
    className: "bg-sky-50 text-sky-700 ring-1 ring-sky-200/80 dark:bg-sky-500/10 dark:text-sky-300 dark:ring-sky-500/30",
  },
  rejected: {
    label: "Declined by provider",
    icon: XCircle,
    className: "bg-rose-50 text-rose-700 ring-1 ring-rose-200/80 dark:bg-rose-500/10 dark:text-rose-300 dark:ring-rose-500/30",
  },
  [BOOKING_STATUS.COMPLETED]: {
    label: "Completed",
    icon: CheckCircle2,
    className: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200/80 dark:bg-emerald-500/10 dark:text-emerald-300 dark:ring-emerald-500/30",
  },
  [BOOKING_STATUS.CANCELLED]: {
    label: "Cancelled",
    icon: XCircle,
    className: "bg-rose-50 text-rose-700 ring-1 ring-rose-200/80 dark:bg-rose-500/10 dark:text-rose-300 dark:ring-rose-500/30",
  },
};

// One booking in the My bookings list. Actions depend on its status:
// upcoming -> reschedule / cancel / help, completed or cancelled -> book again.
export default function BookingListCard({ booking, customerName, index }) {
  const dispatch = useDispatch();
  const [isOpen, setIsOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [invoiceOpen, setInvoiceOpen] = useState(false);
  const { detailsStatus, cancelStatus } = useBookings();
  const cancelling = Boolean(booking.apiId) && cancelStatus[booking.apiId] === "loading";
  const detailStatus = booking.apiId ? detailsStatus[booking.apiId] : null;
  const details = booking.details ?? null;

  const isUpcoming = booking.status === BOOKING_STATUS.UPCOMING;
  const isCompleted = booking.status === BOOKING_STATUS.COMPLETED;
  const isCancelled = booking.status === BOOKING_STATUS.CANCELLED;
  const isConfirmedUpcoming = isUpcoming && (booking.stage === "confirmed" || booking.stage === "in_progress");
  const countdownText = isConfirmedUpcoming ? formatCountdown(booking) : null;
  const isNoProviderAvailable =
    isCancelled &&
    (booking.apiStatus === "rejected" ||
      Boolean(booking.cancelReason?.toLowerCase().includes("no professional")) ||
      Boolean(booking.cancelReason?.toLowerCase().includes("no provider")));
  let badgeKey = booking.status;
  if (isUpcoming) badgeKey = booking.stage;
  else if (booking.apiStatus === "rejected") badgeKey = "rejected";
  const badge = STATUS_BADGES[badgeKey] ?? STATUS_BADGES.confirmed;
  const placeLabel = [booking.address.label, booking.address.city].filter(Boolean).join(" · ");
  const hoursToStart = (getBookingStart(booking).getTime() - Date.now()) / 3600000;
  const canCancel =
    isUpcoming && Boolean(booking.apiId) && CANCELLABLE_STAGES.includes(booking.stage) && hoursToStart > FREE_CANCEL_HOURS;
  let cancelHint;
  if (!canCancel) {
    cancelHint =
      booking.stage === "in_progress"
        ? "The job has already started - contact us"
        : `Can't cancel within ${FREE_CANCEL_HOURS} hours of the visit - contact us`;
  }
  const rebookTo = booking.rebookPath ?? (booking.kind === "worker" ? ROUTES.WORKERS : ROUTES.SERVICES);
  const contactName = booking.contact.name ?? customerName;

  const copyId = async () => {
    try {
      await navigator.clipboard.writeText(booking.id);
      toast.success("Booking ID copied");
    } catch {
      toast.error("Couldn't copy the booking ID");
    }
  };

  // PATCH /bookings/my-bookings/:id/cancel. The booking then moves to the
  // Cancelled tab and the hero / tab counts are reloaded. A refusal is
  // toasted by httpClient and the dialog stays open.
  const handleCancel = async () => {
    try {
      await dispatch(cancelMyBooking({ id: booking.apiId })).unwrap();
      setConfirmOpen(false);
      toast.success("Booking cancelled", { description: "Nothing was charged." });
      dispatch(fetchMyBookingStatistics());
    } catch {
      // Already toasted.
    }
  };

  // Service bookings load their latest details (GET /bookings/my-bookings/:id)
  // every time the panel opens; the list's copy shows meanwhile.
  const loadDetails = () => {
    if (booking.apiId) dispatch(fetchBookingDetails(booking.apiId));
  };

  const toggleDetails = () => {
    if (!isOpen) loadDetails();
    setIsOpen((open) => !open);
  };

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.97 }}
      transition={{ duration: 0.35, delay: Math.min(index * 0.05, 0.3), ease: "easeOut" }}
      className="overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-lg shadow-slate-900/5 transition hover:shadow-xl dark:border-(--border-subtle) dark:bg-(--surface-1) dark:shadow-black/20"
    >
      <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:p-6">
        <BookingThumb booking={booking} muted={isCancelled} />

        <div className="min-w-0 flex-1">
          {/* Header Row: Status & Type on left, Booking ID on right */}
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${badge.className}`}>
                {badge.icon && <badge.icon className="h-3.5 w-3.5" />}
                {badge.label}
              </span>

              {booking.kind === "worker" ? (
                <span className="inline-flex items-center gap-1 rounded-full border border-purple-200/90 bg-purple-50 px-2.5 py-1 text-xs font-semibold text-purple-700 dark:border-purple-500/30 dark:bg-purple-500/10 dark:text-purple-300">
                  <UserRound className="h-3 w-3" />
                  Hired Provider
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 rounded-full border border-slate-200/80 bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-600 dark:border-(--border-subtle) dark:bg-(--surface-2) dark:text-(--text-muted)">
                  <Wrench className="h-3 w-3" />
                  Service
                </span>
              )}

              {countdownText && (
                <span className="inline-flex items-center gap-1 rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-semibold text-indigo-700 ring-1 ring-indigo-200/80 dark:bg-indigo-500/10 dark:text-indigo-300 dark:ring-indigo-500/30">
                  <CalendarClock className="h-3 w-3" />
                  {countdownText}
                </span>
              )}
            </div>

            <button
              type="button"
              onClick={copyId}
              title="Copy booking ID"
              className="inline-flex items-center gap-1 font-mono text-xs text-slate-400 transition hover:text-indigo-600 dark:text-(--text-muted) dark:hover:text-indigo-400"
            >
              <span className="text-[11px] text-slate-400">ID:</span>
              <span>{booking.id}</span>
              <Copy className="h-3 w-3" />
            </button>
          </div>

          <h3
            className={`mt-2.5 truncate text-lg font-bold ${
              isCancelled ? "text-slate-500 dark:text-(--text-muted)" : "text-slate-900 dark:text-(--text-primary)"
            }`}
          >
            {booking.title}
          </h3>
          <p className="text-sm font-medium text-indigo-600 dark:text-indigo-400">
            {booking.kind === "worker"
              ? `Hourly Hire · ${booking.hours} hr${booking.hours > 1 ? "s" : ""}${
                  booking.hourlyRate ? ` @ ${formatRupees(booking.hourlyRate)}/hr` : ""
                }`
              : booking.subtitle}
          </p>

          {/* Customer-friendly reassurance banner for non-tech customers */}
          {booking.stage === "pending" && (
            <div className="mt-2.5 flex items-center gap-2 rounded-xl border border-amber-200/80 bg-amber-50/60 px-3 py-2 text-xs text-amber-800 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-300">
              <Clock className="h-3.5 w-3.5 shrink-0 text-amber-600 dark:text-amber-400" />
              <span>Waiting for provider acceptance. You will be notified as soon as a professional accepts your request.</span>
            </div>
          )}
          {booking.stage === "confirmed" && (
            <div className="mt-2.5 flex items-center gap-2 rounded-xl border border-indigo-200/80 bg-indigo-50/60 px-3 py-2 text-xs text-indigo-800 dark:border-indigo-500/20 dark:bg-indigo-500/10 dark:text-indigo-300">
              <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-indigo-600 dark:text-indigo-400" />
              <span>Visit confirmed. Your professional will arrive during the scheduled arrival window.</span>
            </div>
          )}

          <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1.5 text-sm text-slate-600 dark:text-(--text-muted)">
            <span className="inline-flex items-center gap-1.5">
              <CalendarDays className="h-4 w-4 text-slate-400" />
              {formatBookingDate(booking)}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Clock className="h-4 w-4 text-slate-400" />
              {formatBookingTime(booking)}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <MapPin className="h-4 w-4 text-slate-400" />
              {placeLabel}
            </span>
          </div>

          {isNoProviderAvailable && (
            <div className="mt-3 flex items-start gap-2.5 rounded-2xl bg-rose-50/80 p-3 text-xs text-rose-800 dark:bg-rose-500/10 dark:text-rose-300">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-rose-600 dark:text-rose-400" />
              <div>
                <p className="font-semibold">Professional was unavailable for this timeslot</p>
                <p className="mt-0.5 text-rose-700/90 dark:text-rose-300/80">
                  {booking.cancelReason || "No professionals were free for this slot."} Tap below to book another timeslot.
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between gap-3 border-t border-slate-100 pt-4 sm:block sm:border-0 sm:pt-0 sm:text-right dark:border-(--border-subtle)">
          <p
            className={`text-2xl font-extrabold ${
              isCancelled ? "text-slate-400 line-through dark:text-(--text-muted)" : "text-slate-900 dark:text-(--text-primary)"
            }`}
          >
            {formatRupees(booking.total)}
          </p>
          <p className="inline-flex items-center gap-1 text-xs text-slate-500 dark:text-(--text-muted)">
            <Banknote className="h-3.5 w-3.5 text-emerald-500" />
            {isUpcoming ? "Pay after service" : isCompleted ? "Paid in cash" : "Not charged"}
          </p>
        </div>
      </div>

      {/* Expandable details */}
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="overflow-hidden"
          >
            <div className="border-t border-slate-100 px-5 py-5 sm:px-6 dark:border-(--border-subtle)">
              <DetailsSyncNote status={detailStatus} onRetry={loadDetails} />

              {isUpcoming && <StageTracker stage={booking.stage} />}

              <dl className={`grid grid-cols-1 gap-5 sm:grid-cols-2 ${isUpcoming ? "mt-6" : ""}`}>
                {details && (
                  <DetailItem
                    icon={booking.kind === "worker" ? UserRound : Wrench}
                    label={booking.kind === "worker" ? "Hired Professional" : "Service"}
                  >
                    {booking.title}
                    <span className="block text-slate-500 dark:text-(--text-muted)">
                      {booking.kind === "worker"
                        ? `Hourly Booking · ${booking.hours} hr${booking.hours > 1 ? "s" : ""}${
                            booking.hourlyRate ? ` @ ${formatRupees(booking.hourlyRate)}/hr` : ""
                          }`
                        : [booking.subtitle, details.verticalName, formatDurationMinutes(details.durationMinutes)]
                            .filter(Boolean)
                            .join(" · ")}
                    </span>
                  </DetailItem>
                )}
                <DetailItem icon={CalendarDays} label="Visit">
                  {formatBookingDate(booking)}
                  <span className="block text-slate-500 dark:text-(--text-muted)">{formatBookingTime(booking)}</span>
                </DetailItem>
                <DetailItem icon={MapPin} label={booking.address.label ? `Address · ${booking.address.label}` : "Address"}>
                  {formatAddress(booking.address)}
                </DetailItem>
                <DetailItem icon={Phone} label="Contact">
                  {contactName ? `${contactName} · ` : ""}
                  {booking.contact.phone}
                </DetailItem>
                {details?.professional ? (
                  <ProfessionalItem
                    professional={details.professional}
                    label={isUpcoming ? "Your professional" : "Served by"}
                    showContact={isUpcoming}
                  />
                ) : (
                  booking.professional && (
                    <DetailItem icon={UserRound} label={isUpcoming ? "Your professional" : "Served by"}>
                      {booking.professional.name}
                      {isUpcoming && booking.professional.phone ? ` · ${booking.professional.phone}` : ""}
                    </DetailItem>
                  )
                )}
                {booking.instructions && (
                  <DetailItem icon={MessageSquareText} label="Notes">
                    <span className="whitespace-pre-line">{booking.instructions}</span>
                  </DetailItem>
                )}
                {isCancelled && booking.cancelReason && (
                  <DetailItem icon={XCircle} label={booking.apiStatus === "rejected" ? "Reason declined" : "Cancellation"}>
                    {booking.cancelReason}
                  </DetailItem>
                )}
                {details && <TimelineItem timeline={details.timeline} />}
              </dl>

              <div className="mt-5 rounded-2xl bg-slate-50 p-4 text-sm dark:bg-(--surface-2)/60">
                {details && details.price > booking.total && (
                  <>
                    <PriceRow label="Service price" value={formatRupees(details.price)} />
                    <PriceRow
                      label="Discount"
                      value={`− ${formatRupees(details.price - booking.total)}`}
                      valueClassName="text-emerald-600 dark:text-emerald-400"
                    />
                  </>
                )}
                <PriceRow label="Payment method" value="Cash on delivery" />
                {details && !isCancelled && (
                  <PriceRow label="Payment status" value={getPaymentStatusLabel(details.paymentStatus, isCompleted)} />
                )}
                {isCompleted && (details?.paidAmount || booking.paidAmount) > 0 && (
                  <PriceRow
                    label="Cash paid to provider"
                    value={formatRupees(details?.paidAmount || booking.paidAmount || booking.total)}
                    valueClassName="text-emerald-600 dark:text-emerald-400 font-bold"
                  />
                )}
                <div className="mt-2 flex justify-between border-t border-dashed border-slate-200 pt-2 dark:border-(--border-subtle)">
                  <span className="font-semibold text-slate-700 dark:text-(--text-primary)">
                    {isUpcoming ? "To pay after service (in cash)" : isCompleted ? "Total Amount" : "Amount (not charged)"}
                  </span>
                  <span className="font-extrabold text-slate-900 dark:text-(--text-primary)">{formatRupees(booking.total)}</span>
                </div>
                {isCompleted && (
                  <div className="mt-3 pt-3 border-t border-slate-200/80 flex items-center justify-between text-xs dark:border-(--border-subtle)">
                    <span className="text-slate-500 dark:text-(--text-muted)">Official Tax Invoice</span>
                    <button
                      type="button"
                      onClick={() => setInvoiceOpen(true)}
                      className="inline-flex items-center gap-1 font-semibold text-indigo-600 hover:text-indigo-700 hover:underline dark:text-indigo-400"
                    >
                      <FileText className="h-3.5 w-3.5" />
                      View & Download Invoice
                    </button>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Actions */}
      <div className="flex flex-wrap items-center gap-2 border-t border-slate-100 bg-slate-50/60 px-5 py-3 sm:px-6 dark:border-(--border-subtle) dark:bg-(--surface-2)/30">
        <button
          type="button"
          onClick={toggleDetails}
          aria-expanded={isOpen}
          className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-white dark:text-(--text-primary) dark:hover:bg-(--surface-2)"
        >
          {isOpen ? "Hide details" : "View details"}
          <ChevronDown className={`h-4 w-4 transition ${isOpen ? "rotate-180" : ""}`} />
        </button>

        <div className="ml-auto flex flex-wrap items-center gap-2">
          {isUpcoming && (
            <>
              <Link
                to={ROUTES.CONTACT}
                className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-semibold text-slate-600 transition hover:bg-white hover:text-slate-900 dark:text-(--text-muted) dark:hover:bg-(--surface-2)"
              >
                <Headset className="h-4 w-4" />
                <span className="hidden sm:inline">Help</span>
              </Link>
              <button
                type="button"
                onClick={() => setConfirmOpen(true)}
                disabled={!canCancel}
                title={cancelHint}
                className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-semibold text-rose-600 transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-40 dark:text-rose-400 dark:hover:bg-rose-500/10"
              >
                <XCircle className="h-4 w-4" />
                Cancel
              </button>
              <button
                type="button"
                onClick={() => toast.info("Rescheduling is coming soon", { description: "For now, contact us to change the time." })}
                className="inline-flex items-center gap-1.5 rounded-lg border border-indigo-200 bg-white px-3 py-2 text-sm font-semibold text-indigo-600 transition hover:border-indigo-400 dark:border-indigo-500/30 dark:bg-transparent dark:text-indigo-400"
              >
                <CalendarClock className="h-4 w-4" />
                Reschedule
              </button>
            </>
          )}
          {isCompleted && (
            <button
              type="button"
              onClick={() => setInvoiceOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-indigo-200 bg-indigo-50/70 px-3.5 py-2 text-sm font-semibold text-indigo-700 transition hover:bg-indigo-100 dark:border-indigo-500/30 dark:bg-indigo-500/10 dark:text-indigo-300"
            >
              <FileText className="h-4 w-4" />
              Invoice (PDF)
            </button>
          )}
          {!isUpcoming && (
            <Link
              to={rebookTo}
              className="inline-flex items-center gap-1.5 rounded-lg bg-linear-to-r from-indigo-600 to-fuchsia-600 px-4 py-2 text-sm font-semibold text-white shadow-md shadow-indigo-600/20 transition hover:brightness-110"
            >
              <RotateCcw className="h-4 w-4" />
              {isNoProviderAvailable ? "Book another timeslot" : booking.rebookPath ? "Book again" : "Book similar"}
            </Link>
          )}
        </div>
      </div>

      <ConfirmDialog
        open={confirmOpen}
        title="Cancel this booking?"
        description={`${booking.title} on ${formatBookingDate(booking)}, ${formatBookingTime(booking)}. Cancelling now is free.`}
        confirmLabel="Yes, cancel it"
        cancelLabel="Keep booking"
        variant="danger"
        loading={cancelling}
        onConfirm={handleCancel}
        onCancel={() => !cancelling && setConfirmOpen(false)}
      />

      <CustomerInvoiceModal
        isOpen={invoiceOpen}
        onClose={() => setInvoiceOpen(false)}
        bookingId={booking.apiId || booking.id}
        bookingNumber={booking.code || booking.id}
      />
    </motion.article>
  );
}

function BookingThumb({ booking, muted }) {
  const category = BOOKING_CATEGORY_ICONS[booking.icon] ?? BOOKING_CATEGORY_ICONS.default;
  const Icon = category.icon;
  return (
    <div
      className={`h-16 w-16 shrink-0 overflow-hidden rounded-2xl shadow-md sm:h-20 sm:w-20 ${muted ? "opacity-50 grayscale" : ""}`}
    >
      {booking.worker ? (
        <WorkerPhoto worker={booking.worker} initialsClassName="text-xl" />
      ) : booking.image ? (
        <img
          src={booking.image}
          alt=""
          className={`h-full w-full bg-indigo-50 ${booking.hasCover ? "object-cover" : "object-contain p-3"}`}
        />
      ) : (
        <div className={`flex h-full w-full items-center justify-center bg-linear-to-br ${category.className} text-white`}>
          <Icon className="h-8 w-8" />
        </div>
      )}
    </div>
  );
}

function StageTracker({ stage }) {
  const current = Math.max(
    0,
    BOOKING_STAGES.findIndex((item) => item.key === stage),
  );
  return (
    <ol className="flex items-center" aria-label="Booking progress">
      {BOOKING_STAGES.map((item, index) => {
        const isDone = index <= current;
        return (
          <li key={item.key} className={`flex items-center ${index < BOOKING_STAGES.length - 1 ? "flex-1" : ""}`}>
            <div className="flex flex-col items-center gap-1.5">
              <span
                className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${
                  isDone
                    ? "bg-emerald-500 text-white shadow-md shadow-emerald-500/30"
                    : "bg-slate-100 text-slate-400 dark:bg-(--surface-2) dark:text-(--text-muted)"
                }`}
              >
                {isDone ? <Check className="h-3.5 w-3.5" strokeWidth={3} /> : index + 1}
              </span>
              <span
                className={`whitespace-nowrap text-[11px] font-semibold ${
                  isDone ? "text-slate-800 dark:text-(--text-primary)" : "text-slate-400 dark:text-(--text-muted)"
                }`}
              >
                {item.label}
              </span>
            </div>
            {index < BOOKING_STAGES.length - 1 && (
              <span
                className={`mx-2 mb-5 h-0.5 flex-1 rounded-full ${
                  index < current ? "bg-emerald-500" : "bg-slate-200 dark:bg-(--border-subtle)"
                }`}
              />
            )}
          </li>
        );
      })}
    </ol>
  );
}

// "Getting the latest details…" while loading; a retry link if it failed
// (the list's copy stays on screen either way).
function DetailsSyncNote({ status, onRetry }) {
  if (status === "loading") {
    return (
      <p className="mb-4 inline-flex items-center gap-1.5 text-xs font-medium text-slate-400 dark:text-(--text-muted)">
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
        Getting the latest details…
      </p>
    );
  }
  if (status === "failed") {
    return (
      <p className="mb-4 flex flex-wrap items-center gap-2 text-xs font-medium text-rose-600 dark:text-rose-400">
        Couldn't load the latest details.
        <button
          type="button"
          onClick={onRetry}
          className="inline-flex items-center gap-1 font-semibold text-indigo-600 hover:underline dark:text-indigo-400"
        >
          <RefreshCw className="h-3 w-3" />
          Try again
        </button>
      </p>
    );
  }
  return null;
}

function ProfessionalItem({ professional, label, showContact }) {
  return (
    <div className="flex items-start gap-3">
      <span className="h-9 w-9 shrink-0 overflow-hidden rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400">
        <WorkerPhoto worker={professional} initialsClassName="text-xs" />
      </span>
      <div className="min-w-0">
        <dt className="text-xs font-semibold uppercase tracking-wide text-slate-400 dark:text-(--text-muted)">{label}</dt>
        <dd className="mt-0.5 text-sm leading-relaxed text-slate-700 dark:text-(--text-primary)">
          {professional.name}
          {showContact && professional.phone && (
            <a
              href={`tel:${professional.phone.replace(/\s+/g, "")}`}
              className="mt-0.5 flex items-center gap-1.5 text-indigo-600 hover:underline dark:text-indigo-400"
            >
              <Phone className="h-3.5 w-3.5" />
              {professional.phone}
            </a>
          )}
          {showContact && professional.email && (
            <a
              href={`mailto:${professional.email}`}
              className="mt-0.5 flex items-center gap-1.5 break-all text-indigo-600 hover:underline dark:text-indigo-400"
            >
              <Mail className="h-3.5 w-3.5 shrink-0" />
              {professional.email}
            </a>
          )}
        </dd>
      </div>
    </div>
  );
}

// When the booking was placed, confirmed, finished, cancelled or declined.
function TimelineItem({ timeline }) {
  const rows = [
    ["Booked", timeline.bookedAt],
    ["Confirmed", timeline.acceptedAt],
    ["Completed", timeline.completedAt],
    ["Cancelled", timeline.cancelledAt],
    ["Declined", timeline.rejectedAt],
  ].filter(([, value]) => value);
  if (!rows.length) return null;
  return (
    <DetailItem icon={History} label="History">
      {rows.map(([label, value]) => (
        <span key={label} className="block">
          <span className="text-slate-500 dark:text-(--text-muted)">{label}:</span> {formatTimestamp(value)}
        </span>
      ))}
    </DetailItem>
  );
}

function PriceRow({ label, value, valueClassName = "text-slate-900 dark:text-(--text-primary)" }) {
  return (
    <div className="flex justify-between py-0.5">
      <span className="text-slate-500 dark:text-(--text-muted)">{label}</span>
      <span className={`font-semibold ${valueClassName}`}>{value}</span>
    </div>
  );
}

function DetailItem({ icon: Icon, label, children }) {
  return (
    <div className="flex items-start gap-3">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400">
        <Icon className="h-4 w-4" />
      </span>
      <div className="min-w-0">
        <dt className="text-xs font-semibold uppercase tracking-wide text-slate-400 dark:text-(--text-muted)">{label}</dt>
        <dd className="mt-0.5 text-sm leading-relaxed text-slate-700 dark:text-(--text-primary)">{children}</dd>
      </div>
    </div>
  );
}
