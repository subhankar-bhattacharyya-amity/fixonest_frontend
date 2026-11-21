// Feature-owned Redux state for the public team list. Every team API call
// goes through a createAsyncThunk here — no component calls httpClient
// directly. Errors are already toasted globally by httpClient.
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { getJson } from "@/lib/httpClient.js";
import { TEAM_API_PATH, ABOUT_TEAM_LIMIT, toTeamMember } from "../definitions/team.js";

const initialState = {
  // The About page's "Meet the team" section.
  about: { items: [], status: "idle" }, // 'idle' | 'loading' | 'succeeded' | 'failed'
};

// backend team_management.controller.js's getActiveTeamMembers. Active
// team members, sorted by the Super Admin-set `order`.
export const fetchAboutTeam = createAsyncThunk("team/fetchAboutTeam", async (_, { rejectWithValue }) => {
  const params = new URLSearchParams({
    sort: "order_asc",
    per_page: String(ABOUT_TEAM_LIMIT),
  });
  try {
    return await getJson(`${TEAM_API_PATH}?${params}`);
  } catch (error) {
    return rejectWithValue(error.response?.data);
  }
});

const teamSlice = createSlice({
  name: "team",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAboutTeam.pending, (state) => {
        state.about.status = "loading";
      })
      .addCase(fetchAboutTeam.fulfilled, (state, action) => {
        state.about.status = "succeeded";
        state.about.items = (action.payload.data ?? []).map(toTeamMember);
      })
      .addCase(fetchAboutTeam.rejected, (state) => {
        state.about.status = "failed";
        state.about.items = [];
      });
  },
});

export default teamSlice.reducer;
