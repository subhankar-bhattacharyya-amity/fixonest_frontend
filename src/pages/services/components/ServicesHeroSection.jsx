import { motion } from "framer-motion";
import { Search } from "lucide-react";
import { servicesHeroContent } from "../definitions/servicesHero.data.js";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0 },
};

// Controlled by ServicesPage.jsx, which also owns ServicesCatalogSection -
// both need the same search query, so it's lifted to their shared parent
// rather than living locally here. Category filtering now lives in the
// catalog section's left-sidebar accordion, not here.
export default function ServicesHeroSection({ query, onQueryChange }) {
  return (
    <section className="relative overflow-hidden">
      <div className="pointer-events-none absolute -left-32 -top-32 h-96 w-96 rounded-full bg-indigo-400/20 blur-3xl dark:bg-indigo-500/10" />
      <div className="pointer-events-none absolute -right-24 top-40 h-96 w-96 rounded-full bg-fuchsia-400/20 blur-3xl dark:bg-fuchsia-500/10" />

      <div className="relative mx-auto max-w-4xl px-3 py-14 text-center sm:px-6 sm:py-20 lg:px-8 lg:py-24">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          <span className="inline-flex items-center gap-2 rounded-full border border-indigo-100 bg-indigo-50 px-4 py-1.5 text-xs font-semibold text-indigo-700 dark:border-indigo-500/20 dark:bg-indigo-500/10 dark:text-indigo-300">
            {servicesHeroContent.eyebrow}
          </span>

          <h1 className="mt-6 text-4xl font-extrabold leading-tight tracking-tight text-slate-900 dark:text-(--text-primary) sm:text-5xl">
            {servicesHeroContent.titlePrefix}
            <span className="gradient-text-animate">{servicesHeroContent.titleHighlight}</span>
          </h1>

          <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-slate-600 dark:text-(--text-muted) sm:text-lg">
            {servicesHeroContent.subtitle}
          </p>
        </motion.div>

        <motion.div
          className="mt-8"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1, ease: "easeOut" }}
        >
          <div className="relative mx-auto max-w-xl">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400 dark:text-(--text-muted)" />
            <input
              type="search"
              value={query}
              onChange={(event) => onQueryChange(event.target.value)}
              placeholder={servicesHeroContent.searchPlaceholder}
              aria-label="Search services"
              className="w-full rounded-2xl border border-slate-200 bg-white py-4 pl-12 pr-4 text-sm text-slate-900 shadow-lg shadow-slate-200/60 outline-none transition placeholder:text-slate-400 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/10 dark:border-(--border-subtle) dark:bg-(--surface-1) dark:text-(--text-primary) dark:shadow-black/20 dark:placeholder:text-(--text-muted) sm:text-base"
            />
          </div>
        </motion.div>
      </div>
    </section>
  );
}
