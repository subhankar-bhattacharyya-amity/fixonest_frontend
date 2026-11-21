import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { motion } from "framer-motion";
import { Loader2, Star } from "lucide-react";
import { fetchServiceReviews, useServices } from "@/features/services/index.js";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0 },
};

function RatingBar({ star, count, total }) {
  const percent = total ? Math.round((count / total) * 100) : 0;
  return (
    <div className="flex items-center gap-3 text-sm">
      <span className="w-10 shrink-0 text-slate-500 dark:text-(--text-muted)">{star} star</span>
      <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100 dark:bg-(--surface-2)">
        <div className="h-full rounded-full bg-amber-400" style={{ width: `${percent}%` }} />
      </div>
      <span className="w-9 shrink-0 text-right text-slate-500 dark:text-(--text-muted)">{percent}%</span>
    </div>
  );
}

// First letters of the first two words - shown when a reviewer has no photo.
const initials = (name) =>
  String(name ?? "")
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .toUpperCase() || "?";

// Customer reviews & ratings from the API (backend: GET
// /api/v1/services/:slug/reviews), managed in the admin panel's Reviews &
// Ratings Management. The score, review count and star bars cover every
// visible rating; the cards are the ones with a written review, a page at a
// time. Left out when the service has no ratings yet.
export default function ServiceDetailsReviewsSection({ service }) {
  const dispatch = useDispatch();
  const { reviews } = useServices();

  useEffect(() => {
    dispatch(fetchServiceReviews({ slug: service.slug }));
  }, [dispatch, service.slug]);

  const isCurrent = reviews.slug === service.slug;
  const summary = isCurrent ? reviews.summary : null;
  const isLoading = !isCurrent || reviews.status === "loading" || reviews.status === "idle";

  if (isLoading) return <ReviewsSkeleton />;
  if (!summary || summary.count === 0) return null;

  const meta = reviews.meta;
  const hasMore = Boolean(meta && meta.page < meta.totalPages);
  const isLoadingMore = reviews.status === "loading-more";
  const distribution = [5, 4, 3, 2, 1].map((star) => ({ star, count: summary.distribution?.[star] ?? 0 }));

  return (
    <section className="border-t border-slate-100 py-10 sm:py-14 lg:py-20 dark:border-(--border-subtle)">
      <div className="mx-auto max-w-7xl px-3 sm:px-6 lg:px-8">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          variants={fadeUp}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          <h2 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-(--text-primary) sm:text-3xl">
            Customer Reviews
          </h2>

          <div className="mt-6 flex flex-col gap-8 rounded-2xl border border-slate-100 bg-white p-6 shadow-sm shadow-slate-200/60 sm:flex-row sm:items-center dark:border-(--border-subtle) dark:bg-(--surface-1) dark:shadow-none">
            <div className="flex shrink-0 flex-col items-center gap-1 sm:border-r sm:border-slate-100 sm:pr-8 dark:sm:border-(--border-subtle)">
              <p className="text-4xl font-extrabold text-slate-900 dark:text-(--text-primary)">
                {summary.average.toFixed(1)}
              </p>
              <div className="flex items-center gap-0.5">
                {Array.from({ length: 5 }).map((_, index) => (
                  <Star
                    key={index}
                    className={`h-4 w-4 ${
                      index < Math.round(summary.average)
                        ? "fill-amber-400 text-amber-400"
                        : "fill-slate-200 text-slate-200 dark:fill-(--surface-2) dark:text-(--surface-2)"
                    }`}
                  />
                ))}
              </div>
              <p className="text-xs text-slate-500 dark:text-(--text-muted)">
                {summary.count.toLocaleString()} {summary.count === 1 ? "review" : "reviews"}
              </p>
            </div>

            <div className="flex-1 space-y-2">
              {distribution.map(({ star, count }) => (
                <RatingBar key={star} star={star} count={count} total={summary.count} />
              ))}
            </div>
          </div>
        </motion.div>

        {reviews.items.length > 0 ? (
          <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2">
            {reviews.items.map((review, index) => (
              <motion.div
                key={review.id}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-60px" }}
                variants={fadeUp}
                transition={{ duration: 0.4, delay: (index % 4) * 0.06, ease: "easeOut" }}
                className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm shadow-slate-200/60 dark:border-(--border-subtle) dark:bg-(--surface-1) dark:shadow-none"
              >
                <div className="flex items-center gap-3">
                  {review.avatar ? (
                    <img src={review.avatar} alt="" className="h-11 w-11 shrink-0 rounded-full object-cover" />
                  ) : (
                    <span
                      aria-hidden="true"
                      className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-linear-to-br from-indigo-500 to-fuchsia-500 text-sm font-bold text-white"
                    >
                      {initials(review.author)}
                    </span>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold text-slate-900 dark:text-(--text-primary)">{review.author}</p>
                    <p className="text-xs text-slate-500 dark:text-(--text-muted)">{review.date}</p>
                  </div>
                  <div className="flex shrink-0 items-center gap-0.5" role="img" aria-label={`${review.rating} out of 5 stars`}>
                    {Array.from({ length: 5 }).map((_, starIndex) => (
                      <Star
                        key={starIndex}
                        className={`h-3.5 w-3.5 ${
                          starIndex < review.rating
                            ? "fill-amber-400 text-amber-400"
                            : "fill-slate-200 text-slate-200 dark:fill-(--surface-2) dark:text-(--surface-2)"
                        }`}
                      />
                    ))}
                  </div>
                </div>
                <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-slate-600 dark:text-(--text-muted)">
                  {review.comment}
                </p>
              </motion.div>
            ))}
          </div>
        ) : null}

        {hasMore ? (
          <div className="mt-8 flex justify-center">
            <button
              type="button"
              onClick={() => dispatch(fetchServiceReviews({ slug: service.slug, page: meta.page + 1 }))}
              disabled={isLoadingMore}
              className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-indigo-300 hover:text-indigo-600 disabled:opacity-60 dark:border-(--border-subtle) dark:text-(--text-primary) dark:hover:text-indigo-400"
            >
              {isLoadingMore ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              {isLoadingMore ? "Loading…" : `Show more reviews (${meta.total - reviews.items.length} more)`}
            </button>
          </div>
        ) : null}
      </div>
    </section>
  );
}

function ReviewsSkeleton() {
  const block = "animate-pulse rounded bg-slate-100 dark:bg-(--surface-2)";
  return (
    <section className="border-t border-slate-100 py-10 sm:py-14 lg:py-20 dark:border-(--border-subtle)" aria-busy="true">
      <div className="mx-auto max-w-7xl px-3 sm:px-6 lg:px-8">
        <div className={`h-8 w-56 ${block}`} />
        <div className={`mt-6 h-40 rounded-2xl ${block}`} />
        <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div className={`h-28 rounded-2xl ${block}`} />
          <div className={`h-28 rounded-2xl ${block}`} />
        </div>
      </div>
    </section>
  );
}
