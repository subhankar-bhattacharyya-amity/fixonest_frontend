import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import {
  POPULAR_SERVICE_CATEGORIES_LIMIT,
  fetchPopularServiceCategories,
  useServiceCategories,
} from "@/features/services/index.js";
import { ROUTES } from "@/routes/constants.js";
import PopularCategoryCard from "./PopularCategoryCard.jsx";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0 },
};

// Placeholder card with a category card's proportions, shown while loading.
function PopularCategoryCardSkeleton() {
  return (
    <div className="flex h-full animate-pulse flex-col items-center rounded-2xl border border-slate-100 bg-white p-5 dark:border-(--border-subtle) dark:bg-(--surface-1)">
      <div className="h-24 w-24 rounded-3xl bg-slate-100 dark:bg-(--surface-2)" />
      <div className="mt-4 h-4 w-24 rounded bg-slate-100 dark:bg-(--surface-2)" />
      <div className="mt-2 h-3 w-16 rounded bg-slate-100 dark:bg-(--surface-2)" />
    </div>
  );
}

export default function ServicesSection() {
  const dispatch = useDispatch();
  const { items: popularCategories, status } = useServiceCategories().popular;
  const isLoading = status === "idle" || status === "loading";

  useEffect(() => {
    dispatch(fetchPopularServiceCategories());
  }, [dispatch]);

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
            Our services
          </span>
          <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-900 dark:text-(--text-primary) sm:text-4xl">
            Everything your home needs, <span className="gradient-text-animate">under one roof.</span>
          </h2>
          <p className="mt-4 text-base leading-relaxed text-slate-600 dark:text-(--text-muted)">
            A dozen categories, dozens of trusted professionals — find exactly what you need in a few taps.
          </p>
        </motion.div>

        {/* Nothing to show (no active categories, or the request failed): hide the grid. */}
        {(isLoading || popularCategories.length > 0) && (
          <div className="mt-12">
            <div className="flex items-end justify-between gap-4">
              <h3 className="text-lg font-bold text-slate-900 dark:text-(--text-primary) sm:text-xl">
                Popular categories
              </h3>
              <Link
                to={ROUTES.SERVICES}
                className="inline-flex shrink-0 items-center gap-1.5 text-sm font-semibold text-indigo-600 transition hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300"
              >
                View all
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {isLoading
                ? Array.from({ length: POPULAR_SERVICE_CATEGORIES_LIMIT }, (_, index) => (
                    <PopularCategoryCardSkeleton key={index} />
                  ))
                : popularCategories.map((category, index) => (
                    <PopularCategoryCard key={category.id} category={category} index={index} />
                  ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
