import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { AnimatePresence } from "framer-motion";
import { Search } from "lucide-react";
import { Pagination } from "@/components/common/pagination/index.js";
import { fetchServiceCategories, useServiceCategories } from "@/features/services/index.js";
import { fetchWorkers, useWorkers, WORKERS_PAGE_SIZE } from "@/features/workers/index.js";
import { WorkerCard, WorkerCardSkeleton } from "@/features/workers/components/index.js";
import { HOURLY_RATE_RANGES } from "../definitions/workerFilters.js";
import WorkersFilterSidebar from "./WorkersFilterSidebar.jsx";

const SEARCH_DEBOUNCE_MS = 300;

// HOURLY_RATE_RANGES' min is inclusive and max exclusive - the same as the
// API's min_price / max_price.
const toPriceParams = (range) => {
  if (!range || range.id === "any") return {};
  return {
    minPrice: range.min || undefined,
    maxPrice: Number.isFinite(range.max) ? range.max : undefined,
  };
};

const EMPTY_FILTERS = { categorySlugs: [], rateRangeId: "any", minRating: 0 };

// Every provider. Search (from the hero), the sidebar's category / rate /
// rating filters and paging are all applied by the server - this section
// only keeps the filter state and asks for the matching page. Same pattern
// as pages/services' ServicesCatalogSection.
export default function WorkersListingSection({ query }) {
  const dispatch = useDispatch();
  const { list } = useWorkers();
  const { all: categories } = useServiceCategories();

  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState(query);

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
    const range = HOURLY_RATE_RANGES.find((candidate) => candidate.id === filters.rateRangeId);
    dispatch(
      fetchWorkers({
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

  const toggleCategory = (slug) =>
    updateFilters((current) => ({
      ...current,
      categorySlugs: current.categorySlugs.includes(slug)
        ? current.categorySlugs.filter((existing) => existing !== slug)
        : [...current.categorySlugs, slug],
    }));
  const setRateRange = (rateRangeId) => updateFilters((current) => ({ ...current, rateRangeId }));
  const setMinRating = (minRating) => updateFilters((current) => ({ ...current, minRating }));
  const clearAll = () => updateFilters(EMPTY_FILTERS);

  const isLoading = list.status === "loading" || list.status === "idle";
  const total = list.meta?.total ?? 0;
  const totalPages = Math.max(1, list.meta?.totalPages ?? 1);

  return (
    <section className="pb-14 pt-6 sm:pb-20 sm:pt-8 lg:pb-28 lg:pt-10">
      <div className="mx-auto max-w-7xl px-3 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[280px_1fr]">
          <aside className="lg:sticky lg:top-24 lg:self-start">
            <WorkersFilterSidebar
              filters={filters}
              categories={categories.items}
              onToggleCategory={toggleCategory}
              onRateRangeChange={setRateRange}
              onMinRatingChange={setMinRating}
              onClearAll={clearAll}
            />
          </aside>

          <div>
            <div className="mb-6 flex items-center justify-between gap-4 border-b border-slate-100 pb-6 dark:border-(--border-subtle)">
              <h2 className="text-lg font-bold text-slate-900 dark:text-(--text-primary) sm:text-xl">
                All providers
              </h2>
              {!isLoading && (
                <span className="shrink-0 text-sm text-slate-500 dark:text-(--text-muted)">
                  {total} {total === 1 ? "provider" : "providers"}
                </span>
              )}
            </div>

            {isLoading && list.items.length === 0 ? (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
                {Array.from({ length: 6 }, (_, index) => (
                  <WorkerCardSkeleton key={index} />
                ))}
              </div>
            ) : !isLoading && list.items.length === 0 ? (
              <div className="flex flex-col items-center rounded-3xl border border-dashed border-slate-200 py-16 text-center dark:border-(--border-subtle)">
                <span className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400 dark:bg-(--surface-2) dark:text-(--text-muted)">
                  <Search className="h-5 w-5" />
                </span>
                <p className="mt-4 text-sm font-semibold text-slate-900 dark:text-(--text-primary)">
                  No providers match your filters
                </p>
                <p className="mt-1 text-sm text-slate-500 dark:text-(--text-muted)">
                  Try a different keyword or clear a filter.
                </p>
              </div>
            ) : (
              <>
                <div
                  className={`grid grid-cols-1 gap-6 transition-opacity sm:grid-cols-2 xl:grid-cols-3 ${
                    isLoading ? "opacity-60" : ""
                  }`}
                  aria-busy={isLoading}
                >
                  <AnimatePresence mode="popLayout">
                    {list.items.map((worker, index) => (
                      <WorkerCard key={worker.id} worker={worker} index={index} />
                    ))}
                  </AnimatePresence>
                </div>

                {total > WORKERS_PAGE_SIZE && (
                  <Pagination
                    page={Math.min(page, totalPages)}
                    totalPages={totalPages}
                    onPageChange={setPage}
                    ariaLabel="Workers pagination"
                  />
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
