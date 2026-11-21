// Feature-owned Redux state for the customer's saved addresses (one Home,
// any number of Work / Other). The list is loaded from the logged-in user's
// profile (GET /api/v1/auth/me's `user_details`) - every auth call that
// returns the profile refreshes it. Adding, editing, removing and choosing
// the default go through the /api/v1/user/addresses thunks below; no
// component calls httpClient directly. Errors are toasted by httpClient.
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { deleteJson, patchJson, postJson } from "@/lib/httpClient.js";
import {
  fetchProfile,
  loginCustomer,
  logoutCustomer,
  updateProfile,
  updateProfilePhoto,
} from "@/features/auth/index.js";
import { appConfig } from "@/lib/config.js";
import { ADDRESSES_API_PATH, toAddress, toAddresses } from "../definitions/addresses.js";

const readStoredAddresses = () => {
  try {
    return toAddresses(JSON.parse(localStorage.getItem(appConfig.authUserKey)));
  } catch {
    return [];
  }
};

const initialState = {
  items: readStoredAddresses(),
};

// POST /user/addresses (no id) or PATCH /user/addresses/:id - `payload` is
// definitions/addresses.js's toAddressPayload shape. Resolves with the saved
// address as the backend returns it.
export const saveAddress = createAsyncThunk(
  "addresses/saveAddress",
  async ({ id, payload }, { rejectWithValue }) => {
    try {
      return id
        ? await patchJson(`${ADDRESSES_API_PATH}/${id}`, payload)
        : await postJson(ADDRESSES_API_PATH, payload);
    } catch (error) {
      return rejectWithValue(error.response?.data);
    }
  },
);

// PATCH /user/addresses/:id/default - the backend clears every other default.
export const setDefaultAddress = createAsyncThunk(
  "addresses/setDefaultAddress",
  async (id, { rejectWithValue }) => {
    try {
      return await patchJson(`${ADDRESSES_API_PATH}/${id}/default`);
    } catch (error) {
      return rejectWithValue(error.response?.data);
    }
  },
);

// DELETE /user/addresses/:id - if it was the default, the backend makes the
// newest remaining address the default (mirrored in the reducer).
export const deleteAddress = createAsyncThunk(
  "addresses/deleteAddress",
  async (id, { rejectWithValue }) => {
    try {
      return await deleteJson(`${ADDRESSES_API_PATH}/${id}`);
    } catch (error) {
      return rejectWithValue(error.response?.data);
    }
  },
);

const setFromProfile = (state, user) => {
  state.items = toAddresses(user);
};

// Puts a saved address into the list; a new default clears the others.
const upsert = (state, address) => {
  if (address.isDefault) state.items.forEach((item) => (item.isDefault = false));
  const index = state.items.findIndex((item) => item.id === address.id);
  if (index === -1) state.items.push(address);
  else state.items[index] = address;
};

const newestFirst = (a, b) => new Date(b.createdAt ?? 0) - new Date(a.createdAt ?? 0);

const addressSlice = createSlice({
  name: "addresses",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchProfile.fulfilled, (state, action) => setFromProfile(state, action.payload.data))
      .addCase(updateProfile.fulfilled, (state, action) => setFromProfile(state, action.payload.data))
      .addCase(updateProfilePhoto.fulfilled, (state, action) => setFromProfile(state, action.payload.data))
      // The login response may not carry the addresses; the /me call that
      // follows fills them in.
      .addCase(loginCustomer.fulfilled, (state, action) => setFromProfile(state, action.payload.data.user))
      .addCase(logoutCustomer.fulfilled, (state) => {
        state.items = [];
      })
      .addCase(logoutCustomer.rejected, (state) => {
        state.items = [];
      })

      .addCase(saveAddress.fulfilled, (state, action) => upsert(state, toAddress(action.payload.data)))
      .addCase(setDefaultAddress.fulfilled, (state, action) => {
        const id = action.payload.data?._id ?? action.meta.arg;
        state.items.forEach((item) => (item.isDefault = item.id === id));
      })
      .addCase(deleteAddress.fulfilled, (state, action) => {
        const removed = state.items.find((item) => item.id === action.meta.arg);
        state.items = state.items.filter((item) => item.id !== action.meta.arg);
        if (removed?.isDefault && state.items.length) {
          [...state.items].sort(newestFirst)[0].isDefault = true;
        }
      });
  },
});

export default addressSlice.reducer;
