import { ChevronLeft, ChevronRight } from "lucide-react";

// Truncates long page ranges to: 1 … current-1, current, current+1 … last,
// so a 24-page listing doesn't render two dozen number buttons.
function buildPageList(page, totalPages) {
  const pages = new Set([1, totalPages, page, page - 1, page + 1]);
  const sorted = [...pages].filter((candidate) => candidate >= 1 && candidate <= totalPages).sort((a, b) => a - b);

  const withGaps = [];
  sorted.forEach((pageNumber, index) => {
    if (index > 0 && pageNumber - sorted[index - 1] > 1) {
      withGaps.push("ellipsis");
    }
    withGaps.push(pageNumber);
  });
  return withGaps;
}

// Promoted here once a second page (Workers) needed the same paginated-grid
// pattern as the Services catalog.
export default function Pagination({ page, totalPages, onPageChange, ariaLabel = "Pagination" }) {
  if (totalPages <= 1) return null;

  const pageList = buildPageList(page, totalPages);

  return (
    <nav aria-label={ariaLabel} className="mt-10 flex items-center justify-center gap-1.5">
      <button
        type="button"
        onClick={() => onPageChange(page - 1)}
        disabled={page === 1}
        aria-label="Previous page"
        className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 text-slate-500 transition hover:border-slate-300 hover:bg-slate-50 disabled:pointer-events-none disabled:opacity-40 dark:border-(--border-subtle) dark:text-(--text-muted) dark:hover:bg-(--surface-2)"
      >
        <ChevronLeft className="h-4 w-4" />
      </button>

      {pageList.map((item, index) =>
        item === "ellipsis" ? (
          <span
            key={`ellipsis-${index}`}
            className="flex h-9 w-9 items-center justify-center text-sm text-slate-400 dark:text-(--text-muted)"
          >
            …
          </span>
        ) : (
          <button
            key={item}
            type="button"
            onClick={() => onPageChange(item)}
            aria-current={item === page ? "page" : undefined}
            className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-semibold transition ${
              item === page
                ? "bg-linear-to-r from-indigo-600 to-fuchsia-600 text-white shadow-lg shadow-indigo-600/25"
                : "text-slate-600 hover:bg-slate-50 dark:text-(--text-muted) dark:hover:bg-(--surface-2)"
            }`}
          >
            {item}
          </button>
        ),
      )}

      <button
        type="button"
        onClick={() => onPageChange(page + 1)}
        disabled={page === totalPages}
        aria-label="Next page"
        className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 text-slate-500 transition hover:border-slate-300 hover:bg-slate-50 disabled:pointer-events-none disabled:opacity-40 dark:border-(--border-subtle) dark:text-(--text-muted) dark:hover:bg-(--surface-2)"
      >
        <ChevronRight className="h-4 w-4" />
      </button>
    </nav>
  );
}
