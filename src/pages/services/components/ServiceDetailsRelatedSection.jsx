import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { ServiceCard, ServiceCardSkeleton } from "@/features/services/components/index.js";
import { ROUTES } from "@/routes/constants.js";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0 },
};

// Other services from the same category, best-rated first (backend:
// GET /api/v1/services/:slug/related). Left out when there are none.
export default function ServiceDetailsRelatedSection({ services, isLoading, category }) {
  if (!isLoading && services.length === 0) return null;

  return (
    <section className="border-t border-slate-100 py-10 sm:py-14 lg:py-20 dark:border-(--border-subtle)">
      <div className="mx-auto max-w-7xl px-3 sm:px-6 lg:px-8">
        <motion.div
          className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          variants={fadeUp}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-indigo-100 bg-indigo-50 px-4 py-1.5 text-xs font-semibold text-indigo-700 dark:border-indigo-500/20 dark:bg-indigo-500/10 dark:text-indigo-300">
              Another service
            </span>
            <h2 className="mt-4 text-2xl font-extrabold tracking-tight text-slate-900 dark:text-(--text-primary) sm:text-3xl">
              Most Related Services
            </h2>
          </div>
          {category ? (
            <Link
              to={`${ROUTES.SERVICES}?category=${category.slug}`}
              className="inline-flex shrink-0 items-center gap-1.5 text-sm font-semibold text-indigo-600 transition hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300"
            >
              View all in {category.name}
              <ArrowRight className="h-4 w-4" />
            </Link>
          ) : null}
        </motion.div>

        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {isLoading
            ? [0, 1, 2].map((index) => <ServiceCardSkeleton key={index} />)
            : services.map((relatedService, index) => (
                <ServiceCard
                  key={relatedService.id}
                  service={relatedService}
                  category={relatedService.category}
                  image={relatedService.image}
                  imageFit="contain"
                  index={index}
                />
              ))}
        </div>
      </div>
    </section>
  );
}
