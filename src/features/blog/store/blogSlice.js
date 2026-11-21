// Feature-owned Redux state for the public blog. Every blog API call goes
// through a createAsyncThunk here — no component calls httpClient directly.
// Errors are already toasted globally by httpClient.
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { getJson } from "@/lib/httpClient.js";
import {
  BLOG_API_PATH,
  BLOG_CATEGORY_API_PATH,
  BLOGS_PER_PAGE,
  BLOG_HIGHLIGHT_COUNT,
  toBlogPost,
} from "../definitions/blogs.js";

const initialState = {
  // The Blog page's category pills.
  categories: { items: [], status: "idle" },
  // The Blog page's grid: one page of posts plus the server's paging meta.
  list: {
    items: [],
    meta: { page: 1, perPage: BLOGS_PER_PAGE, total: 0, totalPages: 0 },
    status: "idle", // 'idle' | 'loading' | 'succeeded' | 'failed'
  },
  // The post open on the details page, and the slug it was loaded for.
  details: { post: null, slug: null, status: "idle" },
  // The details page's sidebar lists.
  highlights: { popular: [], recent: [], trendy: [], status: "idle" },
};

// backend blog_category.controller.js's getActiveBlogCategories. Every active
// category ({ _id, name, slug, description }), in the order they were created.
export const fetchBlogCategories = createAsyncThunk("blog/fetchBlogCategories", async (_, { rejectWithValue }) => {
  try {
    return await getJson(BLOG_CATEGORY_API_PATH);
  } catch (error) {
    return rejectWithValue(error.response?.data);
  }
});

// backend blog.controller.js's getActiveBlogs. Published posts, newest first,
// paged by the server. Filters: search (title/summary) and categoryId.
export const fetchBlogs = createAsyncThunk(
  "blog/fetchBlogs",
  async ({ page = 1, search, categoryId } = {}, { rejectWithValue }) => {
    const params = new URLSearchParams({ page: String(page), per_page: String(BLOGS_PER_PAGE) });
    if (search?.trim()) params.set("search", search.trim());
    if (categoryId) params.set("blogCategoryId", categoryId);
    try {
      return await getJson(`${BLOG_API_PATH}?${params}`);
    } catch (error) {
      return rejectWithValue(error.response?.data);
    }
  },
);

// backend blog.controller.js's getActiveBlogBySlug. One published post with
// its full content and gallery images. A slug that doesn't exist is a 404.
export const fetchBlogBySlug = createAsyncThunk("blog/fetchBlogBySlug", async (slug, { rejectWithValue }) => {
  try {
    return await getJson(`${BLOG_API_PATH}/${encodeURIComponent(slug)}`);
  } catch (error) {
    return rejectWithValue(error.response?.data);
  }
});

// The same listing endpoint, three times: the posts the admin marked popular,
// the newest posts, and the posts marked trendy.
export const fetchBlogHighlights = createAsyncThunk("blog/fetchBlogHighlights", async (_, { rejectWithValue }) => {
  const size = `per_page=${BLOG_HIGHLIGHT_COUNT}`;
  try {
    const [popular, recent, trendy] = await Promise.all([
      getJson(`${BLOG_API_PATH}?isPopular=true&${size}`),
      getJson(`${BLOG_API_PATH}?${size}`),
      getJson(`${BLOG_API_PATH}?isTrendy=true&${size}`),
    ]);
    return { popular: popular.data ?? [], recent: recent.data ?? [], trendy: trendy.data ?? [] };
  } catch (error) {
    return rejectWithValue(error.response?.data);
  }
});

const blogSlice = createSlice({
  name: "blog",
  initialState,
  reducers: {
    // Dispatched when the details page closes, so the next visit starts from
    // a clean slate instead of the previous post (or its failure).
    blogDetailsCleared: (state) => {
      state.details = initialState.details;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchBlogCategories.pending, (state) => {
        state.categories.status = "loading";
      })
      .addCase(fetchBlogCategories.fulfilled, (state, action) => {
        state.categories.status = "succeeded";
        state.categories.items = (action.payload.data ?? []).map((category) => ({
          id: category._id,
          name: category.name,
        }));
      })
      .addCase(fetchBlogCategories.rejected, (state) => {
        state.categories.status = "failed";
      })

      .addCase(fetchBlogs.pending, (state) => {
        state.list.status = "loading";
      })
      .addCase(fetchBlogs.fulfilled, (state, action) => {
        state.list.status = "succeeded";
        state.list.items = (action.payload.data ?? []).map(toBlogPost);
        state.list.meta = action.payload.meta ?? initialState.list.meta;
      })
      .addCase(fetchBlogs.rejected, (state, action) => {
        // A newer search replaced this one; its own result will land instead.
        if (action.meta.aborted) return;
        state.list.status = "failed";
        state.list.items = [];
        state.list.meta = initialState.list.meta;
      })

      .addCase(fetchBlogBySlug.pending, (state, action) => {
        state.details = { post: null, slug: action.meta.arg, status: "loading" };
      })
      .addCase(fetchBlogBySlug.fulfilled, (state, action) => {
        if (state.details.slug !== action.meta.arg) return;
        state.details.status = "succeeded";
        state.details.post = toBlogPost(action.payload.data);
      })
      .addCase(fetchBlogBySlug.rejected, (state, action) => {
        if (state.details.slug !== action.meta.arg) return;
        state.details.status = "failed";
      })

      .addCase(fetchBlogHighlights.pending, (state) => {
        state.highlights.status = "loading";
      })
      .addCase(fetchBlogHighlights.fulfilled, (state, action) => {
        state.highlights = {
          popular: action.payload.popular.map(toBlogPost),
          recent: action.payload.recent.map(toBlogPost),
          trendy: action.payload.trendy.map(toBlogPost),
          status: "succeeded",
        };
      })
      .addCase(fetchBlogHighlights.rejected, (state) => {
        state.highlights.status = "failed";
      });
  },
});

export const { blogDetailsCleared } = blogSlice.actions;

export default blogSlice.reducer;
