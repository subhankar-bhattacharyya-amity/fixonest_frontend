// Multi-line sibling of FormField - same label/error treatment, no leading
// icon (a vertically-centered icon reads oddly next to a tall textarea).
export default function TextareaField({ id, label, placeholder, error, rows = 5, registration }) {
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-(--text-muted)">
        {label}
      </label>
      <textarea
        id={id}
        rows={rows}
        placeholder={placeholder}
        aria-invalid={Boolean(error)}
        className={`w-full resize-none rounded-xl border bg-white px-3.5 py-2.5 text-sm text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:ring-4 dark:bg-(--surface-2) dark:text-(--text-primary) dark:placeholder:text-(--text-muted) dark:shadow-none ${
          error
            ? "border-red-300 focus:border-red-400 focus:ring-red-50 dark:border-red-500/40 dark:focus:border-red-400 dark:focus:ring-red-500/10"
            : "border-slate-200 focus:border-indigo-500 focus:ring-indigo-50 dark:border-(--border-subtle) dark:focus:border-indigo-400 dark:focus:ring-indigo-500/10"
        }`}
        {...registration}
      />
      {error && (
        <p role="alert" className="mt-1.5 text-xs font-medium text-red-600 dark:text-red-400">
          {error}
        </p>
      )}
    </div>
  );
}
