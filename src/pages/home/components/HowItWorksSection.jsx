import { motion } from "framer-motion";
import {
  ArrowRight,
  CalendarCheck,
  Search,
  ThumbsUp,
  UserCheck,
} from "lucide-react";
import AuthGatedLink from "@/routes/guards/AuthGatedLink.jsx";
import {
  howItWorksContent,
  howItWorksSteps,
} from "../definitions/howItWorks.data.js";

const ICONS = {
  search: Search,
  calendarCheck: CalendarCheck,
  userCheck: UserCheck,
  thumbsUp: ThumbsUp,
};

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0 },
};

// id="how-it-works" is the scroll target for the Hero section's secondary
// CTA (pages/home/definitions/hero.data.js's secondaryCta.href).
export default function HowItWorksSection() {
  return (
    <section
      id="how-it-works"
      className="bg-slate-50/70 py-16 dark:bg-(--surface-1)/40 sm:py-20 lg:py-28"
    >
      <div className="mx-auto max-w-7xl px-3 sm:px-6 lg:px-8">
        <motion.div
          className="mx-auto max-w-2xl text-center"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          variants={fadeUp}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          <span className="inline-flex items-center gap-2 rounded-full border border-indigo-100 bg-white px-4 py-1.5 text-xs font-semibold text-indigo-700 dark:border-indigo-500/20 dark:bg-(--surface-2) dark:text-indigo-300">
            {howItWorksContent.eyebrow}
          </span>
          <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-900 dark:text-(--text-primary) sm:text-4xl">
            {howItWorksContent.title}
            <span className="gradient-text-animate">
              {howItWorksContent.titleHighlight}
            </span>
          </h2>
          <p className="mt-4 text-base leading-relaxed text-slate-600 dark:text-(--text-muted)">
            {howItWorksContent.subtitle}
          </p>
        </motion.div>

        <div className="relative mt-16">
          <div className="absolute inset-x-0 top-8 hidden h-px bg-linear-to-r from-transparent via-indigo-200 to-transparent dark:via-indigo-500/25 lg:block" />

          <div className="relative grid grid-cols-1 gap-y-12 sm:grid-cols-2 lg:grid-cols-4 lg:gap-x-6 lg:gap-y-0">
            {howItWorksSteps.map((step, index) => {
              const Icon = ICONS[step.icon];
              return (
                <motion.div
                  key={step.id}
                  className="relative flex flex-col items-center text-center"
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, margin: "-80px" }}
                  variants={fadeUp}
                  transition={{
                    duration: 0.45,
                    delay: index * 0.12,
                    ease: "easeOut",
                  }}
                >
                  <span className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-white shadow-lg shadow-slate-200/70 ring-1 ring-slate-100 dark:bg-(--surface-0) dark:shadow-black/20 dark:ring-(--border-subtle)">
                    <span className="absolute -left-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-linear-to-br from-indigo-600 to-fuchsia-600 text-[11px] font-bold text-white ring-2 ring-slate-50 dark:ring-(--surface-1)">
                      {step.id}
                    </span>
                    <Icon className="h-7 w-7 text-indigo-600 dark:text-indigo-400" />
                  </span>

                  <h3 className="mt-5 text-sm font-semibold text-slate-900 dark:text-(--text-primary) sm:text-base">
                    {step.title}
                  </h3>
                  <p className="mt-2 max-w-60 text-sm leading-relaxed text-slate-500 dark:text-(--text-muted)">
                    {step.description}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>

        <motion.div
          className="mt-14 flex justify-center"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
          variants={fadeUp}
          transition={{ duration: 0.45, delay: 0.2, ease: "easeOut" }}
        >
          <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
            <AuthGatedLink
              to={howItWorksContent.cta.href}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-linear-to-r from-indigo-600 to-fuchsia-600 px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-indigo-600/25 transition hover:brightness-110 sm:text-base"
            >
              {howItWorksContent.cta.label}
              <ArrowRight className="h-4 w-4" />
            </AuthGatedLink>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
