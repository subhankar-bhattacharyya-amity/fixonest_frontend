// Feature-owned Redux state, colocated with the auth feature per this
// structure's convention (see README.md "Using Redux"). Every auth API call
// goes through a createAsyncThunk here — no component calls httpClient directly.
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { getJson, postJson, patchJson } from "@/lib/httpClient.js";
import { appConfig } from "@/lib/config.js";

function readStoredUser() {
  try {
    const raw = localStorage.getItem(appConfig.authUserKey);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function persistSession(user, token) {
  localStorage.setItem(appConfig.authUserKey, JSON.stringify(user));
  localStorage.setItem(appConfig.authTokenKey, token);
}

function clearSession() {
  localStorage.removeItem(appConfig.authUserKey);
  localStorage.removeItem(appConfig.authTokenKey);
}

const initialState = {
  user: readStoredUser(),
  token: localStorage.getItem(appConfig.authTokenKey) || null,
  status: "idle", // 'idle' | 'loading' | 'succeeded' | 'failed' — the most recent thunk's status
  error: null,
  // The GET /me call on its own, so a second request can be skipped while
  // one is already loading.
  profileStatus: "idle",
};

// backend/app/router/customer/auth.routes.js -> backend/app/modules/auth/controller/auth.controller.js's register.
// Only creates the account — the backend does not auto-login on registration
// (no token in the response), so the caller must send the user to /login next.
export const registerCustomer = createAsyncThunk(
  "auth/registerCustomer",
  async (payload, { rejectWithValue }) => {
    try {
      return await postJson("/api/v1/auth/register", payload);
    } catch (error) {
      return rejectWithValue(error.response?.data);
    }
  },
);

// -> auth.controller.js's login. panel is stamped here, not collected from
// the form, so every login attempt is unambiguously declared as coming from
// the customer frontend (see backend/app/config/index.js's panels map).
export const loginCustomer = createAsyncThunk(
  "auth/loginCustomer",
  async (payload, { rejectWithValue }) => {
    try {
      return await postJson("/api/v1/auth/login", { ...payload, panel: appConfig.panel });
    } catch (error) {
      return rejectWithValue(error.response?.data);
    }
  },
);

// -> auth.controller.js's verifyOtp. Activates a freshly registered account.
// No token comes back — the customer logs in afterwards as usual.
export const verifyEmailOtp = createAsyncThunk(
  "auth/verifyEmailOtp",
  async (payload, { rejectWithValue }) => {
    try {
      return await postJson("/api/v1/auth/verify-otp", payload);
    } catch (error) {
      return rejectWithValue(error.response?.data);
    }
  },
);

// -> auth.controller.js's resendOtp. Response data carries expiresAt and
// resendAvailableAt, which drive the OTP page's countdowns.
export const resendEmailOtp = createAsyncThunk(
  "auth/resendEmailOtp",
  async (payload, { rejectWithValue }) => {
    try {
      return await postJson("/api/v1/auth/resend-otp", payload);
    } catch (error) {
      return rejectWithValue(error.response?.data);
    }
  },
);

// -> auth.controller.js's forgotPassword. Emails a 4-digit reset code;
// response data carries expiresAt and resendAvailableAt, same as resend-otp.
export const requestPasswordReset = createAsyncThunk(
  "auth/requestPasswordReset",
  async (payload, { rejectWithValue }) => {
    try {
      return await postJson("/api/v1/auth/forgot-password", payload);
    } catch (error) {
      return rejectWithValue(error.response?.data);
    }
  },
);

// -> auth.controller.js's verifyForgotPasswordOtp. Response data carries a
// one-time resetToken (and its expiresAt) for the final step. Kept in the
// page's component state only, never in Redux or storage.
export const verifyPasswordResetOtp = createAsyncThunk(
  "auth/verifyPasswordResetOtp",
  async (payload, { rejectWithValue }) => {
    try {
      return await postJson("/api/v1/auth/forgot-password/verify-otp", payload);
    } catch (error) {
      return rejectWithValue(error.response?.data);
    }
  },
);

// -> auth.controller.js's resetPassword. payload is { email, resetToken,
// newPassword }. No token comes back — the customer logs in afterwards.
export const resetCustomerPassword = createAsyncThunk(
  "auth/resetCustomerPassword",
  async (payload, { rejectWithValue }) => {
    try {
      return await postJson("/api/v1/auth/reset-password", payload);
    } catch (error) {
      return rejectWithValue(error.response?.data);
    }
  },
);

// -> auth.controller.js's getProfile ("/me"). Used both for session
// restoration on reload (see features/auth/components/AuthBootstrap.jsx) and
// to refresh the richer, role/vertical-populated profile after login.
// Skipped while a /me request is already loading: on a fresh load of the
// profile page both AuthBootstrap and the page ask for it, and React
// StrictMode runs effects twice in development.
export const fetchProfile = createAsyncThunk(
  "auth/fetchProfile",
  async (_, { rejectWithValue }) => {
    try {
      return await getJson("/api/v1/auth/me");
    } catch (error) {
      return rejectWithValue(error.response?.data);
    }
  },
  {
    condition: (_, { getState }) => getState().auth.profileStatus !== "loading",
  },
);

// -> auth.controller.js's updateProfile. Backend accepts a partial body (at
// least one of fullName/phone) but the profile page's form always sends
// both, since it's an edit form with both fields already populated.
export const updateProfile = createAsyncThunk(
  "auth/updateProfile",
  async (payload, { rejectWithValue }) => {
    try {
      return await patchJson("/api/v1/auth/profile", payload);
    } catch (error) {
      return rejectWithValue(error.response?.data);
    }
  },
);

// -> auth.controller.js's updateProfilePhoto. payload is a FormData with a
// single "profileImage" file field — postJson (lib/httpClient.js) detects
// the FormData body and clears the instance's default "application/json"
// header for this request so axios/the browser set the correct multipart
// boundary header instead.
export const updateProfilePhoto = createAsyncThunk(
  "auth/updateProfilePhoto",
  async (formData, { rejectWithValue }) => {
    try {
      return await postJson("/api/v1/auth/profile/photo", formData);
    } catch (error) {
      return rejectWithValue(error.response?.data);
    }
  },
);

// -> auth.controller.js's changePassword. Response carries no user data
// (only a success message) since nothing about the profile itself changed.
export const changePassword = createAsyncThunk(
  "auth/changePassword",
  async (payload, { rejectWithValue }) => {
    try {
      return await patchJson("/api/v1/auth/change-password", payload);
    } catch (error) {
      return rejectWithValue(error.response?.data);
    }
  },
);

// -> auth.controller.js's logout. Revokes the token server-side; the
// reducer below clears the local session on both fulfilled AND rejected, so
// the user is never stuck "logged in" locally just because the revoke call
// itself failed (e.g. the token had already expired).
export const logoutCustomer = createAsyncThunk(
  "auth/logoutCustomer",
  async (_, { rejectWithValue }) => {
    try {
      return await postJson("/api/v1/auth/logout");
    } catch (error) {
      return rejectWithValue(error.response?.data);
    }
  },
);

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(registerCustomer.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(registerCustomer.fulfilled, (state) => {
        state.status = "succeeded";
      })
      .addCase(registerCustomer.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload?.message || action.error.message;
      })

      .addCase(loginCustomer.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(loginCustomer.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.user = action.payload.data.user;
        state.token = action.payload.data.token;
        persistSession(state.user, state.token);
      })
      .addCase(loginCustomer.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload?.message || action.error.message;
      })

      .addCase(fetchProfile.pending, (state) => {
        state.profileStatus = "loading";
      })
      .addCase(fetchProfile.fulfilled, (state, action) => {
        state.profileStatus = "succeeded";
        state.user = action.payload.data;
        localStorage.setItem(appConfig.authUserKey, JSON.stringify(state.user));
      })
      .addCase(fetchProfile.rejected, (state) => {
        state.profileStatus = "failed";
      })

      .addCase(updateProfile.fulfilled, (state, action) => {
        state.user = action.payload.data;
        localStorage.setItem(appConfig.authUserKey, JSON.stringify(state.user));
      })

      .addCase(updateProfilePhoto.fulfilled, (state, action) => {
        state.user = action.payload.data;
        localStorage.setItem(appConfig.authUserKey, JSON.stringify(state.user));
      })

      .addCase(logoutCustomer.fulfilled, (state) => {
        state.user = null;
        state.token = null;
        state.status = "idle";
        clearSession();
      })
      .addCase(logoutCustomer.rejected, (state) => {
        state.user = null;
        state.token = null;
        state.status = "idle";
        clearSession();
      });
  },
});

export default authSlice.reducer;
