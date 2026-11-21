import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { ChevronDown } from "lucide-react";
import { useAuth } from "@/features/auth/index.js";
import {
  blogCommentsCleared,
  createBlogComment,
  deleteBlogComment,
  fetchBlogComments,
  fetchCommentReplies,
  fetchMyCommentLikes,
  toggleCommentLike,
  updateBlogComment,
  useBlogComments,
} from "@/features/blog/index.js";
import { ConfirmDialog } from "@/components/common/confirmDialog/index.js";
import { ROUTES } from "@/routes/constants.js";
import { useRequireAuth } from "@/routes/guards/useRequireAuth.js";
import BlogCommentForm from "./BlogCommentForm.jsx";
import BlogCommentItem from "./BlogCommentItem.jsx";

// The blog details page's comment area: the nested comment list, and the
// "Write a Comment" card (or a sign-in prompt for visitors). Reading is
// public; commenting, replying and liking need a customer login. All data
// lives in features/blog/store/blogCommentSlice.js. API errors are toasted
// by httpClient, so failures here only need to keep the form open.
export default function BlogCommentsSection({ blogId, postSlug }) {
  const dispatch = useDispatch();
  const { user } = useAuth();
  const { isAuthenticated, requireAuth } = useRequireAuth();
  const { topLevel } = useBlogComments();

  // At most one inline editor is open at a time: { commentId, mode: "reply" | "edit" }.
  const [activeEditor, setActiveEditor] = useState(null);
  const [deleteTargetId, setDeleteTargetId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    dispatch(fetchBlogComments({ blogId }));
    return () => {
      dispatch(blogCommentsCleared());
    };
  }, [dispatch, blogId]);

  // Which comments this customer already liked - reloaded after logging in.
  useEffect(() => {
    if (isAuthenticated) dispatch(fetchMyCommentLikes(blogId));
  }, [dispatch, blogId, isAuthenticated]);

  // Resolves true when the request succeeded, so a form knows to clear/close.
  const run = async (thunk, successMessage) => {
    try {
      await dispatch(thunk).unwrap();
      if (successMessage) toast.success(successMessage);
      return true;
    } catch {
      return false;
    }
  };

  const handleComment = (content) => run(createBlogComment({ blogId, content }), "Comment posted");

  const actions = {
    isAuthenticated,
    currentUserId: user?._id ?? null,
    requireAuth,
    activeEditor,
    onToggleEditor: (commentId, mode) =>
      setActiveEditor((current) =>
        current?.commentId === commentId && current.mode === mode ? null : { commentId, mode },
      ),
    onCloseEditor: () => setActiveEditor(null),
    onReply: async (parentId, content) => {
      const posted = await run(createBlogComment({ blogId, content, parentId }), "Reply posted");
      if (posted) setActiveEditor(null);
      return posted;
    },
    onEdit: async (commentId, content) => {
      const saved = await run(updateBlogComment({ commentId, content }), "Comment updated");
      if (saved) setActiveEditor(null);
      return saved;
    },
    onRequestDelete: (commentId) => setDeleteTargetId(commentId),
    onToggleLike: (commentId, liked) => run(toggleCommentLike({ commentId, liked })),
    onLoadReplies: (commentId, page) => dispatch(fetchCommentReplies({ commentId, page })),
  };

  const handleDeleteConfirm = async () => {
    setDeleting(true);
    const deleted = await run(deleteBlogComment(deleteTargetId), "Comment deleted");
    setDeleting(false);
    if (deleted) {
      if (activeEditor?.commentId === deleteTargetId) setActiveEditor(null);
      setDeleteTargetId(null);
    }
  };

  const isFirstLoad = topLevel.status === "loading" && topLevel.ids.length === 0;
  const hasMore = topLevel.page < topLevel.totalPages;

  return (
    <>
      <div className="mt-10 border-t border-slate-100 pt-10 dark:border-(--border-subtle)">
        <h3 className="text-lg font-bold text-slate-900 dark:text-(--text-primary)">
          {topLevel.total} {topLevel.total === 1 ? "Comment" : "Comments"}
        </h3>

        {isFirstLoad ? (
          <div className="mt-6 flex animate-pulse flex-col gap-6" aria-label="Loading comments">
            {[0, 1].map((row) => (
              <div key={row} className="flex items-start gap-4">
                <div className="h-12 w-12 shrink-0 rounded-full bg-slate-100 dark:bg-(--surface-2)" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-32 rounded bg-slate-100 dark:bg-(--surface-2)" />
                  <div className="h-4 w-full rounded bg-slate-100 dark:bg-(--surface-2)" />
                </div>
              </div>
            ))}
          </div>
        ) : topLevel.ids.length === 0 ? (
          <p className="mt-4 text-sm text-slate-500 dark:text-(--text-muted)">
            {topLevel.status === "failed"
              ? "Comments couldn't be loaded right now."
              : "No comments yet. Be the first to share your thoughts."}
          </p>
        ) : (
          <div className="mt-6 flex flex-col gap-6">
            {topLevel.ids.map((commentId) => (
              <BlogCommentItem key={commentId} commentId={commentId} actions={actions} />
            ))}
          </div>
        )}

        {hasMore ? (
          <button
            type="button"
            onClick={() => dispatch(fetchBlogComments({ blogId, page: topLevel.page + 1 }))}
            disabled={topLevel.status === "loading"}
            className="mt-6 inline-flex items-center gap-1.5 rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-60 dark:border-(--border-subtle) dark:text-(--text-primary) dark:hover:bg-(--surface-2)"
          >
            <ChevronDown className="h-4 w-4" />
            {topLevel.status === "loading" ? "Loading…" : "Load more comments"}
          </button>
        ) : null}
      </div>

      <div className="mt-10">
        {isAuthenticated ? (
          <BlogCommentForm authorName={user?.fullName} onSubmit={handleComment} />
        ) : (
          <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50/60 p-8 text-center dark:border-(--border-subtle) dark:bg-(--surface-2)/40">
            <p className="text-sm font-semibold text-slate-900 dark:text-(--text-primary)">
              Want to join the conversation?
            </p>
            <p className="mt-1 text-sm text-slate-500 dark:text-(--text-muted)">Sign in to leave a comment.</p>
            <Link
              to={ROUTES.LOGIN}
              state={{ from: `${ROUTES.BLOG}/${postSlug}` }}
              className="mt-4 inline-flex items-center gap-2 rounded-xl bg-linear-to-r from-indigo-600 to-fuchsia-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-600/25 transition hover:brightness-110"
            >
              Sign In
            </Link>
          </div>
        )}
      </div>

      <ConfirmDialog
        open={Boolean(deleteTargetId)}
        title="Delete this comment?"
        description="Your comment will be removed. Replies to it will stay."
        confirmLabel="Yes, delete"
        cancelLabel="Cancel"
        variant="danger"
        loading={deleting}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTargetId(null)}
      />
    </>
  );
}
