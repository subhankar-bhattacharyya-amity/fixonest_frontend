import { useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlertCircle,
  ArrowRight,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Clock,
  Minus,
  Plus,
  Sparkles,
  Sun,
  Sunrise,
  Sunset,
} from "lucide-react";
import { WorkerPhoto } from "@/features/workers/components/index.js";
import { formatRupees } from "../definitions/bookable.js";
import {
  SLOT_GROUPS,
  formatDayLabel,
  formatDayLong,
  formatHour,
  formatMonthShort,
  formatMonthYear,
  formatSlotRange,
} from "../definitions/bookingSchedule.data.js";

const GROUP_ICONS = { morning: Sunrise, afternoon: Sun, evening: Sunset };
const QUICK_HOURS = [1, 2, 3, 4];

// Step 1 of the booking flow: pick a day, (for a worker) how many hours, and
// a start time. The form itself lives in BookingFlow.jsx; this renders it.
export default function BookingScheduleSection({
  bookable,
  days,
  // The days and times are loading / couldn't be loaded from the backend
  // (nothing is shown in their place), and a way to retry.
  isLoadingDays = false,
  daysFailed = false,
  onRetryDays,
  // Worker bookings: the longest booking any start time allows.
  maxHours = 1,
  values,
  selectedDay,
  selectedSlot,
  slotError,
  onDateChange,
  onSlotChange,
  onHoursChange,
  onSubmit,
  // Service bookings: the professional picked in BookingProviderModal (null =
  // any available) and a way to reopen it. Undefined for worker bookings.
  provider,
  onChangeProvider,
}) {
  return (
    <motion.form
      noValidate
      onSubmit={onSubmit}
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.15, ease: "easeOut" }}
      className="overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-xl shadow-slate-900/5 dark:border-(--border-subtle) dark:bg-(--surface-1) dark:shadow-black/20"
    >
      <div className="p-5 sm:p-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-indigo-600 dark:text-indigo-400">Step 1</p>
            <h2 className="mt-1 text-2xl font-extrabold tracking-tight text-slate-900 dark:text-(--text-primary)">
              When should we come?
            </h2>
            <p className="mt-1 text-sm text-slate-500 dark:text-(--text-muted)">
              {bookable.perHour
                ? `Choose a day, how long you need ${bookable.shortName}, and a start time.`
                : "Choose a day and a time window. Your professional arrives within it."}
            </p>
          </div>
          {selectedDay && (
            <span className="hidden shrink-0 items-center gap-1.5 rounded-full bg-indigo-50 px-3 py-1.5 text-xs font-semibold text-indigo-700 sm:inline-flex dark:bg-indigo-500/10 dark:text-indigo-300">
              <CalendarDays className="h-3.5 w-3.5" />
              {formatMonthYear(selectedDay.date)}
            </span>
          )}
        </div>

        {isLoadingDays ? (
          <DateStripSkeleton />
        ) : daysFailed ? (
          <div className="mt-6 flex flex-wrap items-center gap-3 rounded-2xl border border-rose-100 bg-rose-50/60 p-4 text-sm text-rose-700 dark:border-rose-500/20 dark:bg-rose-500/10 dark:text-rose-300">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span className="flex-1">Couldn&apos;t load the available dates and times.</span>
            <button
              type="button"
              onClick={onRetryDays}
              className="rounded-lg bg-white px-3 py-1.5 text-xs font-semibold text-rose-700 shadow-sm ring-1 ring-rose-200 transition hover:ring-rose-300 dark:bg-(--surface-1) dark:text-rose-300 dark:ring-rose-500/30"
            >
              Retry
            </button>
          </div>
        ) : (
          <DateStrip days={days} selectedKey={values.date} onSelect={onDateChange} />
        )}

        {bookable.perHour && (
          <HoursPicker
            hours={values.hours}
            maxHours={maxHours}
            unitPrice={bookable.unitPrice}
            name={bookable.shortName}
            onChange={onHoursChange}
          />
        )}

        <div className="mt-8">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h3 className="text-base font-bold text-slate-900 dark:text-(--text-primary)">
              {bookable.perHour ? "Start time" : "Arrival window"}
            </h3>
            <Legend />
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={`${values.date}-${values.hours}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="mt-4 space-y-6"
            >
              {isLoadingDays ? (
                <SlotsSkeleton />
              ) : daysFailed ? null : selectedDay && selectedDay.slots.length > 0 ? (
                SLOT_GROUPS.map((group) => {
                  const slots = selectedDay.slots.filter((slot) => slot.hour >= group.fromHour && slot.hour < group.toHour);
                  // A group with no times that day (e.g. no evening when closing at 6 PM) is left out.
                  if (slots.length === 0) return null;
                  return (
                    <SlotGroup
                      key={group.key}
                      group={group}
                      slots={slots}
                      selectedKey={values.slot}
                      perHour={bookable.perHour}
                      onSelect={onSlotChange}
                    />
                  );
                })
              ) : (
                <p className="flex items-center gap-2 text-sm text-slate-500 dark:text-(--text-muted)">
                  <Clock className="h-4 w-4 shrink-0" />
                  No time slots are available. Please pick another day.
                </p>
              )}
            </motion.div>
          </AnimatePresence>

          <AnimatePresence>
            {slotError && (
              <motion.p
                role="alert"
                initial={{ opacity: 0, x: 0 }}
                animate={{ opacity: 1, x: [0, -6, 6, -4, 4, 0] }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4 }}
                className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-rose-600 dark:text-rose-400"
              >
                <AlertCircle className="h-4 w-4" />
                {slotError}
              </motion.p>
            )}
          </AnimatePresence>
        </div>
      </div>

      <div className="flex flex-col gap-4 border-t border-slate-100 bg-slate-50/70 p-5 sm:flex-row sm:items-center sm:justify-between sm:px-8 dark:border-(--border-subtle) dark:bg-(--surface-2)/40">
        <AnimatePresence mode="wait" initial={false}>
          {selectedDay && selectedSlot ? (
            <motion.div
              key={`${selectedDay.key}-${selectedSlot.key}-${values.hours}`}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.2 }}
              className="flex items-center gap-3"
            >
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-linear-to-br from-indigo-600 to-fuchsia-600 text-white shadow-lg shadow-indigo-600/25">
                <CalendarDays className="h-5 w-5" />
              </span>
              <div className="min-w-0">
                <p className="font-bold text-slate-900 dark:text-(--text-primary)">{formatDayLong(selectedDay.date)}</p>
                <p className="text-sm text-slate-500 dark:text-(--text-muted)">{formatSlotRange(selectedSlot)}</p>
                {onChangeProvider && (
                  <button
                    type="button"
                    onClick={onChangeProvider}
                    className="mt-1.5 inline-flex max-w-full items-center gap-1.5 rounded-full bg-white py-0.5 pl-0.5 pr-2.5 text-xs font-semibold text-slate-700 shadow-sm ring-1 ring-slate-200 transition hover:ring-indigo-300 dark:bg-(--surface-1) dark:text-(--text-primary) dark:ring-(--border-subtle)"
                  >
                    <span className="h-5 w-5 shrink-0 overflow-hidden rounded-full">
                      {provider ? (
                        <WorkerPhoto worker={provider} initialsClassName="text-[9px]" />
                      ) : (
                        <span className="flex h-full w-full items-center justify-center bg-linear-to-br from-indigo-500 to-fuchsia-500 text-white">
                          <Sparkles className="h-3 w-3" />
                        </span>
                      )}
                    </span>
                    <span className="truncate">{provider ? provider.name : 'Any available professional'}</span>
                    <span className="text-indigo-600 dark:text-indigo-400">· Change</span>
                  </button>
                )}
              </div>
            </motion.div>
          ) : (
            <motion.p
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-2 text-sm text-slate-500 dark:text-(--text-muted)"
            >
              <Clock className="h-4 w-4" />
              Pick a time to continue
            </motion.p>
          )}
        </AnimatePresence>

        <motion.button
          type="submit"
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          className="group inline-flex items-center justify-center gap-2 rounded-xl bg-linear-to-r from-indigo-600 to-fuchsia-600 px-7 py-3.5 text-sm font-semibold text-white shadow-lg shadow-indigo-600/25 transition hover:brightness-110"
        >
          Continue to address
          <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
        </motion.button>
      </div>
    </motion.form>
  );
}

// The time grid's footprint while the arrival windows load.
function SlotsSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 xl:grid-cols-4" aria-busy="true" aria-label="Loading time slots">
      {Array.from({ length: 5 }, (_, index) => (
        <div key={index} className="h-12 animate-pulse rounded-xl bg-slate-100 dark:bg-(--surface-2)" />
      ))}
    </div>
  );
}

// The date strip's footprint while the arrival windows load.
function DateStripSkeleton() {
  return (
    <div className="mt-6 flex gap-3 overflow-hidden px-1 py-2 sm:mx-4" aria-busy="true" aria-label="Loading dates">
      {Array.from({ length: 7 }, (_, index) => (
        <div key={index} className="h-24 w-20 shrink-0 animate-pulse rounded-2xl bg-slate-100 dark:bg-(--surface-2)" />
      ))}
    </div>
  );
}

// The bookable days as a swipeable row of day cards.
function DateStrip({ days, selectedKey, onSelect }) {
  const scrollerRef = useRef(null);
  const scrollBy = (direction) => scrollerRef.current?.scrollBy({ left: direction * 280, behavior: "smooth" });

  return (
    <div className="relative mt-6">
      <button
        type="button"
        onClick={() => scrollBy(-1)}
        aria-label="Earlier dates"
        className="absolute -left-3 top-1/2 z-10 hidden h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-md transition hover:text-indigo-600 sm:flex dark:border-(--border-subtle) dark:bg-(--surface-2) dark:text-(--text-muted)"
      >
        <ChevronLeft className="h-4 w-4" />
      </button>
      <button
        type="button"
        onClick={() => scrollBy(1)}
        aria-label="Later dates"
        className="absolute -right-3 top-1/2 z-10 hidden h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-md transition hover:text-indigo-600 sm:flex dark:border-(--border-subtle) dark:bg-(--surface-2) dark:text-(--text-muted)"
      >
        <ChevronRight className="h-4 w-4" />
      </button>

      <div
        ref={scrollerRef}
        role="radiogroup"
        aria-label="Date"
        className="-mx-1 flex snap-x gap-3 overflow-x-auto px-1 py-2 [scrollbar-width:none] sm:mx-4 [&::-webkit-scrollbar]:hidden"
      >
        {days.map((day) => {
          const isSelected = day.key === selectedKey;
          return (
            <button
              key={day.key}
              type="button"
              role="radio"
              aria-checked={isSelected}
              disabled={!day.isAvailable}
              title={day.closedReason ?? undefined}
              onClick={() => onSelect(day.key)}
              className={`relative flex w-20 shrink-0 snap-start flex-col items-center rounded-2xl border px-2 py-3 text-center transition ${
                isSelected
                  ? "border-transparent text-white"
                  : day.isAvailable
                    ? "border-slate-200 bg-white text-slate-700 hover:-translate-y-0.5 hover:border-indigo-300 hover:shadow-md dark:border-(--border-subtle) dark:bg-(--surface-1) dark:text-(--text-primary) dark:hover:border-indigo-500/50"
                    : "cursor-not-allowed border-dashed border-slate-200 bg-slate-50 text-slate-300 dark:border-(--border-subtle) dark:bg-transparent dark:text-slate-600"
              }`}
            >
              {isSelected && (
                <motion.span
                  layoutId="booking-date-highlight"
                  className="absolute inset-0 rounded-2xl bg-linear-to-br from-indigo-600 to-fuchsia-600 shadow-lg shadow-indigo-600/30"
                  transition={{ type: "spring", stiffness: 400, damping: 32 }}
                />
              )}
              <span className="relative text-[11px] font-semibold uppercase tracking-wide opacity-80">
                {formatDayLabel(day)}
              </span>
              <span className="relative mt-1 text-2xl font-extrabold leading-none">{day.date.getDate()}</span>
              <span className="relative mt-1 text-xs opacity-80">{formatMonthShort(day.date)}</span>
              {/* Closed: the reason from working hours (holiday name or "Closed").
                  Open but nothing left to pick (every slot starts too soon): "No slots". */}
              <span className="relative mt-2 block w-full truncate text-[10px] font-semibold">
                {!day.isAvailable ? (
                  day.closedReason ?? "No slots"
                ) : (
                  <span
                    className={`inline-block h-1.5 w-1.5 rounded-full ${isSelected ? "bg-white" : "bg-emerald-500"}`}
                    aria-label="Slots available"
                  />
                )}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// How many hours the worker is booked for, up to the longest stretch they're
// free (maxHours, from the backend). Changing it changes which start times
// still fit before closing, a break or another booking.
function HoursPicker({ hours, maxHours, unitPrice, name, onChange }) {
  return (
    <div className="mt-8 rounded-2xl border border-indigo-100 bg-linear-to-br from-indigo-50/80 to-fuchsia-50/60 p-5 dark:border-indigo-500/20 dark:from-indigo-500/10 dark:to-fuchsia-500/5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-(--text-primary)">How long do you need {name}?</h3>
          {unitPrice ? (
            <p className="mt-0.5 text-sm text-slate-600 dark:text-(--text-muted)">
              {formatRupees(unitPrice)}/hr × {hours} {hours === 1 ? "hr" : "hrs"} ={" "}
              <span className="font-bold text-slate-900 dark:text-(--text-primary)">{formatRupees(unitPrice * hours)}</span>
            </p>
          ) : null}
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => onChange(hours - 1)}
            disabled={hours <= 1}
            aria-label="Fewer hours"
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 transition hover:border-indigo-300 hover:text-indigo-600 disabled:cursor-not-allowed disabled:opacity-40 dark:border-(--border-subtle) dark:bg-(--surface-1) dark:text-(--text-primary)"
          >
            <Minus className="h-4 w-4" />
          </button>
          <span className="min-w-20 text-center" aria-live="polite">
            <span className="text-2xl font-extrabold text-slate-900 dark:text-(--text-primary)">{hours}</span>
            <span className="ml-1 text-sm text-slate-500 dark:text-(--text-muted)">{hours === 1 ? "hour" : "hours"}</span>
          </span>
          <button
            type="button"
            onClick={() => onChange(hours + 1)}
            disabled={hours >= maxHours}
            aria-label="More hours"
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 transition hover:border-indigo-300 hover:text-indigo-600 disabled:cursor-not-allowed disabled:opacity-40 dark:border-(--border-subtle) dark:bg-(--surface-1) dark:text-(--text-primary)"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {QUICK_HOURS.filter((option) => option <= maxHours).map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => onChange(option)}
            className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition ${
              option === hours
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/25"
                : "bg-white text-slate-600 hover:text-indigo-600 dark:bg-(--surface-1) dark:text-(--text-muted)"
            }`}
          >
            {option} {option === 1 ? "hr" : "hrs"}
          </button>
        ))}
      </div>
    </div>
  );
}

function SlotGroup({ group, slots, selectedKey, perHour, onSelect }) {
  const Icon = GROUP_ICONS[group.key];
  const openCount = slots.filter((slot) => slot.availability !== "booked").length;

  return (
    <div>
      <div className="flex items-center gap-2">
        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-50 text-amber-500 dark:bg-amber-500/10">
          <Icon className="h-4 w-4" />
        </span>
        <span className="text-sm font-semibold text-slate-800 dark:text-(--text-primary)">{group.label}</span>
        <span className="text-xs text-slate-400 dark:text-(--text-muted)">
          {openCount > 0 ? `${openCount} open` : "Unavailable"}
        </span>
      </div>

      <div role="radiogroup" aria-label={`${group.label} slots`} className="mt-3 grid grid-cols-2 gap-2.5 sm:grid-cols-3 xl:grid-cols-4">
        {slots.map((slot) => {
          const isBooked = slot.availability === "booked";
          const isSelected = slot.key === selectedKey;
          return (
            <button
              key={slot.key}
              type="button"
              role="radio"
              aria-checked={isSelected}
              disabled={isBooked}
              onClick={() => onSelect(slot.key)}
              className={`relative flex flex-col items-center justify-center rounded-xl border px-3 py-3 text-sm font-semibold transition ${
                isSelected
                  ? "border-transparent text-white"
                  : isBooked
                    ? "cursor-not-allowed border-slate-100 bg-slate-50 text-slate-300 line-through dark:border-(--border-subtle) dark:bg-transparent dark:text-slate-600"
                    : "border-slate-200 bg-white text-slate-700 hover:-translate-y-0.5 hover:border-indigo-300 hover:text-indigo-700 hover:shadow-md dark:border-(--border-subtle) dark:bg-(--surface-1) dark:text-(--text-primary) dark:hover:border-indigo-500/50"
              }`}
            >
              {isSelected && (
                <motion.span
                  layoutId="booking-slot-highlight"
                  className="absolute inset-0 rounded-xl bg-linear-to-r from-indigo-600 to-fuchsia-600 shadow-lg shadow-indigo-600/30"
                  transition={{ type: "spring", stiffness: 420, damping: 34 }}
                />
              )}
              <span className="relative">{perHour ? formatHour(slot.hour) : formatSlotRange(slot)}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function Legend() {
  return (
    <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-(--text-muted)">
      <span className="inline-flex items-center gap-1.5">
        <span className="h-2 w-2 rounded-full bg-emerald-500" /> Available
      </span>
      <span className="inline-flex items-center gap-1.5">
        <span className="h-2 w-2 rounded-full bg-slate-300 dark:bg-slate-600" /> Unavailable
      </span>
    </div>
  );
}
