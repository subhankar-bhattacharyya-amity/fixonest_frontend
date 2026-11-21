import { useEffect } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { AlertTriangle } from "lucide-react";

// Generic yes/no confirmation modal (e.g. "Log out?" from
// layouts/header/components/UserMenu.jsx). Portaled to document.body so it
// always sits above the header/dropdown that triggered it, regardless of
// that trigger's own stacking context or overflow. `variant` only changes
// the icon badge/confirm button color - "danger" (red, e.g. logout/delete)
// vs "default" (brand indigo/fuchsia gradient, for non-destructive
// confirmations).
export default function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  onConfirm,
  onCancel,
  variant = "danger",
  loading = false,
}) {
  useEffect(() => {
    if (!open) return undefined;

    function handleKeyDown(event) {
      if (event.key === "Escape" && !loading) onCancel();
    }
    document.addEventListener("keydown", handleKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [open, loading, onCancel]);

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          role="presentation"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15, ease: "easeOut" }}
          className="fixed inset-0 z-60 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm"
          onClick={() => !loading && onCancel()}
        >
          <motion.div
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="confirm-dialog-title"
            aria-describedby="confirm-dialog-description"
            initial={{ opacity: 0, y: 12, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.96 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            onClick={(event) => event.stopPropagation()}
            className="w-full max-w-sm rounded-3xl border border-slate-100 bg-white p-6 text-center shadow-2xl shadow-slate-900/10 dark:border-(--border-subtle) dark:bg-(--surface-1) dark:shadow-black/40 sm:p-8"
          >
            <span
              className={`mx-auto flex h-12 w-12 items-center justify-center rounded-2xl ${
                variant === "danger"
                  ? "bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400"
                  : "bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400"
              }`}
            >
              <AlertTriangle className="h-6 w-6" />
            </span>

            <h2
              id="confirm-dialog-title"
              className="mt-4 text-lg font-bold text-slate-900 dark:text-(--text-primary)"
            >
              {title}
            </h2>
            {description && (
              <p
                id="confirm-dialog-description"
                className="mt-2 text-sm leading-relaxed text-slate-500 dark:text-(--text-muted)"
              >
                {description}
              </p>
            )}

            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row">
              <button
                type="button"
                onClick={onCancel}
                disabled={loading}
                className="inline-flex w-full items-center justify-center rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-60 dark:border-(--border-subtle) dark:text-(--text-primary) dark:hover:bg-(--surface-2) sm:w-auto sm:flex-1"
              >
                {cancelLabel}
              </button>
              <button
                type="button"
                onClick={onConfirm}
                disabled={loading}
                className={`inline-flex w-full items-center justify-center rounded-xl px-4 py-2.5 text-sm font-semibold text-white shadow-lg transition disabled:opacity-70 sm:w-auto sm:flex-1 ${
                  variant === "danger"
                    ? "bg-red-600 shadow-red-600/25 hover:bg-red-700"
                    : "bg-linear-to-r from-indigo-600 to-fuchsia-600 shadow-indigo-600/25 hover:brightness-110"
                }`}
              >
                {loading ? "Please wait…" : confirmLabel}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}
