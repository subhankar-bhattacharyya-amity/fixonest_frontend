// Feature-owned Redux state for the public contact form. Every contact API
// call goes through a createAsyncThunk here — no component calls httpClient
// directly. Errors are already toasted globally by httpClient.
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { postJson } from "@/lib/httpClient.js";

const initialState = {
  status: "idle", // 'idle' | 'loading' | 'succeeded' | 'failed' — the most recent submission's status
  error: null,
};

// backend/app/router/customer/contact.routes.js -> contact.controller.js's
// createContact. Public (no login needed). payload: { fullName, email,
// subject, message }. The backend rejects an exact repeat of a message the
// same email already sent. Nothing about the sender is sent here: the backend
// works out whether they are a logged-in customer or a guest from the login
// token httpClient already attaches, and records that on the message.
export const submitContact = createAsyncThunk(
  "contact/submitContact",
  async (payload, { rejectWithValue }) => {
    try {
      return await postJson("/api/v1/contact", payload);
    } catch (error) {
      return rejectWithValue(error.response?.data);
    }
  },
);

// backend/app/router/customer/contact.routes.js -> contact.controller.js's
// createProviderContact. Logged-in customers only (the Worker Details page
// sends a guest to /login before this runs). payload: { provider_id,
// fullName, email, phone, subject, message }. The provider sees it on their
// admin panel's Contact page; the Super Admin sees it too.
export const submitProviderContact = createAsyncThunk(
  "contact/submitProviderContact",
  async (payload, { rejectWithValue }) => {
    try {
      return await postJson("/api/v1/contact/provider", payload);
    } catch (error) {
      return rejectWithValue(error.response?.data);
    }
  },
);

const contactSlice = createSlice({
  name: "contact",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(submitContact.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(submitContact.fulfilled, (state) => {
        state.status = "succeeded";
      })
      .addCase(submitContact.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload?.message || action.error.message;
      });
  },
});

export default contactSlice.reducer;
