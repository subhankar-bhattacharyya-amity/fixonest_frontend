import { appConfig } from "@/lib/config.js";
import { formatDate } from "@/utils/formatDate.js";

// backend/app/router/customer/blog_comment.routes.js. Reading is public;
// writing and liking need a customer login (httpClient attaches the token).
//   GET    /api/v1/blogs/:blogId/comments              top-level comments
//   POST   /api/v1/blogs/:blogId/comments              add comment / reply (parentId)
//   GET    /api/v1/blogs/:blogId/comment-likes/me      ids of my liked comments
//   GET    /api/v1/blog-comments/:commentId/replies    direct replies
//   PATCH  /api/v1/blog-comments/:commentId            edit own comment
//   DELETE /api/v1/blog-comments/:commentId            delete own comment
//   POST   /api/v1/blog-comments/:commentId/like       like
//   DELETE /api/v1/blog-comments/:commentId/like       unlike
export const blogCommentsPath = (blogId) => `/api/v1/blogs/${blogId}/comments`;
export const myCommentLikesPath = (blogId) => `/api/v1/blogs/${blogId}/comment-likes/me`;
export const blogCommentPath = (commentId) => `/api/v1/blog-comments/${commentId}`;

// Top-level comments per "Load more", and replies per "View replies".
export const COMMENTS_PER_PAGE = 10;
export const REPLIES_PER_PAGE = 5;

// Same limit as the backend's blog_comment.model.js content maxlength.
export const COMMENT_MAX_LENGTH = 1000;

// Deeper replies stop indenting further, so a long thread stays readable on
// a phone. The data itself has no depth limit.
export const MAX_VISUAL_DEPTH = 3;

// profile_image is stored as "/uploads/...", served by the backend.
const buildAvatarUrl = (path) => (path ? `${appConfig.apiBaseUrl}/${path.replace(/^\/+/, "")}` : null);

// Turns a comment from the API into the shape the comment components render.
// A deleted comment that still has replies comes back with content "" and
// userId null - it stays in the thread as a placeholder.
export const toBlogComment = (comment) => {
  const author = comment.userId ?? null;

  return {
    id: comment._id,
    parentId: comment.parentId ?? null,
    depth: comment.depth ?? 0,
    content: comment.content ?? "",
    authorId: author?._id ?? null,
    authorName: author?.fullName ?? "",
    avatar: buildAvatarUrl(author?.profile_image),
    date: formatDate(new Date(comment.createdAt)),
    likeCount: comment.likeCount ?? 0,
    replyCount: comment.replyCount ?? 0,
    isEdited: Boolean(comment.isEdited),
    isDeleted: Boolean(comment.isDeleted),
  };
};
