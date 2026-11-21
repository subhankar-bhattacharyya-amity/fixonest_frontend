import { motion } from "framer-motion";
import { Mail, MessageCircle, Phone } from "lucide-react";
import { contactHeroContent, quickContactOptions } from "../definitions/contactHero.data.js";

const ICONS = { mail: Mail, phone: Phone, messageCircle: MessageCircle };

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0 },
};

export default function ContactHeroSection() {
  return (
    <section className="relative overflow-hidden">
      <div className="pointer-events-none absolute -left-32 -top-32 h-96 w-96 rounded-full bg-indigo-400/20 blur-3xl dark:bg-indigo-500/10" />
      <div className="pointer-events-none absolute -right-24 top-40 h-96 w-96 rounded-full bg-fuchsia-400/20 blur-3xl dark:bg-fuchsia-500/10" />

      <div className="relative mx-auto max-w-3xl px-3 py-14 text-center sm:px-6 sm:py-20 lg:px-8 lg:py-24">
        <motion.div initial="hidden" animate="visible" variants={fadeUp} transition={{ duration: 0.5, ease: "easeOut" }}>
          <span className="inline-flex items-center gap-2 rounded-full border border-indigo-100 bg-indigo-50 px-4 py-1.5 text-xs font-semibold text-indigo-700 dark:border-indigo-500/20 dark:bg-indigo-500/10 dark:text-indigo-300">
            {contactHeroContent.eyebrow}
          </span>

          <h1 className="mt-6 text-4xl font-extrabold leading-tight tracking-tight text-slate-900 dark:text-(--text-primary) sm:text-5xl">
            {contactHeroContent.titlePrefix}
            <span className="gradient-text-animate">{contactHeroContent.titleHighlight}</span>
          </h1>

          <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-slate-600 dark:text-(--text-muted) sm:text-lg">
            {contactHeroContent.subtitle}
          </p>
        </motion.div>

        <motion.div
          className="mx-auto mt-10 grid max-w-2xl grid-cols-1 gap-4 sm:grid-cols-3"
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          transition={{ duration: 0.5, delay: 0.1, ease: "easeOut" }}
        >
          {quickContactOptions.map((option) => {
            const Icon = ICONS[option.icon];
            return (
              <motion.a
                key={option.id}
                href={option.href}
                whileHover={{ y: -4 }}
                className="flex flex-col items-center gap-2 rounded-2xl border border-slate-100 bg-white p-5 text-center shadow-sm shadow-slate-200/60 transition hover:shadow-lg hover:shadow-slate-200/70 dark:border-(--border-subtle) dark:bg-(--surface-1) dark:shadow-none dark:hover:shadow-black/20"
              >
                <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400">
                  <Icon className="h-5 w-5" />
                </span>
                <span className="text-sm font-semibold text-slate-900 dark:text-(--text-primary)">{option.label}</span>
                <span className="text-xs text-slate-500 dark:text-(--text-muted)">{option.value}</span>
              </motion.a>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
