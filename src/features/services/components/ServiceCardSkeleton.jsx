// Same footprint as ServiceCard, shown while services load.
export default function ServiceCardSkeleton() {
  return (
    <div
      className="flex h-full animate-pulse flex-col overflow-hidden rounded-2xl border border-slate-100 bg-white dark:border-(--border-subtle) dark:bg-(--surface-1)"
      aria-hidden="true"
    >
      <div className="h-44 bg-slate-100 dark:bg-(--surface-2)" />
      <div className="space-y-3 p-5">
        <div className="h-4 w-3/4 rounded bg-slate-100 dark:bg-(--surface-2)" />
        <div className="h-3 w-1/4 rounded bg-slate-100 dark:bg-(--surface-2)" />
        <div className="h-5 w-1/3 rounded bg-slate-100 dark:bg-(--surface-2)" />
      </div>
    </div>
  );
}
