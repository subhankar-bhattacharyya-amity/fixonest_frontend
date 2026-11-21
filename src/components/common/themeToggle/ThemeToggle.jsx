import { useDispatch } from "react-redux";
import { AnimatePresence, motion } from "framer-motion";
import { Moon, Sun } from "lucide-react";
import { useTheme, toggleTheme } from "@/features/theme/index.js";

// Promoted from layouts/header/components once the auth pages (AuthLayout)
// needed the same light/dark switch outside the main Header.
export default function ThemeToggle({ className = "" }) {
  const theme = useTheme();
  const dispatch = useDispatch();
  const isDark = theme === "dark";

  return (
    <button
      type="button"
      onClick={() => dispatch(toggleTheme())}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      className={`inline-flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-slate-200 text-slate-600 transition hover:border-slate-300 hover:text-slate-900 dark:border-(--border-subtle) dark:text-(--text-muted) dark:hover:border-(--surface-2) dark:hover:text-(--text-primary) lg:h-10 lg:w-10 ${className}`}
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={isDark ? "sun" : "moon"}
          initial={{ opacity: 0, rotate: -90, scale: 0.6 }}
          animate={{ opacity: 1, rotate: 0, scale: 1 }}
          exit={{ opacity: 0, rotate: 90, scale: 0.6 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="flex"
        >
          {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </motion.span>
      </AnimatePresence>
    </button>
  );
}
