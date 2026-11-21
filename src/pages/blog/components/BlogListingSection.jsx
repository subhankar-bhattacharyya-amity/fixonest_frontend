import { AnimatePresence } from "framer-motion";
import { Search } from "lucide-react";
import { Pagination } from "@/components/common/pagination/index.js";
import { BLOGS_PER_PAGE } from "@/features/blog/index.js";
import { BlogCard } from "@/features/blog/components/index.js";

// Placeholder with BlogCard's proportions, shown while the first page loads.
function BlogCardSkeleton() {
  return (
    <div className="flex h-full animate-pulse flex-col overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm shadow-slate-200/60 dark:border-(--border-subtle) dark:bg-(--surface-1) dark:shadow-none">
      <div className="h-44 bg-indigo-50 dark:bg-indigo-500/10" />
      <div className="flex flex-1 flex-col gap-3 p-5">
        <div className="h-3 w-32 rounded bg-slate-100 dark:bg-(--surface-2)" />
        <div className="h-4 w-full rounded bg-slate-100 dark:bg-(--surface-2)" />
        <div className="h-4 w-2/3 rounded bg-slate-100 dark:bg-(--surface-2)" />
        <div className="h-3 w-full rounded bg-slate-100 dark:bg-(--surface-2)" />
        <div className="mb-9 h-3 w-5/6 rounded bg-slate-100 dark:bg-(--surface-2)" />
      </div>
    </div>
  );
}

// Presentational: BlogPage.jsx owns the request (search, category and page
// are all applied by the backend) and hands the current page of posts down.
export default function BlogListingSection({ posts, total, page, totalPages, onPageChange, isLoading, hasFilters }) {
  const isFirstLoad = isLoading && posts.length === 0;

  return (
    <section className="pb-14 pt-6 sm:pb-20 sm:pt-8 lg:pb-28 lg:pt-10">
      <div className="mx-auto max-w-7xl px-3 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-center justify-between gap-4 border-b border-slate-100 pb-6 dark:border-(--border-subtle)">
          <h2 className="text-lg font-bold text-slate-900 dark:text-(--text-primary) sm:text-xl">Latest articles</h2>
          {isFirstLoad ? null : (
            <span className="shrink-0 text-sm text-slate-500 dark:text-(--text-muted)">
              {total} {total === 1 ? "post" : "posts"}
            </span>
          )}
        </div>

        {isFirstLoad ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3" aria-label="Loading articles">
            {Array.from({ length: BLOGS_PER_PAGE / 3 }, (_, index) => (
              <BlogCardSkeleton key={index} />
            ))}
          </div>
        ) : posts.length === 0 ? (
          <div className="flex flex-col items-center rounded-3xl border border-dashed border-slate-200 py-16 text-center dark:border-(--border-subtle)">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400 dark:bg-(--surface-2) dark:text-(--text-muted)">
              <Search className="h-5 w-5" />
            </span>
            <p className="mt-4 text-sm font-semibold text-slate-900 dark:text-(--text-primary)">
              {hasFilters ? "No articles match your search" : "No articles yet"}
            </p>
            <p className="mt-1 text-sm text-slate-500 dark:text-(--text-muted)">
              {hasFilters ? "Try a different keyword or category." : "Check back soon for tips and guides."}
            </p>
          </div>
        ) : (
          <>
            <div
              className={`grid grid-cols-1 gap-6 transition-opacity duration-200 sm:grid-cols-2 xl:grid-cols-3 ${
                isLoading ? "opacity-60" : ""
              }`}
            >
              <AnimatePresence mode="popLayout">
                {posts.map((post, index) => (
                  <BlogCard key={post.id} post={post} category={post.category} image={post.image} index={index} />
                ))}
              </AnimatePresence>
            </div>

            <Pagination page={page} totalPages={totalPages} onPageChange={onPageChange} ariaLabel="Blog pagination" />
          </>
        )}
      </div>
    </section>
  );
}
