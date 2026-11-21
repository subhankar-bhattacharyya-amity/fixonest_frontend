// Feature-owned Redux state for the public services. Every service API call
// goes through a createAsyncThunk here — no component calls httpClient
// directly. Errors are already toasted globally by httpClient.
//
// Each list keeps the requestId of its latest request and ignores answers to
// older ones, so fast typing or filter clicks can never show stale results.
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { getJson } from "@/lib/httpClient.js";
import {
  SERVICES_API_PATH,
  SERVICES_PAGE_SIZE,
  FEATURED_SERVICES_LIMIT,
  getServiceApiPath,
  getRelatedServicesApiPath,
  getServiceReviewsApiPath,
  SERVICE_REVIEWS_PAGE_SIZE,
  toServiceReview,
  toServiceCard,
  toServiceDetails,
} from "../definitions/services.js";

const initialState = {
  // Home's "Featured services".
  featured: { items: [], status: "idle" }, // 'idle' | 'loading' | 'succeeded' | 'failed'
  // The Services page catalogue (one page of it).
  catalog: {
    items: [],
    meta: { page: 1, perPage: SERVICES_PAGE_SIZE, total: 0, totalPages: 0 },
    status: "idle",
    requestId: null,
    currentQueryKey: null,
  },
  // The Service Details page, and its "Most Related Services".
  details: { slug: null, data: null, status: "idle" },
  related: { slug: null, items: [], status: "idle" },
  // The details page's "Customer Reviews": the rating summary of the
  // service's visible ratings, and its written reviews loaded page by page.
  reviews: {
    slug: null,
    summary: null, // { average, count, distribution: { 5, 4, 3, 2, 1 } }
    items: [],
    meta: null,
    status: "idle",
  },
};

// Serializes the catalogue filters so duplicate calls with the exact same
// parameters can be skipped while one is already in flight (e.g. during React
// StrictMode's double-mount in development).
const toCatalogQueryKey = (arg = {}) => {
  const safe = arg || {};
  return JSON.stringify({
    page: safe.page ?? 1,
    search: safe.search?.trim() || "",
    categorySlugs: Array.isArray(safe.categorySlugs) ? [...safe.categorySlugs].sort() : [],
    minPrice: safe.minPrice ?? "",
    maxPrice: safe.maxPrice ?? "",
    minRating: safe.minRating ?? 0,
  });
};

// backend service.controller.js getActiveServices with ?isFeatured=true.
export const fetchFeaturedServices = createAsyncThunk(
  "services/fetchFeaturedServices",
  async (_, { rejectWithValue }) => {
    try {
      return await getJson(`${SERVICES_API_PATH}?isFeatured=true&limit=${FEATURED_SERVICES_LIMIT}`);
    } catch (error) {
      return rejectWithValue(error.response?.data);
    }
  },
  {
    condition: (_, { getState }) => getState().services.featured.status !== "loading",
  },
);

// getActiveServices, one page. filters: { page, search, categorySlugs[],
// minPrice, maxPrice, minRating } - every filter is applied by the server.
export const fetchServiceCatalog = createAsyncThunk(
  "services/fetchServiceCatalog",
  async ({ page = 1, search, categorySlugs = [], minPrice, maxPrice, minRating } = {}, { rejectWithValue }) => {
    // Default order (newest first) - the order the admin added them in reverse.
    const params = new URLSearchParams({ page: String(page), per_page: String(SERVICES_PAGE_SIZE) });
    if (search?.trim()) params.set("search", search.trim());
    if (categorySlugs.length) params.set("categoryIds", categorySlugs.join(","));
    if (minPrice !== undefined) params.set("minPrice", String(minPrice));
    if (maxPrice !== undefined) params.set("maxPrice", String(maxPrice));
    if (minRating) params.set("minRating", String(minRating));
    try {
      return await getJson(`${SERVICES_API_PATH}?${params}`);
    } catch (error) {
      return rejectWithValue(error.response?.data);
    }
  },
  {
    condition: (arg, { getState }) => {
      const { status, currentQueryKey } = getState().services.catalog;
      return !(status === "loading" && currentQueryKey === toCatalogQueryKey(arg));
    },
  },
);

// Skips a request when the same slug is already loading - React StrictMode
// runs the page's effects twice in development, which would otherwise call
// each endpoint twice.
const isAlreadyLoading = (entry, slug) => entry.slug === slug && entry.status === "loading";

// getActiveServiceBySlug - one service with its details, gallery and the
// providers who offer it (assignedProviders).
export const fetchServiceDetails = createAsyncThunk(
  "services/fetchServiceDetails",
  async (slug, { rejectWithValue }) => {
    try {
      return await getJson(getServiceApiPath(slug));
    } catch (error) {
      return rejectWithValue({ status: error.response?.status, ...error.response?.data });
    }
  },
  { condition: (slug, { getState }) => !isAlreadyLoading(getState().services.details, slug) },
);

// getRelatedServices - up to 3 others from the same category, best rated first.
export const fetchRelatedServices = createAsyncThunk(
  "services/fetchRelatedServices",
  async (slug, { rejectWithValue }) => {
    try {
      return await getJson(getRelatedServicesApiPath(slug));
    } catch (error) {
      return rejectWithValue(error.response?.data);
    }
  },
  { condition: (slug, { getState }) => !isAlreadyLoading(getState().services.related, slug) },
);

// service_reviews_ratings.controller.js getPublicServiceReviews. page 1
// replaces the list; later pages ("Show more reviews") are appended.
export const fetchServiceReviews = createAsyncThunk(
  "services/fetchServiceReviews",
  async ({ slug, page = 1 }, { rejectWithValue }) => {
    try {
      return await getJson(`${getServiceReviewsApiPath(slug)}?page=${page}&per_page=${SERVICE_REVIEWS_PAGE_SIZE}`);
    } catch (error) {
      return rejectWithValue(error.response?.data);
    }
  },
  { condition: ({ slug, page = 1 }, { getState }) => page !== 1 || !isAlreadyLoading(getState().services.reviews, slug) },
);

const serviceSlice = createSlice({
  name: "services",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchFeaturedServices.pending, (state) => {
        state.featured.status = "loading";
      })
      .addCase(fetchFeaturedServices.fulfilled, (state, action) => {
        state.featured.status = "succeeded";
        state.featured.items = (action.payload.data ?? []).map(toServiceCard);
      })
      .addCase(fetchFeaturedServices.rejected, (state) => {
        state.featured.status = "failed";
        state.featured.items = [];
      })

      .addCase(fetchServiceCatalog.pending, (state, action) => {
        state.catalog.status = "loading";
        state.catalog.requestId = action.meta.requestId;
        state.catalog.currentQueryKey = toCatalogQueryKey(action.meta.arg);
      })
      .addCase(fetchServiceCatalog.fulfilled, (state, action) => {
        if (state.catalog.requestId !== action.meta.requestId) return;
        state.catalog.status = "succeeded";
        state.catalog.items = (action.payload.data ?? []).map(toServiceCard);
        state.catalog.meta = action.payload.meta ?? initialState.catalog.meta;
      })
      .addCase(fetchServiceCatalog.rejected, (state, action) => {
        if (state.catalog.requestId !== action.meta.requestId) return;
        state.catalog.status = "failed";
        state.catalog.items = [];
      })

      .addCase(fetchServiceDetails.pending, (state, action) => {
        state.details = { slug: action.meta.arg, data: null, status: "loading" };
      })
      .addCase(fetchServiceDetails.fulfilled, (state, action) => {
        if (state.details.slug !== action.meta.arg) return;
        state.details.status = "succeeded";
        state.details.data = toServiceDetails(action.payload.data);
      })
      .addCase(fetchServiceDetails.rejected, (state, action) => {
        if (state.details.slug !== action.meta.arg) return;
        state.details.status = "failed";
      })

      .addCase(fetchRelatedServices.pending, (state, action) => {
        state.related = { slug: action.meta.arg, items: [], status: "loading" };
      })
      .addCase(fetchRelatedServices.fulfilled, (state, action) => {
        if (state.related.slug !== action.meta.arg) return;
        state.related.status = "succeeded";
        state.related.items = (action.payload.data ?? []).map(toServiceCard);
      })
      .addCase(fetchRelatedServices.rejected, (state, action) => {
        if (state.related.slug !== action.meta.arg) return;
        state.related.status = "failed";
      })

      .addCase(fetchServiceReviews.pending, (state, action) => {
        const { slug, page = 1 } = action.meta.arg;
        if (page === 1 || state.reviews.slug !== slug) {
          state.reviews = { slug, summary: null, items: [], meta: null, status: "loading" };
        } else {
          state.reviews.status = "loading-more";
        }
      })
      .addCase(fetchServiceReviews.fulfilled, (state, action) => {
        const { slug, page = 1 } = action.meta.arg;
        if (state.reviews.slug !== slug) return;
        const items = (action.payload.data?.items ?? []).map(toServiceReview);
        state.reviews.status = "succeeded";
        state.reviews.summary = action.payload.data?.summary ?? null;
        state.reviews.items = page === 1 ? items : [...state.reviews.items, ...items];
        state.reviews.meta = action.payload.meta ?? null;
      })
      .addCase(fetchServiceReviews.rejected, (state, action) => {
        if (state.reviews.slug !== action.meta.arg.slug) return;
        state.reviews.status = "failed";
      });
  },
});

export default serviceSlice.reducer;
