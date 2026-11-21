import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ROUTES } from "@/routes/constants.js";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0 },
};

const CARD_CLASS =
  "group relative flex h-full flex-col items-center overflow-hidden rounded-2xl border border-slate-100 bg-white p-5 text-center shadow-sm shadow-slate-200/60 transition hover:shadow-lg hover:shadow-slate-200/70 dark:border-(--border-subtle) dark:bg-(--surface-1) dark:shadow-none dark:hover:shadow-black/20";

// `category` is a popular service category from the API
// (see features/services/definitions/serviceCategories.js's toPopularCategory).
export default function PopularCategoryCard({ category, index }) {
  const { providerCount } = category;

  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-60px" }}
      variants={fadeUp}
      transition={{ duration: 0.4, delay: (index % 8) * 0.05, ease: "easeOut" }}
      whileHover={{ y: -4 }}
    >
      <Link to={`${ROUTES.SERVICES}?category=${category.slug}`} className={CARD_CLASS}>
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 left-0 z-0 w-0 bg-linear-to-r from-indigo-50 to-fuchsia-50 transition-[width] duration-500 ease-out group-hover:w-full dark:from-indigo-500/15 dark:to-fuchsia-500/15"
        />

        {category.icon ? (
          <img
            src={category.icon}
            alt=""
            aria-hidden="true"
            className="relative z-10 h-24 w-24 object-contain"
          />
        ) : (
          <span
            aria-hidden="true"
            className="relative z-10 flex h-24 w-24 items-center justify-center rounded-3xl bg-linear-to-br from-indigo-500 to-fuchsia-500 text-3xl font-bold text-white"
          >
            {category.name.charAt(0)}
          </span>
        )}
        <h4 className="relative z-10 mt-4 text-sm font-semibold text-slate-900 dark:text-(--text-primary)">
          {category.name}
        </h4>
        <p className="relative z-10 mt-1 text-xs text-slate-500 dark:text-(--text-muted)">
          {providerCount.toLocaleString()} {providerCount === 1 ? "provider" : "providers"}
        </p>
      </Link>
    </motion.div>
  );
}
