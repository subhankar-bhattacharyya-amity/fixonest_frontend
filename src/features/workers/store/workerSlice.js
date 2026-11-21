// Feature-owned Redux state for the public Workers pages. Every provider API
// call goes through a createAsyncThunk here — no component calls httpClient
// directly. Errors are already toasted globally by httpClient.
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { getJson } from "@/lib/httpClient.js";
import { WORKERS_API_PATH, WORKERS_PAGE_SIZE, getWorkerApiPath, toWorker } from "../definitions/workers.js";

const initialState = {
  // The Workers page listing (one page of it).
  list: {
    items: [],
    meta: { page: 1, perPage: WORKERS_PAGE_SIZE, total: 0, totalPages: 0 },
    status: "idle", // 'idle' | 'loading' | 'succeeded' | 'failed'
    requestId: null,
  },
  // The Worker Details page.
  details: { id: null, data: null, status: "idle" },
  // Providers of one service category - the booking flow's "choose your
  // professional" modal. Kept apart from `list` so it never disturbs the
  // Workers page.
  byCategory: { slug: null, items: [], status: "idle" },
};

// Providers to pick from for a service booking.
const CATEGORY_WORKERS_LIMIT = 50;

// backend providers.controller.js's getPublicProviders. Search, filters and
// paging are applied by the server. minPrice is inclusive, maxPrice exclusive.
export const fetchWorkers = createAsyncThunk(
  "workers/fetchWorkers",
  async ({ page = 1, search, categorySlugs = [], minPrice, maxPrice, minRating } = {}, { rejectWithValue }) => {
    const params = new URLSearchParams({ page: String(page), per_page: String(WORKERS_PAGE_SIZE) });
    if (search?.trim()) params.set("search", search.trim());
    if (categorySlugs.length) params.set("category", categorySlugs.join(","));
    if (minPrice !== undefined) params.set("min_price", String(minPrice));
    if (maxPrice !== undefined) params.set("max_price", String(maxPrice));
    if (minRating) params.set("min_rating", String(minRating));
    try {
      return await getJson(`${WORKERS_API_PATH}?${params}`);
    } catch (error) {
      return rejectWithValue(error.response?.data);
    }
  },
);

// getPublicProviderDetails - one provider with their Areas of Experience.
// An unknown or no-longer-listed provider fails (toasted by httpClient) and
// the page sends the visitor back to the listing.
export const fetchWorkerDetails = createAsyncThunk(
  "workers/fetchWorkerDetails",
  async (id, { rejectWithValue }) => {
    try {
      return await getJson(getWorkerApiPath(id));
    } catch (error) {
      return rejectWithValue(error.response?.data);
    }
  },
);

// The same getPublicProviders, filtered to one category - every provider who
// works in it (best rated first, as the endpoint sorts). Skipped while the
// same category is already loading - React StrictMode runs the booking
// page's effect twice in development, which sent this request twice.
export const fetchCategoryWorkers = createAsyncThunk(
  "workers/fetchCategoryWorkers",
  async (categorySlug, { rejectWithValue }) => {
    const params = new URLSearchParams({ page: "1", per_page: String(CATEGORY_WORKERS_LIMIT), category: categorySlug });
    try {
      return await getJson(`${WORKERS_API_PATH}?${params}`);
    } catch (error) {
      return rejectWithValue(error.response?.data);
    }
  },
  {
    condition: (categorySlug, { getState }) => {
      const { slug, status } = getState().workers.byCategory;
      return !(slug === categorySlug && status === "loading");
    },
  },
);

const workerSlice = createSlice({
  name: "workers",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchWorkers.pending, (state, action) => {
        state.list.status = "loading";
        state.list.requestId = action.meta.requestId;
      })
      // Only the latest request wins, so a slow earlier search can't
      // overwrite the results of a newer one.
      .addCase(fetchWorkers.fulfilled, (state, action) => {
        if (state.list.requestId !== action.meta.requestId) return;
        state.list.status = "succeeded";
        state.list.items = (action.payload.data ?? []).map(toWorker);
        state.list.meta = action.payload.meta ?? initialState.list.meta;
      })
      .addCase(fetchWorkers.rejected, (state, action) => {
        if (state.list.requestId !== action.meta.requestId) return;
        state.list.status = "failed";
        state.list.items = [];
      })

      .addCase(fetchWorkerDetails.pending, (state, action) => {
        state.details = { id: action.meta.arg, data: null, status: "loading" };
      })
      .addCase(fetchWorkerDetails.fulfilled, (state, action) => {
        if (state.details.id !== action.meta.arg) return;
        state.details.status = "succeeded";
        state.details.data = toWorker(action.payload.data);
      })
      .addCase(fetchWorkerDetails.rejected, (state, action) => {
        if (state.details.id !== action.meta.arg) return;
        state.details.status = "failed";
      })

      .addCase(fetchCategoryWorkers.pending, (state, action) => {
        // Keep the list when re-checking the same category.
        if (state.byCategory.slug !== action.meta.arg) state.byCategory.items = [];
        state.byCategory.slug = action.meta.arg;
        state.byCategory.status = "loading";
      })
      .addCase(fetchCategoryWorkers.fulfilled, (state, action) => {
        if (state.byCategory.slug !== action.meta.arg) return;
        state.byCategory.status = "succeeded";
        state.byCategory.items = (action.payload.data ?? []).map(toWorker);
      })
      .addCase(fetchCategoryWorkers.rejected, (state, action) => {
        if (state.byCategory.slug !== action.meta.arg) return;
        state.byCategory.status = "failed";
      });
  },
});

export default workerSlice.reducer;
