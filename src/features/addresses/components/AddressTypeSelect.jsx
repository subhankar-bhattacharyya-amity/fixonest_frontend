import { useEffect, useId, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, ChevronDown, Tags } from "lucide-react";
import { ADDRESS_TYPES, getAddressTypeMeta, isSingleAddressType } from "../definitions/addresses.js";

// Dropdown for the address type (Home / Work, from ADDRESS_TYPES). A styled
// listbox instead of a native <select> so each option can show its icon and
// whether that type is already saved. Arrow keys, Home/End, Enter/Space and
// Escape work like a native select.
export default function AddressTypeSelect({ id, value, onChange, error, savedTypes = [], editingType }) {
  const listId = useId();
  const rootRef = useRef(null);
  const buttonRef = useRef(null);
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  const selectedMeta = value ? getAddressTypeMeta(value) : null;
  const SelectedIcon = selectedMeta?.icon ?? Tags;

  useEffect(() => {
    if (!open) return undefined;
    const handlePointer = (event) => {
      if (!rootRef.current?.contains(event.target)) setOpen(false);
    };
    document.addEventListener("pointerdown", handlePointer);
    return () => document.removeEventListener("pointerdown", handlePointer);
  }, [open]);

  const openList = () => {
    setActiveIndex(Math.max(ADDRESS_TYPES.indexOf(value), 0));
    setOpen(true);
  };

  const choose = (type) => {
    onChange(type);
    setOpen(false);
    buttonRef.current?.focus();
  };

  const handleKeyDown = (event) => {
    const last = ADDRESS_TYPES.length - 1;
    const keys = {
      ArrowDown: () => (open ? setActiveIndex((index) => Math.min(index + 1, last)) : openList()),
      ArrowUp: () => (open ? setActiveIndex((index) => Math.max(index - 1, 0)) : openList()),
      Home: () => open && setActiveIndex(0),
      End: () => open && setActiveIndex(last),
      Enter: () => (open ? choose(ADDRESS_TYPES[activeIndex]) : openList()),
      " ": () => (open ? choose(ADDRESS_TYPES[activeIndex]) : openList()),
      Escape: () => open && setOpen(false),
      Tab: () => setOpen(false),
    };
    const action = keys[event.key];
    if (!action) return;
    if (event.key !== "Tab") event.preventDefault();
    // Escape on an open list closes only the list, not the modal around it.
    if (event.key === "Escape" && open) event.stopPropagation();
    action();
  };

  return (
    <div ref={rootRef} className="relative">
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-(--text-muted)">
        Address type
      </label>
      <button
        ref={buttonRef}
        id={id}
        type="button"
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        aria-invalid={Boolean(error)}
        aria-activedescendant={open ? `${listId}-${activeIndex}` : undefined}
        onClick={() => (open ? setOpen(false) : openList())}
        onKeyDown={handleKeyDown}
        className={`flex w-full items-center gap-3 rounded-xl border bg-white py-2 pl-2 pr-3.5 text-left text-sm shadow-sm outline-none transition focus:ring-4 dark:bg-(--surface-2) dark:shadow-none ${
          error
            ? "border-red-300 focus:border-red-400 focus:ring-red-50 dark:border-red-500/40 dark:focus:ring-red-500/10"
            : open
              ? "border-indigo-500 ring-4 ring-indigo-50 dark:border-indigo-400 dark:ring-indigo-500/10"
              : "border-slate-200 focus:border-indigo-500 focus:ring-indigo-50 dark:border-(--border-subtle) dark:focus:border-indigo-400 dark:focus:ring-indigo-500/10"
        }`}
      >
        <span
          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition ${
            selectedMeta
              ? `bg-linear-to-br ${selectedMeta.gradient} text-white shadow-md shadow-indigo-600/20`
              : "bg-slate-100 text-slate-400 dark:bg-(--surface-1) dark:text-(--text-muted)"
          }`}
        >
          <SelectedIcon className="h-4 w-4" />
        </span>
        <span className="min-w-0 flex-1">
          {value ? (
            <span className="font-semibold text-slate-900 dark:text-(--text-primary)">{value}</span>
          ) : (
            <span className="text-slate-400 dark:text-(--text-muted)">Select address type</span>
          )}
        </span>
        <ChevronDown
          className={`h-4 w-4 shrink-0 text-slate-400 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>

      <AnimatePresence>
        {open && (
          <motion.ul
            id={listId}
            role="listbox"
            aria-label="Address type"
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="absolute inset-x-0 top-full z-10 mt-2 origin-top overflow-hidden rounded-2xl border border-slate-100 bg-white p-1.5 shadow-xl shadow-slate-900/10 dark:border-(--border-subtle) dark:bg-(--surface-1) dark:shadow-black/40"
          >
            {ADDRESS_TYPES.map((type, index) => {
              const meta = getAddressTypeMeta(type);
              const Icon = meta.icon;
              const isSelected = type === value;
              const isActive = index === activeIndex;
              const isTaken = isSingleAddressType(type) && savedTypes.includes(type) && type !== editingType;
              return (
                <li
                  key={type}
                  id={`${listId}-${index}`}
                  role="option"
                  aria-selected={isSelected}
                  onPointerEnter={() => setActiveIndex(index)}
                  onClick={() => choose(type)}
                  className={`flex cursor-pointer items-center gap-3 rounded-xl px-2.5 py-2.5 transition ${
                    isActive ? "bg-slate-50 dark:bg-(--surface-2)" : ""
                  }`}
                >
                  <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${meta.soft}`}>
                    <Icon className="h-4.5 w-4.5" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-slate-900 dark:text-(--text-primary)">{type}</span>
                      {isTaken && (
                        <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-amber-700 dark:bg-amber-500/15 dark:text-amber-400">
                          Saved
                        </span>
                      )}
                    </span>
                    <span className="block text-xs text-slate-500 dark:text-(--text-muted)">{meta.hint}</span>
                  </span>
                  {isSelected && <Check className="h-4 w-4 shrink-0 text-indigo-600 dark:text-indigo-400" strokeWidth={3} />}
                </li>
              );
            })}
          </motion.ul>
        )}
      </AnimatePresence>

      {error && (
        <p role="alert" className="mt-1.5 text-xs font-medium text-red-600 dark:text-red-400">
          {error}
        </p>
      )}
    </div>
  );
}
