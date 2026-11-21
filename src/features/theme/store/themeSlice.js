// Feature-owned Redux state, colocated with the theme feature per this
// structure's convention (see README.md "Using Redux"). Pure UI preference,
// no API call involved, so a plain reducer is enough — no createAsyncThunk.
import { createSlice } from "@reduxjs/toolkit";
import { appConfig } from "@/lib/config.js";

function readInitialTheme() {
  try {
    const stored = localStorage.getItem(appConfig.themeKey);
    if (stored === "dark" || stored === "light") return stored;
  } catch {
    // localStorage can throw in private-browsing/blocked-storage contexts.
  }
  const prefersDark = window.matchMedia?.("(prefers-color-scheme: dark)").matches;
  return prefersDark ? "dark" : "light";
}

const themeSlice = createSlice({
  name: "theme",
  initialState: { value: readInitialTheme() },
  reducers: {
    toggleTheme(state) {
      state.value = state.value === "dark" ? "light" : "dark";
    },
    setTheme(state, action) {
      state.value = action.payload;
    },
  },
});

export const { toggleTheme, setTheme } = themeSlice.actions;
export default themeSlice.reducer;
