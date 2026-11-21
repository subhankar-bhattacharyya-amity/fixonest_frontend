import { useEffect, useMemo, useState } from "react";
import { useDispatch } from "react-redux";
import { Link } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { FEATURED_SERVICES_LIMIT, fetchFeaturedServices, useServices } from "@/features/services/index.js";
import { ServiceCard, ServiceCardSkeleton } from "@/features/services/components/index.js";
import { ROUTES } from "@/routes/constants.js";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0 },
};

// The services the admin marked as featured (backend: ?isFeatured=true, at
// most 6). Only the categories actually represented among them become tabs.
export default function FeaturedServicesSection() {
  const dispatch = useDispatch();
  const { featured } = useServices();
  const [activeCategory, setActiveCategory] = useState("all");

  useEffect(() => {
    dispatch(fetchFeaturedServices());
  }, [dispatch]);

  const featuredServices = featured.items;
  const isLoading = featured.status === "idle" || featured.status === "loading";

  const categoryTabs = useMemo(() => {
    const seen = new Map();
    featuredServices.forEach((service) => {
      if (service.category && !seen.has(service.category.id)) seen.set(service.category.id, service.category);
    });
    return [{ id: "all", name: "All" }, ...seen.values()];
  }, [featuredServices]);

  // A tab whose services are gone (e.g. after a refetch) falls back to "All".
  const currentTab = categoryTabs.some((tab) => tab.id === activeCategory) ? activeCategory : "all";

  const filteredServices = useMemo(
    () =>
      currentTab === "all"
        ? featuredServices
        : featuredServices.filter((service) => service.category?.id === currentTab),
    [currentTab, featuredServices],
  );

  // Nothing featured right now - leave the section out rather than show an empty grid.
  if (!isLoading && featuredServices.length === 0) return null;

  return (
    <section className="py-16 sm:py-20 lg:py-28">
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
              Featured services
            </span>
            <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-900 dark:text-(--text-primary) sm:text-4xl">
              Hand-picked and <span className="gradient-text-animate">ready to book.</span>
            </h2>
            <p className="mt-4 max-w-xl text-base leading-relaxed text-slate-600 dark:text-(--text-muted)">
              A spotlight on our top-rated, best-value services — hover a card to book instantly.
            </p>
          </div>
          <Link
            to={ROUTES.SERVICES}
            className="inline-flex shrink-0 items-center gap-1.5 text-sm font-semibold text-indigo-600 transition hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300"
          >
            View all services
            <ArrowRight className="h-4 w-4" />
          </Link>
        </motion.div>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-2 sm:justify-start">
          {isLoading
            ? [0, 1, 2, 3].map((index) => (
                <span
                  key={index}
                  className="h-8 w-20 animate-pulse rounded-full bg-slate-100 dark:bg-(--surface-2)"
                  aria-hidden="true"
                />
              ))
            : categoryTabs.map((tab) => {
                const isActive = tab.id === currentTab;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveCategory(tab.id)}
                    aria-pressed={isActive}
                    className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition sm:text-sm ${
                      isActive
                        ? "bg-linear-to-r from-indigo-600 to-fuchsia-600 text-white shadow-lg shadow-indigo-600/25"
                        : "border border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50 dark:border-(--border-subtle) dark:text-(--text-muted) dark:hover:bg-(--surface-2)"
                    }`}
                  >
                    {tab.name}
                  </button>
                );
              })}
        </div>

        <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {isLoading ? (
            Array.from({ length: FEATURED_SERVICES_LIMIT }, (_, index) => <ServiceCardSkeleton key={index} />)
          ) : (
            <AnimatePresence mode="popLayout">
              {filteredServices.map((service, index) => (
                <ServiceCard
                  key={service.id}
                  service={service}
                  category={service.category}
                  image={service.image}
                  imageFit={service.hasCover ? "cover" : "contain"}
                  index={index}
                />
              ))}
            </AnimatePresence>
          )}
        </div>
      </div>
    </section>
  );
}
