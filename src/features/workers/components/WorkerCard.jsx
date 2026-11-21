import { motion } from "framer-motion";
import { ArrowUpRight, Star } from "lucide-react";
import { Link } from "react-router-dom";
import AuthGatedLink from "@/routes/guards/AuthGatedLink.jsx";
import { getWorkerDetailsPath } from "@/routes/constants.js";
import WorkerPhoto from "./WorkerPhoto.jsx";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0 },
};

// `worker` is features/workers/definitions/workers.js's toWorker shape. The
// badge is the provider's first assigned service category.
export default function WorkerCard({ worker, index = 0 }) {
  return (
    <motion.div
      layout
      initial="hidden"
      animate="visible"
      exit="hidden"
      variants={fadeUp}
      transition={{
        layout: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
        opacity: { duration: 0.35, ease: "easeOut", delay: (index % 12) * 0.05 },
        y: { duration: 0.35, ease: "easeOut", delay: (index % 12) * 0.05 },
      }}
      whileHover={{ y: -4, transition: { duration: 0.2, ease: "easeOut" } }}
      className="group flex h-full flex-col overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm shadow-slate-200/60 transition hover:shadow-lg hover:shadow-slate-200/70 dark:border-(--border-subtle) dark:bg-(--surface-1) dark:shadow-none dark:hover:shadow-black/20"
    >
      <div className="relative h-44 overflow-hidden">
        <WorkerPhoto worker={worker} />

        {worker.category && (
          <span className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-slate-700 shadow-sm backdrop-blur dark:bg-(--surface-1)/90 dark:text-(--text-primary)">
            {worker.category.name}
          </span>
        )}

        <Link
          to={getWorkerDetailsPath(worker.id)}
          aria-label={`View details for ${worker.name}`}
          className="absolute right-4 top-4 flex h-9 w-9 scale-90 items-center justify-center rounded-full bg-white/90 text-slate-500 opacity-0 shadow-sm backdrop-blur transition duration-200 ease-out group-hover:scale-100 group-hover:opacity-100 group-focus-within:scale-100 group-focus-within:opacity-100 hover:text-indigo-600 dark:bg-(--surface-1)/90 dark:text-(--text-muted)"
        >
          <ArrowUpRight className="h-4 w-4" />
        </Link>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h4 className="truncate text-base font-semibold text-slate-900 dark:text-(--text-primary)">
              {worker.name}
            </h4>
            <p className="text-sm text-indigo-600 dark:text-indigo-400">{worker.designation}</p>
          </div>
          <p className="shrink-0 text-right">
            <span className="text-lg font-bold text-slate-900 dark:text-(--text-primary)">
              {worker.hourlyRate ?? "—"}
            </span>
            {worker.hourlyRate && <span className="text-xs text-slate-500 dark:text-(--text-muted)">/hr</span>}
          </p>
        </div>

        <div className="mt-auto flex items-center justify-between gap-2 pt-4">
          <span className="inline-flex items-center gap-1.5 text-sm text-slate-600 dark:text-(--text-muted)">
            <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
            <span className="font-semibold text-slate-900 dark:text-(--text-primary)">{worker.rating}</span>
            <span>({worker.reviewCount.toLocaleString()})</span>
          </span>

          <div className="grid grid-cols-[0fr] opacity-0 transition-[grid-template-columns,opacity] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:grid-cols-[1fr] group-hover:opacity-100 group-focus-within:grid-cols-[1fr] group-focus-within:opacity-100">
            <div className="overflow-hidden">
              <AuthGatedLink
                to={getWorkerDetailsPath(worker.id)}
                className="inline-flex shrink-0 items-center whitespace-nowrap rounded-full bg-linear-to-r from-indigo-600 to-fuchsia-600 px-4 py-2 text-xs font-semibold text-white shadow-lg shadow-indigo-600/25 transition hover:shadow-indigo-600/40"
              >
                Book Now
              </AuthGatedLink>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
