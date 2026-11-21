import { SlidersHorizontal, X } from "lucide-react";
import { FilterAccordionItem } from "@/components/common/filterAccordion/index.js";
import { HOURLY_RATE_RANGES, RATING_OPTIONS } from "../definitions/workerFilters.js";

const hasActiveFilters = (filters) =>
  filters.categorySlugs.length > 0 || filters.rateRangeId !== "any" || filters.minRating !== 0;

// `categories` are the active service categories from the API
// ({ id, slug, name }); a category is selected by its slug.
export default function WorkersFilterSidebar({
  filters,
  categories,
  onToggleCategory,
  onRateRangeChange,
  onMinRatingChange,
  onClearAll,
}) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm shadow-slate-200/60 dark:border-(--border-subtle) dark:bg-(--surface-1) dark:shadow-none">
      <div className="flex items-center justify-between gap-2">
        <span className="inline-flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-(--text-primary)">
          <SlidersHorizontal className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
          Filters
        </span>
        {hasActiveFilters(filters) ? (
          <button
            type="button"
            onClick={onClearAll}
            className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 transition hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300"
          >
            <X className="h-3.5 w-3.5" />
            Clear all
          </button>
        ) : null}
      </div>

      <div className="mt-2">
        <FilterAccordionItem title="Category" badge={filters.categorySlugs.length || null}>
          <div className="flex flex-col gap-2.5">
            {categories.map((category) => (
              <label
                key={category.id}
                className="flex cursor-pointer items-center gap-2.5 text-sm text-slate-600 dark:text-(--text-muted)"
              >
                <input
                  type="checkbox"
                  checked={filters.categorySlugs.includes(category.slug)}
                  onChange={() => onToggleCategory(category.slug)}
                  className="h-4 w-4 shrink-0 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 dark:border-(--border-subtle)"
                />
                {category.name}
              </label>
            ))}
          </div>
        </FilterAccordionItem>

        <FilterAccordionItem title="Hourly rate" badge={filters.rateRangeId !== "any" ? 1 : null}>
          <div className="flex flex-col gap-2.5">
            {HOURLY_RATE_RANGES.map((range) => (
              <label
                key={range.id}
                className="flex cursor-pointer items-center gap-2.5 text-sm text-slate-600 dark:text-(--text-muted)"
              >
                <input
                  type="radio"
                  name="rate-range"
                  checked={filters.rateRangeId === range.id}
                  onChange={() => onRateRangeChange(range.id)}
                  className="h-4 w-4 shrink-0 border-slate-300 text-indigo-600 focus:ring-indigo-500 dark:border-(--border-subtle)"
                />
                {range.label}
              </label>
            ))}
          </div>
        </FilterAccordionItem>

        <FilterAccordionItem title="Rating" badge={filters.minRating !== 0 ? 1 : null}>
          <div className="flex flex-col gap-2.5">
            {RATING_OPTIONS.map((option) => (
              <label
                key={option.id}
                className="flex cursor-pointer items-center gap-2.5 text-sm text-slate-600 dark:text-(--text-muted)"
              >
                <input
                  type="radio"
                  name="worker-min-rating"
                  checked={filters.minRating === option.id}
                  onChange={() => onMinRatingChange(option.id)}
                  className="h-4 w-4 shrink-0 border-slate-300 text-indigo-600 focus:ring-indigo-500 dark:border-(--border-subtle)"
                />
                {option.label}
              </label>
            ))}
          </div>
        </FilterAccordionItem>
      </div>
    </div>
  );
}
