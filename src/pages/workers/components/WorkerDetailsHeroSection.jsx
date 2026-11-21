import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ChevronRight, IndianRupee, Languages, Mail, Phone, Star } from "lucide-react";
import AuthGatedLink from "@/routes/guards/AuthGatedLink.jsx";
import { ROUTES, getWorkerBookingPath } from "@/routes/constants.js";
import { WorkerPhoto } from "@/features/workers/components/index.js";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0 },
};

// `worker` is features/workers/definitions/workers.js's toWorker shape.
// Details the provider hasn't filled in yet are simply left out.
export default function WorkerDetailsHeroSection({ worker }) {
  const infoRows = [
    worker.languages.length > 0 && { key: "languages", label: "Languages", icon: Languages, value: worker.languages.join(", ") },
    worker.hourlyRate && { key: "rate", label: "Hourly rate", icon: IndianRupee, value: `${worker.hourlyRate}/hr` },
    worker.phone && { key: "phone", label: "Phone", icon: Phone, value: worker.phone },
    worker.email && { key: "email", label: "Email", icon: Mail, value: worker.email, truncate: true },
  ].filter(Boolean);

  return (
    <section className="relative overflow-hidden">
      <div className="pointer-events-none absolute -left-32 -top-32 h-96 w-96 rounded-full bg-indigo-400/20 blur-3xl dark:bg-indigo-500/10" />
      <div className="pointer-events-none absolute -right-24 top-0 h-96 w-96 rounded-full bg-fuchsia-400/20 blur-3xl dark:bg-fuchsia-500/10" />

      <div className="relative mx-auto max-w-7xl px-3 py-10 sm:px-6 sm:py-14 lg:px-8">
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
          <Link to={ROUTES.WORKERS} className="transition hover:text-indigo-600 dark:hover:text-indigo-400">
            Workers
          </Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <span className="truncate text-slate-700 dark:text-(--text-primary)">{worker.name}</span>
        </motion.nav>

        <div className="mt-6 grid grid-cols-1 gap-10 lg:grid-cols-2 lg:items-center">
          <motion.div
            className="relative mx-auto w-full max-w-md"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            <div className="aspect-4/5 overflow-hidden rounded-3xl border border-slate-100 bg-indigo-50 shadow-2xl shadow-indigo-900/10 dark:border-(--border-subtle) dark:bg-indigo-500/10 dark:shadow-black/30">
              <WorkerPhoto worker={worker} initialsClassName="text-7xl" />
            </div>

            {worker.yearsExperience !== null && worker.yearsExperience !== undefined && (
              <div className="absolute -left-4 -top-4 flex flex-col items-center justify-center rounded-2xl bg-linear-to-br from-indigo-600 to-fuchsia-600 px-5 py-4 text-center text-white shadow-xl shadow-indigo-900/20">
                <span className="text-3xl font-extrabold leading-none">{worker.yearsExperience}</span>
                <span className="mt-1 text-xs font-semibold uppercase tracking-wide">
                  {worker.yearsExperience === 1 ? "Year Experience" : "Years Experience"}
                </span>
              </div>
            )}
          </motion.div>

          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            transition={{ duration: 0.5, delay: 0.1, ease: "easeOut" }}
          >
            <h1 className="text-3xl font-extrabold leading-tight tracking-tight text-slate-900 dark:text-(--text-primary) sm:text-4xl">
              {worker.name}
            </h1>
            {worker.designation && (
              <p className="mt-1 text-base font-semibold text-indigo-600 dark:text-indigo-400">{worker.designation}</p>
            )}

            <span className="mt-3 inline-flex items-center gap-1.5 text-sm text-slate-600 dark:text-(--text-muted)">
              <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
              <span className="font-semibold text-slate-900 dark:text-(--text-primary)">{worker.rating}</span>
              <span>
                ({worker.reviewCount.toLocaleString()} {worker.reviewCount === 1 ? "review" : "reviews"})
              </span>
            </span>

            {worker.bio && (
              <p className="mt-5 max-w-xl whitespace-pre-line text-base leading-relaxed text-slate-600 dark:text-(--text-muted)">
                {worker.bio}
              </p>
            )}

            {infoRows.length > 0 && (
              <div className="mt-6 grid grid-cols-1 gap-4 border-t border-slate-100 pt-6 sm:grid-cols-2 dark:border-(--border-subtle)">
                {infoRows.map(({ key, label, icon: Icon, value, truncate }) => (
                  <div key={key} className="flex items-start gap-3">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400">
                      <Icon className="h-4 w-4" />
                    </span>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 dark:text-(--text-muted)">
                        {label}
                      </p>
                      <p
                        className={`mt-0.5 text-sm text-slate-700 dark:text-(--text-primary) ${truncate ? "truncate" : ""}`}
                        title={truncate ? value : undefined}
                      >
                        {value}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <motion.div className="mt-7" whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
              <AuthGatedLink
                to={getWorkerBookingPath(worker.id)}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-linear-to-r from-indigo-600 to-fuchsia-600 px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-indigo-600/25 transition hover:brightness-110 sm:w-auto sm:text-base"
              >
                Book {worker.firstName}
              </AuthGatedLink>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
