// Feature-owned Redux state for the public FAQs. Every FAQ API call goes
// through a createAsyncThunk here — no component calls httpClient directly.
// Errors are already toasted globally by httpClient.
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { getJson } from "@/lib/httpClient.js";
import { FAQ_API_PATH, HOME_FAQ_CATEGORY, HOME_FAQ_LIMIT, toFaq } from "../definitions/faqs.js";

const initialState = {
  // The Home page's FAQ section.
  home: { items: [], status: "idle" }, // 'idle' | 'loading' | 'succeeded' | 'failed'
};

// backend faq.controller.js's getActiveFaqs. Active "General" FAQs, sorted
// by the admin-set `order`.
export const fetchHomeFaqs = createAsyncThunk("faq/fetchHomeFaqs", async (_, { rejectWithValue }) => {
  const params = new URLSearchParams({
    category: HOME_FAQ_CATEGORY,
    sort: "order_asc",
    per_page: String(HOME_FAQ_LIMIT),
  });
  try {
    return await getJson(`${FAQ_API_PATH}?${params}`);
  } catch (error) {
    return rejectWithValue(error.response?.data);
  }
});

const faqSlice = createSlice({
  name: "faq",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchHomeFaqs.pending, (state) => {
        state.home.status = "loading";
      })
      .addCase(fetchHomeFaqs.fulfilled, (state, action) => {
        state.home.status = "succeeded";
        state.home.items = (action.payload.data ?? []).map(toFaq);
      })
      .addCase(fetchHomeFaqs.rejected, (state) => {
        state.home.status = "failed";
        state.home.items = [];
      });
  },
});

export default faqSlice.reducer;
