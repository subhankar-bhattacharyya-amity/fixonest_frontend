import { motion } from "framer-motion";
import { journeyContent, journeyMilestones } from "../definitions/journey.data.js";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0 },
};

export default function AboutJourneySection() {
  return (
    <section className="bg-slate-50/70 py-16 dark:bg-(--surface-1)/40 sm:py-20 lg:py-28">
      <div className="mx-auto max-w-4xl px-3 sm:px-6 lg:px-8">
        <motion.div
          className="mx-auto max-w-2xl text-center"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          variants={fadeUp}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          <span className="inline-flex items-center gap-2 rounded-full border border-indigo-100 bg-white px-4 py-1.5 text-xs font-semibold text-indigo-700 dark:border-indigo-500/20 dark:bg-(--surface-2) dark:text-indigo-300">
            {journeyContent.eyebrow}
          </span>
          <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-900 dark:text-(--text-primary) sm:text-4xl">
            {journeyContent.title}
            <span className="gradient-text-animate">{journeyContent.titleHighlight}</span>
          </h2>
          <p className="mt-4 text-base leading-relaxed text-slate-600 dark:text-(--text-muted)">
            {journeyContent.subtitle}
          </p>
        </motion.div>

        <div className="relative mt-16">
          <div className="absolute bottom-5 left-5 top-5 w-px bg-slate-200 dark:bg-(--border-subtle)" />

          <div className="space-y-8">
            {journeyMilestones.map((milestone, index) => (
              <motion.div
                key={milestone.id}
                className="relative flex gap-6"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-60px" }}
                variants={fadeUp}
                transition={{ duration: 0.45, delay: index * 0.08, ease: "easeOut" }}
              >
                <span className="relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-linear-to-br from-indigo-600 to-fuchsia-600 ring-4 ring-slate-50 dark:ring-(--surface-1)">
                  <span className="h-2.5 w-2.5 rounded-full bg-white" />
                </span>

                <div className="flex-1 rounded-2xl border border-slate-100 bg-white p-6 shadow-sm shadow-slate-200/60 dark:border-(--border-subtle) dark:bg-(--surface-1) dark:shadow-none">
                  <span className="inline-flex items-center rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-semibold text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-300">
                    {milestone.year}
                  </span>
                  <h3 className="mt-3 text-base font-semibold text-slate-900 dark:text-(--text-primary)">
                    {milestone.title}
                  </h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-slate-600 dark:text-(--text-muted)">
                    {milestone.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
