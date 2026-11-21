// Shared labeled input shell: icon + label + error message. Dumb/
// presentational — `registration` is the object returned by React Hook
// Form's `register(name)`, spread straight onto the input. Originally
// colocated under pages/auth/ but promoted here once Profile's forms
// started reusing it too — see components/common/form/index.js.
export default function FormField({
  id,
  label,
  labelAction,
  type = "text",
  icon,
  rightSlot,
  autoComplete,
  placeholder,
  error,
  registration,
}) {
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between">
        <label htmlFor={id} className="text-sm font-medium text-slate-700 dark:text-(--text-muted)">
          {label}
        </label>
        {labelAction}
      </div>
      <div className="relative">
        <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400 dark:text-(--text-muted)">
          {icon}
        </span>
        <input
          id={id}
          type={type}
          autoComplete={autoComplete}
          placeholder={placeholder}
          aria-invalid={Boolean(error)}
          className={`w-full rounded-xl border bg-white py-2.5 pl-10 text-sm text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:ring-4 dark:bg-(--surface-2) dark:text-(--text-primary) dark:placeholder:text-(--text-muted) dark:shadow-none ${
            rightSlot ? "pr-10" : "pr-3.5"
          } ${
            error
              ? "border-red-300 focus:border-red-400 focus:ring-red-50 dark:border-red-500/40 dark:focus:border-red-400 dark:focus:ring-red-500/10"
              : "border-slate-200 focus:border-indigo-500 focus:ring-indigo-50 dark:border-(--border-subtle) dark:focus:border-indigo-400 dark:focus:ring-indigo-500/10"
          }`}
          {...registration}
        />
        {rightSlot && <span className="absolute inset-y-0 right-0 flex items-center pr-3.5">{rightSlot}</span>}
      </div>
      {error && (
        <p role="alert" className="mt-1.5 text-xs font-medium text-red-600 dark:text-red-400">
          {error}
        </p>
      )}
    </div>
  );
}
