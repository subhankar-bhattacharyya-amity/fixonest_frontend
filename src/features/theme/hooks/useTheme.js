import { useSelector } from "react-redux";

// Read-only view of the theme slice ("light" | "dark"). Dispatch
// toggleTheme/setTheme directly via react-redux's useDispatch() — see
// features/theme/store/themeSlice.js.
export function useTheme() {
  return useSelector((state) => state.theme.value);
}
