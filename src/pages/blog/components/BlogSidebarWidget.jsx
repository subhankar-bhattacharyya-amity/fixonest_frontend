import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { Link } from "react-router-dom";
import { fetchBlogHighlights, useBlog } from "@/features/blog/index.js";
import { getBlogDetailsPath } from "@/routes/constants.js";

// A list with nothing in it (e.g. no post has been marked popular yet) is
// left out rather than shown as an empty box.
function RankedPostList({ title, posts, currentPostId }) {
  if (posts.length === 0) return null;

  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm shadow-slate-200/60 dark:border-(--border-subtle) dark:bg-(--surface-1) dark:shadow-none">
      <h3 className="text-sm font-bold text-slate-900 dark:text-(--text-primary)">{title}</h3>
      <div className="mt-4 flex flex-col divide-y divide-slate-100 dark:divide-(--border-subtle)">
        {posts.map((post) => {
          const isCurrent = String(post.id) === String(currentPostId);
          return (
            <Link
              key={post.id}
              to={getBlogDetailsPath(post.id)}
              className={`flex items-center gap-3 py-3 first:pt-0 last:pb-0 ${isCurrent ? "opacity-60" : ""}`}
            >
              <span className="h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-indigo-50 dark:bg-indigo-500/10">
                {post.image ? <img src={post.image} alt="" className="h-full w-full object-contain p-2" /> : null}
              </span>
              <div className="min-w-0">
                <p className="text-xs text-slate-500 dark:text-(--text-muted)">{post.publishedAt}</p>
                <p className="mt-0.5 line-clamp-2 text-sm font-semibold text-slate-900 dark:text-(--text-primary)">
                  {post.title}
                </p>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

// Three standalone sections (not tabs) - per chat, Popular/Recent/Trendy
// each get their own always-visible block. No search/category-filter here,
// per the earlier "details page shouldn't duplicate the listing's filters"
// instruction. Popular and Trendy are the posts the admin marked as such;
// Recent is simply the newest ones.
export default function BlogSidebarWidget({ currentPostId }) {
  const dispatch = useDispatch();
  const { highlights } = useBlog();

  useEffect(() => {
    dispatch(fetchBlogHighlights());
  }, [dispatch]);

  return (
    <div className="flex flex-col gap-6">
      <RankedPostList title="Popular" posts={highlights.popular} currentPostId={currentPostId} />
      <RankedPostList title="Recent" posts={highlights.recent} currentPostId={currentPostId} />
      <RankedPostList title="Trendy" posts={highlights.trendy} currentPostId={currentPostId} />
    </div>
  );
}
