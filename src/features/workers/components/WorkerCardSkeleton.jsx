// Same footprint as WorkerCard, shown while providers load.
export default function WorkerCardSkeleton() {
  return (
    <div
      className="flex h-full animate-pulse flex-col overflow-hidden rounded-2xl border border-slate-100 bg-white dark:border-(--border-subtle) dark:bg-(--surface-1)"
      aria-hidden="true"
    >
      <div className="h-44 bg-slate-100 dark:bg-(--surface-2)" />
      <div className="space-y-3 p-5">
        <div className="flex justify-between gap-4">
          <div className="h-4 w-1/2 rounded bg-slate-100 dark:bg-(--surface-2)" />
          <div className="h-4 w-1/5 rounded bg-slate-100 dark:bg-(--surface-2)" />
        </div>
        <div className="h-3 w-1/3 rounded bg-slate-100 dark:bg-(--surface-2)" />
        <div className="h-4 w-1/4 rounded bg-slate-100 pt-4 dark:bg-(--surface-2)" />
      </div>
    </div>
  );
}
