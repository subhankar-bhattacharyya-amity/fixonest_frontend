// Public API of the theme feature. Import from "@/features/theme/index.js",
// never reach into components/, hooks/, or store/ from outside this folder.
export { default as ThemeBootstrap } from "./components/ThemeBootstrap.jsx";
export { useTheme } from "./hooks/useTheme.js";
export { default as themeReducer, toggleTheme, setTheme } from "./store/themeSlice.js";
