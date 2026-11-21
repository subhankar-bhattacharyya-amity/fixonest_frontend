import { motion } from "framer-motion";
import { Receipt, ShieldCheck, ThumbsUp, Zap } from "lucide-react";
import { trustPoints } from "../definitions/trust.data.js";

const ICONS = { zap: Zap, receipt: Receipt, shieldCheck: ShieldCheck, thumbsUp: ThumbsUp };

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export default function ServicesTrustSection() {
  return (
    <section className="border-y border-slate-100 bg-slate-50/70 py-14 dark:border-(--border-subtle) dark:bg-(--surface-1)/40 sm:py-16">
      <div className="mx-auto max-w-7xl px-3 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
          {trustPoints.map((point, index) => {
            const Icon = ICONS[point.icon];
            return (
              <motion.div
                key={point.id}
                className="flex items-start gap-4"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-60px" }}
                variants={fadeUp}
                transition={{ duration: 0.4, delay: index * 0.08, ease: "easeOut" }}
              >
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white text-indigo-600 shadow-sm shadow-slate-200/70 dark:bg-(--surface-0) dark:text-indigo-400 dark:shadow-none">
                  <Icon className="h-5 w-5" />
                </span>
                <div>
                  <h3 className="text-sm font-semibold text-slate-900 dark:text-(--text-primary)">{point.title}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-slate-500 dark:text-(--text-muted)">
                    {point.description}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
