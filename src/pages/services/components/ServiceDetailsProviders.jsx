import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Award, ChevronDown, Languages, Star, UserX } from "lucide-react";
import { WorkerPhoto } from "@/features/workers/components/index.js";
import { getWorkerDetailsPath } from "@/routes/constants.js";

const VISIBLE_PROVIDERS = 4;

// "Professionals for this service" on the Service Details page: the
// service's assignedProviders (returned by /api/v1/services/:slug, mapped in
// toServiceDetails), best rated first. Each links to their profile; the
// customer picks one (or "any") while booking.
export default function ServiceDetailsProviders({ workers }) {
  const [showAll, setShowAll] = useState(false);
  const isLoading = (workers.status === "loading" || workers.status === "idle") && workers.items.length === 0;
  const visible = showAll ? workers.items : workers.items.slice(0, VISIBLE_PROVIDERS);
  const hiddenCount = workers.items.length - visible.length;

  return (
    <div className="mt-8 border-t border-slate-100 pt-8 dark:border-(--border-subtle)">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h3 className="text-lg font-bold text-slate-900 dark:text-(--text-primary)">Professionals for this service</h3>
        {workers.items.length > 0 && (
          <span className="text-sm text-slate-500 dark:text-(--text-muted)">
            {workers.items.length > 1
              ? `${workers.items.length} verified pros · choose one while booking`
              : "1 verified pro"}
          </span>
        )}
      </div>

      {isLoading ? (
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2" aria-busy="true" aria-label="Loading professionals">
          {Array.from({ length: 2 }, (_, index) => (
            <div key={index} className="flex animate-pulse items-center gap-3 rounded-2xl border border-slate-100 p-3.5 dark:border-(--border-subtle)">
              <div className="h-14 w-14 rounded-full bg-slate-100 dark:bg-(--surface-2)" />
              <div className="flex-1 space-y-2">
                <div className="h-3.5 w-28 rounded bg-slate-100 dark:bg-(--surface-2)" />
                <div className="h-3 w-20 rounded bg-slate-100 dark:bg-(--surface-2)" />
              </div>
            </div>
          ))}
        </div>
      ) : workers.items.length === 0 ? (
        <p className="mt-4 flex items-center gap-2 text-sm text-slate-500 dark:text-(--text-muted)">
          <UserX className="h-4 w-4 shrink-0" />
          {workers.status === "failed"
            ? "Couldn't load the professionals right now."
            : "No professionals are listed for this service yet."}
        </p>
      ) : (
        <>
          <ul className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
            {visible.map((worker, index) => (
              <motion.li
                key={worker.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, delay: Math.min(index * 0.05, 0.3) }}
              >
                <Link
                  to={getWorkerDetailsPath(worker.id)}
                  className="flex items-center gap-3 rounded-2xl border border-slate-100 p-3.5 transition hover:-translate-y-0.5 hover:border-indigo-300 hover:shadow-md dark:border-(--border-subtle) dark:hover:border-indigo-500/50"
                >
                  <span className="h-14 w-14 shrink-0 overflow-hidden rounded-full bg-indigo-50 shadow-sm dark:bg-indigo-500/10">
                    <WorkerPhoto worker={worker} initialsClassName="text-lg" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center gap-1.5">
                      <span className="truncate font-semibold text-slate-900 dark:text-(--text-primary)">{worker.name}</span>
                      {index === 0 && Number(worker.rating) >= 4 && (
                        <Award className="h-4 w-4 shrink-0 text-amber-500" aria-label="Top rated" />
                      )}
                    </span>
                    <span className="mt-0.5 flex items-center gap-1 text-xs text-slate-500 dark:text-(--text-muted)">
                      <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                      <span className="font-semibold text-slate-700 dark:text-(--text-primary)">{worker.rating}</span>
                      <span>({worker.reviewCount} reviews)</span>
                      {worker.yearsExperience ? <span>· {worker.yearsExperience} yrs exp</span> : null}
                    </span>
                    {worker.languages.length > 0 && (
                      <span className="mt-1 flex items-center gap-1 truncate text-[11px] text-slate-400 dark:text-(--text-muted)">
                        <Languages className="h-3 w-3 shrink-0" />
                        <span className="truncate">{worker.languages.slice(0, 3).join(", ")}</span>
                      </span>
                    )}
                  </span>
                </Link>
              </motion.li>
            ))}
          </ul>
          {hiddenCount > 0 && (
            <button
              type="button"
              onClick={() => setShowAll(true)}
              className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-indigo-600 hover:underline dark:text-indigo-400"
            >
              Show {hiddenCount} more
              <ChevronDown className="h-4 w-4" />
            </button>
          )}
        </>
      )}
    </div>
  );
}
