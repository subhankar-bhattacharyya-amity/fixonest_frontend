import { motion } from "framer-motion";
import { Award, Eye, Heart, ShieldCheck } from "lucide-react";
import { valuesContent, values } from "../definitions/values.data.js";

const ICONS = { shieldCheck: ShieldCheck, eye: Eye, award: Award, heart: Heart };

const ACCENTS = {
  indigo: {
    bar: "bg-indigo-500",
    iconBg: "bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400",
  },
  fuchsia: {
    bar: "bg-fuchsia-500",
    iconBg: "bg-fuchsia-50 text-fuchsia-600 dark:bg-fuchsia-500/10 dark:text-fuchsia-400",
  },
  amber: {
    bar: "bg-amber-500",
    iconBg: "bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400",
  },
  emerald: {
    bar: "bg-emerald-500",
    iconBg: "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400",
  },
};

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0 },
};

export default function AboutValuesSection() {
  return (
    <section className="py-16 sm:py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-3 sm:px-6 lg:px-8">
        <motion.div
          className="mx-auto max-w-2xl text-center"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          variants={fadeUp}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          <span className="inline-flex items-center gap-2 rounded-full border border-indigo-100 bg-indigo-50 px-4 py-1.5 text-xs font-semibold text-indigo-700 dark:border-indigo-500/20 dark:bg-indigo-500/10 dark:text-indigo-300">
            {valuesContent.eyebrow}
          </span>
          <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-900 dark:text-(--text-primary) sm:text-4xl">
            {valuesContent.title}
            <span className="gradient-text-animate">{valuesContent.titleHighlight}</span>
          </h2>
          <p className="mt-4 text-base leading-relaxed text-slate-600 dark:text-(--text-muted)">
            {valuesContent.subtitle}
          </p>
        </motion.div>

        <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {values.map((value, index) => {
            const Icon = ICONS[value.icon];
            const accent = ACCENTS[value.accent];
            return (
              <motion.div
                key={value.id}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-60px" }}
                variants={fadeUp}
                transition={{ duration: 0.45, delay: index * 0.1, ease: "easeOut" }}
                whileHover={{ y: -6 }}
                className="overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-sm shadow-slate-200/60 transition hover:shadow-xl hover:shadow-slate-200/70 dark:border-(--border-subtle) dark:bg-(--surface-1) dark:shadow-none dark:hover:shadow-black/20"
              >
                <div className={`h-1.5 w-full ${accent.bar}`} />
                <div className="p-6">
                  <span className={`flex h-12 w-12 items-center justify-center rounded-2xl ${accent.iconBg}`}>
                    <Icon className="h-6 w-6" />
                  </span>
                  <h3 className="mt-5 text-base font-semibold text-slate-900 dark:text-(--text-primary)">
                    {value.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-(--text-muted)">
                    {value.description}
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
