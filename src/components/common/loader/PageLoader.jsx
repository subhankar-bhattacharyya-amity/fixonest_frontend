import { motion } from "framer-motion";

// Shown by app/App.jsx's single Suspense boundary while a lazy-loaded page
// chunk is fetched, so it covers every route the same way — a spinning
// indigo/fuchsia ring around the static Fixonest mark.
export default function PageLoader() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white dark:bg-(--surface-0)">
      <div className="relative flex h-16 w-16 items-center justify-center">
        <span className="absolute inset-0 rounded-full border-4 border-slate-100 dark:border-(--border-subtle)" />
        <motion.span
          className="absolute inset-0 rounded-full border-4 border-transparent border-t-indigo-600 border-r-fuchsia-600"
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 0.9, ease: "linear" }}
        />
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-linear-to-br from-indigo-600 to-fuchsia-600 text-base font-bold text-white shadow-md shadow-indigo-600/20">
          F
        </span>
      </div>
    </div>
  );
}
