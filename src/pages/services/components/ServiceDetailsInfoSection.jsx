import { useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle2, Clock } from "lucide-react";
import AuthGatedLink from "@/routes/guards/AuthGatedLink.jsx";
import { getServiceBookingPath } from "@/routes/constants.js";
import { serviceDetailsInfoContent } from "../definitions/serviceDetailsInfo.data.js";
import ServiceDetailsProviders from "./ServiceDetailsProviders.jsx";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0 },
};

const VISIBLE_SKILLS = 4;

// The details page's main content: the overview and the "What You'll Get" /
// package benefit lists (from the service's ServiceDetails, managed in the
// admin panel), the professionals who offer it (`workers`, the
// service's assignedProviders), and the sticky booking card with price, duration
// and skills. A list or block with nothing in it is left out.
export default function ServiceDetailsInfoSection({ service, workers }) {
  const [showAllSkills, setShowAllSkills] = useState(false);
  const visibleSkills = showAllSkills ? service.skills : service.skills.slice(0, VISIBLE_SKILLS);
  const remainingSkillsCount = service.skills.length - visibleSkills.length;

  return (
    <section className="py-10 sm:py-14 lg:py-20">
      <div className="mx-auto max-w-7xl px-3 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1fr_340px]">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            variants={fadeUp}
            transition={{ duration: 0.5, ease: "easeOut" }}
          >
            <h2 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-(--text-primary) sm:text-3xl">
              Service Details
            </h2>
            <p className="mt-4 max-w-2xl whitespace-pre-line text-base leading-relaxed text-slate-600 dark:text-(--text-muted)">
              {service.overview || service.description}
            </p>

            <ServiceDetailsProviders workers={workers} />

            {service.whatYouGet.length > 0 ? (
              <div className="mt-8 border-t border-slate-100 pt-8 dark:border-(--border-subtle)">
                <h3 className="text-lg font-bold text-slate-900 dark:text-(--text-primary)">What You'll Get</h3>
                <p className="mt-1 text-sm font-medium text-slate-500 dark:text-(--text-muted)">{service.name}:</p>
                <CheckList items={service.whatYouGet} />
              </div>
            ) : null}

            {service.packageBenefits.length > 0 ? (
              <div className="mt-8 border-t border-slate-100 pt-8 dark:border-(--border-subtle)">
                <h3 className="text-lg font-bold text-slate-900 dark:text-(--text-primary)">
                  Benefits Of The Premium Package
                </h3>
                <CheckList items={service.packageBenefits} />
              </div>
            ) : null}
          </motion.div>

          <motion.aside
            className="lg:sticky lg:top-24 lg:self-start"
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.5, delay: 0.1, ease: "easeOut" }}
          >
            <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-xl shadow-slate-900/5 dark:border-(--border-subtle) dark:bg-(--surface-1) dark:shadow-black/20">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs text-slate-500 dark:text-(--text-muted)">Package Name</p>
                  <p className="mt-0.5 font-semibold text-slate-900 dark:text-(--text-primary)">{service.name}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-slate-500 dark:text-(--text-muted)">Starting At</p>
                  <p className="mt-0.5 flex items-baseline gap-1.5">
                    <span className="text-lg font-extrabold text-slate-900 dark:text-(--text-primary)">
                      {service.startingPrice}
                    </span>
                    {service.originalPrice ? (
                      <span className="text-xs text-slate-400 line-through dark:text-(--text-muted)">
                        {service.originalPrice}
                      </span>
                    ) : null}
                  </p>
                </div>
              </div>

              <motion.div className="mt-5" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <AuthGatedLink
                  to={getServiceBookingPath(service.slug)}
                  className="flex w-full items-center justify-center rounded-xl bg-linear-to-r from-indigo-600 to-fuchsia-600 px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-indigo-600/25 transition hover:brightness-110"
                >
                  {serviceDetailsInfoContent.primaryCta}
                </AuthGatedLink>
              </motion.div>

              {service.duration ? (
                <div className="mt-6 border-t border-slate-100 pt-5 dark:border-(--border-subtle)">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-(--text-muted)">
                    Duration
                  </p>
                  <p className="mt-2 flex items-center gap-2 text-sm text-slate-700 dark:text-(--text-primary)">
                    <Clock className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                    {service.duration}
                  </p>
                </div>
              ) : null}

              {service.skills.length > 0 ? (
                <div className="mt-5 border-t border-slate-100 pt-5 dark:border-(--border-subtle)">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-(--text-muted)">
                    Skills and Services
                  </p>
                  <div className="mt-2.5 flex flex-wrap gap-2">
                    {visibleSkills.map((skill) => (
                      <span
                        key={skill}
                        className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600 dark:bg-(--surface-2) dark:text-(--text-muted)"
                      >
                        {skill}
                      </span>
                    ))}
                    {remainingSkillsCount > 0 ? (
                      <button
                        type="button"
                        onClick={() => setShowAllSkills(true)}
                        aria-label={`Show ${remainingSkillsCount} more skills`}
                        className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-600 transition hover:bg-indigo-100 dark:bg-indigo-500/10 dark:text-indigo-400"
                      >
                        +{remainingSkillsCount}
                      </button>
                    ) : null}
                  </div>
                </div>
              ) : null}
            </div>
          </motion.aside>
        </div>
      </div>
    </section>
  );
}

function CheckList({ items }) {
  return (
    <ul className="mt-4 flex flex-col gap-3">
      {items.map((item) => (
        <li key={item} className="flex items-start gap-2.5 text-sm text-slate-600 dark:text-(--text-muted)">
          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
          {item}
        </li>
      ))}
    </ul>
  );
}
