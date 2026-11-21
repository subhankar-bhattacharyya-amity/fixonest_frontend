import { useEffect } from "react";
import { appConfig } from "@/lib/config.js";
import { useTheme } from "../hooks/useTheme.js";

// Mounted once in app/AppProviders.jsx. index.html's inline script already
// set the initial class before React mounted (avoiding a flash of the wrong
// theme) — this keeps <html>.dark and localStorage in sync with the Redux
// slice on every change after that.
export default function ThemeBootstrap() {
  const theme = useTheme();

  useEffect(() => {
    const isDark = theme === "dark";
    document.documentElement.classList.toggle("dark", isDark);
    try {
      localStorage.setItem(appConfig.themeKey, theme);
    } catch {
      // localStorage can throw in private-browsing/blocked-storage contexts.
    }

    // Keeps the mobile browser chrome (address bar / status bar) in sync
    // with the in-app theme, not just the OS's prefers-color-scheme — the
    // toggle can override the OS setting, so this has to be set in JS
    // rather than a static <meta name="theme-color"> media query.
    const themeColorMeta = document.querySelector('meta[name="theme-color"]');
    if (themeColorMeta) themeColorMeta.setAttribute("content", isDark ? "#0a0a13" : "#4f46e5");
  }, [theme]);

  return null;
}
