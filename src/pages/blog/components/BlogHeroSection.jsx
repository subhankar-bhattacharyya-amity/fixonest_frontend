import { motion } from "framer-motion";
import { Search } from "lucide-react";
import { blogHeroContent } from "../definitions/blogHero.data.js";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0 },
};

// Controlled by BlogPage.jsx, which also owns BlogListingSection - both
// need the same search query and active category, so they're lifted to
// their shared parent rather than living locally here (same pattern as
// Services/Workers). `categories` are the active blog categories from the
// backend ({ id, name }), shown as filter pills after "All".
export default function BlogHeroSection({ query, onQueryChange, categories, activeCategory, onCategoryChange }) {
  const categoryFilters = [{ id: "all", name: "All" }, ...categories];

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
            {blogHeroContent.eyebrow}
          </span>

          <h1 className="mt-6 text-4xl font-extrabold leading-tight tracking-tight text-slate-900 dark:text-(--text-primary) sm:text-5xl">
            {blogHeroContent.titlePrefix}
            <span className="gradient-text-animate">{blogHeroContent.titleHighlight}</span>
          </h1>

          <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-slate-600 dark:text-(--text-muted) sm:text-lg">
            {blogHeroContent.subtitle}
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
              placeholder={blogHeroContent.searchPlaceholder}
              aria-label="Search blog articles"
              className="w-full rounded-2xl border border-slate-200 bg-white py-4 pl-12 pr-4 text-sm text-slate-900 shadow-lg shadow-slate-200/60 outline-none transition placeholder:text-slate-400 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/10 dark:border-(--border-subtle) dark:bg-(--surface-1) dark:text-(--text-primary) dark:shadow-black/20 dark:placeholder:text-(--text-muted) sm:text-base"
            />
          </div>

          <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
            {categoryFilters.map((filter) => {
              const isActive = filter.id === activeCategory;
              return (
                <button
                  key={filter.id}
                  type="button"
                  onClick={() => onCategoryChange(filter.id)}
                  aria-pressed={isActive}
                  className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition sm:text-sm ${
                    isActive
                      ? "bg-linear-to-r from-indigo-600 to-fuchsia-600 text-white shadow-lg shadow-indigo-600/25"
                      : "border border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50 dark:border-(--border-subtle) dark:text-(--text-muted) dark:hover:bg-(--surface-2)"
                  }`}
                >
                  {filter.name}
                </button>
              );
            })}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
