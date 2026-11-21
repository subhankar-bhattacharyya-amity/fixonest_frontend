// Feature-owned Redux state for the public testimonials. Every testimonials
// API call goes through a createAsyncThunk here — no component calls
// httpClient directly. Errors are already toasted globally by httpClient.
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { getJson } from "@/lib/httpClient.js";
import {
  TESTIMONIALS_API_PATH,
  HOME_TESTIMONIALS_LIMIT,
  toTestimonial,
} from "../definitions/testimonials.js";

const initialState = {
  // The Home page's Testimonials section.
  home: { items: [], status: "idle" }, // 'idle' | 'loading' | 'succeeded' | 'failed'
};

// backend testimonials.controller.js's getActiveTestimonials. Active
// testimonials, sorted by the Super Admin-set `order`.
export const fetchHomeTestimonials = createAsyncThunk(
  "testimonials/fetchHomeTestimonials",
  async (_, { rejectWithValue }) => {
    const params = new URLSearchParams({
      sort: "order_asc",
      per_page: String(HOME_TESTIMONIALS_LIMIT),
    });
    try {
      return await getJson(`${TESTIMONIALS_API_PATH}?${params}`);
    } catch (error) {
      return rejectWithValue(error.response?.data);
    }
  },
);

const testimonialsSlice = createSlice({
  name: "testimonials",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchHomeTestimonials.pending, (state) => {
        state.home.status = "loading";
      })
      .addCase(fetchHomeTestimonials.fulfilled, (state, action) => {
        state.home.status = "succeeded";
        state.home.items = (action.payload.data ?? []).map(toTestimonial);
      })
      .addCase(fetchHomeTestimonials.rejected, (state) => {
        state.home.status = "failed";
        state.home.items = [];
      });
  },
});

export default testimonialsSlice.reducer;
