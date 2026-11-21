import { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Award, CalendarDays, Check, ExternalLink, Languages, RefreshCw, Sparkles, Star, UserX, X } from 'lucide-react';
import { WorkerPhoto } from '@/features/workers/components/index.js';
import { getWorkerDetailsPath } from '@/routes/constants.js';
import { formatDayLong, formatSlotRange } from '../definitions/bookingSchedule.data.js';
import { sortProviders } from '../definitions/bookingProviders.js';

const ANY = 'any';

// Opens after the customer picks a time slot on a service booking: the
// professionals of that service who are free in that slot (bookings slice
// slotProviders, from GET /api/v1/provider-availability/available-providers),
// as photo cards, plus "Any available
// professional" (the backend assigns the best-rated free one). `workers` is
// the workers slice's byCategory state - everyone who offers the service -
// used to say how many are busy. Closing (X / Escape / backdrop) keeps the
// slot; "Pick another time" clears it. The parent remounts it (new `key`)
// each time it opens, so the choice starts from `selectedId`.
export default function BookingProviderModal({
  open,
  bookable,
  day,
  slot,
  workers,
  slotProviders,
  selectedId,
  onConfirm,
  onClose,
  onPickAnotherTime,
  onRetry,
}) {
  const [pickedId, setPickedId] = useState(selectedId ?? ANY);

  // Escape closes; the page behind doesn't scroll while open.
  useEffect(() => {
    if (!open) return undefined;
    const handleKey = (event) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKey);
    const { overflow } = document.body.style;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKey);
      document.body.style.overflow = overflow;
    };
  }, [open, onClose]);

  const { available, busyCount } = useMemo(() => {
    if (!day || !slot) return { available: [], busyCount: 0 };
    const free = sortProviders(slotProviders.items);
    return { available: free, busyCount: Math.max(workers.items.length - free.length, 0) };
  }, [slotProviders.items, workers.items.length, day, slot]);

  const isLoading = (slotProviders.status === 'loading' || slotProviders.status === 'idle') && slotProviders.items.length === 0;
  const failed = slotProviders.status === 'failed' && slotProviders.items.length === 0;
  const isClosed = slotProviders.status === 'succeeded' && !slotProviders.isWorkingDay;
  const noneFree = slotProviders.status === 'succeeded' && available.length === 0;
  // Nobody to assign (or still checking) - only "Pick another time" works.
  const cannotContinue = isLoading || isClosed || noneFree;
  const picked = available.find((worker) => worker.id === pickedId) ?? null;

  return createPortal(
    <AnimatePresence>
      {open && day && slot && (
        <motion.div
          key="provider-modal"
          role="presentation"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={onClose}
          className="fixed inset-0 z-60 flex items-end justify-center bg-slate-900/60 backdrop-blur-sm sm:items-center sm:p-4"
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="provider-modal-title"
            initial={{ opacity: 0, y: 40, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 320, damping: 30 }}
            onClick={(event) => event.stopPropagation()}
            className="flex max-h-[92vh] w-full max-w-2xl flex-col overflow-hidden rounded-t-3xl bg-white shadow-2xl shadow-slate-900/20 sm:rounded-3xl dark:bg-(--surface-1) dark:shadow-black/50"
          >
            {/* Header */}
            <div className="relative border-b border-slate-100 px-5 pb-5 pt-6 sm:px-7 dark:border-(--border-subtle)">
              <div className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-fuchsia-400/15 blur-2xl" />
              <div className="relative flex items-start gap-4">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-linear-to-br from-indigo-600 to-fuchsia-600 text-white shadow-lg shadow-indigo-600/30">
                  <Sparkles className="h-6 w-6" />
                </span>
                <div className="min-w-0 flex-1">
                  <h2 id="provider-modal-title" className="text-xl font-extrabold tracking-tight text-slate-900 dark:text-(--text-primary)">
                    Choose your professional
                  </h2>
                  <p className="mt-0.5 text-sm text-slate-500 dark:text-(--text-muted)">
                    {isLoading
                      ? `Finding ${bookable.subtitle.toLowerCase()} experts near you…`
                      : failed
                        ? "We couldn't check who's free right now"
                        : `${available.length} ${available.length === 1 ? 'professional is' : 'professionals are'} free for this slot`}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  aria-label="Close"
                  className="-mr-2 -mt-1 flex h-9 w-9 items-center justify-center rounded-xl text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-(--surface-2)"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="relative mt-4 flex flex-wrap gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 px-3 py-1.5 text-xs font-semibold text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-300">
                  <CalendarDays className="h-3.5 w-3.5" />
                  {formatDayLong(day.date)} · {formatSlotRange(slot)}
                </span>
                <span className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-600 dark:bg-(--surface-2) dark:text-(--text-muted)">
                  {bookable.title}
                </span>
              </div>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto px-5 py-5 sm:px-7">
              <div role="radiogroup" aria-label="Professional" className="space-y-3">
                {!cannotContinue && <AnyProviderCard selected={pickedId === ANY} onSelect={() => setPickedId(ANY)} />}

                {isLoading ? (
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2" aria-busy="true">
                    {Array.from({ length: 4 }, (_, index) => (
                      <div key={index} className="flex animate-pulse items-center gap-3 rounded-2xl border border-slate-100 p-3.5 dark:border-(--border-subtle)">
                        <div className="h-14 w-14 rounded-2xl bg-slate-100 dark:bg-(--surface-2)" />
                        <div className="flex-1 space-y-2">
                          <div className="h-3.5 w-28 rounded bg-slate-100 dark:bg-(--surface-2)" />
                          <div className="h-3 w-20 rounded bg-slate-100 dark:bg-(--surface-2)" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : failed ? (
                  <div className="rounded-2xl border border-dashed border-slate-200 px-5 py-8 text-center dark:border-(--border-subtle)">
                    <p className="text-sm font-semibold text-slate-700 dark:text-(--text-primary)">Couldn't load the professionals</p>
                    <p className="mt-1 text-xs text-slate-500 dark:text-(--text-muted)">You can still continue - we'll assign the best available one.</p>
                    <button
                      type="button"
                      onClick={onRetry}
                      className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-indigo-50 px-4 py-2 text-sm font-semibold text-indigo-700 transition hover:bg-indigo-100 dark:bg-indigo-500/10 dark:text-indigo-300"
                    >
                      <RefreshCw className="h-4 w-4" />
                      Try again
                    </button>
                  </div>
                ) : isClosed ? (
                  <div className="flex items-center gap-3 rounded-2xl bg-amber-50 px-4 py-4 text-sm text-amber-800 dark:bg-amber-500/10 dark:text-amber-300">
                    <CalendarDays className="h-5 w-5 shrink-0" />
                    {slotProviders.reason || "We're closed on this day. Please pick another day."}
                  </div>
                ) : available.length === 0 ? (
                  <div className="flex items-center gap-3 rounded-2xl bg-amber-50 px-4 py-4 text-sm text-amber-800 dark:bg-amber-500/10 dark:text-amber-300">
                    <UserX className="h-5 w-5 shrink-0" />
                    {workers.items.length
                      ? 'Everyone is booked at this time. Please pick another time.'
                      : 'No professionals offer this service yet. Please check back soon.'}
                  </div>
                ) : (
                  <>
                    <p className="pt-2 text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-(--text-muted)">Or pick someone</p>
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      {available.map((worker, index) => (
                        <ProviderCard
                          key={worker.id}
                          worker={worker}
                          index={index}
                          topRated={index === 0 && Number(worker.rating) >= 4}
                          selected={pickedId === worker.id}
                          onSelect={() => setPickedId(worker.id)}
                        />
                      ))}
                    </div>
                    {busyCount > 0 && (
                      <p className="text-center text-xs text-slate-400 dark:text-(--text-muted)">
                        {busyCount} more {busyCount === 1 ? 'professional is' : 'professionals are'} busy at this time
                      </p>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="flex flex-col-reverse gap-2 border-t border-slate-100 bg-slate-50/70 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-7 dark:border-(--border-subtle) dark:bg-(--surface-2)/40">
              <button
                type="button"
                onClick={onPickAnotherTime}
                className="rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-white hover:text-slate-900 dark:text-(--text-muted) dark:hover:bg-(--surface-2)"
              >
                Pick another time
              </button>
              <motion.button
                type="button"
                onClick={() => onConfirm(picked)}
                disabled={cannotContinue}
                whileHover={cannotContinue ? undefined : { scale: 1.02 }}
                whileTap={cannotContinue ? undefined : { scale: 0.98 }}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-linear-to-r from-indigo-600 to-fuchsia-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-600/25 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {picked ? (
                  <>
                    <span className="h-6 w-6 overflow-hidden rounded-full ring-2 ring-white/60">
                      <WorkerPhoto worker={picked} initialsClassName="text-[10px]" />
                    </span>
                    Continue with {picked.firstName}
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    Continue - assign the best pro
                  </>
                )}
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}

function AnyProviderCard({ selected, onSelect }) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      onClick={onSelect}
      className={`relative flex w-full items-center gap-4 rounded-2xl border p-4 text-left transition ${
        selected
          ? 'border-transparent bg-indigo-50/70 ring-2 ring-indigo-500 dark:bg-indigo-500/10 dark:ring-indigo-400'
          : 'border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/30 dark:border-(--border-subtle) dark:hover:border-indigo-500/50'
      }`}
    >
      <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-linear-to-br from-indigo-500 to-fuchsia-500 text-white shadow-md shadow-indigo-500/30">
        <Sparkles className="h-6 w-6" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex flex-wrap items-center gap-2">
          <span className="font-bold text-slate-900 dark:text-(--text-primary)">Any available professional</span>
          <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400">
            Fastest
          </span>
        </span>
        <span className="mt-0.5 block text-sm text-slate-500 dark:text-(--text-muted)">
          We'll assign the best-rated pro who's free - quickest confirmation.
        </span>
      </span>
      <CheckDot selected={selected} />
    </button>
  );
}

function ProviderCard({ worker, index, topRated, selected, onSelect }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay: Math.min(index * 0.04, 0.3) }}
      className={`group relative rounded-2xl border transition ${
        selected
          ? 'border-transparent bg-indigo-50/70 ring-2 ring-indigo-500 dark:bg-indigo-500/10 dark:ring-indigo-400'
          : 'border-slate-200 hover:-translate-y-0.5 hover:border-indigo-300 hover:shadow-md dark:border-(--border-subtle) dark:hover:border-indigo-500/50'
      }`}
    >
      <button type="button" role="radio" aria-checked={selected} onClick={onSelect} className="flex w-full items-center gap-3 p-3.5 text-left">
        <span className="relative h-14 w-14 shrink-0">
          <span className="block h-full w-full overflow-hidden rounded-2xl bg-indigo-50 shadow-sm dark:bg-indigo-500/10">
            <WorkerPhoto worker={worker} initialsClassName="text-lg" />
          </span>
          <span className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-(--surface-1)" title="Free at this time" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="flex items-center gap-1.5">
            <span className="truncate font-bold text-slate-900 dark:text-(--text-primary)">{worker.name}</span>
            {topRated && <Award className="h-4 w-4 shrink-0 text-amber-500" aria-label="Top rated" />}
          </span>
          <span className="mt-0.5 flex items-center gap-1 text-xs text-slate-500 dark:text-(--text-muted)">
            <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
            <span className="font-semibold text-slate-700 dark:text-(--text-primary)">{worker.rating}</span>
            <span>({worker.reviewCount})</span>
            {worker.yearsExperience ? <span>· {worker.yearsExperience} yrs exp</span> : null}
          </span>
          {worker.languages.length > 0 && (
            <span className="mt-1 flex items-center gap-1 truncate text-[11px] text-slate-400 dark:text-(--text-muted)">
              <Languages className="h-3 w-3 shrink-0" />
              <span className="truncate">{worker.languages.slice(0, 3).join(', ')}</span>
            </span>
          )}
        </span>
        <CheckDot selected={selected} />
      </button>
      <Link
        to={getWorkerDetailsPath(worker.id)}
        target="_blank"
        rel="noreferrer"
        aria-label={`View ${worker.name}'s profile in a new tab`}
        className="absolute right-11 top-3 hidden rounded-lg p-1.5 text-slate-400 transition hover:bg-white hover:text-indigo-600 group-hover:block dark:hover:bg-(--surface-2)"
      >
        <ExternalLink className="h-3.5 w-3.5" />
      </Link>
    </motion.div>
  );
}

function CheckDot({ selected }) {
  return (
    <span
      className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 transition ${
        selected ? 'border-indigo-600 bg-indigo-600 text-white dark:border-indigo-400 dark:bg-indigo-400' : 'border-slate-300 dark:border-(--border-subtle)'
      }`}
    >
      {selected && <Check className="h-3.5 w-3.5" strokeWidth={3} />}
    </span>
  );
}
