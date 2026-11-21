// Feature-owned Redux state for the public service categories. Every service
// category API call goes through a createAsyncThunk here — no component calls
// httpClient directly. Errors are already toasted globally by httpClient.
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { getJson } from "@/lib/httpClient.js";
import {
  POPULAR_SERVICE_CATEGORIES_API_PATH,
  SERVICE_CATEGORIES_API_PATH,
  SERVICE_CATEGORIES_FETCH_SIZE,
  toPopularCategory,
  toCategoryOption,
} from "../definitions/serviceCategories.js";

const initialState = {
  // The Home page's "Popular categories" grid.
  popular: { items: [], status: "idle" }, // 'idle' | 'loading' | 'succeeded' | 'failed'
  // Every active category - the Services page's category filter.
  all: { items: [], status: "idle" },
};

// backend service_category.controller.js's getPopularServiceCategories.
export const fetchPopularServiceCategories = createAsyncThunk(
  "serviceCategories/fetchPopularServiceCategories",
  async (_, { rejectWithValue }) => {
    try {
      return await getJson(POPULAR_SERVICE_CATEGORIES_API_PATH);
    } catch (error) {
      return rejectWithValue(error.response?.data);
    }
  },
);

// backend getActiveServiceCategories, every page of it (the list is small).
// Skipped when already loaded.
export const fetchServiceCategories = createAsyncThunk(
  "serviceCategories/fetchServiceCategories",
  async (_, { rejectWithValue }) => {
    try {
      const items = [];
      let page = 1;
      let totalPages = 1;
      do {
        const response = await getJson(`${SERVICE_CATEGORIES_API_PATH}?page=${page}&per_page=${SERVICE_CATEGORIES_FETCH_SIZE}`);
        items.push(...(response.data ?? []));
        totalPages = response.meta?.totalPages ?? 1;
        page += 1;
      } while (page <= totalPages);
      return items;
    } catch (error) {
      return rejectWithValue(error.response?.data);
    }
  },
  {
    condition: (_, { getState }) => {
      const { status } = getState().serviceCategories.all;
      return status !== "loading" && status !== "succeeded";
    },
  },
);

const serviceCategorySlice = createSlice({
  name: "serviceCategories",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchPopularServiceCategories.pending, (state) => {
        state.popular.status = "loading";
      })
      .addCase(fetchPopularServiceCategories.fulfilled, (state, action) => {
        state.popular.status = "succeeded";
        state.popular.items = (action.payload.data ?? []).map(toPopularCategory);
      })
      .addCase(fetchPopularServiceCategories.rejected, (state) => {
        state.popular.status = "failed";
        state.popular.items = [];
      })

      .addCase(fetchServiceCategories.pending, (state) => {
        state.all.status = "loading";
      })
      .addCase(fetchServiceCategories.fulfilled, (state, action) => {
        state.all.status = "succeeded";
        state.all.items = action.payload.map(toCategoryOption);
      })
      .addCase(fetchServiceCategories.rejected, (state) => {
        state.all.status = "failed";
        state.all.items = [];
      });
  },
});

export default serviceCategorySlice.reducer;
