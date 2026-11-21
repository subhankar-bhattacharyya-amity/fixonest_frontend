import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { AnimatePresence } from "framer-motion";
import { Search } from "lucide-react";
import { Pagination } from "@/components/common/pagination/index.js";
import {
  fetchServiceCatalog,
  fetchServiceCategories,
  useServiceCategories,
  useServices,
} from "@/features/services/index.js";
import { ServiceCard, ServiceCardSkeleton } from "@/features/services/components/index.js";
import { PRICE_RANGES } from "../definitions/serviceFilters.js";
import ServicesFilterSidebar from "./ServicesFilterSidebar.jsx";

const SEARCH_DEBOUNCE_MS = 300;

// PRICE_RANGES' max is exclusive ("Under ₹500" excludes ₹500); the API's
// maxPrice is inclusive, so the bound is pulled in by a paisa.
const toPriceParams = (range) => {
  if (!range || range.id === "any") return {};
  return {
    minPrice: range.min || undefined,
    maxPrice: Number.isFinite(range.max) ? range.max - 0.01 : undefined,
  };
};

// The full catalogue. Search (from the hero), the sidebar's category / price
// / rating filters and paging are all applied by the server - this section
// only keeps the filter state and asks for the matching page.
export default function ServicesCatalogSection({ query, initialCategorySlug, onCategoryFilterChange }) {
  const dispatch = useDispatch();
  const { catalog } = useServices();
  const { all: categories } = useServiceCategories();

  const [filters, setFilters] = useState({
    categorySlugs: initialCategorySlug ? [initialCategorySlug] : [],
    priceRangeId: "any",
    minRating: 0,
  });
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState(query);

  // A new ?category=<slug> while already on this page (e.g. a Home category
  // card clicked from here) selects just that category. Adjusted during
  // render (not in an effect) so the first fetch already uses it.
  const [seededSlug, setSeededSlug] = useState(initialCategorySlug);
  if (initialCategorySlug !== seededSlug) {
    setSeededSlug(initialCategorySlug);
    if (initialCategorySlug) {
      setFilters((current) => ({ ...current, categorySlugs: [initialCategorySlug] }));
      setPage(1);
    }
  }

  useEffect(() => {
    dispatch(fetchServiceCategories());
  }, [dispatch]);

  // Debounce typing in the hero's search box; a new search starts at page 1.
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(query);
      setPage(1);
    }, SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    const range = PRICE_RANGES.find((candidate) => candidate.id === filters.priceRangeId);
    dispatch(
      fetchServiceCatalog({
        page,
        search,
        categorySlugs: filters.categorySlugs,
        minRating: filters.minRating,
        ...toPriceParams(range),
      }),
    );
  }, [dispatch, page, search, filters]);

  const updateFilters = (updater) => {
    setFilters(updater);
    setPage(1);
  };

  const toggleCategory = (slug) => {
    onCategoryFilterChange?.();
    updateFilters((current) => ({
      ...current,
      categorySlugs: current.categorySlugs.includes(slug)
        ? current.categorySlugs.filter((existing) => existing !== slug)
        : [...current.categorySlugs, slug],
    }));
  };
  const setPriceRange = (priceRangeId) => updateFilters((current) => ({ ...current, priceRangeId }));
  const setMinRating = (minRating) => updateFilters((current) => ({ ...current, minRating }));
  const clearAll = () => {
    onCategoryFilterChange?.();
    updateFilters({ categorySlugs: [], priceRangeId: "any", minRating: 0 });
  };

  const isLoading = catalog.status === "idle" || catalog.status === "loading";
  const total = catalog.meta?.total ?? catalog.items.length;
  const totalPages = Math.max(1, catalog.meta?.totalPages ?? 1);
  const showSkeleton = isLoading && catalog.items.length === 0;

  return (
    <section className="pb-14 pt-6 sm:pb-20 sm:pt-8 lg:pb-28 lg:pt-10">
      <div className="mx-auto max-w-7xl px-3 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[280px_1fr]">
          <aside className="lg:sticky lg:top-24 lg:self-start">
            <ServicesFilterSidebar
              categories={categories.items}
              categoriesLoading={categories.status === "idle" || categories.status === "loading"}
              filters={filters}
              onToggleCategory={toggleCategory}
              onPriceRangeChange={setPriceRange}
              onMinRatingChange={setMinRating}
              onClearAll={clearAll}
            />
          </aside>

          <div>
            <div className="mb-6 flex items-center justify-between gap-4 border-b border-slate-100 pb-6 dark:border-(--border-subtle)">
              <h2 className="text-lg font-bold text-slate-900 dark:text-(--text-primary) sm:text-xl">
                All services
              </h2>
              <span className="shrink-0 text-sm text-slate-500 dark:text-(--text-muted)">
                {showSkeleton ? "Loading…" : `${total} ${total === 1 ? "service" : "services"}`}
              </span>
            </div>

            {showSkeleton ? (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
                {Array.from({ length: 6 }, (_, index) => (
                  <ServiceCardSkeleton key={index} />
                ))}
              </div>
            ) : !isLoading && catalog.items.length === 0 ? (
              <div className="flex flex-col items-center rounded-3xl border border-dashed border-slate-200 py-16 text-center dark:border-(--border-subtle)">
                <span className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400 dark:bg-(--surface-2) dark:text-(--text-muted)">
                  <Search className="h-5 w-5" />
                </span>
                <p className="mt-4 text-sm font-semibold text-slate-900 dark:text-(--text-primary)">
                  No services match your filters
                </p>
                <p className="mt-1 text-sm text-slate-500 dark:text-(--text-muted)">
                  Try a different keyword or clear a filter.
                </p>
              </div>
            ) : (
              <>
                <div
                  className={`grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3 transition-opacity duration-200 ${
                    isLoading ? "opacity-60" : ""
                  }`}
                  aria-busy={isLoading}
                >
                  <AnimatePresence mode="popLayout">
                    {catalog.items.map((service, index) => (
                      <ServiceCard
                        key={service.id}
                        service={service}
                        category={service.category}
                        image={service.image}
                        imageFit="contain"
                        index={index}
                      />
                    ))}
                  </AnimatePresence>
                </div>

                <Pagination
                  page={Math.min(page, totalPages)}
                  totalPages={totalPages}
                  onPageChange={setPage}
                  ariaLabel="Services pagination"
                />
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
