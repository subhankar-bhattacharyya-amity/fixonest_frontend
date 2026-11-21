// Feature-owned Redux state for the comments on the blog details page. Every
// comment API call goes through a createAsyncThunk here - no component calls
// httpClient directly. Errors are already toasted globally by httpClient.
//
// Comments are kept flat (byId) and every list only holds ids, mirroring the
// backend, where each comment is its own document pointing at its parent:
//   topLevel           - the blog's top-level comments, newest first
//   replies[commentId] - the loaded direct replies of one comment, oldest first
// so a reply at any depth is added, edited, liked or removed in one place.
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { deleteJson, getJson, patchJson, postJson } from "@/lib/httpClient.js";
import {
  COMMENTS_PER_PAGE,
  REPLIES_PER_PAGE,
  blogCommentPath,
  blogCommentsPath,
  myCommentLikesPath,
  toBlogComment,
} from "../definitions/blogComments.js";

const initialState = {
  // The blog these comments belong to; loading another blog starts over.
  blogId: null,
  byId: {},
  topLevel: { ids: [], page: 0, total: 0, totalPages: 0, status: "idle" },
  replies: {}, // commentId -> { ids, page, totalPages, status }
  // Comment ids the logged-in customer liked on this blog, and the ones with
  // a like/unlike request in flight.
  likedIds: {},
  likePendingIds: {},
};

const emptyReplies = { ids: [], page: 0, totalPages: 0, status: "idle" };

// Adds ids to a list without repeating one already there. Needed because new
// comments shift the server's pages while older pages are still being loaded.
const mergeIds = (current, incoming, { prepend = false } = {}) => {
  const fresh = incoming.filter((id) => !current.includes(id));
  return prepend ? [...fresh, ...current] : [...current, ...fresh];
};

const storeComments = (state, rawComments) =>
  rawComments.map((raw) => {
    const comment = toBlogComment(raw);
    state.byId[comment.id] = comment;
    return comment.id;
  });

// Takes a comment out of whichever list holds it (and out of byId). A
// deleted parent left with no replies is hidden too, as the backend does.
const removeComment = (state, commentId) => {
  const comment = state.byId[commentId];
  if (!comment) return;

  if (comment.parentId) {
    const list = state.replies[comment.parentId];
    if (list) list.ids = list.ids.filter((id) => id !== commentId);
  } else {
    state.topLevel.ids = state.topLevel.ids.filter((id) => id !== commentId);
    state.topLevel.total = Math.max(0, state.topLevel.total - 1);
  }
  delete state.byId[commentId];
  delete state.replies[commentId];
  delete state.likedIds[commentId];

  const parent = comment.parentId ? state.byId[comment.parentId] : null;
  if (parent?.isDeleted && parent.replyCount === 0) {
    removeComment(state, parent.id);
  }
};

// backend blog_comment.controller.js's getBlogComments. Public. page 1
// replaces the list; later pages are appended ("Load more comments").
export const fetchBlogComments = createAsyncThunk(
  "blogComments/fetchBlogComments",
  async ({ blogId, page = 1 }, { rejectWithValue }) => {
    const params = new URLSearchParams({ page: String(page), per_page: String(COMMENTS_PER_PAGE) });
    try {
      return await getJson(`${blogCommentsPath(blogId)}?${params}`);
    } catch (error) {
      return rejectWithValue(error.response?.data);
    }
  },
);

// backend getCommentReplies. Public. One page of a comment's direct replies.
export const fetchCommentReplies = createAsyncThunk(
  "blogComments/fetchCommentReplies",
  async ({ commentId, page = 1 }, { rejectWithValue }) => {
    const params = new URLSearchParams({ page: String(page), per_page: String(REPLIES_PER_PAGE) });
    try {
      return await getJson(`${blogCommentPath(commentId)}/replies?${params}`);
    } catch (error) {
      return rejectWithValue(error.response?.data);
    }
  },
);

// backend getMyLikedCommentIds. Customer login. Ids of every comment on this
// blog the customer liked, so their like buttons show as pressed.
export const fetchMyCommentLikes = createAsyncThunk(
  "blogComments/fetchMyCommentLikes",
  async (blogId, { rejectWithValue }) => {
    try {
      return await getJson(myCommentLikesPath(blogId));
    } catch (error) {
      return rejectWithValue(error.response?.data);
    }
  },
);

// backend createComment. Customer login. payload: { blogId, content,
// parentId? } - parentId makes it a reply to that comment.
export const createBlogComment = createAsyncThunk(
  "blogComments/createBlogComment",
  async ({ blogId, content, parentId }, { rejectWithValue }) => {
    try {
      return await postJson(blogCommentsPath(blogId), parentId ? { content, parentId } : { content });
    } catch (error) {
      return rejectWithValue(error.response?.data);
    }
  },
);

// backend updateComment. Customer login, own comment only.
export const updateBlogComment = createAsyncThunk(
  "blogComments/updateBlogComment",
  async ({ commentId, content }, { rejectWithValue }) => {
    try {
      return await patchJson(blogCommentPath(commentId), { content });
    } catch (error) {
      return rejectWithValue(error.response?.data);
    }
  },
);

// backend deleteComment. Customer login, own comment only. Its replies stay.
export const deleteBlogComment = createAsyncThunk(
  "blogComments/deleteBlogComment",
  async (commentId, { rejectWithValue }) => {
    try {
      return await deleteJson(blogCommentPath(commentId));
    } catch (error) {
      return rejectWithValue(error.response?.data);
    }
  },
);

// backend likeComment / unlikeComment. Customer login. `liked` is the
// current state: true unlikes, false likes. Customers can like their own
// comments too. The response carries the new likeCount.
export const toggleCommentLike = createAsyncThunk(
  "blogComments/toggleCommentLike",
  async ({ commentId, liked }, { rejectWithValue }) => {
    const path = `${blogCommentPath(commentId)}/like`;
    try {
      return await (liked ? deleteJson(path) : postJson(path, {}));
    } catch (error) {
      return rejectWithValue(error.response?.data);
    }
  },
);

const blogCommentSlice = createSlice({
  name: "blogComments",
  initialState,
  reducers: {
    // Dispatched when the details page closes, so the next post starts clean.
    blogCommentsCleared: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchBlogComments.pending, (state, action) => {
        const { blogId } = action.meta.arg;
        if (state.blogId !== blogId) {
          Object.assign(state, initialState, { blogId });
        }
        state.topLevel.status = "loading";
      })
      .addCase(fetchBlogComments.fulfilled, (state, action) => {
        const { blogId, page = 1 } = action.meta.arg;
        if (state.blogId !== blogId) return;
        const ids = storeComments(state, action.payload.data ?? []);
        const meta = action.payload.meta ?? {};
        state.topLevel = {
          ids: page === 1 ? ids : mergeIds(state.topLevel.ids, ids),
          page: meta.page ?? page,
          total: meta.total ?? ids.length,
          totalPages: meta.totalPages ?? 1,
          status: "succeeded",
        };
      })
      .addCase(fetchBlogComments.rejected, (state, action) => {
        if (state.blogId !== action.meta.arg.blogId) return;
        state.topLevel.status = "failed";
      })

      .addCase(fetchCommentReplies.pending, (state, action) => {
        const { commentId } = action.meta.arg;
        state.replies[commentId] = { ...(state.replies[commentId] ?? emptyReplies), status: "loading" };
      })
      .addCase(fetchCommentReplies.fulfilled, (state, action) => {
        const { commentId, page = 1 } = action.meta.arg;
        if (!state.byId[commentId]) return;
        const ids = storeComments(state, action.payload.data ?? []);
        const meta = action.payload.meta ?? {};
        const current = state.replies[commentId] ?? emptyReplies;
        state.replies[commentId] = {
          ids: mergeIds(current.ids, ids),
          page: meta.page ?? page,
          totalPages: meta.totalPages ?? 1,
          status: "succeeded",
        };
      })
      .addCase(fetchCommentReplies.rejected, (state, action) => {
        const list = state.replies[action.meta.arg.commentId];
        if (list) list.status = "failed";
      })

      .addCase(fetchMyCommentLikes.fulfilled, (state, action) => {
        if (state.blogId !== action.meta.arg) return;
        state.likedIds = Object.fromEntries((action.payload.data ?? []).map((id) => [id, true]));
      })

      .addCase(createBlogComment.fulfilled, (state, action) => {
        if (state.blogId !== action.meta.arg.blogId) return;
        const [id] = storeComments(state, [action.payload.data]);
        const { parentId } = state.byId[id];
        if (parentId) {
          const parent = state.byId[parentId];
          if (parent) parent.replyCount += 1;
          const list = state.replies[parentId] ?? { ...emptyReplies, status: "succeeded" };
          state.replies[parentId] = { ...list, ids: mergeIds(list.ids, [id]) };
        } else {
          state.topLevel.ids = mergeIds(state.topLevel.ids, [id], { prepend: true });
          state.topLevel.total += 1;
        }
      })

      .addCase(updateBlogComment.fulfilled, (state, action) => {
        const comment = toBlogComment(action.payload.data);
        if (state.byId[comment.id]) state.byId[comment.id] = comment;
      })

      .addCase(deleteBlogComment.fulfilled, (state, action) => {
        const comment = state.byId[action.meta.arg];
        if (!comment) return;
        const parent = comment.parentId ? state.byId[comment.parentId] : null;
        if (parent) parent.replyCount = Math.max(0, parent.replyCount - 1);

        if (comment.replyCount > 0) {
          // Its replies stay, so it stays as an empty placeholder.
          Object.assign(comment, { isDeleted: true, content: "", authorId: null, authorName: "", avatar: null });
          delete state.likedIds[comment.id];
        } else {
          removeComment(state, comment.id);
        }
      })

      .addCase(toggleCommentLike.pending, (state, action) => {
        state.likePendingIds[action.meta.arg.commentId] = true;
      })
      .addCase(toggleCommentLike.fulfilled, (state, action) => {
        const { commentId } = action.meta.arg;
        const { liked, likeCount } = action.payload.data ?? {};
        delete state.likePendingIds[commentId];
        if (liked) state.likedIds[commentId] = true;
        else delete state.likedIds[commentId];
        if (state.byId[commentId] && typeof likeCount === "number") {
          state.byId[commentId].likeCount = likeCount;
        }
      })
      .addCase(toggleCommentLike.rejected, (state, action) => {
        delete state.likePendingIds[action.meta.arg.commentId];
      });
  },
});

export const { blogCommentsCleared } = blogCommentSlice.actions;

export default blogCommentSlice.reducer;
