import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown } from "lucide-react";

// One collapsible section of a filter sidebar (Services, Workers, ...) —
// each section opens and closes independently (its own local `isOpen`
// state), not as an accordion-group-exclusive widget. Promoted here once a
// second page needed the same filter-sidebar pattern.
export default function FilterAccordionItem({ title, badge, defaultOpen = true, children }) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="border-b border-slate-100 py-4 last:border-b-0 dark:border-(--border-subtle)">
      <button
        type="button"
        onClick={() => setIsOpen((current) => !current)}
        aria-expanded={isOpen}
        className="flex w-full items-center justify-between gap-2 text-left"
      >
        <span className="inline-flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-(--text-primary)">
          {title}
          {badge ? (
            <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-indigo-50 px-1.5 text-xs font-semibold text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400">
              {badge}
            </span>
          ) : null}
        </span>
        <ChevronDown
          className={`h-4 w-4 shrink-0 text-slate-400 transition-transform duration-300 dark:text-(--text-muted) ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      <AnimatePresence initial={false}>
        {isOpen ? (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="pt-4">{children}</div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
