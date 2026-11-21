import { useState } from "react";
import { ChevronDown, CornerUpLeft, Pencil, ThumbsUp, Trash2 } from "lucide-react";
import { initialsOf } from "@/features/auth/index.js";
import { MAX_VISUAL_DEPTH, useBlogComments } from "@/features/blog/index.js";
import BlogReplyForm from "./BlogReplyForm.jsx";

// A customer can like any comment or reply, including their own.
function LikeButton({ liked, count, disabled, onClick, ariaLabel }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-pressed={liked}
      aria-label={ariaLabel}
      className={`inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition disabled:cursor-wait disabled:opacity-70 ${
        liked
          ? "border-indigo-200 bg-indigo-50 text-indigo-600 dark:border-indigo-500/30 dark:bg-indigo-500/10 dark:text-indigo-400"
          : "border-slate-200 text-slate-500 hover:border-slate-300 hover:bg-slate-50 dark:border-(--border-subtle) dark:text-(--text-muted) dark:hover:bg-(--surface-2)"
      }`}
    >
      <ThumbsUp className={`h-3.5 w-3.5 ${liked ? "fill-indigo-600 dark:fill-indigo-400" : ""}`} />
      {count}
    </button>
  );
}

const ghostButton =
  "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-xs font-semibold text-slate-500 transition hover:bg-slate-100 hover:text-slate-700 dark:text-(--text-muted) dark:hover:bg-(--surface-2) dark:hover:text-(--text-primary)";

function Avatar({ comment, small }) {
  const [failed, setFailed] = useState(false);
  const size = small ? "h-9 w-9 text-xs" : "h-12 w-12 text-sm";

  if (comment.isDeleted) {
    return <span className={`${size} shrink-0 rounded-full bg-slate-100 dark:bg-(--surface-2)`} aria-hidden="true" />;
  }
  if (comment.avatar && !failed) {
    return (
      <img
        src={comment.avatar}
        alt=""
        onError={() => setFailed(true)}
        className={`${size} shrink-0 rounded-full object-cover shadow-sm`}
      />
    );
  }
  return (
    <span
      className={`${size} flex shrink-0 items-center justify-center rounded-full bg-linear-to-br from-indigo-500 to-fuchsia-500 font-semibold text-white`}
    >
      {initialsOf(comment.authorName)}
    </span>
  );
}

// One comment and, below it, its loaded replies - each rendered by this same
// component, so a thread nests to any depth. Data comes from the blog
// comments slice; everything that changes data goes through `actions`
// (see BlogCommentsSection.jsx), which dispatches the thunks.
export default function BlogCommentItem({ commentId, actions }) {
  const { byId, replies, likedIds, likePendingIds } = useBlogComments();
  const comment = byId[commentId];
  if (!comment) return null;

  const isReply = comment.depth > 0;
  const isOwn = Boolean(actions.currentUserId) && comment.authorId === actions.currentUserId;
  const liked = actions.isAuthenticated && Boolean(likedIds[comment.id]);
  const editor = actions.activeEditor?.commentId === comment.id ? actions.activeEditor.mode : null;

  const replyList = replies[comment.id];
  const loadedReplies = replyList?.ids ?? [];
  const hiddenReplyCount = Math.max(0, comment.replyCount - loadedReplies.length);
  const loadingReplies = replyList?.status === "loading";
  // Past MAX_VISUAL_DEPTH, replies line up with their parent instead of
  // indenting further.
  const indentReplies = comment.depth < MAX_VISUAL_DEPTH;

  return (
    <div className={isReply ? "" : "border-b border-slate-100 pb-6 last:border-b-0 dark:border-(--border-subtle)"}>
      <div className={`flex items-start ${isReply ? "gap-3" : "gap-4"}`}>
        <Avatar comment={comment} small={isReply} />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <p
                className={`font-semibold text-slate-900 dark:text-(--text-primary) ${isReply ? "text-sm" : ""}`}
              >
                {comment.isDeleted ? "Deleted comment" : comment.authorName}
                {isOwn ? (
                  <span className="ml-2 rounded-full bg-indigo-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400">
                    You
                  </span>
                ) : null}
              </p>
              <p className="text-xs text-slate-500 dark:text-(--text-muted)">
                {comment.date}
                {comment.isEdited && !comment.isDeleted ? " · edited" : ""}
              </p>
            </div>

            {!comment.isDeleted ? (
              <div className="flex shrink-0 flex-wrap items-center gap-1.5">
                <LikeButton
                  liked={liked}
                  count={comment.likeCount}
                  disabled={Boolean(likePendingIds[comment.id])}
                  onClick={actions.requireAuth(() => actions.onToggleLike(comment.id, liked))}
                  ariaLabel={liked ? `Unlike ${comment.authorName}'s comment` : `Like ${comment.authorName}'s comment`}
                />
                <button
                  type="button"
                  onClick={actions.requireAuth(() => actions.onToggleEditor(comment.id, "reply"))}
                  aria-expanded={editor === "reply"}
                  className="inline-flex items-center gap-1.5 rounded-full bg-linear-to-r from-indigo-600 to-fuchsia-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-sm shadow-indigo-600/25 transition hover:brightness-110"
                >
                  <CornerUpLeft className="h-3.5 w-3.5" />
                  Reply
                </button>
                {isOwn ? (
                  <>
                    <button
                      type="button"
                      onClick={() => actions.onToggleEditor(comment.id, "edit")}
                      aria-expanded={editor === "edit"}
                      aria-label="Edit your comment"
                      className={ghostButton}
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => actions.onRequestDelete(comment.id)}
                      aria-label="Delete your comment"
                      className={`${ghostButton} hover:text-red-600 dark:hover:text-red-400`}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </>
                ) : null}
              </div>
            ) : null}
          </div>

          {editor === "edit" ? (
            <BlogReplyForm
              id={`edit-${comment.id}`}
              label="Edit comment"
              placeholder="Update your comment…"
              submitLabel="Save"
              defaultMessage={comment.content}
              onCancel={actions.onCloseEditor}
              onSubmit={(text) => actions.onEdit(comment.id, text)}
            />
          ) : (
            <p
              className={`mt-2 whitespace-pre-line text-sm leading-relaxed ${
                comment.isDeleted ? "italic text-slate-400 dark:text-(--text-muted)" : "text-slate-600 dark:text-(--text-muted)"
              }`}
            >
              {comment.isDeleted ? "This comment was deleted." : comment.content}
            </p>
          )}

          {editor === "reply" ? (
            <BlogReplyForm
              id={`reply-${comment.id}`}
              placeholder={`Reply to ${comment.authorName}…`}
              onCancel={actions.onCloseEditor}
              onSubmit={(text) => actions.onReply(comment.id, text)}
            />
          ) : null}
        </div>
      </div>

      {loadedReplies.length > 0 || hiddenReplyCount > 0 ? (
        <div
          className={`mt-4 flex flex-col gap-4 ${
            indentReplies ? "ml-0 border-l-2 border-slate-100 pl-4 sm:ml-6 dark:border-(--border-subtle)" : ""
          }`}
        >
          {loadedReplies.map((replyId) => (
            <BlogCommentItem key={replyId} commentId={replyId} actions={actions} />
          ))}

          {hiddenReplyCount > 0 ? (
            <button
              type="button"
              onClick={() => actions.onLoadReplies(comment.id, (replyList?.page ?? 0) + 1)}
              disabled={loadingReplies}
              className="inline-flex items-center gap-1.5 self-start text-xs font-semibold text-indigo-600 transition hover:text-indigo-700 disabled:opacity-60 dark:text-indigo-400"
            >
              <ChevronDown className="h-3.5 w-3.5" />
              {loadingReplies
                ? "Loading replies…"
                : `View ${loadedReplies.length > 0 ? "more " : ""}${hiddenReplyCount} ${hiddenReplyCount === 1 ? "reply" : "replies"}`}
            </button>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
