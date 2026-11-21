import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { Navigate, useParams } from "react-router-dom";
import { useDocumentTitle } from "@/hooks/useDocumentTitle.js";
import { blogDetailsCleared, fetchBlogBySlug, useBlog } from "@/features/blog/index.js";
import { ROUTES } from "@/routes/constants.js";
import { BlogDetailsContentSection } from "./components/index.js";

// Shown while the post loads - the page's own width and spacing, so the
// article doesn't jump when it arrives.
function BlogDetailsSkeleton() {
  return (
    <section className="mx-auto max-w-7xl px-3 py-10 sm:px-6 sm:py-14 lg:px-8" aria-label="Loading article">
      <div className="animate-pulse lg:max-w-[calc(100%-380px)]">
        <div className="h-4 w-56 max-w-full rounded bg-slate-100 dark:bg-(--surface-2)" />
        <div className="mt-8 h-7 w-28 rounded-full bg-slate-100 dark:bg-(--surface-2)" />
        <div className="mt-4 h-9 w-full rounded bg-slate-100 dark:bg-(--surface-2)" />
        <div className="mt-2 h-9 w-2/3 rounded bg-slate-100 dark:bg-(--surface-2)" />
        <div className="mt-8 aspect-video rounded-3xl bg-slate-100 dark:bg-(--surface-2)" />
      </div>
    </section>
  );
}

// One reusable page for every post — looked up by :postId, which is the
// post's slug (see routes/constants.js's BLOG_DETAILS pattern), not one page
// per post. The post itself comes from the backend.
export default function BlogDetailsPage() {
  const { postId } = useParams();
  const dispatch = useDispatch();
  const { details } = useBlog();

  useDocumentTitle("Fixonest");

  // Same route pattern for every post (/blog/:postId), so React Router
  // keeps this page mounted, and its scroll position, when navigating from
  // one post's details to another's (e.g. the sidebar's Popular/Recent/Trendy
  // list) - load the new post and jump back to the top on change.
  useEffect(() => {
    dispatch(fetchBlogBySlug(postId));
    window.scrollTo(0, 0);
  }, [dispatch, postId]);

  useEffect(
    () => () => {
      dispatch(blogDetailsCleared());
    },
    [dispatch],
  );

  const isCurrent = details.slug === postId;

  // A slug that doesn't exist (or a post that was hidden) goes back to the
  // listing; httpClient has already shown why.
  if (isCurrent && details.status === "failed") {
    return <Navigate to={ROUTES.BLOG} replace />;
  }

  if (!isCurrent || !details.post) {
    return <BlogDetailsSkeleton />;
  }

  const { post } = details;

  return (
    <BlogDetailsContentSection
      // Forces a full remount when navigating between posts (same route
      // pattern for all of them) so local state - the open reply/edit
      // editor - doesn't leak from one post to the next. The comments
      // themselves are loaded by BlogCommentsSection from post.blogId.
      key={post.id}
      post={post}
      category={post.category}
      mainImage={post.image}
      detailImages={post.galleryImages}
    />
  );
}
